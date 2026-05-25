"use client";

import type { FlashcardReviewItem } from "@/lib/flashcards/types";

type FlipCardProps = {
  card: FlashcardReviewItem;
  isFlipped: boolean;
  onFlip: () => void;
};

export default function FlipCard({ card, isFlipped, onFlip }: FlipCardProps) {
  return (
    <button
      type="button"
      onClick={onFlip}
      aria-label={isFlipped ? "Show word front" : "Reveal meaning"}
      className="flashcard-scene group w-full max-w-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b10]"
    >
      <div
        className={`flashcard-inner relative min-h-[22rem] w-full md:min-h-[24rem] ${
          isFlipped ? "is-flipped" : ""
        }`}
      >
        <div className="flashcard-face flashcard-front flex min-h-[22rem] flex-col items-center justify-center rounded-2xl border border-white/[0.12] bg-[#12141d] px-8 py-10 shadow-[0_12px_48px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] transition group-hover:border-white/[0.16] group-hover:shadow-[0_16px_56px_rgba(0,0,0,0.5),0_0_40px_rgba(124,140,255,0.08)] md:min-h-[24rem]">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
            Saved from reading
          </p>
          <p className="mt-6 text-4xl font-medium tracking-tight text-white md:text-5xl">
            {card.word}
          </p>
          <p className="mt-8 text-sm text-zinc-500 transition group-hover:text-zinc-400">
            Click to reveal meaning
          </p>
        </div>

        <div className="flashcard-face flashcard-back flex min-h-[22rem] flex-col rounded-2xl border border-white/[0.12] bg-[#12141d] px-6 py-7 shadow-[0_12px_48px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] md:min-h-[24rem] md:px-8 md:py-8">
          <div className="text-center">
            <p className="text-2xl font-medium tracking-tight text-white md:text-3xl">
              {card.word}
            </p>
            <p className="mt-1.5 text-sm text-zinc-400">
              {card.partOfSpeech} · {card.pronunciation}
            </p>
          </div>

          <div className="mt-6 space-y-4 overflow-y-auto">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-500">
                Definition
              </p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-zinc-200">{card.definition}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-500">
                In context
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                {card.contextualMeaning}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.1] bg-[#0e1016] p-4">
              <p className="text-[15px] italic leading-relaxed text-zinc-400">
                &ldquo;{card.contextSentence}&rdquo;
              </p>
              <p className="mt-3 text-[12px] text-zinc-500">{card.source}</p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
