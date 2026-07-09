"use client";

import { useState } from "react";
import Papa from "papaparse";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DropzoneArea } from "@/components/dropzone-area";
import { CsvPreviewTable } from "@/components/csv-preview-table";
import { ProcessingOverlay, buildProcessingSteps } from "@/components/processing-overlay";
import type { ImportResult } from "@/lib/schema";

type Stage = "dropzone" | "preview" | "processing";

export function ImportModal({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (result: ImportResult) => void;
}) {
  const [stage, setStage] = useState<Stage>("dropzone");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [requestDone, setRequestDone] = useState(false);

  function reset() {
    setStage("dropzone");
    setFile(null);
    setHeaders([]);
    setPreviewRows([]);
    setTotalRows(0);
    setError(null);
    setRequestDone(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFileAccepted(f: File) {
    setFile(f);
    setError(null);
    // Client-side parse for preview ONLY — no AI call happens yet.
    Papa.parse<Record<string, string>>(f, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (res) => {
        setHeaders(res.meta.fields ?? []);
        setPreviewRows(res.data.slice(0, 8));
        setTotalRows(res.data.length);
        setStage("preview");
      },
      error: () => setError("Could not read this CSV file."),
    });
  }

  function handleDownloadSample() {
    window.location.href = "/api/sample-csv";
  }

  async function handleProcessWithAI() {
    if (!file) return;
    const batchCount = Math.max(1, Math.ceil(totalRows / 20));
    setSteps(buildProcessingSteps(batchCount));
    setRequestDone(false);
    setStage("processing");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Import failed.");
      }
      const result: ImportResult = await res.json();
      setRequestDone(true);
      // Let the step animation catch up visually before handing off
      setTimeout(() => {
        onComplete(result);
        reset();
      }, 700);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStage("preview");
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-2xl rounded-2xl bg-[var(--ge-card-bg)] shadow-2xl max-h-[88vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between px-6 pt-6 pb-1">
            <div>
              <h2 className="text-lg font-bold text-[var(--ge-text)]">Import Leads via CSV</h2>
              <p className="text-sm text-[var(--ge-text-muted)] mt-1">
                Upload a CSV file to bulk import leads into your system.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[var(--ge-content-bg)] text-[var(--ge-text-muted)]"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-6 py-5">
            <AnimatePresence mode="wait">
              {stage === "dropzone" && (
                <motion.div key="drop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <DropzoneArea onFileAccepted={handleFileAccepted} onDownloadSample={handleDownloadSample} />
                </motion.div>
              )}
              {stage === "preview" && file && (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <CsvPreviewTable
                    fileName={file.name}
                    fileSize={file.size}
                    headers={headers}
                    rows={previewRows}
                    totalRows={totalRows}
                    onRemove={reset}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2 border-t border-[var(--ge-border)] mt-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={stage !== "preview"}
              onClick={handleProcessWithAI}
            >
              Process with AI
            </Button>
          </div>
        </motion.div>
      </div>

      {stage === "processing" && <ProcessingOverlay steps={steps} done={requestDone} />}
    </>
  );
}
