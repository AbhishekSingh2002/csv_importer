"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Rocket,
  Inbox,
  MessageSquare,
  Users,
  Radio,
  Megaphone,
  MessageCircle,
  Phone,
  Table2,
  Plug,
  Building2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAIN_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/generate-leads", label: "Generate Leads", icon: Rocket },
  { href: "/manage-leads", label: "Manage Leads", icon: Inbox },
  { href: "/engage-leads", label: "Engage Leads", icon: MessageSquare },
];

const CONTROL_ITEMS = [
  { href: "/team-members", label: "Team Members", icon: Users },
  { href: "/lead-sources", label: "Lead Sources", icon: Radio },
  { href: "/ad-accounts", label: "Ad Accounts", icon: Megaphone },
  { href: "/whatsapp-account", label: "WhatsApp Account", icon: MessageCircle },
  { href: "/tele-calling", label: "Tele Calling", icon: Phone },
  { href: "/crm-fields", label: "CRM Fields", icon: Table2 },
  { href: "/api-center", label: "API Center", icon: Plug },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
        active
          ? "bg-[var(--ge-content-bg)] text-[var(--ge-text)] font-semibold"
          : "text-[var(--ge-text-muted)] hover:bg-[var(--ge-content-bg)] hover:text-[var(--ge-text)]"
      )}
    >
      <Icon size={17} strokeWidth={2} />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-[var(--ge-border)] bg-[var(--ge-sidebar-bg)] h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-[var(--ge-border)]">
        <div className="h-7 w-7 rounded-lg bg-[var(--ge-teal)] flex items-center justify-center text-white font-bold text-sm">
          G
        </div>
        <span className="font-bold text-[15px] tracking-tight">GrowEasy</span>
      </div>

      <button className="mx-4 mt-4 flex items-center gap-2.5 rounded-xl border border-[var(--ge-border)] px-3 py-2.5 hover:bg-[var(--ge-content-bg)] transition-colors text-left">
        <div className="h-8 w-8 rounded-lg bg-[var(--ge-teal)] flex items-center justify-center text-white font-semibold text-xs shrink-0">
          TC
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold truncate">Test Corp</p>
          <p className="text-[11px] text-[var(--ge-text-subtle)] uppercase tracking-wide">Owner</p>
        </div>
        <ChevronRight size={15} className="text-[var(--ge-text-subtle)]" />
      </button>

      <nav className="flex-1 overflow-y-auto px-4 mt-5 space-y-6 pb-6">
        <div>
          <p className="px-3 mb-2 text-[10.5px] font-semibold tracking-wider text-[var(--ge-text-subtle)]">
            MAIN
          </p>
          <div className="space-y-0.5">
            {MAIN_ITEMS.map((item) => (
              <NavLink key={item.href} {...item} active={pathname === item.href} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-2 text-[10.5px] font-semibold tracking-wider text-[var(--ge-text-subtle)]">
            CONTROL CENTER
          </p>
          <div className="space-y-0.5">
            {CONTROL_ITEMS.map((item) => (
              <NavLink key={item.href} {...item} active={pathname === item.href} />
            ))}
          </div>
        </div>
      </nav>

      <div className="px-4 pb-5">
        <NavLink
          href="/business-center"
          label="Business Center"
          icon={Building2}
          active={pathname === "/business-center"}
        />
      </div>
    </aside>
  );
}
