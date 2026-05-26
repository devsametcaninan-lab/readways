const MAX_METADATA_BYTES = 2_048;
const MAX_STRING_LENGTH = 200;
const MAX_KEYS = 24;

const BLOCKED_KEY_PATTERN =
  /password|secret|token|api[_-]?key|authorization|sentence|extracted|paragraph|definition|context|email|file$/i;

const BLOCKED_EXACT_KEYS = new Set([
  "text",
  "content",
  "body",
  "raw",
  "word",
  "phrase",
  "back",
  "front"
]);

function truncateString(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_STRING_LENGTH)}…`;
}

function sanitizeValue(value: unknown, depth: number): unknown {
  if (depth > 3) {
    return undefined;
  }

  if (value == null || typeof value === "boolean" || typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return truncateString(value);
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, 12)
      .map((entry) => sanitizeValue(entry, depth + 1))
      .filter((entry) => entry !== undefined);
  }

  if (typeof value === "object") {
    const output: Record<string, unknown> = {};

    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (BLOCKED_EXACT_KEYS.has(key) || BLOCKED_KEY_PATTERN.test(key)) {
        continue;
      }

      const sanitized = sanitizeValue(nested, depth + 1);
      if (sanitized !== undefined) {
        output[key] = sanitized;
      }
    }

    return output;
  }

  return undefined;
}

export function sanitizeAnalyticsMetadata(
  metadata: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!metadata) {
    return {};
  }

  const sanitized = sanitizeValue(metadata, 0);
  if (!sanitized || typeof sanitized !== "object" || Array.isArray(sanitized)) {
    return {};
  }

  const entries = Object.entries(sanitized as Record<string, unknown>).slice(0, MAX_KEYS);
  const compact = Object.fromEntries(entries);

  try {
    const serialized = JSON.stringify(compact);
    if (serialized.length <= MAX_METADATA_BYTES) {
      return compact;
    }
  } catch {
    return {};
  }

  return { truncated: true };
}
