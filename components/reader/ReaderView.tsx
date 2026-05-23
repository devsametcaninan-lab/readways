"use client";

import { useCallback, useState } from "react";
import { appText } from "@/components/app/app-typography";
import type { StoredReaderDocument } from "@/lib/document-storage";
import { readerDocument, vocabularyById } from "@/lib/reader-mock-data";
import VocabularyPanel from "./VocabularyPanel";

type ReaderViewProps =
  | { variant: "mock" }
  | { variant: "stored"; storedDocument: StoredReaderDocument };

export default function ReaderView(props: ReaderViewProps) {
  const isMock = props.variant === "mock";
  const storedDocument = props.variant === "stored" ? props.storedDocument : null;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const handleSave = useCallback((id: string) => {
    setSavedIds((prev) => new Set(prev).add(id));
  }, []);

  const title = isMock ? readerDocument.title : storedDocument!.title;
  const source = isMock ? readerDocument.source : storedDocument!.source;
  const pageLabel = isMock
    ? `Page ${readerDocument.page}`
    : `${storedDocument!.pageCount} page${storedDocument!.pageCount === 1 ? "" : "s"}`;
  const progress = isMock ? readerDocument.progress : storedDocument!.progress;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={`flex h-10 shrink-0 items-center justify-between border-b border-white/[0.1] bg-[#0a0b10] px-4 ${appText.metaSmall}`}
      >
        <span className="truncate text-zinc-300">{source}</span>
        <span>
          {pageLabel} · {progress}% complete
        </span>
        <span className="hidden text-zinc-400 sm:inline">
          {isMock ? "Highlight mode on" : "Uploaded PDF"}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#0e1016] px-6 py-8 md:px-12 md:py-10">
          <h2 className="mb-8 text-lg font-medium text-zinc-100 md:text-xl">{title}</h2>

          <div className="mx-auto max-w-prose space-y-6 text-[15px] leading-[1.92] text-zinc-400">
            {isMock
              ? readerDocument.paragraphs.map((paragraph, index) => (
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
                ))
              : storedDocument!.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
          </div>
        </div>

        <VocabularyPanel
          mode={isMock ? "mock" : "uploaded"}
          selectedId={selectedId}
          savedIds={savedIds}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
