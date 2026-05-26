export function formatDueLabel(nextReviewAt: string | null): string {
  if (!nextReviewAt) {
    return "Now";
  }

  const target = new Date(nextReviewAt).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (Number.isNaN(diffMs) || diffMs <= 0) {
    return "Now";
  }

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) {
    return minutes <= 1 ? "Soon" : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? "1h" : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  if (days === 1) {
    return "Tomorrow";
  }

  if (days < 7) {
    return `${days}d`;
  }

  return new Date(nextReviewAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}
