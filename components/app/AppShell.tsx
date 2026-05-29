"use client";

import { useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/provider";
import ActivityPanel from "./ActivityPanel";
import AppSidebar from "./AppSidebar";

export default function AppShell({
  children,
  showActivityPanel = false,
  fullHeightMain = false
}: {
  children: ReactNode;
  showActivityPanel?: boolean;
  fullHeightMain?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div
      className={
        fullHeightMain
          ? "flex h-screen overflow-x-hidden overflow-y-hidden bg-[#0a0b10] text-[#f5f7ff]"
          : "flex min-h-screen overflow-x-hidden bg-[#0a0b10] text-[#f5f7ff]"
      }
    >
      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 items-center justify-between border-b border-white/[0.06] bg-[#0a0b10]/80 px-4 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            aria-label={t("common.openMenu")}
            className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 text-slate-400"
            onClick={() => setMobileOpen(true)}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-4 w-4">
              <path strokeLinecap="round" d="M2.5 4h11M2.5 8h11M2.5 12h11" />
            </svg>
          </button>
          <p className="text-[13px] text-slate-400">ReadWays</p>
          <div className="w-8" />
        </header>

        <div className="flex min-h-0 flex-1">
          <main
            className={
              fullHeightMain
                ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
                : "min-w-0 flex-1 overflow-y-auto"
            }
          >
            {children}
          </main>
          {showActivityPanel && <ActivityPanel />}
        </div>
      </div>
    </div>
  );
}
