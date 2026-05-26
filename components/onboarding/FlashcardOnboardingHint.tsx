"use client";

import { ONBOARDING_COPY } from "@/lib/onboarding/constants";
import { useOnboarding } from "@/lib/onboarding/OnboardingProvider";
import OnboardingHint from "./OnboardingHint";

export default function FlashcardOnboardingHint() {
  const { shouldShow, dismiss } = useOnboarding();

  if (!shouldShow("flashcards")) {
    return null;
  }

  const copy = ONBOARDING_COPY.flashcards;

  return (
    <OnboardingHint
      title={copy.title}
      onDismiss={() => void dismiss("flashcards")}
      dismissLabel={copy.dismiss}
      className="mb-5"
    >
      <p className="text-sm leading-relaxed text-zinc-400">{copy.description}</p>
    </OnboardingHint>
  );
}
