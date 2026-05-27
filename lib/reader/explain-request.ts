import {
  PHRASE_MAX_WORDS,
  cleanPhraseText,
  countPhraseWords
} from "./phrase-selection";
import type { ExplainClickPayload } from "./explain-word-client";

export const EXPLAIN_WORD_MAX_LENGTH = 80;
export const EXPLAIN_PHRASE_MAX_LENGTH = 200;

export type ExplainClientValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateExplainClick(
  click: ExplainClickPayload
): ExplainClientValidationResult {
  const raw = click.rawWord.trim();

  if (!raw) {
    return { ok: false, message: "Select a word or short phrase to explain." };
  }

  if (click.kind === "phrase") {
    const phrase = cleanPhraseText(raw);
    const wordCount = countPhraseWords(phrase);

    if (wordCount < 2) {
      return {
        ok: false,
        message: "Select at least two words for a phrase explanation."
      };
    }

    if (wordCount > PHRASE_MAX_WORDS) {
      return {
        ok: false,
        message: `Select up to ${PHRASE_MAX_WORDS} words for a phrase explanation.`
      };
    }

    if (phrase.length > EXPLAIN_PHRASE_MAX_LENGTH) {
      return {
        ok: false,
        message: "That phrase is too long. Try a shorter selection."
      };
    }

    return { ok: true };
  }

  if (raw.length > EXPLAIN_WORD_MAX_LENGTH) {
    return {
      ok: false,
      message: "That selection is too long. Try a single word or shorter phrase."
    };
  }

  return { ok: true };
}
