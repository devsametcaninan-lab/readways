export const ANALYTICS_EVENT_NAMES = [
  "pdf_uploaded",
  "pdf_parse_failed",
  "pdf_storage_uploaded",
  "pdf_storage_failed",
  "document_processing_ready",
  "document_processing_failed",
  "document_needs_ocr",
  "document_job_created",
  "document_job_completed",
  "document_job_failed",
  "paywall_shown",
  "upgrade_cta_clicked",
  "limit_reached",
  "word_explained",
  "phrase_explained",
  "word_saved",
  "flashcard_reviewed",
  "review_completed",
  "ai_cache_hit",
  "ai_generated",
  "ai_limit_reached",
  "ai_error"
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export const ANALYTICS_EVENT_TYPES = ["product", "ai", "error"] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export const EVENT_NAME_TO_TYPE: Record<AnalyticsEventName, AnalyticsEventType> = {
  pdf_uploaded: "product",
  pdf_parse_failed: "error",
  pdf_storage_uploaded: "product",
  pdf_storage_failed: "error",
  document_processing_ready: "product",
  document_processing_failed: "error",
  document_needs_ocr: "product",
  document_job_created: "product",
  document_job_completed: "product",
  document_job_failed: "error",
  paywall_shown: "product",
  upgrade_cta_clicked: "product",
  limit_reached: "error",
  word_explained: "product",
  phrase_explained: "product",
  word_saved: "product",
  flashcard_reviewed: "product",
  review_completed: "product",
  ai_cache_hit: "ai",
  ai_generated: "ai",
  ai_limit_reached: "ai",
  ai_error: "error"
};

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return ANALYTICS_EVENT_NAMES.includes(value as AnalyticsEventName);
}

export function eventTypeForName(name: AnalyticsEventName): AnalyticsEventType {
  return EVENT_NAME_TO_TYPE[name];
}
