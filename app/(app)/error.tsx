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

  return <AppRouteError reset={reset} />;
}
