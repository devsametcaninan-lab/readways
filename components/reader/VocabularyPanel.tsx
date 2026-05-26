"use client";

import { memo } from "react";
import type { PanelVocabularySelection } from "@/lib/reader/types";
import Spinner from "@/components/feedback/Spinner";
import SuccessCheck from "@/components/feedback/SuccessCheck";
import {
  ExplanationTextSkeleton,
  PronunciationSkeleton
} from "./ExplanationSkeleton";
import UpgradeCta from "@/components/billing/UpgradeCta";

type VocabularyPanelProps = {
  selection: PanelVocabularySelection | null;
  onSave: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
};

function sourceLabel(source: "cache" | "ai"): string {
  return source === "cache" ? "From cache" : "AI generated";
}

function saveButtonLabel(selection: PanelVocabularySelection): string {
  if (selection.status === "loading") {
    return "Explanation loading…";
  }

  switch (selection.saveState) {
    case "saving":
      return "Saving…";
    case "saved":
      return "Saved";
    case "already_saved":
      return "Already saved";
    default:
      return "Save as flashcard";
  }
}

const EXPLANATION_TEXT_MIN_HEIGHT = "min-h-[4.25rem]";

function VocabularyPanel({
  selection,
  onSave,
  emptyTitle = "Select a word",
  emptyDescription = "Select any word from your document to understand it in context."
}: VocabularyPanelProps) {
  const isLoading = selection?.status === "loading";
  const isError = selection?.status === "error";
  const isReady = selection?.status === "ready";
  const isSaving = selection?.saveState === "saving";
  const canSave =
    isReady &&
    Boolean(selection?.wordExplanationId) &&
    selection.saveState === "idle" &&
    !isSaving;

  const saveTitle = isLoading
    ? "Explanation loading…"
    : isSaving
      ? "Saving…"
      : !selection?.wordExplanationId && isReady
        ? "Explanation unavailable"
        : undefined;

  const explanationKey = selection
    ? `${selection.highlightKey}:${selection.status}:${selection.explanationSource ?? "none"}`
    : "empty";

  return (
    <aside className="flex w-full shrink-0 flex-col border-t border-white/[0.1] bg-[#0e0f14] lg:w-[320px] lg:border-l lg:border-t-0">
      <div className="border-b border-white/[0.1] px-5 py-3.5">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Vocabulary</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 md:p-6">
        {!selection ? (
          <div className="rounded-xl border border-white/[0.1] bg-[#12141d] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-base font-medium text-zinc-100">{emptyTitle}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-400">{emptyDescription}</p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-medium text-white">{selection.word}</h3>
            <p className="mt-2 flex min-h-[1.25rem] flex-wrap items-center gap-x-1.5 text-sm text-zinc-400">
              <span className="capitalize">{selection.partOfSpeech}</span>
              {isLoading ? (
                <>
                  <span aria-hidden="true">·</span>
                  <PronunciationSkeleton />
                </>
              ) : isReady && selection.pronunciation ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{selection.pronunciation}</span>
                </>
              ) : null}
            </p>

            {isReady && selection.explanationSource ? (
              <p className="mt-2 text-[11px] tracking-[0.04em] text-zinc-600">
                {sourceLabel(selection.explanationSource)}
              </p>
            ) : null}

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
                  Original sentence
                </p>
                <p className="mt-2.5 text-[15px] italic leading-relaxed text-zinc-400">
                  &ldquo;{selection.sentence}&rdquo;
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
                  Source
                </p>
                <p className="mt-2.5 text-[15px] leading-relaxed text-zinc-400">
                  {selection.sourceTitle}
                </p>
              </div>
            </div>

            {isError ? (
              <div
                className={`mt-6 rounded-lg border px-4 py-3.5 ${
                  selection.paywall
                    ? "border-accent/20 bg-accent/[0.06]"
                    : "border-red-500/20 bg-red-500/[0.06]"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    selection.paywall ? "text-[#c5cdff]" : "text-red-200/90"
                  }`}
                >
                  {selection.paywall?.title ?? "Could not load explanation"}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">
                  {selection.paywall?.message ??
                    selection.errorMessage ??
                    "Something went wrong. Try selecting the word again."}
                </p>
                {selection.paywall ? (
                  <div className="mt-4">
                    <UpgradeCta source="reader_vocabulary_panel" className="w-full" />
                  </div>
                ) : null}
              </div>
            ) : (
              <div
                key={explanationKey}
                className="mt-6 space-y-6"
                aria-busy={isLoading}
                aria-live="polite"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
                    In this sentence
                  </p>
                  <div className={`mt-2.5 ${EXPLANATION_TEXT_MIN_HEIGHT}`}>
                    {isLoading ? (
                      <ExplanationTextSkeleton lines={2} />
                    ) : (
                      <p className="animate-fade-in text-[15px] leading-relaxed text-zinc-200">
                        {selection.contextMeaning}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
                    General meaning
                  </p>
                  <div className={`mt-2.5 ${EXPLANATION_TEXT_MIN_HEIGHT}`}>
                    {isLoading ? (
                      <ExplanationTextSkeleton lines={2} />
                    ) : (
                      <p className="animate-fade-in text-[15px] leading-relaxed text-zinc-300">
                        {selection.definition}
                      </p>
                    )}
                  </div>
                </div>
                {isReady && selection.exampleUsage ? (
                  <div className="animate-fade-in">
                    <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
                      Example
                    </p>
                    <p className="mt-2.5 text-[14px] leading-relaxed text-zinc-400">
                      {selection.exampleUsage}
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            <button
              type="button"
              disabled={!canSave}
              title={saveTitle}
              onClick={onSave}
              className={`mt-7 flex w-full items-center justify-center gap-2 rounded-md border py-3 text-sm font-medium transition-all duration-200 ${
                selection.saveState === "saved" || selection.saveState === "already_saved"
                  ? "cursor-default border-white/[0.12] bg-white/[0.06] text-zinc-400"
                  : canSave
                    ? "border-accent/25 bg-accent/90 text-white hover:bg-[#6D7EFF]"
                    : "cursor-default border-white/[0.08] bg-white/[0.03] text-zinc-500"
              }`}
            >
              {selection.saveState === "saving" ? <Spinner /> : null}
              {selection.saveState === "saved" || selection.saveState === "already_saved" ? (
                <SuccessCheck />
              ) : null}
              {saveButtonLabel(selection)}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

export default memo(VocabularyPanel);
