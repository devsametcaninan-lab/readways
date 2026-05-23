"use client";

import { useCallback, useState } from "react";
import { appText } from "@/components/app/app-typography";
import { readerDocument, vocabularyById } from "@/lib/reader-mock-data";
import VocabularyPanel from "./VocabularyPanel";

export default function ReaderView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const handleSave = useCallback((id: string) => {
    setSavedIds((prev) => new Set(prev).add(id));
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={`flex h-10 shrink-0 items-center justify-between border-b border-white/[0.1] bg-[#0a0b10] px-4 ${appText.metaSmall}`}
      >
        <span className="text-zinc-300">{readerDocument.source}</span>
        <span>
          Page {readerDocument.page} · {readerDocument.progress}% complete
        </span>
        <span className="hidden text-zinc-400 sm:inline">Highlight mode on</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#0e1016] px-6 py-8 md:px-12 md:py-10">
          <h2 className="mb-8 text-lg font-medium text-zinc-100 md:text-xl">{readerDocument.title}</h2>

          <div className="mx-auto max-w-prose space-y-6 text-[15px] leading-[1.92] text-zinc-400">
            {readerDocument.paragraphs.map((paragraph, index) => (
              <p key={index}>
                {paragraph.segments.map((segment, segIndex) => {
                  if (segment.type === "text") {
                    return <span key={segIndex}>{segment.value}</span>;
                  }

                  const vocab = vocabularyById[segment.id];
                  if (!vocab) return null;

                  const isActive = selectedId === segment.id;

                  return (
                    <button
                      key={segIndex}
                      type="button"
                      onClick={() => setSelectedId(segment.id)}
                      className={`mx-0.5 inline cursor-pointer rounded-sm px-0.5 transition-colors duration-200 ${
                        isActive
                          ? "border-b-2 border-accent bg-accent/[0.16] text-white"
                          : "border-b border-accent/60 bg-accent/[0.1] text-zinc-200 hover:bg-accent/[0.14] hover:text-white"
                      }`}
                    >
                      {vocab.word}
                    </button>
                  );
                })}
              </p>
            ))}
          </div>
        </div>

        <VocabularyPanel selectedId={selectedId} savedIds={savedIds} onSave={handleSave} />
      </div>
    </div>
  );
}
