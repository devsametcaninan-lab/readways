"use client";

import { memo, useCallback, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { isPointerTap, READER_INTERACTION } from "@/lib/reader/reader-interaction";
import type { WordToken } from "@/lib/reader/text-tokens";
import { wordHighlightClass } from "./word-highlight";

type ClickableWordProps = {
  token: WordToken;
  isWordActive: boolean;
  isPhraseActive: boolean;
  onActivate: (token: WordToken) => void;
};

function hasNonCollapsedTextSelection(): boolean {
  const selection = window.getSelection();
  return Boolean(selection && !selection.isCollapsed && selection.toString().trim());
}

function ClickableWord({
  token,
  isWordActive,
  isPhraseActive,
  onActivate
}: ClickableWordProps) {
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLSpanElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLSpanElement>) => {
      const start = pointerStartRef.current;
      pointerStartRef.current = null;

      if (!isPointerTap(start, { x: event.clientX, y: event.clientY })) {
        return;
      }

      if (hasNonCollapsedTextSelection()) {
        return;
      }

      event.stopPropagation();
      onActivate(token);
    },
    [onActivate, token]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onActivate(token);
      }
    },
    [onActivate, token]
  );

  const className =
    isPhraseActive || isWordActive
      ? wordHighlightClass(true)
      : wordHighlightClass(isWordActive);

  return (
    <span
      role="button"
      tabIndex={0}
      {...{ [READER_INTERACTION.word]: "" }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      className={className}
    >
      {token.value}
    </span>
  );
}

export default memo(
  ClickableWord,
  (prev, next) =>
    prev.token === next.token &&
    prev.isWordActive === next.isWordActive &&
    prev.isPhraseActive === next.isPhraseActive &&
    prev.onActivate === next.onActivate
);
