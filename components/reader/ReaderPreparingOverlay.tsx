"use client";

import { useI18n } from "@/lib/i18n/provider";

export default function ReaderPreparingOverlay() {
  const { t } = useI18n();

  return (
    <div
      className="flex items-center justify-center rounded-xl border border-white/[0.08] bg-[#12141d]/80 px-6 py-16"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm text-zinc-500">{t("app.readerPreparingDocument")}</p>
    </div>
  );
}
