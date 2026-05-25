"use client";

import type { WordClickPayload } from "@/lib/reader/explain-word-client";
import {
  extractSentence,
  highlightKeyForWord,
  tokenizeParagraph,
  type WordToken
} from "@/lib/reader/text-tokens";
import { readerParagraphClass } from "./reader-typography";
import { wordHighlightClass } from "./word-highlight";

type SelectableParagraphProps = {
  paragraph: string;
  paragraphIndex: number;
  activeHighlightKey: string | null;
  onWordClick: (payload: WordClickPayload) => void;
};

export default function SelectableParagraph({
  paragraph,
  paragraphIndex,
  activeHighlightKey,
  onWordClick
}: SelectableParagraphProps) {
  const tokens = tokenizeParagraph(paragraph);

  const handleWordClick = (token: WordToken) => {
    const sentence = extractSentence(paragraph, token.start);
    const highlightKey = highlightKeyForWord(paragraphIndex, token.wordIndex);
    onWordClick({
      rawWord: token.value,
      normalizedWord: token.normalized,
      sentence,
      highlightKey
    });
  };

  return (
    <p className={readerParagraphClass}>
      {tokens.map((token, index) => {
        if (token.type !== "word") {
          return <span key={index}>{token.value}</span>;
        }

        const highlightKey = highlightKeyForWord(paragraphIndex, token.wordIndex);
        const isActive = activeHighlightKey === highlightKey;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleWordClick(token)}
            className={wordHighlightClass(isActive)}
          >
            {token.value}
          </button>
        );
      })}
    </p>
  );
}
