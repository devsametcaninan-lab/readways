const TECHNICAL_MESSAGE_PATTERN =
  /^(Error|TypeError|SyntaxError|ReferenceError|AggregateError):/i;

const TECHNICAL_CONTENT_PATTERN =
  /\bat\s+[\w./]+\s*\(|node_modules|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|invalid input syntax|PGRST\d+|JWTExpired|JWSError/i;

const MAX_USER_MESSAGE_LENGTH = 240;

/**
 * Returns a safe message for UI toasts and panels. Falls back when the string looks internal.
 */
export function safeUserFacingMessage(
  message: string | null | undefined,
  fallback: string
): string {
  if (!message?.trim()) {
    return fallback;
  }

  const trimmed = message.trim();

  if (trimmed.length > MAX_USER_MESSAGE_LENGTH) {
    return fallback;
  }

  if (TECHNICAL_MESSAGE_PATTERN.test(trimmed) || TECHNICAL_CONTENT_PATTERN.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}

export async function parseApiErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return safeUserFacingMessage(body.error, fallback);
  } catch {
    return fallback;
  }
}

export function safeSupabaseClientMessage(
  message: string | null | undefined,
  fallback: string
): string {
  return safeUserFacingMessage(message, fallback);
}
