export const FEEDBACK_TYPE_VALUES = ["bug", "feature_request", "general"] as const;
export type FeedbackType = (typeof FEEDBACK_TYPE_VALUES)[number];

export const FEEDBACK_STATUS_VALUES = ["new", "reviewed", "resolved"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUS_VALUES)[number];

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  bug: "Bug",
  feature_request: "Feature request",
  general: "General"
};

export const FEEDBACK_CONTACT_EMAIL = "info@readways.com";
