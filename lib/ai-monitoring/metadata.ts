import type { DocumentLanguage } from "@/lib/language/document-language";
import {
  estimateExplanationTokens,
  estimateRequestCostUsd,
  SLOW_AI_REQUEST_MS
} from "./cost-estimate";

export type AiExplanationKind = "word_explained" | "phrase_explained";

export type AiCacheStatus = "hit" | "miss";

export type BuildAiUsageMetadataParams = {
  documentId: string;
  documentLanguage: DocumentLanguage;
  explanationLanguage: DocumentLanguage;
  explanationKind: AiExplanationKind;
  cacheStatus: AiCacheStatus;
  durationMs?: number;
  word?: string;
  sentence?: string;
  definition?: string;
  contextualMeaning?: string;
  pronunciation?: string;
  repairAttempt?: boolean;
  reason?: string;
  plan?: string;
  used?: number;
  limit?: number;
  cacheLookupMs?: number;
  usageSnapshotMs?: number;
  allowanceMs?: number;
  openAiMs?: number;
  insertMs?: number;
  usageIncrementMs?: number;
};

export function buildAiUsageMetadata(
  params: BuildAiUsageMetadataParams
): Record<string, unknown> {
  const durationMs =
    typeof params.durationMs === "number" && Number.isFinite(params.durationMs)
      ? Math.max(0, Math.round(params.durationMs))
      : undefined;

  const tokenEstimate =
    params.cacheStatus === "hit"
      ? { estimatedInputTokens: 0, estimatedOutputTokens: 0 }
      : params.word && params.sentence
        ? estimateExplanationTokens({
            word: params.word,
            sentence: params.sentence,
            definition: params.definition,
            contextualMeaning: params.contextualMeaning,
            pronunciation: params.pronunciation,
            repairAttempt: params.repairAttempt
          })
        : null;

  const estimatedInputTokens = tokenEstimate?.estimatedInputTokens;
  const estimatedOutputTokens = tokenEstimate?.estimatedOutputTokens;
  const estimatedCostUsd =
    tokenEstimate != null
      ? estimateRequestCostUsd(
          tokenEstimate.estimatedInputTokens,
          tokenEstimate.estimatedOutputTokens
        )
      : undefined;

  const metadata: Record<string, unknown> = {
    documentId: params.documentId,
    documentLanguage: params.documentLanguage,
    explanationLanguage: params.explanationLanguage,
    explanationKind: params.explanationKind,
    cacheStatus: params.cacheStatus
  };

  if (durationMs !== undefined) {
    metadata.durationMs = durationMs;
    metadata.slowRequest = durationMs >= SLOW_AI_REQUEST_MS;
  }

  if (estimatedInputTokens !== undefined) {
    metadata.estimatedInputTokens = estimatedInputTokens;
  }

  if (estimatedOutputTokens !== undefined) {
    metadata.estimatedOutputTokens = estimatedOutputTokens;
  }

  if (estimatedCostUsd !== undefined) {
    metadata.estimatedCostUsd = estimatedCostUsd;
  }

  if (params.reason) {
    metadata.reason = params.reason;
  }

  if (params.plan) {
    metadata.plan = params.plan;
  }

  if (typeof params.used === "number") {
    metadata.used = params.used;
  }

  if (typeof params.limit === "number") {
    metadata.limit = params.limit;
  }

  const timingFields: Array<[string, number | undefined]> = [
    ["cacheLookupMs", params.cacheLookupMs],
    ["usageSnapshotMs", params.usageSnapshotMs],
    ["allowanceMs", params.allowanceMs],
    ["openAiMs", params.openAiMs],
    ["insertMs", params.insertMs],
    ["usageIncrementMs", params.usageIncrementMs]
  ];

  for (const [key, value] of timingFields) {
    if (typeof value === "number" && Number.isFinite(value)) {
      metadata[key] = Math.max(0, Math.round(value));
    }
  }

  return metadata;
}
