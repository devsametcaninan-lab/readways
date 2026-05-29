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

type Translate = (key: string) => string;

export function validateExplainClick(
  click: ExplainClickPayload,
  t: Translate
): ExplainClientValidationResult {
  const raw = click.rawWord.trim();

  if (!raw) {
    return { ok: false, message: t("toast.explainSelectWord") };
  }

  if (click.kind === "phrase") {
    const phrase = cleanPhraseText(raw);
    const wordCount = countPhraseWords(phrase);

    if (wordCount < 2) {
      return {
        ok: false,
        message: t("toast.explainSelectTwoWords")
      };
    }

    if (wordCount > PHRASE_MAX_WORDS) {
      return {
        ok: false,
        message: t("toast.explainMaxPhraseWords").replace("{max}", String(PHRASE_MAX_WORDS))
      };
    }

    if (phrase.length > EXPLAIN_PHRASE_MAX_LENGTH) {
      return {
        ok: false,
        message: t("toast.explainPhraseTooLong")
      };
    }

    return { ok: true };
  }

  if (raw.length > EXPLAIN_WORD_MAX_LENGTH) {
    return {
      ok: false,
      message: t("toast.explainSelectionTooLong")
    };
  }

  return { ok: true };
}
