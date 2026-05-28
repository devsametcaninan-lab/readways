"use client";

import { useOnboarding } from "@/lib/onboarding/OnboardingProvider";
import { useI18n } from "@/lib/i18n/provider";
import OnboardingHint from "./OnboardingHint";

export default function ReaderOnboardingHints() {
  const { t } = useI18n();
  const { shouldShow, dismiss } = useOnboarding();

  if (!shouldShow("reader")) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4 pb-[env(safe-area-inset-bottom)] lg:bottom-6 lg:max-w-[42rem] lg:px-0">
      <div className="pointer-events-auto w-full max-w-md">
        <OnboardingHint
          title={t("app.onboardingQuickTips")}
          onDismiss={() => void dismiss("reader")}
          dismissLabel={t("app.onboardingGotIt")}
        >
          <ul className="space-y-2 text-left text-[13px] leading-relaxed text-zinc-400">
            {[
              { id: "word", text: t("app.onboardingTapWord") },
              { id: "phrase", text: t("app.onboardingSelectPhrase") },
              { id: "save", text: t("app.onboardingSaveWords") }
            ].map((hint) => (
              <li key={hint.id} className="flex gap-2">
                <span className="mt-[0.35rem] h-1 w-1 shrink-0 rounded-full bg-accent/70" />
                <span>{hint.text}</span>
              </li>
            ))}
          </ul>
        </OnboardingHint>
      </div>
    </div>
  );
}
