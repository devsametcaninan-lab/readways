"use client";

import type { ReactNode } from "react";

type OnboardingHintProps = {
  title?: string;
  children: ReactNode;
  onDismiss: () => void;
  dismissLabel?: string;
  className?: string;
};

export default function OnboardingHint({
  title,
  children,
  onDismiss,
  dismissLabel = "Got it",
  className = ""
}: OnboardingHintProps) {
  return (
    <div
      className={`animate-fade-in rounded-xl border border-accent/20 bg-[#12141d]/95 px-4 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm ${className}`}
      role="status"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {title ? (
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#a8b0ff]">
              {title}
            </p>
          ) : null}
          <div className={title ? "mt-2" : ""}>{children}</div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="min-h-[40px] shrink-0 rounded-md border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-[12px] font-medium text-zinc-300 transition hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white"
        >
          {dismissLabel}
        </button>
      </div>
    </div>
  );
}
