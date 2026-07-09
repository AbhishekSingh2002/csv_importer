"use client";

import { useState } from "react";
import { Search, RotateCw, Plus, Upload, Users, TrendingUp, Clock3, Percent } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ImportModal } from "@/components/import-modal";
import { ResultPanel } from "@/components/result-panel";
import type { CrmRow, CrmStatus, ImportResult } from "@/lib/schema";

interface Lead {
  id: string;
  name: string;
  email: string;
  contact: string;
  dateCreated: string;
  company: string;
  status: CrmStatus;
}

const INITIAL_LEADS: Lead[] = [
  { id: "1", name: "punnnf g", email: "kjgkhv2@gcghc.com", contact: "+917894561177", dateCreated: "Jun 23, 2026, 2:37 PM", company: "—", status: "SALE_DONE" },
  { id: "2", name: "kjjkvkh", email: "jkhbkbn@hjf.hfv", contact: "+911212121415", dateCreated: "Jun 23, 2026, 12:23 PM", company: "fhtf", status: "DID_NOT_CONNECT" },
  { id: "3", name: "kugkkh", email: "ljgbjg@hgdh.hjc", contact: "+911212121217", dateCreated: "Jun 23, 2026, 12:17 PM", company: "fhtf", status: "DID_NOT_CONNECT" },
  { id: "4", name: "hjvjv", email: "jfgf@fgd.com", contact: "+911515151515", dateCreated: "Jun 23, 2026, 12:16 PM", company: "fhtf", status: "GOOD_LEAD_FOLLOW_UP" },
  { id: "5", name: "Abhraneel Dhar", email: "abhraneeldhar7@growe...", contact: "+919051589728", dateCreated: "Jun 23, 2026, 11:01 AM", company: "groweasy", status: "GOOD_LEAD_FOLLOW_UP" },
  { id: "6", name: "fhjf ghf", email: "tjrf.ft@gfjj.com", contact: "+911414141414", dateCreated: "Jun 22, 2026, 4:49 PM", company: "thr rh", status: "DID_NOT_CONNECT" },
  { id: "7", name: "fhf", email: "gnhfg@fgjf.com", contact: "+911313131313", dateCreated: "Jun 22, 2026, 4:48 PM", company: "fhtf", status: "DID_NOT_CONNECT" },
  { id: "8", name: "Abc 1", email: "abc1@kryf.com", contact: "+911212121212", dateCreated: "Jun 22, 2026, 4:44 PM", company: "—", status: "DID_NOT_CONNECT" },
];

function crmRowToLead(row: CrmRow, i: number): Lead {
  return {
    id: `import-${Date.now()}-${i}`,
    name: row.name || "—",
    email: row.email || "—",
    contact: row.mobile_without_country_code ? `+${row.country_code}${row.mobile_without_country_code}` : "—",
    dateCreated: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
    company: row.company || "—",
    status: row.crm_status,
  };
}

export default function ManageLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [importOpen, setImportOpen] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [search, setSearch] = useState("");

  function handleImportComplete(res: ImportResult) {
    setResult(res);
    const newLeads = res.imported.map(crmRowToLead);
    setLeads((prev) => [...newLeads, ...prev]);
  }

  const filtered = leads.filter(
    (l) =>
      !search ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.contact.includes(search)
  );

  return (
    <>
      <Topbar title="Manage Your Leads" subtitle="Monitor lead status, assign tasks, and close deals faster." />

      <main className="px-6 md:px-8 py-6">
        {result && <ResultPanel result={result} onDismiss={() => setResult(null)} />}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Users} tint="bg-[var(--ge-teal-tint)] text-[var(--ge-teal)]" label="Total Leads" value={String(leads.length)} />
          <StatCard icon={TrendingUp} tint="bg-[var(--badge-green-bg)] text-[var(--badge-green-text)]" label="Good Leads" value={String(leads.filter((l) => l.status === "GOOD_LEAD_FOLLOW_UP").length)} />
          <StatCard icon={Clock3} tint="bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]" label="Sales Closed" value={String(leads.filter((l) => l.status === "SALE_DONE").length)} />
          <StatCard icon={Percent} tint="bg-[var(--badge-orange-bg)] text-[var(--badge-orange-text)]" label="Conversion Rate" value="12.6%" />
        </div>

        <div className="rounded-2xl border border-[var(--ge-border)] bg-[var(--ge-card-bg)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[var(--ge-border)]">
            <h2 className="font-bold text-[var(--ge-text)]">Your Leads</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ge-text-subtle)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Enter email or phone number..."
                  className="w-64 rounded-lg border border-[var(--ge-border)] bg-[var(--ge-content-bg)] pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ge-teal)]/30 placeholder:text-[var(--ge-text-subtle)]"
                />
              </div>
              <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--ge-border)] hover:bg-[var(--ge-content-bg)] text-[var(--ge-text-muted)]">
                <RotateCw size={15} />
              </button>
              <Button variant="secondary" size="sm">
                <Plus size={14} /> Add Lead
              </Button>
              <Button variant="primary" size="sm" onClick={() => setImportOpen(true)}>
                <Upload size={14} /> Import CSV
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--ge-border)]">
                  {["Lead Name", "Email", "Contact", "Date Created", "Company", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--ge-text-muted)] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className="border-b border-[var(--ge-border)] last:border-0 hover:bg-[var(--ge-content-bg)]/60">
                    <td className="px-5 py-3.5 font-medium text-[var(--ge-text)] whitespace-nowrap">{lead.name}</td>
                    <td className="px-5 py-3.5 text-[var(--ge-text-muted)] whitespace-nowrap">{lead.email}</td>
                    <td className="px-5 py-3.5 text-[var(--ge-text-muted)] whitespace-nowrap">{lead.contact}</td>
                    <td className="px-5 py-3.5 text-[var(--ge-text-muted)] whitespace-nowrap">{lead.dateCreated}</td>
                    <td className="px-5 py-3.5 text-[var(--ge-text-muted)] whitespace-nowrap">{lead.company}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={lead.status} /></td>
                    <td className="px-5 py-3.5">
                      <button className="text-xs font-medium text-[var(--ge-teal)] hover:underline whitespace-nowrap">More &gt;</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center py-5 border-t border-[var(--ge-border)]">
            <Button variant="secondary" size="sm">Load more</Button>
          </div>
        </div>
      </main>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onComplete={handleImportComplete} />
    </>
  );
}

function StatCard({ icon: Icon, tint, label, value }: { icon: typeof Users; tint: string; label: string; value: string }) {
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
