import { Topbar } from "@/components/topbar";
import { LucideIcon } from "lucide-react";

export function PlaceholderPage({
  title,
  subtitle,
  icon: Icon,
  note,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  note?: string;
}) {
  return (
    <>
      <Topbar title={title} subtitle={subtitle} />
      <main className="px-6 md:px-8 py-10">
        <div className="flex flex-col items-center justify-center text-center border border-dashed border-[var(--ge-border)] rounded-2xl py-20 bg-[var(--ge-card-bg)]">
          <div className="h-14 w-14 rounded-2xl bg-[var(--ge-teal-tint)] flex items-center justify-center mb-4">
            <Icon size={26} className="text-[var(--ge-teal)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--ge-text)]">{title}</h2>
          <p className="text-sm text-[var(--ge-text-muted)] mt-1.5 max-w-sm">
            {note ?? "This section isn't part of the CSV importer assignment, so it's a placeholder in this build."}
          </p>
        </div>
      </main>
    </>
  );
}
