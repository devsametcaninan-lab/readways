"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { ExplanationLanguagePreference } from "@/lib/ai-dictionary/explanation-language";
import type { DocumentLanguage } from "@/lib/language/document-language";
import { logDevDebug } from "@/lib/logging/dev-log";
import type { ExplainLocalCache } from "@/lib/reader/explain-local-cache";
import {
  buildParagraphPrefetchTargets,
  runExplainPrefetchTarget,
  type ExplainPrefetchWordTarget
} from "@/lib/reader/explain-prefetch";
import {
  EXPLAIN_PREFETCH_INITIAL_PARAGRAPHS,
  EXPLAIN_PREFETCH_MAX_CONCURRENT,
  EXPLAIN_PREFETCH_ROOT_MARGIN,
  isExplainPrefetchEnabled
} from "@/lib/reader/explain-prefetch-config";
import type { PreparedParagraph } from "@/lib/reader/prepare-paragraphs";

type UseExplainParagraphPrefetchParams = {
  documentId: string;
  documentLanguage: DocumentLanguage | string;
  explanationLanguage: string;
  explanationLanguagePreference: ExplanationLanguagePreference;
  explainLocalCache: ExplainLocalCache;
  paragraphs: PreparedParagraph[];
  articleRef: RefObject<HTMLElement | null>;
  isPreparing: boolean;
  userExplainBusy?: boolean;
};

function parseRootMarginPx(rootMargin: string): number {
  const match = rootMargin.match(/(-?\d+)px/);
  return match ? Math.max(0, Number(match[1])) : 0;
}

function collectVisibleParagraphIndices(root: HTMLElement, marginPx: number): number[] {
  const top = -marginPx;
  const bottom = window.innerHeight + marginPx;
  const indices: number[] = [];

  for (const element of root.querySelectorAll("[data-paragraph-index]")) {
    const html = element as HTMLElement;
    const rect = html.getBoundingClientRect();
    if (rect.bottom < top || rect.top > bottom) {
      continue;
    }

    const index = Number(html.dataset.paragraphIndex);
    if (Number.isFinite(index)) {
      indices.push(index);
    }
  }

  return indices;
}

