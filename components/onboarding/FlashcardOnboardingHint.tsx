"use client";

import { useOnboarding } from "@/lib/onboarding/OnboardingProvider";
import { useI18n } from "@/lib/i18n/provider";
import OnboardingHint from "./OnboardingHint";

export default function FlashcardOnboardingHint() {
  const { t } = useI18n();
  const { shouldShow, dismiss } = useOnboarding();

  if (!shouldShow("flashcards")) {
    return null;
  }

  return (
    <OnboardingHint
      title={t("app.onboardingRateRecallTitle")}
      onDismiss={() => void dismiss("flashcards")}
      dismissLabel={t("app.onboardingGotIt")}
      className="mb-5"
    >
      <p className="text-sm leading-relaxed text-zinc-400">
        {t("app.onboardingRateRecallDescription")}
      </p>
    </OnboardingHint>
  );
}
