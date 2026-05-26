"use client";

import { memo, type RefObject } from "react";
import type { ExplainClickPayload } from "@/lib/reader/explain-word-client";
import type { PhraseHighlightRange } from "@/lib/reader/phrase-selection";
import type { PreparedParagraph } from "@/lib/reader/prepare-paragraphs";
import { readerArticleClass } from "./reader-typography";
import SelectableParagraph from "./SelectableParagraph";

export type ReaderArticleProps = {
  articleRef: RefObject<HTMLElement | null>;
  paragraphs: PreparedParagraph[];
  activeHighlightKey: string | null;
  activePhraseRange: PhraseHighlightRange | null;
  onWordClick: (payload: ExplainClickPayload) => void;
};

function ReaderArticle({
  articleRef,
  paragraphs,
  activeHighlightKey,
  activePhraseRange,
  onWordClick
}: ReaderArticleProps) {
  return (
    <article ref={articleRef} className={readerArticleClass}>
      {paragraphs.map((paragraph) => (
        <SelectableParagraph
          key={paragraph.index}
          paragraph={paragraph}
          activeHighlightKey={activeHighlightKey}
          activePhraseRange={activePhraseRange}
          onWordClick={onWordClick}
        />
      ))}
    </article>
  );
}

function readerArticlePropsEqual(prev: ReaderArticleProps, next: ReaderArticleProps): boolean {
  return (
    prev.paragraphs === next.paragraphs &&
    prev.activeHighlightKey === next.activeHighlightKey &&
    prev.activePhraseRange === next.activePhraseRange &&
    prev.onWordClick === next.onWordClick &&
    prev.articleRef === next.articleRef
  );
}

export default memo(ReaderArticle, readerArticlePropsEqual);
