"use client";

import { useCallback, useState } from "react";
import { appText } from "@/components/app/app-typography";
import { reviewDeck, sessionStats } from "@/lib/flashcards-mock-data";
import FlipCard from "./FlipCard";
import RatingButtons from "./RatingButtons";
import ReviewComplete from "./ReviewComplete";
import SessionStats from "./SessionStats";

export default function FlashcardsReviewView() {
  const total = reviewDeck.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = reviewDeck[currentIndex];

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setReviewedCount(0);
    setIsFlipped(false);
    setIsComplete(false);
  }, []);

  const handleRate = () => {
    const nextReviewed = reviewedCount + 1;
    setReviewedCount(nextReviewed);
    setIsFlipped(false);

    if (nextReviewed >= total) {
      setIsComplete(true);
      return;
    }

    setCurrentIndex((i) => i + 1);
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
        <SessionStats stats={sessionStats} />
      </div>

      {isComplete ? (
        <ReviewComplete reviewedCount={reviewedCount} onReviewAgain={resetSession} />
      ) : (
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
            onFlip={() => setIsFlipped((f) => !f)}
          />

          <div
            className={`mt-8 w-full max-w-xl transition-all duration-300 ${
              isFlipped
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
              How well did you recall it?
            </p>
            <RatingButtons onRate={handleRate} />
          </div>

          {!isFlipped && (
            <p className="mt-6 text-center text-[12px] text-zinc-600">
              Flip the card to rate your recall
            </p>
          )}
        </div>
      )}
    </div>
  );
}
