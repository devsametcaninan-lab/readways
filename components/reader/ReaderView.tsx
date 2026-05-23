"use client";

import { useCallback, useState } from "react";
import { appText } from "@/components/app/app-typography";
import type { StoredReaderDocument } from "@/lib/document-storage";
import { readerDocument, vocabularyById } from "@/lib/reader-mock-data";
import { panelEntryFromMockId } from "@/lib/reader/vocabulary-lookup";
import type { PanelVocabularySelection } from "@/lib/reader/types";
import {
  readerArticleClass,
  readerColumnClass,
  readerParagraphClass,
  readerTitleClass
} from "./reader-typography";
import SelectableParagraph from "./SelectableParagraph";
import VocabularyPanel from "./VocabularyPanel";
import { wordHighlightClass } from "./word-highlight";

type ReaderViewProps =
  | { variant: "mock" }
  | { variant: "stored"; storedDocument: StoredReaderDocument };

export default function ReaderView(props: ReaderViewProps) {
  const isMock = props.variant === "mock";
  const storedDocument = props.variant === "stored" ? props.storedDocument : null;

  const [selection, setSelection] = useState<PanelVocabularySelection | null>(null);
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | null>(null);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  const handleSave = useCallback((saveKey: string) => {
    setSavedKeys((prev) => new Set(prev).add(saveKey));
  }, []);

  const title = isMock ? readerDocument.title : storedDocument!.title;
  const source = isMock ? readerDocument.source : storedDocument!.source;
  const pageLabel = isMock
    ? `Page ${readerDocument.page}`
    : `${storedDocument!.pageCount} page${storedDocument!.pageCount === 1 ? "" : "s"}`;
  const progress = isMock ? readerDocument.progress : storedDocument!.progress;

  const handleMockWordClick = (id: string) => {
    const entry = panelEntryFromMockId(id, title);
    if (!entry) return;
    setSelection(entry);
    setActiveHighlightKey(id);
  };

  const handleStoredWordSelect = (entry: PanelVocabularySelection, highlightKey: string) => {
    setSelection(entry);
    setActiveHighlightKey(highlightKey);
  };

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
          {isMock ? "Highlight mode on" : "Select words to learn"}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className={readerColumnClass}>
          <h1 className={readerTitleClass}>{title}</h1>

          <article className={readerArticleClass}>
            {isMock
              ? readerDocument.paragraphs.map((paragraph, index) => (
                  <p key={index} className={readerParagraphClass}>
                    {paragraph.segments.map((segment, segIndex) => {
                      if (segment.type === "text") {
                        return <span key={segIndex}>{segment.value}</span>;
                      }

                      const vocab = vocabularyById[segment.id];
                      if (!vocab) return null;

                      const isActive = activeHighlightKey === segment.id;

                      return (
                        <button
                          key={segIndex}
                          type="button"
                          onClick={() => handleMockWordClick(segment.id)}
                          className={wordHighlightClass(isActive, true)}
                        >
                          {vocab.word}
                        </button>
                      );
                    })}
                  </p>
                ))
              : storedDocument!.paragraphs.map((paragraph, index) => (
                  <SelectableParagraph
                    key={index}
                    paragraph={paragraph}
                    paragraphIndex={index}
                    activeHighlightKey={activeHighlightKey}
                    sourceTitle={title}
                    onSelect={handleStoredWordSelect}
                  />
                ))}
          </article>
        </div>

        <VocabularyPanel
          selection={selection}
          savedKeys={savedKeys}
          onSave={handleSave}
          emptyTitle={isMock ? "Select a word" : "Select a word"}
          emptyDescription={
            isMock
              ? "Click any highlighted word in the article to see its meaning in context, review the original sentence, and save it as a flashcard."
              : "Select any word from your document to understand it in context."
          }
        />
      </div>
    </div>
  );
}
