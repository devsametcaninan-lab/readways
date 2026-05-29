"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Spinner from "@/components/feedback/Spinner";
import { difficultyLabel } from "@/lib/saved-words/format";
import type { SavedWordItem } from "@/lib/saved-words/types";
import { useI18n } from "@/lib/i18n/provider";
import { localizePartOfSpeech } from "@/lib/i18n/part-of-speech";
import StatusBadge from "./StatusBadge";

type WordDetailModalProps = {
  word: SavedWordItem | null;
  onClose: () => void;
  onReviewAgain: (item: SavedWordItem) => Promise<void>;
  onRemove: (item: SavedWordItem) => Promise<void>;
};

export default function WordDetailModal({
  word,
  onClose,
  onReviewAgain,
  onRemove
}: WordDetailModalProps) {
  const { t } = useI18n();
  const [reviewPending, setReviewPending] = useState(false);
  const [removePending, setRemovePending] = useState(false);

  useEffect(() => {
    if (!word) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [word, onClose]);

  if (!word) {
    return null;
  }

  const level = difficultyLabel(word.difficulty, t);
  const statusLabel =
    word.status === "learning"
      ? t("app.statusLearning")
      : word.status === "reviewing"
        ? t("app.statusReviewing")
        : t("app.statusMastered");

  const runReview = async () => {
    setReviewPending(true);
    try {
      await onReviewAgain(word);
    } finally {
      setReviewPending(false);
    }
  };

  const runRemove = async () => {
    setRemovePending(true);
    try {
      await onRemove(word);
      onClose();
    } catch {
      setRemovePending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="word-detail-title"
    >
      <button
        type="button"
        aria-label={t("app.uploadClose")}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.12] bg-[#12141d] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.6)] md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="word-detail-title"
              className="break-words text-2xl font-medium text-white"
            >
              {word.word}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {localizePartOfSpeech(word.partOfSpeech, t)}
              {word.pronunciation ? ` · ${word.pronunciation}` : ""}
            </p>
          </div>
          <StatusBadge status={word.status} />
        </div>

        {word.definition ? (
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
              {t("app.savedWordDefinition")}
            </p>
            <p className="mt-2 break-words text-[15px] leading-relaxed text-zinc-300">
              {word.definition}
            </p>
          </div>
        ) : null}

        {word.contextualMeaning ? (
          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
              {t("app.savedWordInSentence")}
            </p>
            <p className="mt-2 break-words text-[15px] leading-relaxed text-zinc-400">
              {word.contextualMeaning}
            </p>
          </div>
        ) : null}

        <div className="mt-6 space-y-4 rounded-xl border border-white/[0.1] bg-[#0e1016] p-4">
          {word.contextSentence ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
                {t("app.savedWordSourceSentence")}
              </p>
              <p className="mt-2 break-words text-[15px] italic leading-relaxed text-zinc-400">
                &ldquo;{word.contextSentence}&rdquo;
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
            <span>{t("app.savedWordSource")}: {word.source}</span>
            <span>{t("app.savedWordSaved")}: {word.savedAt}</span>
            {level ? <span>{level}</span> : null}
          </div>

          {word.reviewProgress != null ? (
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
                <span>{t("app.savedWordReviewProgress")}</span>
                <span>{word.reviewProgress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.1]">
                <div
                  className="h-full rounded-full bg-accent/70 transition-all"
                  style={{ width: `${word.reviewProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">
              {t("app.savedWordReviewStatus")}: {statusLabel}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={reviewPending}
            onClick={() => void runReview()}
            className="inline-flex items-center gap-2 rounded-md border border-accent/25 bg-accent/10 px-4 py-2 text-sm text-accentSoft transition hover:bg-accent/15 disabled:opacity-50"
          >
            {reviewPending ? <Spinner className="h-3.5 w-3.5" /> : null}
            {t("app.savedWordReviewAgain")}
          </button>

          {word.documentId ? (
            <Link
              href={`/reader/${word.documentId}`}
              className="rounded-md border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.06]"
            >
              {t("app.savedWordOpenSourceDocument")}
            </Link>
          ) : null}

          <button
            type="button"
            disabled={removePending}
            onClick={() => void runRemove()}
            className="rounded-md border border-white/[0.1] px-4 py-2 text-sm text-zinc-500 transition hover:border-red-500/25 hover:bg-red-500/[0.06] hover:text-red-300/90 disabled:opacity-50"
          >
            {removePending ? t("app.savedWordRemoving") : t("app.savedWordRemoveWord")}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-md border border-white/[0.12] bg-white/[0.04] py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.06]"
        >
          {t("app.savedWordClose")}
        </button>
      </div>
    </div>
  );
}
