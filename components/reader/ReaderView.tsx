"use client";

import { useCallback, useRef, useState } from "react";
import { useToast } from "@/components/feedback/ToastProvider";
import { appText } from "@/components/app/app-typography";
import { explainErrorToastMessage, isRateLimitMessage } from "@/lib/feedback/messages";
import { trackAnalyticsEventClient } from "@/lib/analytics/client";
import type { ReaderDocument } from "@/lib/documents/types";
import { documentLanguageLabel } from "@/lib/language/document-language";
import {
  explainWordPayloadToPanelFields,
  fetchExplainWord,
  type ExplainClickPayload,
  type ExplainPanelFields
} from "@/lib/reader/explain-word-client";
import {
  cleanPhraseText,
  clearBrowserSelection,
  highlightKeyForPhrase,
  normalizePhrase,
  type PhraseHighlightRange
} from "@/lib/reader/phrase-selection";
import { cleanDisplayWord } from "@/lib/reader/text-tokens";
import type { PanelVocabularySelection } from "@/lib/reader/types";
import { fetchSaveWord } from "@/lib/save-word/client";
import ReaderDocumentColumn from "./ReaderDocumentColumn";
import { usePhraseSelection } from "./usePhraseSelection";
import { usePreparedParagraphs } from "./usePreparedParagraphs";
import VocabularyPanel from "./VocabularyPanel";

type ReaderViewProps = {
  document: ReaderDocument;
};

