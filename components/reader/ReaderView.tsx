"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useToast } from "@/components/feedback/ToastProvider";
import { appText } from "@/components/app/app-typography";
import { explainErrorToastMessage, isRateLimitMessage } from "@/lib/feedback/messages";
import { trackAnalyticsEventClient } from "@/lib/analytics/client";
import type { ReaderDocument } from "@/lib/documents/types";
import { documentLanguageLabel } from "@/lib/language/document-language";
import {
  explainWordPayloadToPanelFields,
  explainWordRequestKey,
  fetchExplainWord,
  type ExplainClickPayload,
  type ExplainPanelFields
} from "@/lib/reader/explain-word-client";
import { validateExplainClick } from "@/lib/reader/explain-request";
import {
  hasActiveTextSelectionIn,
  isReaderProtectedTarget
} from "@/lib/reader/reader-interaction";
import {
  cleanPhraseText,
  clearBrowserSelection,
  highlightKeyForPhrase,
  normalizePhrase,
  resolvePhraseSelection,
  type PhraseHighlightRange,
  type PhraseSelectionResolved
} from "@/lib/reader/phrase-selection";
import { cleanDisplayWord } from "@/lib/reader/text-tokens";
import type { PanelVocabularySelection } from "@/lib/reader/types";
import { fetchSaveWord } from "@/lib/save-word/client";
import ReaderDocumentColumn from "./ReaderDocumentColumn";
import { usePhraseSelection } from "./usePhraseSelection";
import { usePreparedParagraphs } from "./usePreparedParagraphs";
import { useOnboardingOptional } from "@/lib/onboarding/OnboardingProvider";
import { mapSettingsLanguageToApiPreference } from "@/lib/ai-dictionary/explanation-language";
import { resolveExplanationLanguage } from "@/lib/preferences/resolve-language";
import { useUserPreferences } from "@/lib/preferences/UserPreferencesProvider";
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
  const { preferences } = useUserPreferences();
  const onboarding = useOnboardingOptional();
  const articleRef = useRef<HTMLElement>(null);
  const vocabularyPanelRef = useRef<HTMLElement | null>(null);
  const [selection, setSelection] = useState<PanelVocabularySelection | null>(null);
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | null>(null);
  const [activePhraseRange, setActivePhraseRange] = useState<PhraseHighlightRange | null>(
    null
  );
  const selectedHighlightKeyRef = useRef<string | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const explainRequestIdRef = useRef(0);
  const loadingExplainKeyRef = useRef<string | null>(null);
  const lastExplainRequestRef = useRef<{
    click: ExplainClickPayload;
    phraseRange: PhraseHighlightRange | null;
  } | null>(null);
  const saveInFlightRef = useRef(false);
  const selectionRef = useRef<PanelVocabularySelection | null>(null);
  const savedWordKeysRef = useRef(new Set<string>());
  const autoSavedKeysRef = useRef(new Set<string>());
  const pendingPhraseRef = useRef<PhraseSelectionResolved | null>(null);
  const [isLgUp, setIsLgUp] = useState(false);
  const [mobileVocabPaddingBottomPx, setMobileVocabPaddingBottomPx] = useState(0);

  const { paragraphs: preparedParagraphs, isPreparing } = usePreparedParagraphs(
    document.paragraphs
  );

  selectionRef.current = selection;

  const { pendingPhrase, clearPending } = usePhraseSelection({
    articleRef,
    paragraphs: document.paragraphs,
    enabled: !isPreparing
  });

  pendingPhraseRef.current = pendingPhrase;

  const handleSave = useCallback(async () => {
    if (saveInFlightRef.current) {
      return;
    }

    const current = selectionRef.current;
    if (
      !current ||
      current.status !== "ready" ||
      !current.wordExplanationId ||
      !current.definition.trim() ||
      !current.contextMeaning.trim() ||
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

  useEffect(() => {
    if (!preferences.autoSaveWords) {
      return;
    }

    const current = selectionRef.current;
    if (
      !current ||
      current.status !== "ready" ||
      !current.wordExplanationId ||
      !current.definition.trim() ||
      !current.contextMeaning.trim() ||
      current.saveState !== "idle"
    ) {
      return;
    }

    const autoKey = current.saveKey;
    if (autoSavedKeysRef.current.has(autoKey)) {
      return;
    }

    autoSavedKeysRef.current.add(autoKey);
    void handleSave();
  }, [selection, preferences.autoSaveWords, handleSave]);

  const explanationLanguage = resolveExplanationLanguage(
    preferences.defaultExplanationLanguage,
    document.language
  );
  const explanationLanguagePreference = mapSettingsLanguageToApiPreference(
    preferences.defaultExplanationLanguage
  );

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
        explanationSource: fields.explanationSource,
        explanationLanguageLabel: fields.explanationLanguageLabel
      });
    },
    [document.id, document.title]
  );

  const showExplainError = useCallback(
    (click: ExplainClickPayload, message: string, paywall?: PanelVocabularySelection["paywall"]) => {
      if (selectedHighlightKeyRef.current !== click.highlightKey) {
        return;
      }

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
          paywall
        };
      });
    },
    [toast]
  );

  const requestExplanation = useCallback(
    (click: ExplainClickPayload, phraseRange: PhraseHighlightRange | null) => {
      if (onboarding?.shouldShow("reader")) {
        void onboarding.dismiss("reader");
      }

      const requestKey = explainWordRequestKey(
        document.id,
        click.normalizedWord,
        click.sentence,
        explanationLanguage
      );

      if (
        loadingExplainKeyRef.current === requestKey &&
        selectionRef.current?.status === "loading"
      ) {
        trackAnalyticsEventClient({
          eventName: "duplicate_request_prevented",
          metadata: {
            documentId: document.id,
            kind: click.kind
          }
        });
        return;
      }

      const clientValidation = validateExplainClick(click);
      if (!clientValidation.ok) {
        selectedHighlightKeyRef.current = click.highlightKey;
        setActiveHighlightKey(click.highlightKey);
        setActivePhraseRange(phraseRange);
        setSelection({
          ...buildInstantSelection(click, document.id, document.title),
          status: "error",
          errorMessage: clientValidation.message
        });
        toast.error(clientValidation.message);
        return;
      }

      lastExplainRequestRef.current = { click, phraseRange };

      fetchAbortRef.current?.abort();
      const controller = new AbortController();
      fetchAbortRef.current = controller;
      const requestId = ++explainRequestIdRef.current;

      loadingExplainKeyRef.current = requestKey;
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
            documentLanguage: document.language,
            explanationLanguagePreference,
            signal: controller.signal
          });

          if (
            controller.signal.aborted ||
            requestId !== explainRequestIdRef.current ||
            selectedHighlightKeyRef.current !== click.highlightKey
          ) {
            return;
          }

          const fields = explainWordPayloadToPanelFields(payload);

          if (!fields.wordExplanationId || !fields.definition.trim() || !fields.contextMeaning.trim()) {
            showExplainError(
              click,
              "Could not load a complete explanation. Please try again."
            );
            return;
          }

          const displayLabel =
            click.kind === "phrase"
              ? cleanPhraseText(click.rawWord) || cleanPhraseText(fields.word)
              : cleanDisplayWord(fields.word) || cleanDisplayWord(click.rawWord);

          applyPanelFields(click, fields, displayLabel);
        } catch (error) {
          if (
            isAbortError(error) ||
            controller.signal.aborted ||
            requestId !== explainRequestIdRef.current
          ) {
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

          showExplainError(
            click,
            message,
            paywall
              ? { title: paywall.title, message: paywall.message }
              : isRateLimitMessage(message)
                ? {
                    title: "Daily AI limit reached",
                    message: "Upgrade to continue reading without limits."
                  }
                : undefined
          );
        } finally {
          if (loadingExplainKeyRef.current === requestKey) {
            loadingExplainKeyRef.current = null;
          }

          if (fetchAbortRef.current === controller) {
            fetchAbortRef.current = null;
          }
        }
      })();
    },
    [
      applyPanelFields,
      document.id,
      document.title,
      document.language,
      explanationLanguage,
      explanationLanguagePreference,
      onboarding,
      showExplainError
    ]
  );

  const handleRetryExplain = useCallback(() => {
    const last = lastExplainRequestRef.current;
    if (!last) {
      return;
    }

    requestExplanation(last.click, last.phraseRange);
  }, [requestExplanation]);

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

  const handleCloseVocabulary = useCallback(() => {
    fetchAbortRef.current?.abort();
    loadingExplainKeyRef.current = null;
    clearPending();
    clearBrowserSelection();
    selectedHighlightKeyRef.current = null;
    setSelection(null);
    setActiveHighlightKey(null);
    setActivePhraseRange(null);
  }, [clearPending]);

  const handleCloseVocabularyRef = useRef(handleCloseVocabulary);
  handleCloseVocabularyRef.current = handleCloseVocabulary;

  const clearPendingRefForDismiss = useRef(clearPending);
  clearPendingRefForDismiss.current = clearPending;

  const handleReaderPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (isReaderProtectedTarget(target)) {
        return;
      }

      const article = articleRef.current;
      if (!article?.contains(target)) {
        return;
      }

      // Let phrase selection sync finish before dismissing.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const root = articleRef.current;
          if (!root) {
            return;
          }

          if (hasActiveTextSelectionIn(root)) {
            return;
          }

          const resolved = resolvePhraseSelection({
            articleRoot: root,
            paragraphs: document.paragraphs
          });

          if (resolved) {
            return;
          }

          const hadPhrasePending = pendingPhraseRef.current !== null;
          const hadVocabulary =
            selectionRef.current !== null ||
            selectedHighlightKeyRef.current !== null;

          if (!hadPhrasePending && !hadVocabulary) {
            return;
          }

          handleCloseVocabularyRef.current();
        });
      });
    },
    [document.paragraphs]
  );

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLgUp(mql.matches);
    update();

    // Safari fallback (older MediaQueryList API)
    const withAddEventListener = (mql as unknown as { addEventListener: Function });
    if (typeof (withAddEventListener as any).addEventListener === "function") {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }

    (mql as unknown as { addListener: (cb: () => void) => void; removeListener: (cb: () => void) => void }).addListener(
      update
    );
    return () =>
      (mql as unknown as {
        addListener: (cb: () => void) => void;
        removeListener: (cb: () => void) => void;
      }).removeListener(update);
  }, []);

  useLayoutEffect(() => {
    if (isLgUp || !selection) {
      setMobileVocabPaddingBottomPx(0);
      return;
    }

    const el = vocabularyPanelRef.current;
    if (!el) {
      setMobileVocabPaddingBottomPx(0);
      return;
    }

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setMobileVocabPaddingBottomPx(Math.ceil(rect.height));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isLgUp, Boolean(selection)]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={`flex h-10 shrink-0 items-center justify-between border-b border-white/[0.1] bg-[#0a0b10] px-4 ${appText.metaSmall}`}
      >
        <span className="truncate text-zinc-300">{document.source}</span>
        <span>{pageLabel} · Reading session</span>
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
          mobileExtraPaddingBottomPx={mobileVocabPaddingBottomPx}
          onReaderPointerUp={handleReaderPointerUp}
        />

        <VocabularyPanel
          selection={selection}
          onSave={handleSave}
          onRetry={handleRetryExplain}
          emptyDescription="Select any word from your document to understand it in context."
          isMobileOpen={Boolean(selection)}
          onClose={handleCloseVocabulary}
          panelRef={vocabularyPanelRef}
        />
      </div>
    </div>
  );
}
