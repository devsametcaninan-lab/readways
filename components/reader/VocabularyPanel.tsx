"use client";

import { memo, type RefObject } from "react";
import type { PanelVocabularySelection } from "@/lib/reader/types";
import Spinner from "@/components/feedback/Spinner";
import SuccessCheck from "@/components/feedback/SuccessCheck";
import {
  ExplanationTextSkeleton,
  PronunciationSkeleton
} from "./ExplanationSkeleton";
import AppStateCard from "@/components/app/AppStateCard";
import AppStateInline from "@/components/app/AppStateInline";
import UpgradeCta from "@/components/billing/UpgradeCta";
import { READER_INTERACTION } from "@/lib/reader/reader-interaction";

type VocabularyPanelProps = {
  selection: PanelVocabularySelection | null;
  onSave: () => void;
  onRetry?: () => void;
  /** When false on mobile, the panel will be hidden as a bottom-sheet. */
  isMobileOpen?: boolean;
  /** Mobile-only close action. */
  onClose?: () => void;
  /** Used for mobile layout measurement (safe content padding). */
  panelRef?: RefObject<HTMLElement | null>;
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
  onRetry,
  isMobileOpen,
  onClose,
  panelRef,
  emptyTitle = "Select a word",
  emptyDescription = "Select any word from your document to understand it in context."
}: VocabularyPanelProps) {
  const mobileOpen = isMobileOpen ?? Boolean(selection);
  const isLoading = selection?.status === "loading";
  const isError = selection?.status === "error";
  const isReady = selection?.status === "ready";
  const isSaving = selection?.saveState === "saving";
  const hasValidExplanation =
    Boolean(selection?.definition.trim()) && Boolean(selection?.contextMeaning.trim());

  const canSave =
    isReady &&
    Boolean(selection?.wordExplanationId) &&
    hasValidExplanation &&
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
    <aside
      ref={panelRef}
      {...{ [READER_INTERACTION.vocabulary]: "" }}
      className={[
        "flex w-full shrink-0 flex-col overflow-hidden border-t border-white/[0.1] bg-[#0e0f14]",
        "fixed left-0 right-0 bottom-0 z-40 max-h-[70vh] rounded-t-2xl shadow-[0_-18px_60px_rgba(0,0,0,0.6)]",
        "transition-transform duration-200 ease-out",
        mobileOpen ? "translate-y-0 pointer-events-auto" : "translate-y-full pointer-events-none",
        "lg:static lg:translate-y-0 lg:pointer-events-auto lg:max-h-none lg:rounded-none lg:shadow-none lg:flex lg:w-[320px] lg:border-l lg:border-t-0",
      ].join(" ")}
    >
      <div className="lg:hidden px-5 pt-2 pb-1">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-white/[0.15]" />
      </div>

      <div className="border-b border-white/[0.1] px-5 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Vocabulary</p>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.10] bg-white/[0.03] text-zinc-300 transition hover:bg-white/[0.06] lg:hidden"
              aria-label="Close vocabulary panel"
            >
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:p-6 md:pb-6">
        {!selection ? (
          <AppStateCard
            compact
            icon="ai"
            title={emptyTitle}
            description={emptyDescription}
            className="shadow-none"
          />
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

            {isReady && (selection.explanationSource || selection.explanationLanguageLabel) ? (
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] tracking-[0.04em] text-zinc-600">
                {selection.explanationLanguageLabel ? (
                  <span>Explanation: {selection.explanationLanguageLabel}</span>
                ) : null}
                {selection.explanationSource ? (
                  <span>{sourceLabel(selection.explanationSource)}</span>
                ) : null}
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
              <div className="mt-6">
                <AppStateInline
                  variant={selection.paywall ? "info" : "error"}
                  title={
                    selection.paywall?.title ?? "Explanation unavailable"
                  }
                  description={
                    selection.paywall?.message ??
                    selection.errorMessage ??
                    "Try selecting the word or phrase again."
                  }
                />
                {selection.paywall ? (
                  <div className="mt-4">
                    <UpgradeCta source="reader_vocabulary_panel" className="w-full" />
                  </div>
                ) : onRetry ? (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-4 min-h-[44px] w-full rounded-md border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 transition hover:border-white/[0.16] hover:bg-white/[0.06]"
                  >
                    Try again
                  </button>
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
              className={`mt-7 flex min-h-[44px] w-full select-none items-center justify-center gap-2 rounded-md border py-3 text-sm font-medium active:scale-[0.99] transition-all duration-200 ${
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
