import { z } from "zod";

// ---------------------------------------------------------------------------
// Canonical CRM field list (the shape every imported row must be normalized to)
// ---------------------------------------------------------------------------
export const CRM_FIELDS = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "lead_owner",
  "crm_status",
  "crm_note",
  "data_source",
  "possession_time",
  "description",
] as const;

export type CrmField = (typeof CRM_FIELDS)[number];

// ---------------------------------------------------------------------------
// Allowed enum values (rows are coerced into these — never left free-text)
// ---------------------------------------------------------------------------
export const CRM_STATUS_VALUES = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
] as const;
export type CrmStatus = (typeof CRM_STATUS_VALUES)[number];

export const DATA_SOURCE_VALUES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
] as const;
export type DataSource = (typeof DATA_SOURCE_VALUES)[number];

export const CrmRowSchema = z.object({
  created_at: z.string(),
  name: z.string().default(""),
  email: z.string().default(""),
  country_code: z.string().default(""),
  mobile_without_country_code: z.string().default(""),
  company: z.string().default(""),
  city: z.string().default(""),
  state: z.string().default(""),
  country: z.string().default(""),
  lead_owner: z.string().default(""),
  crm_status: z.enum(CRM_STATUS_VALUES),
  crm_note: z.string().default(""),
  data_source: z.enum(DATA_SOURCE_VALUES),
  possession_time: z.string().default(""),
  description: z.string().default(""),
});
export type CrmRow = z.infer<typeof CrmRowSchema>;

export interface SkippedRow {
  rowIndex: number;
  raw: Record<string, string>;
  reason: string;
}

export interface ColumnMapping {
  sourceColumn: string;
  mappedTo: CrmField | null;
  confidence: number; // 0-100
}

export interface ImportResult {
  imported: CrmRow[];
  skipped: SkippedRow[];
  columnMapping: ColumnMapping[];
  stats: {
    totalRows: number;
    importedCount: number;
    skippedCount: number;
    processingTimeMs: number;
    batches: number;
    aiAssisted: boolean;
  };
}
