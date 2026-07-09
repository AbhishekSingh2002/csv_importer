import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import {
  heuristicMapColumns,
  normalizeCrmStatus,
  normalizeDataSource,
  splitPhone,
} from "@/lib/mapping";
import { isAiConfigured, refineColumnMappingWithAI } from "@/lib/openai-mapper";
import type { CrmRow, ImportResult, SkippedRow } from "@/lib/schema";
import { CrmRowSchema } from "@/lib/schema";

export const runtime = "nodejs";

const BATCH_SIZE = 20;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No CSV file provided." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds the 5MB limit." }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json({ error: "Only .csv files are supported." }, { status: 400 });
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return NextResponse.json({ error: "Could not parse CSV file." }, { status: 400 });
  }

  const headers = parsed.meta.fields ?? [];
  const rows = parsed.data;

  // ---- Column mapping (heuristic "AI" mapper, optionally refined by a real
  // OpenAI call if OPENAI_API_KEY is configured in the environment) ----
  let columnMapping = heuristicMapColumns(headers);
  const aiAssisted = isAiConfigured();
  if (aiAssisted) {
    columnMapping = await refineColumnMappingWithAI(headers, columnMapping);
  }

  const mapByColumn = new Map(columnMapping.map((m) => [m.sourceColumn, m.mappedTo]));

  const imported: CrmRow[] = [];
  const skipped: SkippedRow[] = [];
  const batches = Math.ceil(rows.length / BATCH_SIZE) || 1;

  rows.forEach((row, idx) => {
    const mapped: Record<string, string> = {};
    for (const [col, value] of Object.entries(row)) {
      const target = mapByColumn.get(col);
      if (target) mapped[target] = (value ?? "").toString().trim();
    }

    const email = mapped.email ?? "";
    let countryCode = mapped.country_code ?? "";
    let mobile = mapped.mobile_without_country_code ?? "";

    // If mobile column actually contains a full number with country code
    if (mobile && !countryCode) {
      const split = splitPhone(mobile);
      if (split.countryCode) {
        countryCode = split.countryCode;
        mobile = split.mobile;
      }
    }

    if (!email && !mobile) {
      skipped.push({
        rowIndex: idx,
        raw: row,
        reason: "Missing both email and phone number.",
      });
      return;
    }

    const candidate = {
      created_at: mapped.created_at || new Date().toISOString(),
      name: mapped.name || "",
      email,
      country_code: countryCode || "91",
      mobile_without_country_code: mobile,
      company: mapped.company || "",
      city: mapped.city || "",
      state: mapped.state || "",
      country: mapped.country || "",
      lead_owner: mapped.lead_owner || "",
      crm_status: normalizeCrmStatus(mapped.crm_status),
      crm_note: mapped.crm_note || "",
      data_source: normalizeDataSource(mapped.data_source),
      possession_time: mapped.possession_time || "",
      description: mapped.description || "",
    };

    const result = CrmRowSchema.safeParse(candidate);
    if (!result.success) {
      skipped.push({ rowIndex: idx, raw: row, reason: "Failed schema validation." });
      return;
    }
    imported.push(result.data);
  });

  const response: ImportResult = {
    imported,
    skipped,
    columnMapping,
    stats: {
      totalRows: rows.length,
      importedCount: imported.length,
      skippedCount: skipped.length,
      processingTimeMs: Date.now() - startedAt,
      batches,
      aiAssisted,
    },
  };

  return NextResponse.json(response);
}
