import { sanitizeNextPath } from "@/lib/auth/paths";
import { getSiteUrl } from "@/lib/seo/site-url";

/**
 * Origin used for OAuth redirectTo in the browser.
 * Production uses NEXT_PUBLIC_SITE_URL when set; local dev falls back to window.location.origin.
 */
export function getOAuthRedirectOrigin(): string {
  const configured = getSiteUrl();

  if (configured !== "http://localhost:3000") {
    return configured;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return configured;
}

/** Full Supabase OAuth redirectTo URL with a safe internal next path. */
export function buildAuthCallbackRedirectTo(nextPath?: string | null): string {
  const next = sanitizeNextPath(nextPath ?? undefined);
  const origin = getOAuthRedirectOrigin();
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** Origin for post-auth redirects on the server (callback route). */
export function getPostAuthRedirectOrigin(requestOrigin: string): string {
  const configured = getSiteUrl();

  if (configured !== "http://localhost:3000") {
    return configured;
  }

  return requestOrigin;
}
