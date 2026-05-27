const SENSITIVE_KEY_PATTERN =
  /password|secret|token|api[_-]?key|authorization|cookie|set-cookie|service[_-]?role|supabase|openai/i;

const BLOCKED_BODY_KEYS = new Set([
  "sentence",
  "prompt",
  "response",
  "content",
  "text",
  "extracted_text",
  "pdf_text",
  "body"
]);

function sanitizeObject(value: unknown, depth = 0): unknown {
  if (depth > 4 || value == null) {
    return undefined;
  }

  if (typeof value === "string") {
    return value.length > 200 ? `${value.slice(0, 120)}…` : value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, 20)
      .map((entry) => sanitizeObject(entry, depth + 1))
      .filter((entry) => entry !== undefined);
  }

  if (typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY_PATTERN.test(key) || BLOCKED_BODY_KEYS.has(key.toLowerCase())) {
        continue;
      }

      const safe = sanitizeObject(nested, depth + 1);
      if (safe !== undefined) {
        output[key] = safe;
      }
    }
    return output;
  }

  return undefined;
}

export function sanitizeSentryEvent<T>(event: T): T {
  const copy = event as unknown as Record<string, unknown>;

  if ("request" in copy && copy.request && typeof copy.request === "object") {
    const req = copy.request as Record<string, unknown>;

    if ("headers" in req) {
      delete req.headers;
    }
    if ("cookies" in req) {
      delete req.cookies;
    }
    if ("data" in req) {
      delete req.data;
    }
  }

  if (copy.extra && typeof copy.extra === "object") {
    copy.extra = sanitizeObject(copy.extra) as Record<string, unknown>;
  }

  if (copy.contexts && typeof copy.contexts === "object") {
    copy.contexts = sanitizeObject(copy.contexts) as Record<string, unknown>;
  }

  return event;
}

