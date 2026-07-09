import { CRM_FIELDS, CRM_STATUS_VALUES, DATA_SOURCE_VALUES, type CrmField, type CrmStatus, type DataSource } from "./schema";

// ---------------------------------------------------------------------------
// Synonym dictionary — never assume the source column names, match against
// every alias a real-world CSV export might use.
// ---------------------------------------------------------------------------
const SYNONYMS: Record<CrmField, string[]> = {
  created_at: ["created_at", "created", "date", "date created", "created date", "timestamp", "entry date"],
  name: ["name", "customer", "lead", "client name", "full name", "lead name", "customer name", "contact name"],
  email: ["email", "mail", "email address", "e mail", "e-mail"],
  country_code: ["country_code", "country code", "isd", "isd code", "dial code", "std code"],
  mobile_without_country_code: [
    "mobile_without_country_code",
    "phone",
    "mobile",
    "contact",
    "whatsapp",
    "mobile no",
    "mobile number",
    "phone number",
    "contact number",
    "cell",
  ],
  company: ["company", "organization", "organisation", "business", "company name", "firm"],
  city: ["city", "town"],
  state: ["state", "province", "region"],
  country: ["country", "nation"],
  lead_owner: ["lead_owner", "owner", "assigned to", "sales rep", "agent", "assignee"],
  crm_status: ["status", "crm_status", "lead status", "stage"],
  crm_note: ["remarks", "comment", "comments", "notes", "note", "crm_note", "feedback"],
  data_source: ["source", "data_source", "lead source", "channel", "campaign"],
  possession_time: ["possession_time", "possession", "possession date", "handover", "handover time"],
  description: ["description", "details", "about", "summary"],
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[_\-]+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Levenshtein distance, used to score near-misses (e.g. "e-mail" vs "email")
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 100;
  if (na.includes(nb) || nb.includes(na)) return 90;
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return Math.max(0, Math.round((1 - dist / maxLen) * 100));
}

export interface MappedColumn {
  sourceColumn: string;
  mappedTo: CrmField | null;
  confidence: number;
}

/**
 * Heuristic "AI mapping" — scores every source header against every known
 * synonym for every CRM field, and greedily assigns the best non-conflicting
 * matches. This is the offline fallback (and default) mapper; when an
 * OPENAI_API_KEY is configured, `refineWithOpenAI` can improve ambiguous
 * matches on top of this.
 */
export function heuristicMapColumns(headers: string[]): MappedColumn[] {
  const scored: { sourceColumn: string; field: CrmField; score: number }[] = [];

  for (const header of headers) {
    for (const field of CRM_FIELDS) {
      const aliases = SYNONYMS[field];
      let best = 0;
      for (const alias of aliases) {
        best = Math.max(best, similarity(header, alias));
      }
      scored.push({ sourceColumn: header, field, score: best });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const usedFields = new Set<CrmField>();
  const usedColumns = new Set<string>();
  const result: MappedColumn[] = [];

  for (const { sourceColumn, field, score } of scored) {
    if (usedColumns.has(sourceColumn) || usedFields.has(field)) continue;
    if (score < 55) continue; // below this, don't force a mapping
    usedColumns.add(sourceColumn);
    usedFields.add(field);
    result.push({ sourceColumn, mappedTo: field, confidence: score });
  }

  for (const header of headers) {
    if (!usedColumns.has(header)) {
      result.push({ sourceColumn: header, mappedTo: null, confidence: 0 });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Enum normalization — coerce loose text into the strict allowed values
// ---------------------------------------------------------------------------
const STATUS_SYNONYMS: Record<CrmStatus, string[]> = {
  GOOD_LEAD_FOLLOW_UP: ["good lead", "good_lead", "follow up", "followup", "interested", "hot lead", "warm"],
  DID_NOT_CONNECT: ["did not connect", "dnc", "not dialed", "no answer", "not reachable", "unreachable", "not connected"],
  BAD_LEAD: ["bad lead", "bad_lead", "not interested", "junk", "invalid", "rejected"],
  SALE_DONE: ["sale done", "sale_done", "closed won", "converted", "won", "sold"],
};

export function normalizeCrmStatus(raw: string | undefined): CrmStatus {
  const n = normalize(raw ?? "");
  if (!n) return "DID_NOT_CONNECT";
  for (const status of CRM_STATUS_VALUES) {
    if (n === normalize(status)) return status;
  }
  let bestStatus: CrmStatus = "DID_NOT_CONNECT";
  let bestScore = -1;
  for (const status of CRM_STATUS_VALUES) {
    for (const syn of STATUS_SYNONYMS[status]) {
      const s = similarity(n, syn);
      if (s > bestScore) {
        bestScore = s;
        bestStatus = status;
      }
    }
  }
  return bestScore >= 60 ? bestStatus : "DID_NOT_CONNECT";
}

const SOURCE_SYNONYMS: Record<DataSource, string[]> = {
  leads_on_demand: ["leads on demand", "lod", "on demand"],
  meridian_tower: ["meridian tower", "meridian"],
  eden_park: ["eden park", "eden"],
  varah_swamy: ["varah swamy", "varah"],
  sarjapur_plots: ["sarjapur plots", "sarjapur"],
};

export function normalizeDataSource(raw: string | undefined): DataSource {
  const n = normalize(raw ?? "");
  if (!n) return "leads_on_demand";
  for (const source of DATA_SOURCE_VALUES) {
    if (n === normalize(source)) return source;
  }
  let best: DataSource = "leads_on_demand";
  let bestScore = -1;
  for (const source of DATA_SOURCE_VALUES) {
    for (const syn of SOURCE_SYNONYMS[source]) {
      const s = similarity(n, syn);
      if (s > bestScore) {
        bestScore = s;
        best = source;
      }
    }
  }
  return bestScore >= 55 ? best : "leads_on_demand";
}

// Split a raw phone-ish string into { country_code, mobile } if a combined
// column is provided (e.g. "+919876543210")
export function splitPhone(raw: string): { countryCode: string; mobile: string } {
  const digits = raw.replace(/[^\d]/g, "");
  if (raw.trim().startsWith("+") && digits.length > 10) {
    return { countryCode: digits.slice(0, digits.length - 10), mobile: digits.slice(-10) };
  }
  if (digits.length > 10) {
    return { countryCode: digits.slice(0, digits.length - 10), mobile: digits.slice(-10) };
  }
  return { countryCode: "", mobile: digits };
}
