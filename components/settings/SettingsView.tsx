"use client";

import { useEffect, useState } from "react";
import UserAvatar from "@/components/app/UserAvatar";
import { useAppUser } from "@/components/app/use-app-user";
import { SignOutForm } from "@/components/feedback/SignOutButton";
import { useToast } from "@/components/feedback/ToastProvider";
import { fetchBillingLimits, type BillingLimitsResponse } from "@/lib/billing/client";
import { planDisplayName, planToTier } from "@/lib/billing/plans";
import { clearLocalReaderCache } from "@/lib/preferences/reader-cache";
import { useUserPreferences } from "@/lib/preferences/UserPreferencesProvider";
import type {
  DefaultExplanationLanguage,
  ExplanationStyle,
  HighlightMode
} from "@/lib/preferences/types";
import FeedbackSettingsSection from "./FeedbackSettingsSection";
import SettingsOptionGroup from "./SettingsOptionGroup";
import SettingsSection from "./SettingsSection";
import SettingsToggle from "./SettingsToggle";

function planBadgeClass(tier: "free" | "pro" | "admin"): string {
  if (tier === "admin") {
    return "border-violet-500/25 bg-violet-500/[0.08] text-violet-200/90";
  }

  if (tier === "pro") {
    return "border-accent/25 bg-accent/[0.08] text-[#c5cdff]";
  }

  return "border-white/[0.10] bg-white/[0.03] text-slate-400";
}

