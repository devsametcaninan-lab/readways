export function isRateLimitMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("daily limit") ||
    normalized.includes("limit reached") ||
    normalized.includes("429")
  );
}

export function explainErrorToastMessage(message: string): string {
  if (isRateLimitMessage(message)) {
    return "Daily AI limit reached";
  }
  return message;
}
