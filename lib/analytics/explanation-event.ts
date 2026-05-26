import { countPhraseWords } from "@/lib/reader/phrase-selection";
import type { AnalyticsEventName } from "./events";

export function explanationProductEventName(word: string): Extract<
  AnalyticsEventName,
  "word_explained" | "phrase_explained"
> {
  return countPhraseWords(word) >= 2 ? "phrase_explained" : "word_explained";
}
