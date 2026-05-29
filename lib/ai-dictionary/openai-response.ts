import type { DocumentLanguage } from "@/lib/language/document-language";
import {
  AI_DIFFICULTY_VALUES,
  type AiDifficulty,
  type ValidatedAiExplanation
} from "./openai-response-types";

export type { AiDifficulty, ValidatedAiExplanation } from "./openai-response-types";
export { AI_DIFFICULTY_VALUES } from "./openai-response-types";

export type ExplanationSanitizeInput = {
  word: string;
  sentence: string;
  isPhrase: boolean;
  documentLanguage: DocumentLanguage;
  explanationLanguage: DocumentLanguage;
};

const FIELD_LIMITS = {
  word: 120,
  pronunciation: 80,
  definition: 280,
  contextual_meaning: 360,
  example_usage: 220
} as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function stripMarkdown(value: string): string {
  return value
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .trim();
}

function truncate(value: string, max: number): string {
  const trimmed = collapseWhitespace(value);
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

function normalizeDifficulty(value: unknown): AiDifficulty {
  if (typeof value !== "string") {
    return "intermediate";
  }

  const normalized = value.trim().toLowerCase();
  if (AI_DIFFICULTY_VALUES.includes(normalized as AiDifficulty)) {
    return normalized as AiDifficulty;
  }

  if (normalized.includes("begin") || normalized.includes("easy")) {
    return "beginner";
  }

  if (normalized.includes("advance") || normalized.includes("hard")) {
    return "advanced";
  }

  return "intermediate";
}

function extractJsonObject(text: string): string {
  const cleaned = stripMarkdown(text.trim());
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) {
    return fenced[1].trim();
  }

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return cleaned.slice(start, end + 1);
  }

  return cleaned;
}

function sentencesTooSimilar(a: string, b: string): boolean {
  const left = collapseWhitespace(a).toLowerCase();
  const right = collapseWhitespace(b).toLowerCase();
  if (!left || !right) {
    return false;
  }
  return left === right || left.includes(right) || right.includes(left);
}

function fallbackExampleUsage(word: string, documentLanguage: DocumentLanguage): string {
  if (documentLanguage === "tr") {
    return truncate(
      `"${word}" ile doğal bir örnek cümle kurulabilir; kaynak cümleden farklı olsun.`,
      FIELD_LIMITS.example_usage
    );
  }

  return truncate(
    `Another natural example with "${word}" — different from the source sentence.`,
    FIELD_LIMITS.example_usage
  );
}

function fallbackContextual(definition: string, sentence: string, word: string): string {
  if (definition) {
    return truncate(`Here, "${word}" fits the sentence as: ${definition}`, FIELD_LIMITS.contextual_meaning);
  }
  return truncate(`Used in this sentence to carry the idea around "${word}".`, FIELD_LIMITS.contextual_meaning);
}

export function sanitizeValidatedExplanation(
  record: Record<string, unknown>,
  input: ExplanationSanitizeInput
): ValidatedAiExplanation | null {
  const selectedWord = isNonEmptyString(record.word)
    ? truncate(stripMarkdown(record.word), FIELD_LIMITS.word)
    : truncate(input.word, FIELD_LIMITS.word);

  if (!selectedWord) {
    return null;
  }

  let definition = isNonEmptyString(record.definition)
    ? truncate(stripMarkdown(record.definition), FIELD_LIMITS.definition)
    : "";

  let contextual = isNonEmptyString(record.contextual_meaning)
    ? truncate(stripMarkdown(record.contextual_meaning), FIELD_LIMITS.contextual_meaning)
    : "";

  if (!contextual && definition) {
    contextual = fallbackContextual(definition, input.sentence, selectedWord);
  }

  if (!definition && contextual) {
    definition = truncate(contextual, FIELD_LIMITS.definition);
  }

  if (!contextual) {
    contextual = fallbackContextual(definition, input.sentence, selectedWord);
  }

  if (sentencesTooSimilar(contextual, input.sentence)) {
    contextual = fallbackContextual(definition, input.sentence, selectedWord);
  }

  let example = isNonEmptyString(record.example_usage)
    ? truncate(stripMarkdown(record.example_usage), FIELD_LIMITS.example_usage)
    : "";

  if (!example || sentencesTooSimilar(example, input.sentence)) {
    example = fallbackExampleUsage(selectedWord, input.documentLanguage);
  }

  const pronunciation = isNonEmptyString(record.pronunciation)
    ? truncate(stripMarkdown(record.pronunciation), FIELD_LIMITS.pronunciation)
    : "—";

  return {
    word: selectedWord,
    pronunciation,
    definition,
    contextual_meaning: contextual,
    example_usage: example,
    difficulty: normalizeDifficulty(record.difficulty)
  };
}

export function parseAiExplanationJson(
  raw: string,
  input: ExplanationSanitizeInput
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

  const sanitized = sanitizeValidatedExplanation(parsed as Record<string, unknown>, input);
  if (!sanitized) {
    return { ok: false };
  }

  return { ok: true, data: sanitized };
}
