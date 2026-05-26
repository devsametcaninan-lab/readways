"use client";

import { ONBOARDING_COPY } from "@/lib/onboarding/constants";
import { useOnboarding } from "@/lib/onboarding/OnboardingProvider";
import OnboardingHint from "./OnboardingHint";

export default function ReaderOnboardingHints() {
  const { shouldShow, dismiss } = useOnboarding();

  if (!shouldShow("reader")) {
    return null;
  }

  const copy = ONBOARDING_COPY.reader;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4 pb-[env(safe-area-inset-bottom)] lg:bottom-6 lg:max-w-[42rem] lg:px-0">
      <div className="pointer-events-auto w-full max-w-md">
        <OnboardingHint
          title="Quick tips"
          onDismiss={() => void dismiss("reader")}
          dismissLabel={copy.dismiss}
        >
          <ul className="space-y-2 text-left text-[13px] leading-relaxed text-zinc-400">
            {copy.hints.map((hint) => (
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
