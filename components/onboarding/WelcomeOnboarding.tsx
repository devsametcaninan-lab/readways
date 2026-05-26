"use client";

import { ONBOARDING_COPY } from "@/lib/onboarding/constants";
import { useOnboarding } from "@/lib/onboarding/OnboardingProvider";
import UploadPdfButton from "@/components/upload/UploadPdfButton";
import OnboardingHint from "./OnboardingHint";

export default function WelcomeOnboarding() {
  const { shouldShow, dismiss } = useOnboarding();

  if (!shouldShow("welcome")) {
    return null;
  }

  const copy = ONBOARDING_COPY.welcome;

  return (
    <OnboardingHint
      title="Getting started"
      onDismiss={() => void dismiss("welcome")}
      dismissLabel={copy.dismiss}
      className="mb-6"
    >
      <p className="text-base font-medium text-zinc-100">{copy.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{copy.description}</p>
      <div className="mt-4">
        <UploadPdfButton
          label={copy.primaryCta}
          className="rounded-lg border border-accent/30 bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6D7EFF]"
        />
      </div>
    </OnboardingHint>
  );
}
