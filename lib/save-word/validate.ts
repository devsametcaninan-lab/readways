import type { SaveWordRequestBody } from "./types";

export type SaveWordValidationResult =
  | { ok: true; data: SaveWordRequestBody }
  | { ok: false; error: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateSaveWordRequest(body: unknown): SaveWordValidationResult {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const record = body as SaveWordRequestBody;

  if (!isNonEmptyString(record.documentId)) {
    return { ok: false, error: "documentId is required." };
  }

  if (!isNonEmptyString(record.wordExplanationId)) {
    return { ok: false, error: "wordExplanationId is required." };
  }

  if (!isNonEmptyString(record.word)) {
    return { ok: false, error: "word is required." };
  }

  return {
    ok: true,
    data: {
      documentId: record.documentId.trim(),
      wordExplanationId: record.wordExplanationId.trim(),
      word: record.word.trim()
    }
  };
}
