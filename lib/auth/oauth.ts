import { sanitizeNextPath } from "@/lib/auth/paths";

/** Canonical production origin (Vercel primary domain). */
export const PRODUCTION_AUTH_ORIGIN = "https://www.readways.com";

const READWAYS_HOSTS = new Set(["readways.com", "www.readways.com"]);

function parseSiteUrlOrigin(siteUrl: string | undefined): string | null {
  if (!siteUrl?.trim()) {
    return null;
  }

  try {
    return new URL(siteUrl.trim()).origin;
  } catch {
    return null;
  }
}

/** True when OAuth should use the production readways.com domain (not window fallback). */
export function isReadwaysProductionRuntime(): boolean {
  if (typeof window !== "undefined") {
    return READWAYS_HOSTS.has(window.location.hostname);
  }

  return process.env.NODE_ENV === "production";
}

/**
 * Returns NEXT_PUBLIC_SITE_URL origin when it is a valid readways.com host.
 * Apex env values normalize to www canonical.
 */
function getValidatedEnvAuthOrigin(): string | null {
  const fromEnv = parseSiteUrlOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (!fromEnv) {
    return null;
  }

  try {
    const hostname = new URL(fromEnv).hostname;
    if (hostname === "www.readways.com") {
      return fromEnv;
    }
    if (hostname === "readways.com") {
      return PRODUCTION_AUTH_ORIGIN;
    }
  } catch {
    return null;
  }

  return null;
}

function getReadwaysProductionOrigin(): string {
  return getValidatedEnvAuthOrigin() ?? PRODUCTION_AUTH_ORIGIN;
}

/**
 * Origin used for OAuth redirectTo in the browser.
 * Production readways.com / www.readways.com → https://www.readways.com.
 */
export function getOAuthRedirectOrigin(): string {
  if (isReadwaysProductionRuntime()) {
    return getReadwaysProductionOrigin();
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
}

export type AuthCallbackRedirect = {
  redirectTo: string;
  nextPath: string;
  redirectOrigin: string;
  configuredSiteUrl: string | null;
  windowOrigin: string | null;
};

/** Full Supabase OAuth redirectTo URL with a safe internal next path. */
export function buildAuthCallbackRedirectTo(nextPath?: string | null): AuthCallbackRedirect {
  const next = sanitizeNextPath(nextPath ?? undefined);
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? null;
  const redirectOrigin = getOAuthRedirectOrigin();
  const redirectTo = `${redirectOrigin}/auth/callback?next=${encodeURIComponent(next)}`;
  const windowOrigin = typeof window !== "undefined" ? window.location.origin : null;

  return {
    redirectTo,
    nextPath: next,
    redirectOrigin,
    configuredSiteUrl,
    windowOrigin
  };
}

/** Visible debug output only when NEXT_PUBLIC_OAUTH_DEBUG=1. */
export function logOAuthRedirectDebug(details: AuthCallbackRedirect): void {
  if (process.env.NEXT_PUBLIC_OAUTH_DEBUG !== "1") {
    return;
  }

  console.log("[readways/oauth] redirectTo =", details.redirectTo);
  console.log("[readways/oauth] nextPath =", details.nextPath);
  console.log("[readways/oauth] redirectOrigin =", details.redirectOrigin);
  console.log("[readways/oauth] window.location.origin =", details.windowOrigin ?? "(ssr)");
  console.log("[readways/oauth] NEXT_PUBLIC_SITE_URL =", details.configuredSiteUrl ?? "(unset)");
  console.log(
    "[readways/oauth] expected authorize redirect_to param =",
    encodeURIComponent(details.redirectTo)
  );
}

/** Origin for post-auth redirects on the server (callback route). */
export function getPostAuthRedirectOrigin(requestOrigin: string): string {
  try {
    const hostname = new URL(requestOrigin).hostname;
    if (READWAYS_HOSTS.has(hostname)) {
      return getReadwaysProductionOrigin();
    }
  } catch {
    // fall through
  }

  const fromEnv = getValidatedEnvAuthOrigin();
  if (fromEnv && process.env.NODE_ENV === "production") {
    return fromEnv;
  }

  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_AUTH_ORIGIN;
  }

  return requestOrigin;
}
