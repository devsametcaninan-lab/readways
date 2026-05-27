"use client";

import AppRouteError from "@/components/app/AppRouteError";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <AppRouteError
      reset={reset}
      title="Something went wrong"
      description="We could not load this part of ReadWays. Try again or return to your dashboard."
    />
  );
}
