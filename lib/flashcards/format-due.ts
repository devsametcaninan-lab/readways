import type { UiLocale } from "@/lib/i18n/constants";

type Translate = (key: string) => string;

function formatMessage(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template
  );
}

export function formatDueLabel(
  nextReviewAt: string | null,
  t: Translate,
  locale: UiLocale = "tr"
): string {
  if (!nextReviewAt) {
    return t("app.dueNow");
  }

  const target = new Date(nextReviewAt).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (Number.isNaN(diffMs) || diffMs <= 0) {
    return t("app.dueNow");
  }

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) {
    return minutes <= 1 ? t("app.dueSoon") : formatMessage(t("app.dueMinutes"), { minutes });
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1
      ? t("app.dueOneHour")
      : formatMessage(t("app.dueHours"), { hours });
  }

  const days = Math.floor(hours / 24);
  if (days === 1) {
    return t("app.dueTomorrow");
  }

  if (days < 7) {
    return formatMessage(t("app.dueDaysShort"), { days });
  }

  return new Date(nextReviewAt).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    month: "short",
    day: "numeric"
  });
}

export function formatReviewFeedbackMessage(intervalDays: number, t: Translate): string {
  if (intervalDays <= 1) {
    return t("app.flashcardsFeedbackTomorrow");
  }

  return formatMessage(t("app.flashcardsFeedbackInDays"), { days: intervalDays });
}
