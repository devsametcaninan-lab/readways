"use client";

import { useCallback, useRef, useState } from "react";
import { appText } from "@/components/app/app-typography";
import type { ReaderDocument } from "@/lib/documents/types";
import {
  explainWordPayloadToPanelFields,
  fetchExplainWord,
  type WordClickPayload
} from "@/lib/reader/explain-word-client";
import { cleanDisplayWord } from "@/lib/reader/text-tokens";
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

function buildInstantSelection(
  click: WordClickPayload,
  sourceTitle: string
): PanelVocabularySelection {
  const displayWord = cleanDisplayWord(click.rawWord);

  return {
    saveKey: `${click.highlightKey}:${click.normalizedWord}`,
    highlightKey: click.highlightKey,
    word: displayWord,
    partOfSpeech: "word",
    pronunciation: "",
    definition: "",
    contextMeaning: "",
    sentence: click.sentence,
    sourceTitle,
    status: "loading"
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export default function ReaderView({ document }: ReaderViewProps) {
  const [selection, setSelection] = useState<PanelVocabularySelection | null>(null);
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | null>(null);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  const selectedHighlightKeyRef = useRef<string | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);

  const handleSave = useCallback((saveKey: string) => {
    setSavedKeys((prev) => new Set(prev).add(saveKey));
  }, []);

  const pageLabel = `${document.pageCount} page${document.pageCount === 1 ? "" : "s"}`;

  const handleWordClick = useCallback(
    (click: WordClickPayload) => {
      fetchAbortRef.current?.abort();
      const controller = new AbortController();
      fetchAbortRef.current = controller;

      selectedHighlightKeyRef.current = click.highlightKey;
      setActiveHighlightKey(click.highlightKey);
      setSelection(buildInstantSelection(click, document.title));

      void (async () => {
        try {
          const payload = await fetchExplainWord({
            word: click.rawWord,
            sentence: click.sentence,
            documentId: document.id,
            language: "en",
            signal: controller.signal
          });

          if (controller.signal.aborted) {
            return;
          }

          if (selectedHighlightKeyRef.current !== click.highlightKey) {
            return;
          }

          const fields = explainWordPayloadToPanelFields(payload);

          setSelection({
            saveKey: `${click.highlightKey}:${click.normalizedWord}`,
            highlightKey: click.highlightKey,
            word: cleanDisplayWord(fields.word) || cleanDisplayWord(click.rawWord),
            partOfSpeech: "word",
            pronunciation: fields.pronunciation,
            definition: fields.definition,
            contextMeaning: fields.contextMeaning,
            sentence: fields.sentence,
            sourceTitle: document.title,
            status: "ready",
            explanationSource: fields.explanationSource
          });
        } catch (error) {
          if (isAbortError(error) || controller.signal.aborted) {
            return;
          }

          if (selectedHighlightKeyRef.current !== click.highlightKey) {
            return;
          }

          const message =
            error instanceof Error
              ? error.message
              : "Could not load word explanation.";

          setSelection((prev) => {
            if (!prev || prev.highlightKey !== click.highlightKey) {
              return prev;
            }

            return {
              ...prev,
              status: "error",
              errorMessage: message
            };
          });
        } finally {
          if (fetchAbortRef.current === controller) {
            fetchAbortRef.current = null;
          }
        }
      })();
    },
    [document.id, document.title]
  );

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
                onWordClick={handleWordClick}
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
