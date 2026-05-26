import type { DashboardProgressStat, DashboardStats } from "./types";

export function isDashboardNewUser(stats: DashboardStats): boolean {
  return (
    stats.documentsCount === 0 &&
    stats.savedWordsCount === 0 &&
    stats.flashcardsCount === 0 &&
    stats.reviewsCount === 0
  );
}

function reviewAccuracySub(stats: DashboardStats): string {
  if (stats.reviewsCount === 0) {
    return "Start a review session";
  }

  const pct = Math.round((stats.positiveReviewsCount / stats.reviewsCount) * 100);
  return `${pct}% good or easy`;
}

function masteredSub(stats: DashboardStats): string {
  if (stats.savedWordsCount === 0) {
    return "Save words while reading";
  }

  if (stats.masteredWordsCount === 0) {
    return "Keep reviewing to master words";
  }

  return `${stats.masteredWordsCount} mastered`;
}

function flashcardsDueSub(stats: DashboardStats): string {
  if (stats.flashcardsCount === 0) {
    return "Save words to create cards";
  }

  if (stats.flashcardsDueCount === 0) {
    return "All caught up for now";
  }

  return `${stats.flashcardsCount} flashcards total`;
}

function documentsSub(stats: DashboardStats): string {
  if (stats.documentsCount === 0) {
    return "Upload your first PDF";
  }

  if (stats.documentsReadyCount === 0) {
    return `${stats.documentsCount} in library`;
  }

  const inProgress = stats.documentsCount - stats.documentsReadyCount;
  if (inProgress > 0) {
    return `${stats.documentsReadyCount} ready · ${inProgress} processing`;
  }

  return `${stats.documentsReadyCount} ready to read`;
}

export function buildDashboardProgressStats(stats: DashboardStats): DashboardProgressStat[] {
  return [
    {
      label: "Words saved",
      value: String(stats.savedWordsCount),
      sub: masteredSub(stats)
    },
    {
      label: "Cards reviewed",
      value: String(stats.reviewsCount),
      sub: reviewAccuracySub(stats)
    },
    {
      label: "Flashcards due",
      value: String(stats.flashcardsDueCount),
      sub: flashcardsDueSub(stats)
    },
    {
      label: "Documents",
      value: String(stats.documentsCount),
      sub: documentsSub(stats)
    }
  ];
}
