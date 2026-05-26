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

export function formatSavedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function difficultyLabel(level: number | null | undefined): string | null {
  if (level == null || level < 1 || level > 5) {
    return null;
  }

  return `Level ${level}`;
}
