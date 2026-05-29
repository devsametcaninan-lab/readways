"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import AppRouteError from "@/components/app/AppRouteError";
import { useI18n } from "@/lib/i18n/provider";

export default function FlashcardsError({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { boundary: "flashcards-error" }
    });
  }, [error]);

  return (
    <AppRouteError
      reset={reset}
      title={t("app.flashcardsErrorTitle")}
      description={t("app.flashcardsErrorDescription")}
      backHref="/saved-words"
      backLabel={t("app.flashcardsSavedWordsAction")}
    />
  );
}
