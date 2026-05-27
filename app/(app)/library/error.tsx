"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import AppRouteError from "@/components/app/AppRouteError";

export default function LibraryError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { boundary: "library-error" }
    });
  }, [error]);

  return (
    <AppRouteError
      reset={reset}
      title="Library unavailable"
      description="Your library could not load right now. Try again — uploads and documents are not affected."
      backHref="/dashboard"
      backLabel="Back to dashboard"
    />
  );
}
