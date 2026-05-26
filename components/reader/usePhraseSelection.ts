"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import {
  resolvePhraseSelection,
  type PhraseSelectionResolved
} from "@/lib/reader/phrase-selection";

export function usePhraseSelection(params: {
  articleRef: RefObject<HTMLElement | null>;
  paragraphs: string[];
  enabled: boolean;
}) {
  const { articleRef, paragraphs, enabled } = params;
  const [pending, setPending] = useState<PhraseSelectionResolved | null>(null);

  const clearPending = useCallback(() => {
    setPending(null);
  }, []);

  const syncFromSelection = useCallback(() => {
    if (!enabled) {
      setPending((current) => (current === null ? current : null));
      return;
    }

    const article = articleRef.current;
    if (!article) {
      setPending((current) => (current === null ? current : null));
      return;
    }

    const resolved = resolvePhraseSelection({ articleRoot: article, paragraphs });

    setPending((current) => {
      if (!resolved && !current) {
        return current;
      }

      if (!resolved || !current) {
        return resolved;
      }

      if (
        current.phrase === resolved.phrase &&
        current.paragraphIndex === resolved.paragraphIndex &&
        current.start === resolved.start &&
        current.end === resolved.end
      ) {
        return current;
      }

      return resolved;
    });
  }, [articleRef, paragraphs, enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onSelectionChange = () => {
      syncFromSelection();
    };

    const onMouseUp = () => {
      window.requestAnimationFrame(syncFromSelection);
    };

    const onKeyUp = () => {
      syncFromSelection();
    };

    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [enabled, syncFromSelection]);

  return { pendingPhrase: pending, clearPending };
}
