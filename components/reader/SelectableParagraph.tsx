"use client";

import { memo, useCallback, useMemo } from "react";
import type { ExplainClickPayload } from "@/lib/reader/explain-word-client";
import type { PhraseHighlightRange } from "@/lib/reader/phrase-selection";
import { tokenOverlapsRange } from "@/lib/reader/phrase-selection";
import type { PreparedParagraph } from "@/lib/reader/prepare-paragraphs";
import { selectableParagraphPropsEqual } from "@/lib/reader/paragraph-render";
import { extractSentence, highlightKeyForWord, type WordToken } from "@/lib/reader/text-tokens";
import { useUserPreferences } from "@/lib/preferences/UserPreferencesProvider";
import ClickableWord from "./ClickableWord";
import { readerParagraphClass } from "./reader-typography";
import { wordHighlightClass } from "./word-highlight";

type SelectableParagraphProps = {
  paragraph: PreparedParagraph;
  activeHighlightKey: string | null;
  activePhraseRange: PhraseHighlightRange | null;
  onWordClick: (payload: ExplainClickPayload) => void;
  onWordIntent?: (token: WordToken, paragraph: PreparedParagraph) => void;
};

function hasNonCollapsedTextSelection(): boolean {
  const selection = window.getSelection();
  return Boolean(selection && !selection.isCollapsed && selection.toString().trim());
}

function SelectableParagraph({
  paragraph,
  activeHighlightKey,
  activePhraseRange,
  onWordClick,
  onWordIntent
}: SelectableParagraphProps) {
  const { preferences } = useUserPreferences();
  const { text, tokens, index: paragraphIndex } = paragraph;
  const highlightMode = preferences.highlightMode;

  const isPhraseHighlightActive =
    activePhraseRange?.paragraphIndex === paragraphIndex;

  const handleWordActivate = useCallback(
    (token: WordToken) => {
      if (hasNonCollapsedTextSelection()) {
        return;
      }

      const sentence = extractSentence(text, token.start);
      const highlightKey = highlightKeyForWord(paragraphIndex, token.wordIndex);

      onWordClick({
        rawWord: token.value,
        normalizedWord: token.normalized,
        sentence,
        highlightKey,
        kind: "word"
      });
    },
    [onWordClick, paragraphIndex, text]
  );

  const handleWordIntent = useCallback(
    (token: WordToken) => {
      onWordIntent?.(token, paragraph);
    },
    [onWordIntent, paragraph]
  );

  const renderedTokens = useMemo(
    () =>
      tokens.map((token, tokenIndex) => {
        if (token.type !== "word") {
          const phraseActive =
            isPhraseHighlightActive &&
            tokenOverlapsRange(token.start, token.end, activePhraseRange!);

          return (
            <span
              key={tokenIndex}
              className={phraseActive ? wordHighlightClass(true, highlightMode) : undefined}
            >
              {token.value}
            </span>
          );
        }

        const highlightKey = highlightKeyForWord(paragraphIndex, token.wordIndex);
        const isWordActive = activeHighlightKey === highlightKey;
        const isPhraseActive =
          isPhraseHighlightActive &&
          activePhraseRange !== null &&
          tokenOverlapsRange(token.start, token.end, activePhraseRange);

        return (
          <ClickableWord
            key={tokenIndex}
            token={token}
            isWordActive={isWordActive}
            isPhraseActive={isPhraseActive}
            onActivate={handleWordActivate}
            onIntent={handleWordIntent}
          />
        );
      }),
    [
      tokens,
      paragraphIndex,
      activeHighlightKey,
      activePhraseRange,
      isPhraseHighlightActive,
      handleWordActivate,
      handleWordIntent
    ]
  );

  return (
    <p className={readerParagraphClass} data-paragraph-index={paragraphIndex}>
      {renderedTokens}
    </p>
  );
}

export default memo(SelectableParagraph, (prev, next) =>
  selectableParagraphPropsEqual(
    {
      paragraphIndex: prev.paragraph.index,
      text: prev.paragraph.text,
      tokens: prev.paragraph.tokens,
      activeHighlightKey: prev.activeHighlightKey,
      activePhraseRange: prev.activePhraseRange,
      onWordClick: prev.onWordClick,
      onWordIntent: prev.onWordIntent
    },
    {
      paragraphIndex: next.paragraph.index,
      text: next.paragraph.text,
      tokens: next.paragraph.tokens,
      activeHighlightKey: next.activeHighlightKey,
      activePhraseRange: next.activePhraseRange,
      onWordClick: next.onWordClick,
      onWordIntent: next.onWordIntent
    }
  )
);
