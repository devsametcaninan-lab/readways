/** Safe browser context for feedback metadata (no document content). */
export function collectBrowserMetadata(): Record<string, unknown> {
  if (typeof window === "undefined") {
    return {};
  }

  const metadata: Record<string, unknown> = {
    language: navigator.language,
    platform: navigator.platform,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  const userAgent = navigator.userAgent?.trim();
  if (userAgent) {
    metadata.userAgent = userAgent.slice(0, 200);
  }

  return metadata;
}
