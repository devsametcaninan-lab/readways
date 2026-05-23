"use client";

import { useEffect } from "react";
import StatusBadge from "./StatusBadge";
import type { SavedWordItem } from "@/lib/saved-words-mock-data";

type WordDetailModalProps = {
  word: SavedWordItem | null;
  onClose: () => void;
};

export default function WordDetailModal({ word, onClose }: WordDetailModalProps) {
  useEffect(() => {
    if (!word) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [word, onClose]);

  if (!word) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="word-detail-title"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/[0.12] bg-[#12141d] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.6)] md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="word-detail-title" className="text-2xl font-medium text-white">
              {word.word}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {word.partOfSpeech} · {word.pronunciation}
            </p>
          </div>
          <StatusBadge status={word.status} />
        </div>

        <p className="mt-5 text-[15px] leading-relaxed text-zinc-300">{word.meaning}</p>

        <div className="mt-6 space-y-4 rounded-xl border border-white/[0.1] bg-[#0e1016] p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
              Full context
            </p>
            <p className="mt-2 text-[15px] italic leading-relaxed text-zinc-400">
              &ldquo;{word.contextSentence}&rdquo;
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
            <span>Source: {word.source}</span>
            <span>Saved: {word.savedAt}</span>
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
              <span>Review progress</span>
              <span>{word.reviewProgress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.1]">
              <div
                className="h-full rounded-full bg-accent/70"
                style={{ width: `${word.reviewProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
            Flashcard preview
          </p>
          <div className="mt-3 rounded-xl border border-white/[0.12] bg-[#0a0b10] p-5 text-center">
            <p className="text-xl font-medium text-white">{word.word}</p>
            <p className="mt-3 text-sm text-zinc-400">{word.meaning}</p>
            <p className="mt-4 text-[12px] text-zinc-600">Tap to reveal context on back</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-md border border-white/[0.12] bg-white/[0.04] py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.06]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
