"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import AppRouteError from "@/components/app/AppRouteError";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { boundary: "app-error" }
    });
  }, [error]);

  return (
    <AppRouteError
      reset={reset}
      title="Something went wrong"
      description="We could not load this part of ReadWays. Try again or return to your dashboard."
    />
  );
}
