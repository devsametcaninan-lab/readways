/**
 * Production-safe server logging. Never logs secrets, PDF text, or full request bodies.
 */

const SENSITIVE_KEY_PATTERN =
  /password|secret|token|api[_-]?key|authorization|bearer|service[_-]?role/i;

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEY_PATTERN.test(key)) {
    return "[redacted]";
  }

  if (typeof value === "string" && value.length > 120) {
    return `${value.slice(0, 80)}…`;
  }

  return value;
}

function safeErrorDetails(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message
    };
  }

  return { message: String(error) };
}

export function logServerError(context: string, error: unknown, meta?: Record<string, unknown>): void {
  const safeMeta = meta
    ? Object.fromEntries(
        Object.entries(meta).map(([key, value]) => [key, redactValue(key, value)])
      )
    : undefined;

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console -- intentional dev-only diagnostics
    console.error(`[${context}]`, safeErrorDetails(error), safeMeta ?? "");
    return;
  }

  // eslint-disable-next-line no-console -- minimal production signal without stack traces in responses
  console.error(`[${context}]`, {
    ...safeErrorDetails(error),
    ...(safeMeta ? { meta: safeMeta } : {})
  });
}
