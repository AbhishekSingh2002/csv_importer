"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, ChevronDown, X, Sparkles, Clock, ListChecks, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import type { ImportResult } from "@/lib/schema";

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof Download;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--ge-border)] bg-[var(--ge-card-bg)] p-4 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tint}`}>
        <Icon size={17} />
      </div>
      <div>
        <p className="text-lg font-bold leading-tight text-[var(--ge-text)]">{value}</p>
        <p className="text-xs text-[var(--ge-text-muted)]">{label}</p>
      </div>
    </div>
  );
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ResultPanel({ result, onDismiss }: { result: ImportResult; onDismiss: () => void }) {
  const [showSkipped, setShowSkipped] = useState(false);
  const { imported, skipped, stats, columnMapping } = result;

  function downloadCsv() {
    if (imported.length === 0) return;
    const headers = Object.keys(imported[0]);
    const lines = [
      headers.join(","),
      ...imported.map((row) =>
        headers.map((h) => `"${String((row as Record<string, unknown>)[h] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ];
    downloadBlob(lines.join("\n"), "groweasy-imported-leads.csv", "text/csv");
  }

  function downloadJson() {
    downloadBlob(JSON.stringify(imported, null, 2), "groweasy-imported-leads.json", "application/json");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[var(--ge-border)] bg-[var(--ge-card-bg)] p-5 md:p-6 mb-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[var(--ge-text)]">Import complete</h3>
          <p className="text-sm text-[var(--ge-text-muted)]">
            {stats.aiAssisted ? "AI-assisted mapping" : "Heuristic mapping"} finished for {stats.totalRows} rows.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[var(--ge-content-bg)] text-[var(--ge-text-muted)]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard icon={ListChecks} label="Imported" value={String(stats.importedCount)} tint="bg-[var(--badge-green-bg)] text-[var(--badge-green-text)]" />
        <StatCard icon={AlertTriangle} label="Skipped" value={String(stats.skippedCount)} tint="bg-[var(--badge-orange-bg)] text-[var(--badge-orange-text)]" />
        <StatCard icon={Clock} label="Processing Time" value={`${stats.processingTimeMs} ms`} tint="bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]" />
        <StatCard icon={Sparkles} label="Detected Columns" value={String(columnMapping.filter((c) => c.mappedTo).length)} tint="bg-[var(--ge-teal-tint)] text-[var(--ge-teal)]" />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Button variant="secondary" size="sm" onClick={downloadCsv}>
          <Download size={14} /> Download CSV
        </Button>
        <Button variant="secondary" size="sm" onClick={downloadJson}>
          <Download size={14} /> Download JSON
        </Button>
      </div>

      <div className="rounded-xl border border-[var(--ge-border)] overflow-hidden mb-3">
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--ge-content-bg)] z-10">
              <tr>
                {["Name", "Email", "Mobile", "Company", "Status", "Source"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--ge-text-muted)] whitespace-nowrap border-b border-[var(--ge-border)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {imported.slice(0, 25).map((row, i) => (
                <tr key={i} className="border-b border-[var(--ge-border)] last:border-0 hover:bg-[var(--ge-content-bg)]/60">
                  <td className="px-4 py-2.5 font-medium text-[var(--ge-text)] whitespace-nowrap">{row.name || "—"}</td>
                  <td className="px-4 py-2.5 text-[var(--ge-text-muted)] whitespace-nowrap">{row.email || "—"}</td>
                  <td className="px-4 py-2.5 text-[var(--ge-text-muted)] whitespace-nowrap">
                    {row.country_code ? `+${row.country_code} ` : ""}
                    {row.mobile_without_country_code || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--ge-text-muted)] whitespace-nowrap">{row.company || "—"}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={row.crm_status} /></td>
                  <td className="px-4 py-2.5 text-[var(--ge-text-muted)] whitespace-nowrap">{row.data_source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {imported.length > 25 && (
          <div className="px-4 py-2 text-xs text-[var(--ge-text-muted)] bg-[var(--ge-content-bg)] border-t border-[var(--ge-border)]">
            Showing 25 of {imported.length} imported rows.
          </div>
        )}
      </div>

      {skipped.length > 0 && (
        <div className="rounded-xl border border-[var(--ge-border)] overflow-hidden">
          <button
            onClick={() => setShowSkipped((s) => !s)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[var(--ge-text)] hover:bg-[var(--ge-content-bg)]"
          >
            <span>{skipped.length} skipped rows (missing email &amp; phone, or invalid)</span>
            <ChevronDown size={16} className={showSkipped ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
          {showSkipped && (
            <div className="max-h-56 overflow-auto border-t border-[var(--ge-border)]">
              {skipped.map((s) => (
                <div key={s.rowIndex} className="px-4 py-2.5 text-xs border-b border-[var(--ge-border)] last:border-0">
                  <span className="font-semibold text-[var(--ge-text)]">Row {s.rowIndex + 2}:</span>{" "}
                  <span className="text-[var(--badge-orange-text)]">{s.reason}</span>
                  <div className="text-[var(--ge-text-subtle)] mt-0.5 truncate">
                    {Object.entries(s.raw).slice(0, 4).map(([k, v]) => `${k}: ${v || "—"}`).join("  ·  ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
