import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--ge-content-bg)]">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
