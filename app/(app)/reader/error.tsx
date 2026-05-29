"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import AppRouteError from "@/components/app/AppRouteError";
import { useI18n } from "@/lib/i18n/provider";

export default function ReaderError({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { boundary: "reader-error" }
    });
  }, [error]);

  return (
    <AppRouteError
      reset={reset}
      title={t("app.readerErrorTitle")}
      description={t("app.readerErrorDescription")}
      backHref="/library"
      backLabel={t("app.readerBackLibrary")}
    />
  );
}