export default function SettingsView() {
  const toast = useToast();
  const { name, email, avatarUrl, plan, loading: userLoading } = useAppUser();
  const { preferences, updatePreferences } = useUserPreferences();
  const [billing, setBilling] = useState<BillingLimitsResponse | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchBillingLimits()
      .then((snapshot) => {
        if (!cancelled) {
          setBilling(snapshot);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBilling(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setBillingLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const tier = billing?.tier ?? planToTier(plan);
  const isProOrAdmin = tier === "pro" || tier === "admin";
  const displayPlan = billing?.plan ?? plan;

  function notifyUpdated() {
    toast.success("Settings updated");
  }

  function patchPreferences<T extends Partial<typeof preferences>>(patch: T) {
    updatePreferences(patch);
    notifyUpdated();
  }

  function handleClearReaderCache() {
    const removed = clearLocalReaderCache();
    toast.success(
      removed > 0 ? "Local reader cache cleared" : "Reader cache was already empty"
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-slate-400">
          Account, reading preferences, and appearance for your ReadWays workspace.
        </p>
      </div>

      <div className="mx-auto max-w-xl space-y-4">
        <SettingsSection title="Account">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={userLoading ? "Reader" : name}
              avatarUrl={avatarUrl}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-medium text-white">
                {userLoading ? "Loading…" : name}
              </p>
              <p className="mt-0.5 truncate text-sm text-slate-400">
                {userLoading ? "…" : email || "No email on file"}
              </p>
              <p className="mt-2">
                <span
                  className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] ${planBadgeClass(tier)}`}
                >
                  {userLoading ? "…" : planDisplayName(displayPlan)}
                </span>
              </p>
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-4">
            <SignOutForm />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Reading"
          description="Customize how you read and save vocabulary in the reader."
        >
          <SettingsOptionGroup<HighlightMode>
            name="highlight-mode"
            label="Highlight mode"
            description="How strongly selected words stand out in your document."
            value={preferences.highlightMode}
            onChange={(highlightMode) => patchPreferences({ highlightMode })}
            options={[
              { value: "subtle", label: "Subtle", description: "Light underline on selection" },
              {
                value: "focused",
                label: "Focused",
                description: "Stronger accent highlight (recommended)"
              },
              { value: "off", label: "Off", description: "Minimal styling while reading" }
            ]}
          />

          <SettingsToggle
            id="auto-save-words"
            label="Auto-save words"
            description="Automatically save explained words to your collection after each explanation."
            checked={preferences.autoSaveWords}
            onChange={(autoSaveWords) => patchPreferences({ autoSaveWords })}
          />

          <SettingsToggle
            id="phrase-selection-hints"
            label="Phrase selection hints"
            description="Show a short tip about selecting multi-word phrases in the reader."
            checked={preferences.phraseSelectionHints}
            onChange={(phraseSelectionHints) => patchPreferences({ phraseSelectionHints })}
          />
        </SettingsSection>

        <SettingsSection title="Appearance">
          <SettingsOptionGroup<"dark" | "light">
            name="theme"
            label="Theme"
            value={preferences.theme}
            onChange={(theme) => {
              if (theme === "dark") {
                patchPreferences({ theme: "dark" });
              }
            }}
            options={[
              {
                value: "dark",
                label: "Dark",
                description: "Premium dark UI (default)"
              },
              {
                value: "light",
                label: "Light",
                description: "Bright theme for daytime reading",
                disabled: true,
                badge: "Coming soon"
              }
            ]}
          />
        </SettingsSection>

        <SettingsSection
          title="AI preferences"
          description="Default explanation language applies to your next word or phrase in the reader."
        >
          <SettingsOptionGroup<ExplanationStyle>
            name="explanation-style"
            label="Explanation style"
            value={preferences.explanationStyle}
            onChange={() => undefined}
            options={[
              {
                value: "concise",
                label: "Concise",
                description: "Shorter definitions",
                disabled: true,
                badge: "Coming soon"
              },
              {
                value: "balanced",
                label: "Balanced",
                description: "Default depth",
                disabled: true,
                badge: "Coming soon"
              },
              {
                value: "detailed",
                label: "Detailed",
                description: "More context and nuance",
                disabled: true,
                badge: "Coming soon"
              }
            ]}
          />

          <SettingsOptionGroup<DefaultExplanationLanguage>
            name="default-explanation-language"
            label="Default explanation language"
            description="Used when you request a word explanation in the reader."
            value={preferences.defaultExplanationLanguage}
            onChange={(defaultExplanationLanguage) =>
              patchPreferences({ defaultExplanationLanguage })
            }
            options={[
              {
                value: "document",
                label: "Same as document",
                description: "Match the PDF language"
              },
              { value: "tr", label: "Turkish" },
              { value: "en", label: "English" }
            ]}
          />
        </SettingsSection>

        <FeedbackSettingsSection />

        <div id="upgrade">
          <SettingsSection title="Upgrade">
            {billingLoading ? (
              <p className="text-sm text-slate-500">Loading plan details…</p>
            ) : isProOrAdmin ? (
              <div className="rounded-lg border border-accent/20 bg-accent/[0.06] px-4 py-4">
                <p className="text-sm font-medium text-[#d4dcff]">
                  {planDisplayName(displayPlan)} is active
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                  You have higher AI and PDF limits on your current plan. Thank you for supporting
                  ReadWays.
                </p>
                {billing ? (
                  <p className="mt-3 text-xs text-slate-500">
                    AI today: {billing.ai.used}/{billing.ai.limit} · PDFs this month:{" "}
                    {billing.pdf.used}/{billing.pdf.limit}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-white/[0.10] bg-white/[0.02] px-4 py-4">
                <p className="text-sm font-medium text-zinc-200">
                  Unlock higher AI limits, more PDFs, and advanced reviews.
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                  Free: {billing?.ai.limit ?? 20} AI explanations/day · {billing?.pdf.limit ?? 3}{" "}
                  PDFs/month. Pro plans add substantially more capacity.
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-accent/25 bg-accent/10 px-4 py-2.5 text-sm font-medium text-[#c5cdff] opacity-80 sm:w-auto"
                >
                  Upgrade coming soon
                </button>
              </div>
            )}
          </SettingsSection>
        </div>

        <SettingsSection title="Danger zone">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-200">Clear local reader cache</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                Removes legacy offline document copies stored in this browser. Your cloud library is
                not affected.
              </p>
              <button
                type="button"
                onClick={handleClearReaderCache}
                className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/[0.12] bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-zinc-100"
              >
                Clear local reader cache
              </button>
            </div>

            <div className="border-t border-white/[0.08] pt-4">
              <p className="text-sm font-medium text-zinc-200">Delete account</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                Permanently remove your account and all learning data.
              </p>
              <button
                type="button"
                disabled
                className="mt-3 inline-flex min-h-[44px] cursor-not-allowed items-center justify-center rounded-md border border-red-500/15 bg-red-500/[0.04] px-4 py-2 text-sm text-red-300/50"
              >
                Delete account — coming soon
              </button>
            </div>
          </div>
        </SettingsSection>

      </div>
    </div>
  );
}