function buildInstantSelection(
  click: ExplainClickPayload,
  documentId: string,
  sourceTitle: string
): PanelVocabularySelection {
  const displayLabel =
    click.kind === "phrase"
      ? cleanPhraseText(click.rawWord)
      : cleanDisplayWord(click.rawWord);

  return {
    saveKey: `${click.highlightKey}:${click.normalizedWord}`,
    highlightKey: click.highlightKey,
    documentId,
    normalizedWord: click.normalizedWord,
    word: displayLabel,
    partOfSpeech: click.kind === "phrase" ? "phrase" : "word",
    pronunciation: "",
    definition: "",
    contextMeaning: "",
    sentence: click.sentence,
    sourceTitle,
    status: "loading",
    saveState: "idle"
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export default function ReaderView({ document }: ReaderViewProps) {
  const toast = useToast();
  const articleRef = useRef<HTMLElement>(null);
  const [selection, setSelection] = useState<PanelVocabularySelection | null>(null);
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | null>(null);
  const [activePhraseRange, setActivePhraseRange] = useState<PhraseHighlightRange | null>(
    null
  );
  const selectedHighlightKeyRef = useRef<string | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const saveInFlightRef = useRef(false);
  const selectionRef = useRef<PanelVocabularySelection | null>(null);
  const savedWordKeysRef = useRef(new Set<string>());

  const { paragraphs: preparedParagraphs, isPreparing } = usePreparedParagraphs(
    document.paragraphs
  );

  selectionRef.current = selection;

  const { pendingPhrase, clearPending } = usePhraseSelection({
    articleRef,
    paragraphs: document.paragraphs,
    enabled: !isPreparing
  });

  const handleSave = useCallback(async () => {
    if (saveInFlightRef.current) {
      return;
    }

    const current = selectionRef.current;
    if (
      !current ||
      current.status !== "ready" ||
      !current.wordExplanationId ||
      current.saveState === "saving" ||
      current.saveState === "saved" ||
      current.saveState === "already_saved"
    ) {
      return;
    }

    const persistKey = `${current.documentId}:${current.normalizedWord}`;
    if (savedWordKeysRef.current.has(persistKey)) {
      setSelection((prev) => {
        if (!prev || prev.highlightKey !== current.highlightKey) {
          return prev;
        }

        return { ...prev, saveState: "already_saved" };
      });
      toast.info("Already saved");
      return;
    }

    saveInFlightRef.current = true;
    setSelection((prev) => {
      if (!prev || prev.highlightKey !== current.highlightKey) {
        return prev;
      }

      return { ...prev, saveState: "saving" };
    });

    try {
      const result = await fetchSaveWord({
        documentId: current.documentId,
        wordExplanationId: current.wordExplanationId,
        word: current.word
      });

      savedWordKeysRef.current.add(persistKey);

      setSelection((prev) => {
        if (!prev || prev.highlightKey !== current.highlightKey) {
          return prev;
        }

        return {
          ...prev,
          saveState: result.status === "already_saved" ? "already_saved" : "saved"
        };
      });

      if (result.status === "already_saved") {
        toast.info("Already saved");
      } else {
        toast.success("Saved to flashcards");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save word.";
      toast.error(message);

      setSelection((prev) => {
        if (!prev || prev.highlightKey !== current.highlightKey) {
          return prev;
        }

        return { ...prev, saveState: "idle" };
      });
    } finally {
      saveInFlightRef.current = false;
    }
  }, [toast]);

  const pageLabel = `${document.pageCount} page${document.pageCount === 1 ? "" : "s"}`;

  const applyPanelFields = useCallback(
    (click: ExplainClickPayload, fields: ExplainPanelFields, displayLabel: string) => {
      setSelection({
        saveKey: `${click.highlightKey}:${click.normalizedWord}`,
        highlightKey: click.highlightKey,
        documentId: document.id,
        wordExplanationId: fields.wordExplanationId,
        normalizedWord: click.normalizedWord,
        word: displayLabel,
        partOfSpeech: click.kind === "phrase" ? "phrase" : "word",
        pronunciation: fields.pronunciation,
        definition: fields.definition,
        contextMeaning: fields.contextMeaning,
        exampleUsage: fields.exampleUsage,
        difficulty: fields.difficulty,
        sentence: fields.sentence,
        sourceTitle: document.title,
        status: "ready",
        saveState: "idle",
        explanationSource: fields.explanationSource
      });
    },
    [document.id, document.title]
  );

  const requestExplanation = useCallback(
    (click: ExplainClickPayload, phraseRange: PhraseHighlightRange | null) => {
      fetchAbortRef.current?.abort();
      const controller = new AbortController();
      fetchAbortRef.current = controller;

      selectedHighlightKeyRef.current = click.highlightKey;
      setActiveHighlightKey(click.highlightKey);
      setActivePhraseRange(phraseRange);
      setSelection(buildInstantSelection(click, document.id, document.title));

      void (async () => {
        try {
          const payload = await fetchExplainWord({
            word: click.rawWord,
            sentence: click.sentence,
            documentId: document.id,
            language: document.language,
            signal: controller.signal
          });

          if (controller.signal.aborted) {
            return;
          }

          if (selectedHighlightKeyRef.current !== click.highlightKey) {
            return;
          }

          const fields = explainWordPayloadToPanelFields(payload);
          const displayLabel =
            click.kind === "phrase"
              ? cleanPhraseText(click.rawWord) || cleanPhraseText(fields.word)
              : cleanDisplayWord(fields.word) || cleanDisplayWord(click.rawWord);

          applyPanelFields(click, fields, displayLabel);
        } catch (error) {
          if (isAbortError(error) || controller.signal.aborted) {
            return;
          }

          if (selectedHighlightKeyRef.current !== click.highlightKey) {
            return;
          }

          const paywall =
            error instanceof Error && "paywall" in error
              ? (error as Error & { paywall?: { title: string; message: string } })
                  .paywall
              : undefined;

          const message =
            error instanceof Error
              ? error.message
              : "Could not load word explanation.";

          if (paywall || isRateLimitMessage(message)) {
            trackAnalyticsEventClient({
              eventName: "paywall_shown",
              metadata: { source: "reader_vocabulary", feature: "ai_explanation" }
            });
          }

          toast.error(explainErrorToastMessage(message));

          setSelection((prev) => {
            if (!prev || prev.highlightKey !== click.highlightKey) {
              return prev;
            }

            return {
              ...prev,
              status: "error",
              errorMessage: message,
              paywall: paywall
                ? { title: paywall.title, message: paywall.message }
                : isRateLimitMessage(message)
                  ? {
                      title: "Daily AI limit reached",
                      message: "Upgrade to continue reading without limits."
                    }
                  : undefined
            };
          });
        } finally {
          if (fetchAbortRef.current === controller) {
            fetchAbortRef.current = null;
          }
        }
      })();
    },
    [applyPanelFields, document.id, document.language, document.title, toast]
  );

  const requestExplanationRef = useRef(requestExplanation);
  requestExplanationRef.current = requestExplanation;

  const clearPendingRef = useRef(clearPending);
  clearPendingRef.current = clearPending;

  const stableOnWordClick = useCallback((click: ExplainClickPayload) => {
    clearPendingRef.current();
    clearBrowserSelection();
    requestExplanationRef.current(click, null);
  }, []);

  const handleExplainPhrase = useCallback(() => {
    if (!pendingPhrase) {
      return;
    }

    const normalized = normalizePhrase(pendingPhrase.phrase);
    const highlightKey = highlightKeyForPhrase(
      pendingPhrase.paragraphIndex,
      pendingPhrase.start,
      pendingPhrase.end
    );

    clearPending();
    clearBrowserSelection();

    requestExplanation(
      {
        rawWord: pendingPhrase.phrase,
        normalizedWord: normalized,
        sentence: pendingPhrase.sentence,
        highlightKey,
        kind: "phrase"
      },
      {
        paragraphIndex: pendingPhrase.paragraphIndex,
        start: pendingPhrase.start,
        end: pendingPhrase.end
      }
    );
  }, [pendingPhrase, clearPending, requestExplanation]);

  const handleExplainPhraseRef = useRef(handleExplainPhrase);
  handleExplainPhraseRef.current = handleExplainPhrase;

  const stableOnExplainPhrase = useCallback(() => {
    handleExplainPhraseRef.current();
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={`flex h-10 shrink-0 items-center justify-between border-b border-white/[0.1] bg-[#0a0b10] px-4 ${appText.metaSmall}`}
      >
        <span className="truncate text-zinc-300">{document.source}</span>
        <span>
          {pageLabel} · {document.progress}% complete
        </span>
        <span className="hidden text-zinc-500 sm:inline">
          {documentLanguageLabel(document.language)}
        </span>
        <span className="hidden text-zinc-400 md:inline">Select words to learn</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <ReaderDocumentColumn
          title={document.title}
          articleRef={articleRef}
          paragraphs={preparedParagraphs}
          isPreparing={isPreparing}
          activeHighlightKey={activeHighlightKey}
          activePhraseRange={activePhraseRange}
          pendingPhrase={pendingPhrase}
          onWordClick={stableOnWordClick}
          onExplainPhrase={stableOnExplainPhrase}
        />

        <VocabularyPanel
          selection={selection}
          onSave={handleSave}
          emptyDescription="Select any word from your document to understand it in context."
        />
      </div>
    </div>
  );
}
