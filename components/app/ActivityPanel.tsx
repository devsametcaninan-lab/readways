"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { appText } from "./app-typography";
import { fetchDashboardDataForCurrentUser } from "@/lib/dashboard/client";
import type { DashboardData } from "@/lib/dashboard/types";

export default function ActivityPanel() {
  const { t } = useI18n();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchDashboardDataForCurrentUser()
      .then((data) => {
        if (!cancelled) {
          setDashboard(data);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = dashboard?.stats;

  const formatMessage = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce(
      (text, [key, value]) => text.replace(`{${key}}`, String(value)),
      template
    );

  const masteredPct =
    stats && stats.savedWordsCount > 0
      ? Math.round((stats.masteredWordsCount / stats.savedWordsCount) * 100)
      : 0;

  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-l border-white/[0.1] bg-[#0e0f14] xl:flex">
      <div className="border-b border-white/[0.1] px-4 py-3">
        <p className={appText.label}>{t("shell.activity")}</p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className={appText.metaSmall}>{t("app.activitySavedWords")}</p>
            <Link href="/saved-words" className={appText.link}>
              {t("app.activityViewAll")}
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[52px] animate-pulse rounded-lg border border-white/[0.1] bg-[#12141d]"
                />
              ))
            ) : dashboard && dashboard.savedWordPreviews.length > 0 ? (
              dashboard.savedWordPreviews.map((word) => (
                <div
                  key={word.id}
                  className="rounded-lg border border-white/[0.1] bg-[#12141d] px-3 py-2.5 transition-colors hover:border-white/[0.14] hover:bg-[#141820]"
                >
                  <p className={appText.title}>{word.word}</p>
                  <p className={`mt-0.5 truncate ${appText.metaSmall}`}>{word.meaning}</p>
                </div>
              ))
            ) : (
              <p className={`rounded-lg border border-white/[0.1] bg-[#12141d] px-3 py-2.5 ${appText.metaSmall}`}>
                {t("app.activityNoSavedWords")}
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className={appText.metaSmall}>{t("app.activityFlashcardsDue")}</p>
            <Link href="/flashcards" className={appText.link}>
              {t("app.activityReview")}
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              [0, 1].map((i) => (
                <div
                  key={i}
                  className="h-[52px] animate-pulse rounded-lg border border-white/[0.1] bg-[#12141d]"
                />
              ))
            ) : dashboard && dashboard.dueFlashcardPreviews.length > 0 ? (
              dashboard.dueFlashcardPreviews.map((card) => (
                <div
                  key={card.id}
                  className="rounded-lg border border-white/[0.1] bg-[#12141d] px-3 py-2.5 transition-colors hover:border-white/[0.14] hover:bg-[#141820]"
                >
                  <div className="flex items-center justify-between">
                    <p className={appText.title}>{card.word}</p>
                    <span className={appText.metaSmall}>Due {card.dueLabel}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className={`rounded-lg border border-white/[0.1] bg-[#12141d] px-3 py-2.5 ${appText.metaSmall}`}>
                {stats && stats.flashcardsDueCount > 0
                  ? formatMessage(t("app.activityDueOpenReview"), {
                      count: stats.flashcardsDueCount
                    })
                  : t("app.activityNoCardsDue")}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.12] bg-[#12141d] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <p className={appText.metaSmall}>{t("app.activityVocabularyProgress")}</p>
          {loading || !stats ? (
            <div className="mt-3 h-8 animate-pulse rounded bg-white/[0.06]" />
          ) : stats.savedWordsCount === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">
              {t("app.activityTrackProgressHint")}
            </p>
          ) : (
            <>
              <p className="mt-1.5 text-sm font-medium text-zinc-100">
                {formatMessage(t("app.activityMasteredRatio"), {
                  mastered: stats.masteredWordsCount,
                  total: stats.savedWordsCount
                })}
              </p>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.1]">
                <div
                  className="h-full rounded-full bg-accent/70 transition-[width] duration-300"
                  style={{ width: `${masteredPct}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
