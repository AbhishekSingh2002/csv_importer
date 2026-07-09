"use client";

import { FileSpreadsheet, X } from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function CsvPreviewTable({
  fileName,
  fileSize,
  headers,
  rows,
  totalRows,
  onRemove,
}: {
  fileName: string;
  fileSize: number;
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  onRemove: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 rounded-xl border border-[var(--ge-border)] bg-[var(--ge-content-bg)] px-4 py-3">
        <div className="h-9 w-9 rounded-lg bg-[var(--badge-green-bg)] flex items-center justify-center shrink-0">
          <FileSpreadsheet size={16} className="text-[var(--badge-green-text)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-[var(--ge-text)]">{fileName}</p>
          <p className="text-xs text-[var(--ge-text-muted)]">{formatBytes(fileSize)} &middot; {totalRows} rows</p>
        </div>
        <button
          onClick={onRemove}
          className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-[var(--ge-border)] text-[var(--ge-text-muted)]"
          aria-label="Remove file"
        >
          <X size={15} />
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-[var(--ge-border)] overflow-hidden">
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--ge-content-bg)] z-10">
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--ge-text-muted)] whitespace-nowrap border-b border-[var(--ge-border)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-[var(--ge-border)] last:border-0 hover:bg-[var(--ge-content-bg)]/60">
                  {headers.map((h) => (
                    <td key={h} className="px-4 py-2.5 whitespace-nowrap text-[var(--ge-text)]">
                      {row[h] || <span className="text-[var(--ge-text-subtle)]">&mdash;</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalRows > rows.length && (
          <div className="px-4 py-2 text-xs text-[var(--ge-text-muted)] bg-[var(--ge-content-bg)] border-t border-[var(--ge-border)]">
            Showing {rows.length} of {totalRows} rows &middot; full file will be processed
          </div>
        )}
      </div>
    </div>
  );
}
