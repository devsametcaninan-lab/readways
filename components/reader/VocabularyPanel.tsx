"use client";

import { vocabularyById, type VocabularyEntry } from "@/lib/reader-mock-data";

type VocabularyPanelProps = {
  mode?: "mock" | "uploaded";
  selectedId: string | null;
  savedIds: Set<string>;
  onSave: (id: string) => void;
};

export default function VocabularyPanel({
  mode = "mock",
  selectedId,
  savedIds,
  onSave
}: VocabularyPanelProps) {
  const entry: VocabularyEntry | null = selectedId ? vocabularyById[selectedId] ?? null : null;
  const isSaved = selectedId ? savedIds.has(selectedId) : false;

  return (
    <aside className="flex w-full shrink-0 flex-col border-t border-white/[0.1] bg-[#0e0f14] lg:w-[320px] lg:border-l lg:border-t-0">
      <div className="border-b border-white/[0.1] px-5 py-3.5">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Vocabulary</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 md:p-6">
        {!entry ? (
          <div className="rounded-xl border border-white/[0.1] bg-[#12141d] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-base font-medium text-zinc-100">
              {mode === "uploaded" ? "Vocabulary from your PDF" : "Select a word"}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-400">
              {mode === "uploaded"
                ? "Your extracted text is shown on the left. Interactive word highlights are available in the demo reader for now."
                : "Click any highlighted word in the article to see its meaning in context, review the original sentence, and save it as a flashcard."}
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-medium text-white">{entry.word}</h3>
            <p className="mt-2 text-sm text-zinc-400">
              {entry.partOfSpeech} · {entry.pronunciation}
            </p>

            <div className="mt-7 space-y-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
                  Definition
                </p>
                <p className="mt-2.5 text-[15px] leading-relaxed text-zinc-300">{entry.definition}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
                  In this sentence
                </p>
                <p className="mt-2.5 text-[15px] leading-relaxed text-zinc-300">
                  {entry.contextMeaning}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
                  Original sentence
                </p>
                <p className="mt-2.5 text-[15px] italic leading-relaxed text-zinc-400">
                  &ldquo;{entry.sentence}&rdquo;
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isSaved}
              onClick={() => onSave(entry.id)}
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
