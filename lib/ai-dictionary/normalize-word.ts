/**
 * Normalizes a selected word for cache keys and lookups.
 * Lowercases, trims, and strips surrounding punctuation.
 */
export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .trim()
    .replace(/^[^a-z0-9']+|[^a-z0-9']+$/gi, "");
}
