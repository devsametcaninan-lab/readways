"use client";

import type { PanelVocabularySelection } from "@/lib/reader/types";

type VocabularyPanelProps = {
  selection: PanelVocabularySelection | null;
  savedKeys: Set<string>;
  onSave: (saveKey: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
};

export default function VocabularyPanel({
  selection,
  savedKeys,
  onSave,
  emptyTitle = "Select a word",
  emptyDescription = "Click any highlighted word in the article to see its meaning in context, review the original sentence, and save it as a flashcard."
}: VocabularyPanelProps) {
  const isSaved = selection ? savedKeys.has(selection.saveKey) : false;

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
              {selection.partOfSpeech} · {selection.pronunciation}
            </p>

            <div className="mt-7 space-y-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
                  Definition
                </p>
                <p className="mt-2.5 text-[15px] leading-relaxed text-zinc-300">
                  {selection.definition}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
                  In this sentence
                </p>
                <p className="mt-2.5 text-[15px] leading-relaxed text-zinc-300">
                  {selection.contextMeaning}
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

            <button
              type="button"
              disabled={isSaved}
              onClick={() => onSave(selection.saveKey)}
              className={`mt-7 w-full rounded-md border py-3 text-sm font-medium transition-all duration-200 ${
                isSaved
                  ? "cursor-default border-white/[0.12] bg-white/[0.06] text-zinc-400"
                  : "border-accent/25 bg-accent/90 text-white hover:bg-[#6D7EFF]"
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
