"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { ArrowUp, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SIZE = 5 * 1024 * 1024;

export function DropzoneArea({
  onFileAccepted,
  onDownloadSample,
}: {
  onFileAccepted: (file: File) => void;
  onDownloadSample: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setError(null);
      if (rejected.length > 0) {
        setError(rejected[0]?.errors?.[0]?.message ?? "File was rejected.");
        return;
      }
      const file = accepted[0];
      if (!file) return;
      if (file.size > MAX_SIZE) {
        setError("File exceeds the 5MB limit.");
        return;
      }
      onFileAccepted(file);
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    maxSize: MAX_SIZE,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-[var(--ge-orange)] bg-[var(--ge-orange-tint)] scale-[1.01]"
            : "border-[var(--ge-border)] hover:border-[var(--ge-orange)]/50 hover:bg-[var(--ge-content-bg)]"
        )}
      >
        <input {...getInputProps()} />
        <div className="h-14 w-14 rounded-2xl bg-[var(--ge-content-bg)] border border-[var(--ge-border)] flex items-center justify-center mb-4">
          <ArrowUp size={22} className="text-[var(--ge-text)]" />
        </div>
        <p className="font-semibold text-[15px] text-[var(--ge-text)]">Drop your CSV file here</p>
        <p className="text-sm text-[var(--ge-text-muted)] mt-1">or click to browse files</p>

        <span className="inline-flex items-center gap-1.5 mt-4 rounded-full bg-[var(--ge-content-bg)] border border-[var(--ge-border)] px-3 py-1 text-xs text-[var(--ge-text-muted)]">
          <FileSpreadsheet size={13} /> Supported file: .csv (max 5MB)
        </span>

        <p className="text-xs text-[var(--ge-text-subtle)] mt-4 max-w-md leading-relaxed">
          Required headers: created_at, name, email, country_code, mobile_without_country_code,
          company, city, state, country, lead_owner, crm_status, crm_note. Template includes
          default + custom CRM fields to reduce upload errors.
        </p>
      </div>

      {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDownloadSample();
        }}
        className="mt-4 mx-auto flex items-center gap-2 text-sm font-medium text-[var(--ge-teal)] hover:underline"
      >
        <FileSpreadsheet size={15} />
        Download Sample CSV Template
      </button>
    </div>
  );
}
