export function previewText(text: string, maxLength = 140): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

import type { UiLocale } from "@/lib/i18n/constants";

export function formatSavedDate(iso: string, locale: UiLocale = "tr"): string {
  return new Date(iso).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

type Translate = (key: string) => string;

export function difficultyLabel(
  level: number | null | undefined,
  t: Translate
): string | null {
  if (level == null || level < 1 || level > 5) {
    return null;
  }

  return t("app.savedWordLevel").replace("{level}", String(level));
}
