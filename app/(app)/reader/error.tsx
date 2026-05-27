"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import AppRouteError from "@/components/app/AppRouteError";

export default function ReaderError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { boundary: "reader-error" }
    });
  }, [error]);

  return (
    <AppRouteError
      reset={reset}
      title="Reader unavailable"
      description="The reader could not load this document. Try again or open your library to pick another PDF."
      backHref="/library"
      backLabel="Back to library"
    />
  );
}
