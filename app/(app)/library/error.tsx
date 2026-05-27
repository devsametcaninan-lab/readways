"use client";

import AppRouteError from "@/components/app/AppRouteError";

export default function LibraryError({ reset }: { error: Error; reset: () => void }) {
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
