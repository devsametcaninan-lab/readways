"use client";

import AppRouteError from "@/components/app/AppRouteError";

export default function FlashcardsError({ reset }: { error: Error; reset: () => void }) {
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
