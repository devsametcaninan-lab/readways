"use client";

import { useOnboarding } from "@/lib/onboarding/OnboardingProvider";
import UploadPdfButton from "@/components/upload/UploadPdfButton";
import { useI18n } from "@/lib/i18n/provider";
import OnboardingHint from "./OnboardingHint";

export default function WelcomeOnboarding() {
  const { t } = useI18n();
  const { shouldShow, dismiss } = useOnboarding();

  if (!shouldShow("welcome")) {
    return null;
  }

  return (
    <OnboardingHint
      title={t("app.onboardingGettingStarted")}
      onDismiss={() => void dismiss("welcome")}
      dismissLabel={t("app.onboardingGotIt")}
      className="mb-6"
    >
      <p className="text-base font-medium text-zinc-100">{t("app.onboardingWelcomeTitle")}</p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{t("app.onboardingWelcomeDescription")}</p>
      <div className="mt-4">
        <UploadPdfButton
          label={t("app.onboardingUploadFirstPdf")}
          className="rounded-lg border border-accent/30 bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6D7EFF]"
        />
      </div>
    </OnboardingHint>
  );
}
