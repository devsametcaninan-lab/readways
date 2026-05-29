import type { DashboardProgressStat, DashboardStats } from "./types";

type Translate = (key: string) => string;

function formatMessage(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template
  );
}

export function isDashboardNewUser(stats: DashboardStats): boolean {
  return (
    stats.documentsCount === 0 &&
    stats.savedWordsCount === 0 &&
    stats.flashcardsCount === 0 &&
    stats.reviewsCount === 0
  );
}

function reviewAccuracySub(stats: DashboardStats, t: Translate): string {
  if (stats.reviewsCount === 0) {
    return t("app.progressStartReviewSession");
  }

  const pct = Math.round((stats.positiveReviewsCount / stats.reviewsCount) * 100);
  return formatMessage(t("app.progressReviewAccuracy"), { pct });
}

function masteredSub(stats: DashboardStats, t: Translate): string {
  if (stats.savedWordsCount === 0) {
    return t("app.progressSaveWhileReading");
  }

  if (stats.masteredWordsCount === 0) {
    return t("app.progressKeepReviewing");
  }

  return formatMessage(t("app.progressMasteredCount"), {
    count: stats.masteredWordsCount
  });
}

function flashcardsDueSub(stats: DashboardStats, t: Translate): string {
  if (stats.flashcardsCount === 0) {
    return t("app.progressSaveWordsForCards");
  }

  if (stats.flashcardsDueCount === 0) {
    return t("app.progressAllCaughtUp");
  }

  return formatMessage(t("app.progressFlashcardsTotal"), {
    count: stats.flashcardsCount
  });
}

function documentsSub(stats: DashboardStats, t: Translate): string {
  if (stats.documentsCount === 0) {
    return t("app.progressUploadFirstPdf");
  }

  if (stats.documentsReadyCount === 0) {
    return formatMessage(t("app.progressInLibrary"), { count: stats.documentsCount });
  }

  const inProgress = stats.documentsCount - stats.documentsReadyCount;
  if (inProgress > 0) {
    return formatMessage(t("app.progressReadyProcessing"), {
      ready: stats.documentsReadyCount,
      processing: inProgress
    });
  }

  return formatMessage(t("app.progressReadyToRead"), { ready: stats.documentsReadyCount });
}

export function buildDashboardProgressStats(
  stats: DashboardStats,
  t: Translate
): DashboardProgressStat[] {
  return [
    {
      label: t("app.progressWordsSaved"),
      value: String(stats.savedWordsCount),
      sub: masteredSub(stats, t)
    },
    {
      label: t("app.progressCardsReviewed"),
      value: String(stats.reviewsCount),
      sub: reviewAccuracySub(stats, t)
    },
    {
      label: t("app.progressFlashcardsDue"),
      value: String(stats.flashcardsDueCount),
      sub: flashcardsDueSub(stats, t)
    },
    {
      label: t("app.progressDocuments"),
      value: String(stats.documentsCount),
      sub: documentsSub(stats, t)
    }
  ];
}
