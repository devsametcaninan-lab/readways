/** Database enum values — keep in sync with SQL check constraints */

export const PLAN_VALUES = ["free", "pro"] as const;
export type Plan = (typeof PLAN_VALUES)[number];

export const DOCUMENT_STATUS_VALUES = [
  "processing",
  "ready",
  "failed",
  "needs_ocr"
] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUS_VALUES)[number];

export const DOCUMENT_JOB_TYPE_VALUES = [
  "pdf_extraction",
  "ocr",
  "cleanup"
] as const;
export type DocumentJobType = (typeof DOCUMENT_JOB_TYPE_VALUES)[number];

export const DOCUMENT_JOB_STATUS_VALUES = [
  "pending",
  "processing",
  "completed",
  "failed"
] as const;
export type DocumentJobStatus = (typeof DOCUMENT_JOB_STATUS_VALUES)[number];

export const SAVED_WORD_STATUS_VALUES = ["learning", "reviewing", "mastered"] as const;
export type SavedWordStatus = (typeof SAVED_WORD_STATUS_VALUES)[number];

export const REVIEW_RATING_VALUES = ["hard", "good", "easy"] as const;
export type ReviewRating = (typeof REVIEW_RATING_VALUES)[number];
