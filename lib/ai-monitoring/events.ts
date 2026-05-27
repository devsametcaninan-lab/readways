import type { AnalyticsEventName } from "@/lib/analytics/events";

/** AI-related analytics event names used for cost and usage monitoring. */
export const AI_USAGE_EVENT_NAMES = [
  "ai_cache_hit",
  "ai_cache_miss",
  "ai_generated",
  "ai_limit_reached",
  "ai_generation_failed",
  "ai_timeout",
  "ai_invalid_response",
  "ai_error"
] as const satisfies readonly AnalyticsEventName[];

export type AiUsageEventName = (typeof AI_USAGE_EVENT_NAMES)[number];

export const AI_GENERATION_FAILURE_EVENTS = [
  "ai_generation_failed",
  "ai_timeout",
  "ai_invalid_response",
  "ai_error"
] as const satisfies readonly AnalyticsEventName[];

export const AI_REQUEST_EVENTS = [
  "ai_cache_hit",
  "ai_cache_miss",
  "ai_generated"
] as const satisfies readonly AnalyticsEventName[];
