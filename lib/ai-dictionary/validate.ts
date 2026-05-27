import { normalizeDocumentLanguage } from "@/lib/language/document-language";
import type {
  ExplainWordRequestBody,
  ValidatedExplainWordRequest
} from "./types";

const WORD_MAX_LENGTH = 80;
const PHRASE_MAX_LENGTH = 200;
const SENTENCE_MAX_LENGTH = 800;

export type ExplainWordValidationResult =
  | { ok: true; data: ValidatedExplainWordRequest }
  | { ok: false; error: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateExplainWordRequest(
  body: unknown
): ExplainWordValidationResult {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const record = body as ExplainWordRequestBody;

  if (!isNonEmptyString(record.word)) {
    return { ok: false, error: "word is required." };
  }

  if (!isNonEmptyString(record.sentence)) {
    return { ok: false, error: "sentence is required." };
  }

  if (!isNonEmptyString(record.documentId)) {
    return { ok: false, error: "documentId is required." };
  }

  const word = record.word.trim();
  const sentence = record.sentence.trim();
  const documentId = record.documentId.trim();

  const isPhrase = /\s/.test(word);
  const wordMax = isPhrase ? PHRASE_MAX_LENGTH : WORD_MAX_LENGTH;

  if (word.length > wordMax) {
    return {
      ok: false,
      error: isPhrase
        ? `phrase must be at most ${PHRASE_MAX_LENGTH} characters.`
        : `word must be at most ${WORD_MAX_LENGTH} characters.`
    };
  }

  if (sentence.length > SENTENCE_MAX_LENGTH) {
    return {
      ok: false,
      error: `sentence must be at most ${SENTENCE_MAX_LENGTH} characters.`
    };
  }

  const language = normalizeDocumentLanguage(
    typeof record.language === "string" ? record.language : undefined
  );

  return {
    ok: true,
    data: { word, sentence, documentId, language }
  };
}
