"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import AppRouteError from "@/components/app/AppRouteError";

export default function FlashcardsError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { boundary: "flashcards-error" }
    });
  }, [error]);

  return (
    <AppRouteError
      reset={reset}
      title="Flashcards unavailable"
      description="Your review session could not load. Try again — your saved words and progress are still in your account."
      backHref="/saved-words"
      backLabel="Saved words"
    />
  );
}
