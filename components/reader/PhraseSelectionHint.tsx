"use client";

import { useState } from "react";
import {
  dismissPhraseHintForSession,
  isPhraseHintDismissedForSession
} from "@/lib/preferences/reader-cache";
import { useUserPreferences } from "@/lib/preferences/UserPreferencesProvider";
import { useI18n } from "@/lib/i18n/provider";

export default function PhraseSelectionHint() {
  const { t } = useI18n();
  const { preferences } = useUserPreferences();
  const [dismissed, setDismissed] = useState(() => isPhraseHintDismissedForSession());

  if (!preferences.phraseSelectionHints || dismissed) {
    return null;
  }

  return (
    <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-3">
      <p className="text-[13px] leading-relaxed text-slate-400">
        <span className="font-medium text-zinc-300">{t("app.onboardingPhraseTipLead")}</span>{" "}
        {t("app.onboardingPhraseTipBody")}
      </p>
      <button
        type="button"
        onClick={() => {
          dismissPhraseHintForSession();
          setDismissed(true);
        }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-200"
        aria-label={t("app.onboardingDismissPhraseTip")}
      >
        ×
      </button>
    </div>
  );
}
