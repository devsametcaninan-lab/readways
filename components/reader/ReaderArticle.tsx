"use client";

import { memo, type RefObject } from "react";
import type { ExplainClickPayload } from "@/lib/reader/explain-word-client";
import type { PhraseHighlightRange } from "@/lib/reader/phrase-selection";
import type { PreparedParagraph } from "@/lib/reader/prepare-paragraphs";
import type { WordToken } from "@/lib/reader/text-tokens";
import { READER_INTERACTION } from "@/lib/reader/reader-interaction";
import { readerArticleClass } from "./reader-typography";
import SelectableParagraph from "./SelectableParagraph";

export type ReaderArticleProps = {
  articleRef: RefObject<HTMLElement | null>;
  paragraphs: PreparedParagraph[];
  activeHighlightKey: string | null;
  activePhraseRange: PhraseHighlightRange | null;
  onWordClick: (payload: ExplainClickPayload) => void;
  onWordIntent?: (token: WordToken, paragraph: PreparedParagraph) => void;
};

function ReaderArticle({
  articleRef,
  paragraphs,
  activeHighlightKey,
  activePhraseRange,
  onWordClick,
  onWordIntent
}: ReaderArticleProps) {
  return (
    <article
      ref={articleRef}
      className={readerArticleClass}
      {...{ [READER_INTERACTION.article]: "" }}
    >
      {paragraphs.map((paragraph) => (
        <SelectableParagraph
          key={paragraph.index}
          paragraph={paragraph}
          activeHighlightKey={activeHighlightKey}
          activePhraseRange={activePhraseRange}
          onWordClick={onWordClick}
          onWordIntent={onWordIntent}
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
    prev.onWordIntent === next.onWordIntent &&
    prev.articleRef === next.articleRef
  );
}

export default memo(ReaderArticle, readerArticlePropsEqual);
