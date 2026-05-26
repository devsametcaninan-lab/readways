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

export const SAVED_WORD_STATUS_VALUES = ["learning", "reviewing", "mastered"] as const;
export type SavedWordStatus = (typeof SAVED_WORD_STATUS_VALUES)[number];

export const REVIEW_RATING_VALUES = ["hard", "good", "easy"] as const;
export type ReviewRating = (typeof REVIEW_RATING_VALUES)[number];
