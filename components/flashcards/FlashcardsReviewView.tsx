"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { appText } from "@/components/app/app-typography";
import { useToast } from "@/components/feedback/ToastProvider";
import { submitFlashcardReview } from "@/lib/flashcards/client";
import type { FlashcardReviewItem, SessionStats as SessionStatsData } from "@/lib/flashcards/types";
import type { ReviewRating } from "@/lib/supabase/schema";
import FlipCard from "./FlipCard";
import RatingButtons from "./RatingButtons";
import ReviewComplete from "./ReviewComplete";
import SessionStats from "./SessionStats";

type FlashcardsReviewViewProps = {
  initialDeck: FlashcardReviewItem[];
  initialStats: SessionStatsData;
};

export default function FlashcardsReviewView({
  initialDeck,
  initialStats
}: FlashcardsReviewViewProps) {
  const router = useRouter();
  const toast = useToast();
  const total = initialDeck.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [scheduleFeedback, setScheduleFeedback] = useState<string | null>(null);

  const currentCard = initialDeck[currentIndex];

  useEffect(() => {
    setScheduleFeedback(null);
    setReviewError(null);
  }, [currentIndex]);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setReviewedCount(0);
    setIsFlipped(false);
    setIsComplete(false);
    setReviewError(null);
    setScheduleFeedback(null);
    router.refresh();
  }, [router]);

  const handleRate = async (rating: ReviewRating) => {
    if (!currentCard || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setReviewError(null);
    setScheduleFeedback(null);

    try {
      const result = await submitFlashcardReview({
        flashcardId: currentCard.id,
        rating
      });

      setScheduleFeedback(result.feedbackMessage);
      toast.info(result.feedbackMessage);

      const nextReviewed = reviewedCount + 1;
      setReviewedCount(nextReviewed);
      setIsFlipped(false);

      if (nextReviewed >= total) {
        setIsComplete(true);
        toast.success("Review completed");
        return;
      }

      setCurrentIndex((index) => index + 1);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save review.";
      setReviewError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">Flashcards</h1>
        <p className={`mt-2 ${appText.body}`}>
          Review words from your reading with spaced repetition.
        </p>
      </div>

      <div className="mb-8 max-w-xl">
        <SessionStats stats={initialStats} />
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-white/[0.12] bg-[#12141d] px-6 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <p className="text-base font-medium text-zinc-200">No flashcards due right now.</p>
          <p className="mt-2 text-sm text-zinc-400">
            Save words from the reader to build your review deck.
          </p>
        </div>
      ) : isComplete ? (
        <ReviewComplete reviewedCount={reviewedCount} onReviewAgain={resetSession} />
      ) : (
        currentCard && (
          <div className="mx-auto flex max-w-2xl flex-col items-center">
            <div className="mb-6 flex w-full max-w-xl items-center justify-between text-sm">
              <p className="tabular-nums text-zinc-400">
                <span className="font-medium text-zinc-200">{reviewedCount}</span>
                <span className="text-zinc-600"> / </span>
                {total} reviewed
              </p>
              <p className="text-zinc-500">
                Card {currentIndex + 1} of {total}
              </p>
            </div>

            <FlipCard
              key={currentCard.id}
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped((flipped) => !flipped)}
            />

            <div
              className={`mt-8 w-full max-w-xl transition-all duration-300 ${
                isFlipped
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-2 opacity-0"
              }`}
              onClick={(event) => event.stopPropagation()}
            >
              <p className="mb-4 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                How well did you recall it?
              </p>
              <RatingButtons onRate={handleRate} disabled={isSubmitting} />
              {scheduleFeedback && !reviewError ? (
                <p className="mt-4 text-center text-[13px] text-zinc-400">{scheduleFeedback}</p>
              ) : null}
              {reviewError ? (
                <p className="mt-4 text-center text-sm text-red-300/90">{reviewError}</p>
              ) : null}
            </div>

            {!isFlipped && (
              <p className="mt-6 text-center text-[12px] text-zinc-600">
                Flip the card to rate your recall
              </p>
            )}
          </div>
        )
      )}
    </div>
  );
}
