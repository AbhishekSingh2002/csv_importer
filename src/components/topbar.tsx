"use client";

import { Search, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function Topbar({ title, subtitle }: { title: string; subtitle: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--ge-border)] bg-[var(--ge-content-bg)]/95 backdrop-blur px-6 md:px-8 py-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--ge-text)]">{title}</h1>
        <p className="text-sm text-[var(--ge-text-muted)] mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ge-text-subtle)]"
          />
          <input
            placeholder="Search..."
            className="w-56 rounded-lg border border-[var(--ge-border)] bg-[var(--ge-card-bg)] pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ge-teal)]/30 placeholder:text-[var(--ge-text-subtle)]"
          />
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--ge-border)] bg-[var(--ge-card-bg)] hover:bg-[var(--ge-content-bg)] transition-colors"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="h-9 w-9 rounded-full bg-[var(--ge-orange)] flex items-center justify-center text-white text-sm font-semibold">
          T
        </div>
      </div>
    </header>
  );
}
