"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
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
  const rafRef = useRef<number | null>(null);

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

    const scheduleSync = () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        syncFromSelection();
      });
    };

    const onSelectionChange = () => {
      scheduleSync();
    };

    const onPointerUp = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(syncFromSelection);
      });
    };

    const onKeyUp = () => {
      syncFromSelection();
    };

    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("mouseup", onPointerUp);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("touchend", onPointerUp, { passive: true });
    document.addEventListener("touchcancel", onPointerUp, { passive: true });

    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("mouseup", onPointerUp);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("touchend", onPointerUp);
      document.removeEventListener("touchcancel", onPointerUp);

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled, syncFromSelection]);

  return { pendingPhrase: pending, clearPending };
}
