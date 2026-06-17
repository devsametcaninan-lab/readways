/**
 * Dev-only debug logging. Never logs secrets, full document text, or sensitive user content.
 */

const SENSITIVE_KEY_PATTERN =
  /password|secret|token|api[_-]?key|authorization|bearer|service[_-]?role/i;

const CONTENT_KEY_PATTERN = /^(sentence|definition|contextual_meaning|pronunciation|word|phrase)$/i;

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEY_PATTERN.test(key)) {
    return "[redacted]";
  }

  if (CONTENT_KEY_PATTERN.test(key) && typeof value === "string") {
    return `[len=${value.length}]`;
  }

  if (typeof value === "string" && value.length > 120) {
    return `${value.slice(0, 80)}…`;
  }

  return value;
}

export function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function logDevDebug(context: string, data?: Record<string, unknown>): void {
  if (!isDevEnvironment()) {
    return;
  }

  const safeMeta = data
    ? Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, redactValue(key, value)])
      )
    : undefined;

  // eslint-disable-next-line no-console -- intentional dev-only diagnostics
  console.debug(`[${context}]`, safeMeta ?? "");
}
