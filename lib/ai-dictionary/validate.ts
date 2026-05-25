import type {
  ExplainWordRequestBody,
  ValidatedExplainWordRequest
} from "./types";

const WORD_MAX_LENGTH = 80;
const SENTENCE_MAX_LENGTH = 800;
const DEFAULT_LANGUAGE = "en";

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

  if (word.length > WORD_MAX_LENGTH) {
    return { ok: false, error: `word must be at most ${WORD_MAX_LENGTH} characters.` };
  }

  if (sentence.length > SENTENCE_MAX_LENGTH) {
    return {
      ok: false,
      error: `sentence must be at most ${SENTENCE_MAX_LENGTH} characters.`
    };
  }

  const language =
    typeof record.language === "string" && record.language.trim().length > 0
      ? record.language.trim()
      : DEFAULT_LANGUAGE;

  return {
    ok: true,
    data: { word, sentence, documentId, language }
  };
}
