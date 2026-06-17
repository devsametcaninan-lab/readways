"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/feedback/ToastProvider";
import { appText } from "@/components/app/app-typography";
import { explainErrorToastMessage, isRateLimitMessage } from "@/lib/feedback/messages";
import {
  defaultAiLimitPaywall,
  localizePaywallState,
  localizeUserMessage
} from "@/lib/i18n/localize-user-message";
import { trackAnalyticsEventClient } from "@/lib/analytics/client";
import type { ReaderDocument } from "@/lib/documents/types";
import { documentLanguageLabel } from "@/lib/language/document-language";
import {
  explainWordRequestKey,
  fetchExplainWord,
  type ExplainClickPayload,
  type ExplainPanelFields
} from "@/lib/reader/explain-word-client";
import {
  logExplainClientTiming,
  type ExplainClientTiming
} from "@/lib/explain-word/timing";
import { validateExplainClick } from "@/lib/reader/explain-request";
import { createExplainLocalCache } from "@/lib/reader/explain-local-cache";
import { resolveExplainIntoCache } from "@/lib/reader/explain-fetch-coordinator";
import { buildPrefetchTargetFromToken } from "@/lib/reader/explain-prefetch";
import type { PreparedParagraph } from "@/lib/reader/prepare-paragraphs";
import type { WordToken } from "@/lib/reader/text-tokens";
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
import { useI18n } from "@/lib/i18n/provider";
import VocabularyPanel from "./VocabularyPanel";
import { useExplainParagraphPrefetch } from "./useExplainParagraphPrefetch";

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
  const { t } = useI18n();
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
  const explainLocalCache = useMemo(
    () => createExplainLocalCache(document.id),
    [document.id]
  );
  const lastExplainRequestRef = useRef<{
    click: ExplainClickPayload;
    phraseRange: PhraseHighlightRange | null;
  } | null>(null);
  const saveInFlightRef = useRef(false);
  const selectionRef = useRef<PanelVocabularySelection | null>(null);
  const savedWordKeysRef = useRef(new Set<string>());
  const autoSavedKeysRef = useRef(new Set<string>());
  const pendingPhraseRef = useRef<PhraseSelectionResolved | null>(null);
  const explainClientTimingRef = useRef<ExplainClientTiming | null>(null);
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
      toast.info(t("toast.alreadySaved"));
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
        toast.info(t("toast.alreadySaved"));
      } else {
        toast.success(t("toast.savedToFlashcards"));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("toast.saveWordFailed");
      toast.error(localizeUserMessage(message, t));

      setSelection((prev) => {
        if (!prev || prev.highlightKey !== current.highlightKey) {
          return prev;
        }

        return { ...prev, saveState: "idle" };
      });
    } finally {
      saveInFlightRef.current = false;
    }
  }, [t, toast]);

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

  const { prioritizePrefetch } = useExplainParagraphPrefetch({
    documentId: document.id,
    documentLanguage: document.language,
    explanationLanguage,
    explanationLanguagePreference,
    explainLocalCache,
    paragraphs: preparedParagraphs,
    articleRef,
    isPreparing,
    userExplainBusy: selection?.status === "loading"
  });

  const pageLabel =
    document.pageCount === 1
      ? t("app.readerPageSingular").replace("{count}", String(document.pageCount))
      : t("app.readerPagePlural").replace("{count}", String(document.pageCount));

  const handleWordIntent = useCallback(
    (token: WordToken, paragraph: PreparedParagraph) => {
      const target = buildPrefetchTargetFromToken({
        paragraph,
        token,
        documentId: document.id,
        explanationLanguage,
        cache: explainLocalCache
      });

      if (target) {
        prioritizePrefetch(target);
      }
    },
    [document.id, explanationLanguage, explainLocalCache, prioritizePrefetch]
  );

  const applyPanelFields = useCallback(
    (click: ExplainClickPayload, fields: ExplainPanelFields, displayLabel: string) => {
      const timing = explainClientTimingRef.current;
      if (timing) {
        timing.panelDispatchAt = performance.now();
      }

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

  useLayoutEffect(() => {
    const timing = explainClientTimingRef.current;
    if (!timing || selection?.status !== "ready" || !selection.definition.trim()) {
      return;
    }

    explainClientTimingRef.current = null;
    timing.panelRenderedAt = performance.now();
    logExplainClientTiming(timing);
  }, [selection]);

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

      const localizedMessage = localizeUserMessage(message, t);
      toast.error(explainErrorToastMessage(message, t));

      setSelection((prev) => {
        if (!prev || prev.highlightKey !== click.highlightKey) {
          return prev;
        }

        return {
          ...prev,
          status: "error",
          errorMessage: localizedMessage,
          paywall
        };
      });
    },
    [t, toast]
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
        explanationLanguage,
        click.kind
      );

      const clientTiming: ExplainClientTiming = {
        clickAt: performance.now(),
        kind: click.kind,
        wordLength: click.rawWord.trim().length,
        sentenceLength: click.sentence.trim().length
      };

      const cachedLocal = explainLocalCache.get(requestKey);
      if (cachedLocal) {
        explainClientTimingRef.current = { ...clientTiming, cacheStatus: "hit" };
        selectedHighlightKeyRef.current = click.highlightKey;
        setActiveHighlightKey(click.highlightKey);
        setActivePhraseRange(phraseRange);
        applyPanelFields(click, cachedLocal.fields, cachedLocal.displayLabel);
        return;
      }

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

      const clientValidation = validateExplainClick(click, t);
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
      explainClientTimingRef.current = clientTiming;

      void (async () => {
        try {
          const cachedEntry = await resolveExplainIntoCache({
            requestKey,
            cache: explainLocalCache,
            rawWord: click.rawWord,
            kind: click.kind,
            signal: controller.signal,
            fetchPayload: () =>
              fetchExplainWord({
                word: click.rawWord,
                sentence: click.sentence,
                documentId: document.id,
                documentLanguage: document.language,
                explanationLanguagePreference,
                signal: controller.signal,
                timing: clientTiming
              })
          });

          if (
            controller.signal.aborted ||
            requestId !== explainRequestIdRef.current ||
            selectedHighlightKeyRef.current !== click.highlightKey
          ) {
            if (explainClientTimingRef.current === clientTiming) {
              explainClientTimingRef.current = null;
            }
            return;
          }

          if (!cachedEntry) {
            if (explainClientTimingRef.current === clientTiming) {
              explainClientTimingRef.current = null;
            }
            showExplainError(click, t("toast.explainIncomplete"));
            return;
          }

          applyPanelFields(click, cachedEntry.fields, cachedEntry.displayLabel);
        } catch (error) {
          if (
            isAbortError(error) ||
            controller.signal.aborted ||
            requestId !== explainRequestIdRef.current
          ) {
            if (explainClientTimingRef.current === clientTiming) {
              explainClientTimingRef.current = null;
            }
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
            error instanceof Error ? error.message : t("toast.explainLoadFailed");

          showExplainError(
            click,
            message,
            paywall
              ? localizePaywallState(paywall, t)
              : isRateLimitMessage(message)
                ? defaultAiLimitPaywall(t)
                : undefined
          );

          if (explainClientTimingRef.current === clientTiming) {
            explainClientTimingRef.current = null;
          }
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
      explainLocalCache,
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

  const handleWordIntentRef = useRef(handleWordIntent);
  handleWordIntentRef.current = handleWordIntent;

  const stableOnWordIntent = useCallback((token: WordToken, paragraph: PreparedParagraph) => {
    handleWordIntentRef.current(token, paragraph);
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
        <span>
          {pageLabel} · {t("app.readerReadingSession")}
        </span>
        <span className="hidden text-zinc-500 sm:inline">
          {documentLanguageLabel(document.language)}
        </span>
        <span className="hidden text-zinc-400 md:inline">
          {t("app.readerSelectWordsToLearn")}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row lg:overflow-visible">
        <ReaderDocumentColumn
          title={document.title}
          articleRef={articleRef}
          paragraphs={preparedParagraphs}
          isPreparing={isPreparing}
          activeHighlightKey={activeHighlightKey}
          activePhraseRange={activePhraseRange}
          pendingPhrase={pendingPhrase}
          onWordClick={stableOnWordClick}
          onWordIntent={stableOnWordIntent}
          onExplainPhrase={stableOnExplainPhrase}
          mobileExtraPaddingBottomPx={mobileVocabPaddingBottomPx}
          onReaderPointerUp={handleReaderPointerUp}
        />

        <VocabularyPanel
          selection={selection}
          onSave={handleSave}
          onRetry={handleRetryExplain}
          emptyTitle={t("app.readerEmptySelectWordTitle")}
          emptyDescription={t("app.readerEmptySelectWordBody")}
          isMobileOpen={Boolean(selection)}
          onClose={handleCloseVocabulary}
          panelRef={vocabularyPanelRef}
        />
      </div>
    </div>
  );
}
