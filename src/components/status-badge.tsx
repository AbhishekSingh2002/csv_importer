import { cn } from "@/lib/utils";
import type { CrmStatus } from "@/lib/schema";

const STYLES: Record<CrmStatus, string> = {
  SALE_DONE: "bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]",
  GOOD_LEAD_FOLLOW_UP: "bg-[var(--badge-green-bg)] text-[var(--badge-green-text)]",
  BAD_LEAD: "bg-[var(--badge-orange-bg)] text-[var(--badge-orange-text)]",
  DID_NOT_CONNECT: "bg-[var(--badge-grey-bg)] text-[var(--badge-grey-text)]",
};

const LABELS: Record<CrmStatus, string> = {
  SALE_DONE: "Sale Done",
  GOOD_LEAD_FOLLOW_UP: "Good Lead",
  BAD_LEAD: "Bad Lead",
  DID_NOT_CONNECT: "Not Dialed",
};

export function StatusBadge({ status }: { status: CrmStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold",
        STYLES[status]
      )}
    >
      {LABELS[status]}
    </span>
  );
}
