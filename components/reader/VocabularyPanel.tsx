"use client";

import type { PanelVocabularySelection } from "@/lib/reader/types";

type VocabularyPanelProps = {
  selection: PanelVocabularySelection | null;
  savedKeys: Set<string>;
  onSave: (saveKey: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
};

function sourceLabel(source: "cache" | "mock"): string {
  return source === "cache" ? "Cached explanation" : "Preview explanation";
}

export default function VocabularyPanel({
  selection,
  savedKeys,
  onSave,
  emptyTitle = "Select a word",
  emptyDescription = "Select any word from your document to understand it in context."
}: VocabularyPanelProps) {
  const isSaved = selection ? savedKeys.has(selection.saveKey) : false;
  const isLoading = selection?.status === "loading";
  const isError = selection?.status === "error";
  const isReady = selection?.status === "ready";
  const canSave = isReady && !isSaved;

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
            <p className="mt-2 text-sm text-zinc-400">
              {selection.partOfSpeech}
              {isLoading ? (
                <span className="text-zinc-500"> · Loading explanation…</span>
              ) : isReady && selection.pronunciation ? (
                <> · {selection.pronunciation}</>
              ) : null}
            </p>

            {isReady && selection.explanationSource ? (
              <p className="mt-1.5 text-[11px] uppercase tracking-[0.08em] text-zinc-600">
                {sourceLabel(selection.explanationSource)}
              </p>
            ) : null}

            {isError ? (
              <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-4 py-3.5">
                <p className="text-sm font-medium text-red-200/90">Could not load explanation</p>
                <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">
                  {selection.errorMessage ?? "Something went wrong. Try selecting the word again."}
                </p>
              </div>
            ) : (
              <div className={`mt-7 space-y-6 ${isLoading ? "animate-pulse" : ""}`}>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
                    Definition
                  </p>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-zinc-300">
                    {isLoading ? (
                      <span className="text-zinc-600">Loading…</span>
                    ) : (
                      selection.definition
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
                    In this sentence
                  </p>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-zinc-300">
                    {isLoading ? (
                      <span className="text-zinc-600">Loading…</span>
                    ) : (
                      selection.contextMeaning
                    )}
                  </p>
                </div>
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
            )}

            <button
              type="button"
              disabled={!canSave}
              onClick={() => onSave(selection.saveKey)}
              className={`mt-7 w-full rounded-md border py-3 text-sm font-medium transition-all duration-200 ${
                isSaved
                  ? "cursor-default border-white/[0.12] bg-white/[0.06] text-zinc-400"
                  : canSave
                    ? "border-accent/25 bg-accent/90 text-white hover:bg-[#6D7EFF]"
                    : "cursor-default border-white/[0.08] bg-white/[0.03] text-zinc-500"
              }`}
            >
              {isSaved ? "Saved" : "Save as flashcard"}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
