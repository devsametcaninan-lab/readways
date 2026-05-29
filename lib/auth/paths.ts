const PROTECTED_PREFIXES = [
  "/dashboard",
  "/library",
  "/reader",
  "/saved-words",
  "/flashcards",
  "/settings"
] as const;

export const AUTH_PAGE_PATHS = ["/login", "/signup"] as const;

export type AuthPagePath = (typeof AUTH_PAGE_PATHS)[number];

export function isProtectedAppPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAuthPagePath(pathname: string): pathname is AuthPagePath {
  return AUTH_PAGE_PATHS.includes(pathname as AuthPagePath);
}

/**
 * Only allow in-app relative redirects (open-redirect safe).
 */
export function sanitizeNextPath(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || typeof next !== "string") {
    return fallback;
  }

  const trimmed = next.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  if (trimmed.includes("://") || trimmed.includes("\\")) {
    return fallback;
  }

  if (trimmed === "/" || isAuthPagePath(trimmed)) {
    return fallback;
  }

  if (!isProtectedAppPath(trimmed)) {
    return fallback;
  }

  return trimmed;
}
