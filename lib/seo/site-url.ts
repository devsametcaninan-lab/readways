export function getSiteUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (rawUrl) {
    try {
      return new URL(rawUrl).toString().replace(/\/$/, "");
    } catch {
      // fall through to localhost
    }
  }

  return "http://localhost:3000";
}

