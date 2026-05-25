export const AI_DIFFICULTY_VALUES = ["beginner", "intermediate", "advanced"] as const;
export type AiDifficulty = (typeof AI_DIFFICULTY_VALUES)[number];

export type ValidatedAiExplanation = {
  word: string;
  pronunciation: string;
  definition: string;
  contextual_meaning: string;
  example_usage: string;
  difficulty: AiDifficulty;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function extractJsonObject(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

export function parseAiExplanationJson(
  raw: string
): { ok: true; data: ValidatedAiExplanation } | { ok: false } {
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJsonObject(raw));
  } catch {
    return { ok: false };
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false };
  }

  const record = parsed as Record<string, unknown>;

  if (
    !isNonEmptyString(record.word) ||
    !isNonEmptyString(record.pronunciation) ||
    !isNonEmptyString(record.definition) ||
    !isNonEmptyString(record.contextual_meaning) ||
    !isNonEmptyString(record.example_usage) ||
    typeof record.difficulty !== "string" ||
    !AI_DIFFICULTY_VALUES.includes(record.difficulty as AiDifficulty)
  ) {
    return { ok: false };
  }

  return {
    ok: true,
    data: {
      word: record.word.trim(),
      pronunciation: record.pronunciation.trim(),
      definition: record.definition.trim(),
      contextual_meaning: record.contextual_meaning.trim(),
      example_usage: record.example_usage.trim(),
      difficulty: record.difficulty as AiDifficulty
    }
  };
}
