"use client";

import { useEffect, useState } from "react";
import { shouldDeferReaderPrep } from "@/lib/reader/document-limits";
import {
  buildPreparedParagraphs,
  type PreparedParagraph
} from "@/lib/reader/prepare-paragraphs";

type PreparedParagraphsState = {
  paragraphs: PreparedParagraph[];
  isPreparing: boolean;
};

export function usePreparedParagraphs(sourceParagraphs: string[]): PreparedParagraphsState {
  const [state, setState] = useState<PreparedParagraphsState>(() => {
    if (shouldDeferReaderPrep(sourceParagraphs)) {
      return { paragraphs: [], isPreparing: true };
    }

    return {
      paragraphs: buildPreparedParagraphs(sourceParagraphs),
      isPreparing: false
    };
  });

  useEffect(() => {
    let cancelled = false;

    const apply = (paragraphs: PreparedParagraph[]) => {
      if (!cancelled) {
        setState({ paragraphs, isPreparing: false });
      }
    };

    if (!shouldDeferReaderPrep(sourceParagraphs)) {
      apply(buildPreparedParagraphs(sourceParagraphs));
      return () => {
        cancelled = true;
      };
    }

    setState((current) =>
      current.isPreparing ? current : { paragraphs: [], isPreparing: true }
    );

    const run = () => {
      apply(buildPreparedParagraphs(sourceParagraphs));
    };

    if (typeof requestIdleCallback === "function") {
      const idleId = requestIdleCallback(run, { timeout: 200 });
      return () => {
        cancelled = true;
        cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(run, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [sourceParagraphs]);

  return state;
}
