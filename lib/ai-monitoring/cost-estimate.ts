/** Rough gpt-4o-mini list prices (USD per 1M tokens). Estimates only — not billing truth. */
const DEFAULT_INPUT_USD_PER_1M = 0.15;
const DEFAULT_OUTPUT_USD_PER_1M = 0.6;

/** Typical system + instruction overhead per OpenAI call (tokens). */
export const EXPLANATION_SYSTEM_PROMPT_TOKEN_ESTIMATE = 450;

/** Expected JSON response size when output fields are not yet known. */
export const EXPLANATION_DEFAULT_OUTPUT_TOKEN_ESTIMATE = 120;

/** Requests slower than this are flagged in analytics metadata. */
export const SLOW_AI_REQUEST_MS = 10_000;

/** ~4 characters per token for mixed Latin text (heuristic). */
export function estimateTokensFromText(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  return Math.max(1, Math.ceil(trimmed.length / 4));
}

export type ExplanationTokenEstimate = {
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
};

export function estimateExplanationTokens(params: {
  word: string;
  sentence: string;
  definition?: string;
  contextualMeaning?: string;
  pronunciation?: string;
  /** Second repair call after a failed parse. */
  repairAttempt?: boolean;
}): ExplanationTokenEstimate {
  const userPromptTokens =
    estimateTokensFromText(params.word) + estimateTokensFromText(params.sentence);

  const repairOverhead = params.repairAttempt ? 100 : 0;

  const estimatedInputTokens =
    EXPLANATION_SYSTEM_PROMPT_TOKEN_ESTIMATE + userPromptTokens + repairOverhead;

  const outputText = [params.definition, params.contextualMeaning, params.pronunciation]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ");

  const estimatedOutputTokens = outputText
    ? estimateTokensFromText(outputText)
    : EXPLANATION_DEFAULT_OUTPUT_TOKEN_ESTIMATE;

  return { estimatedInputTokens, estimatedOutputTokens };
}

export function estimateRequestCostUsd(
  estimatedInputTokens: number,
  estimatedOutputTokens: number
): number {
  const inputCost = (estimatedInputTokens * DEFAULT_INPUT_USD_PER_1M) / 1_000_000;
  const outputCost = (estimatedOutputTokens * DEFAULT_OUTPUT_USD_PER_1M) / 1_000_000;
  const total = inputCost + outputCost;

  return Math.round(total * 1_000_000) / 1_000_000;
}
