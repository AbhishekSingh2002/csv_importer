"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

export function buildProcessingSteps(batchCount: number): string[] {
  const steps = ["Uploading CSV", "Reading records"];
  for (let i = 1; i <= batchCount; i++) steps.push(`AI Mapping — Batch ${i}/${batchCount}`);
  steps.push("Generating CRM Objects", "Finalizing");
  return steps;
}

export function ProcessingOverlay({
  steps,
  done,
}: {
  steps: string[];
  /** true once the real API call has resolved — lets the animation catch up and finish */
  done: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= steps.length - 1) return;
    // Pace the animation, but speed up once the real request has finished
    const delay = done ? 90 : 550;
    const t = setTimeout(() => setActiveIndex((i) => Math.min(i + 1, steps.length - 1)), delay);
    return () => clearTimeout(t);
  }, [activeIndex, steps.length, done]);

  const progressPct = Math.round(((activeIndex + 1) / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-[var(--ge-card-bg)] p-7 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-1">
          <Loader2 size={20} className="animate-spin text-[var(--ge-orange)]" />
          <h3 className="text-base font-bold text-[var(--ge-text)]">Processing your leads</h3>
        </div>
        <p className="text-sm text-[var(--ge-text-muted)] mb-5">
          AI is mapping your columns to CRM fields. This usually takes a few seconds.
        </p>

        <div className="h-2 rounded-full bg-[var(--ge-content-bg)] overflow-hidden mb-5">
          <motion.div
            className="h-full bg-[var(--ge-orange)]"
            animate={{ width: `${progressPct}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          />
        </div>

        <ul className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {steps.map((step, i) => {
              if (i > activeIndex) return null;
              const isCurrent = i === activeIndex;
              const isComplete = i < activeIndex || (isCurrent && done && activeIndex === steps.length - 1);
              return (
                <motion.li
                  key={step}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2.5 text-sm"
                >
                  <span
                    className={
                      isComplete
                        ? "h-5 w-5 rounded-full bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] flex items-center justify-center shrink-0"
                        : "h-5 w-5 rounded-full border-2 border-[var(--ge-orange)] flex items-center justify-center shrink-0"
                    }
                  >
                    {isComplete ? (
                      <Check size={12} strokeWidth={3} />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--ge-orange)] animate-pulse" />
                    )}
                  </span>
                  <span className={isComplete ? "text-[var(--ge-text-muted)]" : "text-[var(--ge-text)] font-medium"}>
                    {step}
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </motion.div>
    </div>
  );
}
