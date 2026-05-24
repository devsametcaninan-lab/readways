"use client";

import { useCallback, useState } from "react";
import { appText } from "@/components/app/app-typography";
import type { ReaderDocument } from "@/lib/documents/types";
import type { PanelVocabularySelection } from "@/lib/reader/types";
import {
  readerArticleClass,
  readerColumnClass,
  readerTitleClass
} from "./reader-typography";
import SelectableParagraph from "./SelectableParagraph";
import VocabularyPanel from "./VocabularyPanel";

type ReaderViewProps = {
  document: ReaderDocument;
};

export default function ReaderView({ document }: ReaderViewProps) {
  const [selection, setSelection] = useState<PanelVocabularySelection | null>(null);
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | null>(null);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  const handleSave = useCallback((saveKey: string) => {
    setSavedKeys((prev) => new Set(prev).add(saveKey));
  }, []);

  const pageLabel = `${document.pageCount} page${document.pageCount === 1 ? "" : "s"}`;

  const handleWordSelect = (entry: PanelVocabularySelection, highlightKey: string) => {
    setSelection(entry);
    setActiveHighlightKey(highlightKey);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={`flex h-10 shrink-0 items-center justify-between border-b border-white/[0.1] bg-[#0a0b10] px-4 ${appText.metaSmall}`}
      >
        <span className="truncate text-zinc-300">{document.source}</span>
        <span>
          {pageLabel} · {document.progress}% complete
        </span>
        <span className="hidden text-zinc-400 sm:inline">Select words to learn</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className={readerColumnClass}>
          <h1 className={readerTitleClass}>{document.title}</h1>

          <article className={readerArticleClass}>
            {document.paragraphs.map((paragraph, index) => (
              <SelectableParagraph
                key={index}
                paragraph={paragraph}
                paragraphIndex={index}
                activeHighlightKey={activeHighlightKey}
                sourceTitle={document.title}
                onSelect={handleWordSelect}
              />
            ))}
          </article>
        </div>

        <VocabularyPanel
          selection={selection}
          savedKeys={savedKeys}
          onSave={handleSave}
          emptyDescription="Select any word from your document to understand it in context."
        />
      </div>
    </div>
  );
}
