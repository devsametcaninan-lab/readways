import { normalizeWord } from "@/lib/ai-dictionary/normalize-word";
import { normalizePhrase } from "@/lib/reader/phrase-selection";

/**
 * Canonical word key for saved_words deduplication (user + document + word).
 */
export function normalizeStoredWord(word: string, explanationWord: string): string {
  const canonical = explanationWord.trim();
  if (canonical) {
    return canonical;
  }

  const trimmed = word.trim();
  if (!trimmed) {
    return "";
  }

  if (/\s/.test(trimmed)) {
    return normalizePhrase(trimmed);
  }

  return normalizeWord(trimmed) || trimmed.toLowerCase();
}
