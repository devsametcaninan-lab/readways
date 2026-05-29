import { isRateLimitMessage } from "@/lib/feedback/messages";

type Translate = (key: string) => string;

function formatMessage(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template
  );
}

const EXACT_MESSAGE_KEYS: Record<string, string> = {
  "Could not save word.": "toast.saveWordFailed",
  "Could not save word. Please try again.": "toast.saveWordFailed",
  "Could not load word explanation.": "toast.explainLoadFailed",
  "Could not load a complete explanation. Please try again.": "toast.explainIncomplete",
  "Could not generate explanation. Please try again.": "toast.explainLoadFailed",
  "Could not save explanation. Please try again.": "toast.explainLoadFailed",
  "Could not send feedback.": "toast.feedbackSendFailed",
  "Could not send feedback. Please try again.": "toast.feedbackSendFailed",
  "Could not save feedback. Please try again.": "toast.feedbackSendFailed",
  "Could not save review.": "toast.reviewSaveFailed",
  "Could not save review. Please try again.": "toast.reviewSaveFailed",
  "Could not remove word. Please try again.": "toast.removeWordFailed",
  "Could not queue review. Please try again.": "toast.queueReviewFailed",
  "Could not delete document. Please try again.": "toast.deleteDocumentFailed",
  "Daily AI limit reached": "toast.dailyAiLimit",
  "Upgrade to continue reading without limits.": "toast.dailyAiLimitUpgrade",
  "You've used all AI explanations available for today. Try again tomorrow.":
    "toast.dailyAiLimitProMessage",
  "Monthly PDF limit reached": "toast.pdfMonthlyLimit",
  "You've reached your monthly PDF upload limit.": "toast.pdfMonthlyLimitProMessage",
  "Upgrade to upload more documents and keep learning.": "toast.pdfMonthlyLimitUpgrade",
  "Authentication required.": "toast.authenticationRequired",
  "Invalid JSON body.": "toast.invalidRequest",
  "Invalid feedback type.": "toast.feedbackInvalidType",
  "Message is required.": "toast.feedbackMessageRequired",
  "Message is too long.": "toast.feedbackMessageTooLong",
  "Invalid route.": "toast.feedbackInvalidRoute",
  "Request body must be a JSON object.": "toast.invalidRequest",
  "Select a word or short phrase to explain.": "toast.explainSelectWord",
  "Select at least two words for a phrase explanation.": "toast.explainSelectTwoWords",
  "That phrase is too long. Try a shorter selection.": "toast.explainPhraseTooLong",
  "That selection is too long. Try a single word or shorter phrase.":
    "toast.explainSelectionTooLong"
};

export function localizeUserMessage(message: string, t: Translate): string {
  const trimmed = message.trim();
  const exactKey = EXACT_MESSAGE_KEYS[trimmed];

  if (exactKey) {
    return t(exactKey);
  }

  if (isRateLimitMessage(trimmed)) {
    return t("toast.dailyAiLimit");
  }

  const minLength = trimmed.match(/^Message must be at least (\d+) characters\.$/);
  if (minLength) {
    return formatMessage(t("toast.feedbackMessageMinLength"), { min: minLength[1] });
  }

  const phraseMaxWords = trimmed.match(/^Select up to (\d+) words for a phrase explanation\.$/);
  if (phraseMaxWords) {
    return formatMessage(t("toast.explainMaxPhraseWords"), { max: phraseMaxWords[1] });
  }

  return trimmed;
}

export function localizePaywallState(
  paywall: { title: string; message: string },
  t: Translate
): { title: string; message: string } {
  return {
    title: localizeUserMessage(paywall.title, t),
    message: localizeUserMessage(paywall.message, t)
  };
}

export function defaultAiLimitPaywall(t: Translate): { title: string; message: string } {
  return {
    title: t("toast.dailyAiLimit"),
    message: t("toast.dailyAiLimitUpgrade")
  };
}
