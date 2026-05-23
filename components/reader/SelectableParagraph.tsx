"use client";

import { buildPanelEntry } from "@/lib/reader/vocabulary-lookup";
import {
  extractSentence,
  highlightKeyForWord,
  tokenizeParagraph,
  type WordToken
} from "@/lib/reader/text-tokens";
import type { PanelVocabularySelection } from "@/lib/reader/types";
import { readerParagraphClass } from "./reader-typography";
import { wordHighlightClass } from "./word-highlight";

type SelectableParagraphProps = {
  paragraph: string;
  paragraphIndex: number;
  activeHighlightKey: string | null;
  sourceTitle: string;
  onSelect: (selection: PanelVocabularySelection, highlightKey: string) => void;
};

export default function SelectableParagraph({
  paragraph,
  paragraphIndex,
  activeHighlightKey,
  sourceTitle,
  onSelect
}: SelectableParagraphProps) {
  const tokens = tokenizeParagraph(paragraph);

  const handleWordClick = (token: WordToken) => {
    const sentence = extractSentence(paragraph, token.start);
    const highlightKey = highlightKeyForWord(paragraphIndex, token.wordIndex);
    const selection = buildPanelEntry({
      rawWord: token.value,
      normalizedWord: token.normalized,
      sentence,
      sourceTitle,
      highlightKey
    });
    onSelect(selection, highlightKey);
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
