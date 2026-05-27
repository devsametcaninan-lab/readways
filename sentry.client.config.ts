import * as Sentry from "@sentry/nextjs";
import { sanitizeSentryEvent } from "@/lib/monitoring/sentry-sanitize";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production" && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend(event) {
    if (!event) {
      return event;
    }
    return sanitizeSentryEvent(event);
  }
});

