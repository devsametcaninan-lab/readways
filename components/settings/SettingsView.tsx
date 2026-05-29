"use client";

import { useEffect, useMemo, useState } from "react";
import UserAvatar from "@/components/app/UserAvatar";
import { useAppUser } from "@/components/app/use-app-user";
import { SignOutForm } from "@/components/feedback/SignOutButton";
import { useToast } from "@/components/feedback/ToastProvider";
import { fetchBillingLimits, type BillingLimitsResponse } from "@/lib/billing/client";
import { planToTier } from "@/lib/billing/plans";
import { localizedPlanName } from "@/lib/i18n/plan-label";
import { clearLocalReaderCache } from "@/lib/preferences/reader-cache";
import { useUserPreferences } from "@/lib/preferences/UserPreferencesProvider";
import type {
  DefaultExplanationLanguage,
  ExplanationStyle,
  HighlightMode
} from "@/lib/preferences/types";
import { useI18n } from "@/lib/i18n/provider";
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

function formatMessage(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template
  );
}

export default function SettingsView() {
  const toast = useToast();
  const { t } = useI18n();
  const { name, email, avatarUrl, plan, loading: userLoading } = useAppUser();
  const { preferences, updatePreferences } = useUserPreferences();
  const [billing, setBilling] = useState<BillingLimitsResponse | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);

  const comingSoon = t("settings.comingSoon");

  const highlightOptions = useMemo(
    () =>
      [
        { value: "subtle" as const, label: t("settings.highlightSubtle"), description: t("settings.highlightSubtleDesc") },
        {
          value: "focused" as const,
          label: t("settings.highlightFocused"),
          description: t("settings.highlightFocusedDesc")
        },
        { value: "off" as const, label: t("settings.highlightOff"), description: t("settings.highlightOffDesc") }
      ],
    [t]
  );

  const themeOptions = useMemo(
    () =>
      [
        { value: "dark" as const, label: t("settings.themeDark"), description: t("settings.themeDarkDesc") },
        {
          value: "light" as const,
          label: t("settings.themeLight"),
          description: t("settings.themeLightDesc"),
          disabled: true,
          badge: comingSoon
        }
      ],
    [comingSoon, t]
  );

  const explanationStyleOptions = useMemo(
    () =>
      [
        {
          value: "concise" as const,
          label: t("settings.styleConcise"),
          description: t("settings.styleConciseDesc"),
          disabled: true,
          badge: comingSoon
        },
        {
          value: "balanced" as const,
          label: t("settings.styleBalanced"),
          description: t("settings.styleBalancedDesc"),
          disabled: true,
          badge: comingSoon
        },
        {
          value: "detailed" as const,
          label: t("settings.styleDetailed"),
          description: t("settings.styleDetailedDesc"),
          disabled: true,
          badge: comingSoon
        }
      ],
    [comingSoon, t]
  );

  const explanationLanguageOptions = useMemo(
    () =>
      [
        {
          value: "document" as const,
          label: t("settings.langSameAsDocument"),
          description: t("settings.langSameAsDocumentDesc")
        },
        { value: "tr" as const, label: t("settings.langTurkish") },
        { value: "en" as const, label: t("settings.langEnglish") }
      ],
    [t]
  );

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
  const displayPlanLabel = localizedPlanName(displayPlan, t);

  function notifyUpdated() {
    toast.success(t("toast.settingsUpdated"));
  }

  function patchPreferences<T extends Partial<typeof preferences>>(patch: T) {
    updatePreferences(patch);
    notifyUpdated();
  }

  function handleClearReaderCache() {
    const removed = clearLocalReaderCache();
    toast.success(
      removed > 0 ? t("toast.readerCacheCleared") : t("toast.readerCacheAlreadyEmpty")
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">
          {t("settings.title")}
        </h1>
        <p className="mt-2 text-sm text-slate-400">{t("settings.subtitle")}</p>
      </div>

      <div className="mx-auto max-w-xl space-y-4">
        <SettingsSection title={t("settings.sectionAccount")}>
          <div className="flex items-center gap-4">
            <UserAvatar
              name={userLoading ? t("settings.fallbackName") : name}
              avatarUrl={avatarUrl}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-medium text-white">
                {userLoading ? t("common.loading") : name}
              </p>
              <p className="mt-0.5 truncate text-sm text-slate-400">
                {userLoading ? "…" : email || t("settings.noEmail")}
              </p>
              <p className="mt-2">
                <span
                  className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] ${planBadgeClass(tier)}`}
                >
                  {userLoading ? "…" : displayPlanLabel}
                </span>
              </p>
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-4">
            <SignOutForm />
          </div>
        </SettingsSection>

        <SettingsSection
          title={t("settings.sectionReading")}
          description={t("settings.readingDescription")}
        >
          <SettingsOptionGroup<HighlightMode>
            name="highlight-mode"
            label={t("settings.highlightMode")}
            description={t("settings.highlightModeDesc")}
            value={preferences.highlightMode}
            onChange={(highlightMode) => patchPreferences({ highlightMode })}
            options={highlightOptions}
          />

          <SettingsToggle
            id="auto-save-words"
            label={t("settings.autoSave")}
            description={t("settings.autoSaveDesc")}
            checked={preferences.autoSaveWords}
            onChange={(autoSaveWords) => patchPreferences({ autoSaveWords })}
          />

          <SettingsToggle
            id="phrase-selection-hints"
            label={t("settings.phraseHints")}
            description={t("settings.phraseHintsDesc")}
            checked={preferences.phraseSelectionHints}
            onChange={(phraseSelectionHints) => patchPreferences({ phraseSelectionHints })}
          />
        </SettingsSection>

        <SettingsSection title={t("settings.sectionAppearance")}>
          <SettingsOptionGroup<"dark" | "light">
            name="theme"
            label={t("settings.theme")}
            value={preferences.theme}
            onChange={(theme) => {
              if (theme === "dark") {
                patchPreferences({ theme: "dark" });
              }
            }}
            options={themeOptions}
          />
        </SettingsSection>

        <SettingsSection
          title={t("settings.sectionAi")}
          description={t("settings.sectionAiDesc")}
        >
          <SettingsOptionGroup<ExplanationStyle>
            name="explanation-style"
            label={t("settings.explanationStyle")}
            value={preferences.explanationStyle}
            onChange={() => undefined}
            options={explanationStyleOptions}
          />

          <SettingsOptionGroup<DefaultExplanationLanguage>
            name="default-explanation-language"
            label={t("settings.defaultExplanationLanguage")}
            description={t("settings.defaultExplanationLanguageDesc")}
            value={preferences.defaultExplanationLanguage}
            onChange={(defaultExplanationLanguage) =>
              patchPreferences({ defaultExplanationLanguage })
            }
            options={explanationLanguageOptions}
          />
        </SettingsSection>

        <FeedbackSettingsSection />

        <div id="upgrade">
          <SettingsSection title={t("settings.sectionUpgrade")}>
            {billingLoading ? (
              <p className="text-sm text-slate-500">{t("settings.loadingPlan")}</p>
            ) : isProOrAdmin ? (
              <div className="rounded-lg border border-accent/20 bg-accent/[0.06] px-4 py-4">
                <p className="text-sm font-medium text-[#d4dcff]">
                  {formatMessage(t("settings.planActive"), { plan: displayPlanLabel })}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                  {t("settings.planActiveBody")}
                </p>
                {billing ? (
                  <p className="mt-3 text-xs text-slate-500">
                    {formatMessage(t("settings.usageToday"), {
                      aiUsed: billing.ai.used,
                      aiLimit: billing.ai.limit,
                      pdfUsed: billing.pdf.used,
                      pdfLimit: billing.pdf.limit
                    })}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-white/[0.10] bg-white/[0.02] px-4 py-4">
                <p className="text-sm font-medium text-zinc-200">{t("settings.upgradeTeaser")}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                  {formatMessage(t("settings.upgradeLimits"), {
                    aiLimit: billing?.ai.limit ?? 20,
                    pdfLimit: billing?.pdf.limit ?? 3
                  })}
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-accent/25 bg-accent/10 px-4 py-2.5 text-sm font-medium text-[#c5cdff] opacity-80 sm:w-auto"
                >
                  {t("settings.upgradeComingSoon")}
                </button>
              </div>
            )}
          </SettingsSection>
        </div>

        <SettingsSection title={t("settings.sectionDanger")}>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-200">{t("settings.clearCacheTitle")}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                {t("settings.clearCacheDesc")}
              </p>
              <button
                type="button"
                onClick={handleClearReaderCache}
                className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/[0.12] bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-zinc-100"
              >
                {t("settings.clearCacheAction")}
              </button>
            </div>

            <div className="border-t border-white/[0.08] pt-4">
              <p className="text-sm font-medium text-zinc-200">{t("settings.deleteAccountTitle")}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                {t("settings.deleteAccountDesc")}
              </p>
              <button
                type="button"
                disabled
                className="mt-3 inline-flex min-h-[44px] cursor-not-allowed items-center justify-center rounded-md border border-red-500/15 bg-red-500/[0.04] px-4 py-2 text-sm text-red-300/50"
              >
                {t("settings.deleteAccountAction")}
              </button>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
