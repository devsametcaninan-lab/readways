"use client";

import AppRouteError from "@/components/app/AppRouteError";

export default function ReaderError({ reset }: { error: Error; reset: () => void }) {
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