export function useExplainParagraphPrefetch({
  documentId,
  documentLanguage,
  explanationLanguage,
  explanationLanguagePreference,
  explainLocalCache,
  paragraphs,
  articleRef,
  isPreparing,
  userExplainBusy = false
}: UseExplainParagraphPrefetchParams): {
  prioritizePrefetch: (target: ExplainPrefetchWordTarget) => void;
} {
  const queueRef = useRef<ExplainPrefetchWordTarget[]>([]);
  const inFlightRef = useRef(new Set<string>());
  const enqueuedParagraphsRef = useRef(new Set<number>());
  const activeCountRef = useRef(0);
  const pausedRef = useRef(false);
  const pumpQueueRef = useRef<() => void>(() => {});
  const userExplainBusyRef = useRef(userExplainBusy);
  userExplainBusyRef.current = userExplainBusy;

  const prioritizePrefetch = useCallback(
    (target: ExplainPrefetchWordTarget) => {
      if (!isExplainPrefetchEnabled() || pausedRef.current) {
        return;
      }

      if (
        explainLocalCache.get(target.requestKey) ||
        inFlightRef.current.has(target.requestKey)
      ) {
        return;
      }

      queueRef.current = queueRef.current.filter((queued) => queued.requestKey !== target.requestKey);
      queueRef.current.unshift(target);
      pumpQueueRef.current();
    },
    [explainLocalCache]
  );

  useEffect(() => {
    if (!isExplainPrefetchEnabled() || isPreparing) {
      return;
    }

    let cancelled = false;
    const abortController = new AbortController();
    const marginPx = parseRootMarginPx(EXPLAIN_PREFETCH_ROOT_MARGIN);
    queueRef.current = [];
    inFlightRef.current.clear();
    enqueuedParagraphsRef.current.clear();
    activeCountRef.current = 0;
    pausedRef.current = false;

    const pumpQueue = () => {
      if (cancelled || pausedRef.current || userExplainBusyRef.current) {
        return;
      }

      while (
        activeCountRef.current < EXPLAIN_PREFETCH_MAX_CONCURRENT &&
        queueRef.current.length > 0
      ) {
        const target = queueRef.current.shift();
        if (!target) {
          break;
        }

        if (
          explainLocalCache.get(target.requestKey) ||
          inFlightRef.current.has(target.requestKey)
        ) {
          continue;
        }

        inFlightRef.current.add(target.requestKey);
        activeCountRef.current += 1;

        void (async () => {
          try {
            const result = await runExplainPrefetchTarget({
              target,
              documentId,
              documentLanguage,
              explanationLanguagePreference,
              cache: explainLocalCache,
              signal: abortController.signal
            });

            if (result === "rate_limited") {
              pausedRef.current = true;
              queueRef.current = [];
              logDevDebug("explain-prefetch:paused", { reason: "rate_limited" });
            }
          } finally {
            inFlightRef.current.delete(target.requestKey);
            activeCountRef.current = Math.max(0, activeCountRef.current - 1);
            pumpQueue();
          }
        })();
      }
    };

    pumpQueueRef.current = pumpQueue;

    const enqueueParagraph = (paragraphIndex: number) => {
      if (cancelled || pausedRef.current || enqueuedParagraphsRef.current.has(paragraphIndex)) {
        return;
      }

      const paragraph = paragraphs[paragraphIndex];
      if (!paragraph) {
        return;
      }

      enqueuedParagraphsRef.current.add(paragraphIndex);

      const targets = buildParagraphPrefetchTargets({
        paragraph,
        documentId,
        explanationLanguage,
        cache: explainLocalCache
      });

      if (targets.length === 0) {
        return;
      }

      logDevDebug("explain-prefetch:enqueue", {
        paragraphIndex,
        targetCount: targets.length
      });

      queueRef.current.push(...targets);
      pumpQueue();
    };

    const bootstrapParagraphs = (root: HTMLElement) => {
      const indices = new Set<number>();

      for (let index = 0; index < Math.min(EXPLAIN_PREFETCH_INITIAL_PARAGRAPHS, paragraphs.length); index += 1) {
        indices.add(index);
      }

      for (const index of collectVisibleParagraphIndices(root, marginPx)) {
        indices.add(index);
      }

      for (const index of indices) {
        enqueueParagraph(index);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const index = Number((entry.target as HTMLElement).dataset.paragraphIndex);
          if (!Number.isFinite(index)) {
            continue;
          }

          enqueueParagraph(index);
        }
      },
      {
        root: null,
        rootMargin: EXPLAIN_PREFETCH_ROOT_MARGIN,
        threshold: 0
      }
    );

    const observeParagraphs = (root: HTMLElement) => {
      const elements = root.querySelectorAll("[data-paragraph-index]");
      for (const element of elements) {
        observer.observe(element);
      }
      bootstrapParagraphs(root);
    };

    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      if (scrollTimer) {
        return;
      }

      scrollTimer = setTimeout(() => {
        scrollTimer = null;
        const root = articleRef.current;
        if (!root || cancelled) {
          return;
        }

        for (const index of collectVisibleParagraphIndices(root, marginPx)) {
          enqueueParagraph(index);
        }
      }, 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const article = articleRef.current;
    if (!article) {
      const retryFrameId = window.requestAnimationFrame(() => {
        if (cancelled) {
          return;
        }

        const retryArticle = articleRef.current;
        if (!retryArticle) {
          return;
        }

        observeParagraphs(retryArticle);
      });

      return () => {
        cancelled = true;
        window.cancelAnimationFrame(retryFrameId);
        window.removeEventListener("scroll", handleScroll);
        if (scrollTimer) {
          clearTimeout(scrollTimer);
        }
        observer.disconnect();
        abortController.abort();
        pumpQueueRef.current = () => {};
        queueRef.current = [];
        inFlightRef.current.clear();
        activeCountRef.current = 0;
      };
    }

    observeParagraphs(article);
    const frameId = window.requestAnimationFrame(() => {
      if (!cancelled && articleRef.current) {
        observeParagraphs(articleRef.current);
      }
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
      observer.disconnect();
      abortController.abort();
      pumpQueueRef.current = () => {};
      queueRef.current = [];
      inFlightRef.current.clear();
      activeCountRef.current = 0;
    };
  }, [
    articleRef,
    documentId,
    documentLanguage,
    explanationLanguage,
    explanationLanguagePreference,
    explainLocalCache,
    isPreparing,
    paragraphs
  ]);

  useEffect(() => {
    if (!userExplainBusy) {
      pumpQueueRef.current();
    }
  }, [userExplainBusy]);

  return { prioritizePrefetch };
}
