"use client";

import type { ExplainClickPayload } from "@/lib/reader/explain-word-client";
import type { PhraseHighlightRange } from "@/lib/reader/phrase-selection";
import { tokenOverlapsRange } from "@/lib/reader/phrase-selection";
import {
  extractSentence,
  highlightKeyForWord,
  tokenizeParagraph,
  type ParagraphToken,
  type WordToken
} from "@/lib/reader/text-tokens";
import { readerParagraphClass } from "./reader-typography";
import { wordHighlightClass } from "./word-highlight";

type SelectableParagraphProps = {
  paragraph: string;
  paragraphIndex: number;
  activeHighlightKey: string | null;
  activePhraseRange: PhraseHighlightRange | null;
  onWordClick: (payload: ExplainClickPayload) => void;
};

function hasNonCollapsedTextSelection(): boolean {
  const selection = window.getSelection();
  return Boolean(selection && !selection.isCollapsed && selection.toString().trim());
}

function tokenClassName(
  token: ParagraphToken,
  paragraphIndex: number,
  activeHighlightKey: string | null,
  activePhraseRange: PhraseHighlightRange | null
): string {
  const phraseActive =
    activePhraseRange !== null &&
    activePhraseRange.paragraphIndex === paragraphIndex &&
    tokenOverlapsRange(token.start, token.end, activePhraseRange);

  if (phraseActive) {
    return wordHighlightClass(true);
  }

  if (token.type === "word") {
    const highlightKey = highlightKeyForWord(paragraphIndex, token.wordIndex);
    return wordHighlightClass(activeHighlightKey === highlightKey);
  }

  return "";
}

export default function SelectableParagraph({
  paragraph,
  paragraphIndex,
  activeHighlightKey,
  activePhraseRange,
  onWordClick
}: SelectableParagraphProps) {
  const tokens = tokenizeParagraph(paragraph);
  const isPhraseHighlightActive =
    activePhraseRange?.paragraphIndex === paragraphIndex;

  const handleWordActivate = (token: WordToken) => {
    if (hasNonCollapsedTextSelection()) {
      return;
    }

    const sentence = extractSentence(paragraph, token.start);
    const highlightKey = highlightKeyForWord(paragraphIndex, token.wordIndex);

    onWordClick({
      rawWord: token.value,
      normalizedWord: token.normalized,
      sentence,
      highlightKey,
      kind: "word"
    });
  };

  return (
    <p
      className={readerParagraphClass}
      data-paragraph-index={paragraphIndex}
    >
      {tokens.map((token, index) => {
        if (token.type !== "word") {
          const className = isPhraseHighlightActive
            ? tokenClassName(token, paragraphIndex, activeHighlightKey, activePhraseRange)
            : undefined;

          return (
            <span key={index} className={className}>
              {token.value}
            </span>
          );
        }

        const highlightKey = highlightKeyForWord(paragraphIndex, token.wordIndex);
        const isActive = activeHighlightKey === highlightKey;
        const className = tokenClassName(
          token,
          paragraphIndex,
          activeHighlightKey,
          activePhraseRange
        );

        return (
          <span
            key={index}
            role="button"
            tabIndex={0}
            onClick={() => handleWordActivate(token)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleWordActivate(token);
              }
            }}
            className={className || wordHighlightClass(isActive)}
          >
            {token.value}
          </span>
        );
      })}
    </p>
  );
}
