"use client";

import { memo, useCallback } from "react";
import type { WordToken } from "@/lib/reader/text-tokens";
import { wordHighlightClass } from "./word-highlight";

type ClickableWordProps = {
  token: WordToken;
  isWordActive: boolean;
  isPhraseActive: boolean;
  onActivate: (token: WordToken) => void;
};

function ClickableWord({
  token,
  isWordActive,
  isPhraseActive,
  onActivate
}: ClickableWordProps) {
  const handleClick = useCallback(() => {
    onActivate(token);
  }, [onActivate, token]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
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
      onClick={handleClick}
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
