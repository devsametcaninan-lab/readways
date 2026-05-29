export function isRateLimitMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("daily limit") ||
    normalized.includes("limit reached") ||
    normalized.includes("429")
  );
}

import { localizeUserMessage } from "@/lib/i18n/localize-user-message";

type Translate = (key: string) => string;

export function explainErrorToastMessage(message: string, t: Translate): string {
  return localizeUserMessage(message, t);
}
