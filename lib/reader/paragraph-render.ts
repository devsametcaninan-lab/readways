import type { ExplainClickPayload } from "@/lib/reader/explain-word-client";
import type { PhraseHighlightRange } from "@/lib/reader/phrase-selection";

export function paragraphHighlightChanged(
  paragraphIndex: number,
  prevKey: string | null,
  nextKey: string | null,
  prevRange: PhraseHighlightRange | null,
  nextRange: PhraseHighlightRange | null
): boolean {
  const prefix = `${paragraphIndex}:`;
  const phrasePrefix = `phrase:${paragraphIndex}:`;

  const prevWordActive =
    prevKey !== null && (prevKey.startsWith(prefix) || prevKey.startsWith(phrasePrefix));
  const nextWordActive =
    nextKey !== null && (nextKey.startsWith(prefix) || nextKey.startsWith(phrasePrefix));

  const prevPhraseActive = prevRange?.paragraphIndex === paragraphIndex;
  const nextPhraseActive = nextRange?.paragraphIndex === paragraphIndex;

  if (!prevWordActive && !nextWordActive && !prevPhraseActive && !nextPhraseActive) {
    return false;
  }

  return (
    prevKey !== nextKey ||
    prevRange?.start !== nextRange?.start ||
    prevRange?.end !== nextRange?.end ||
    prevRange?.paragraphIndex !== nextRange?.paragraphIndex
  );
}

export type SelectableParagraphRenderProps = {
  paragraphIndex: number;
  text: string;
  tokens: import("./text-tokens").ParagraphToken[];
  activeHighlightKey: string | null;
  activePhraseRange: PhraseHighlightRange | null;
  onWordClick: (payload: ExplainClickPayload) => void;
  onWordIntent?: (token: import("./text-tokens").WordToken, paragraph: import("./prepare-paragraphs").PreparedParagraph) => void;
};

export function selectableParagraphPropsEqual(
  prev: SelectableParagraphRenderProps,
  next: SelectableParagraphRenderProps
): boolean {
  if (prev.paragraphIndex !== next.paragraphIndex) {
    return false;
  }

  if (prev.text !== next.text || prev.tokens !== next.tokens) {
    return false;
  }

  if (prev.onWordClick !== next.onWordClick) {
    return false;
  }

  if (prev.onWordIntent !== next.onWordIntent) {
    return false;
  }

  if (
    paragraphHighlightChanged(
      prev.paragraphIndex,
      prev.activeHighlightKey,
      next.activeHighlightKey,
      prev.activePhraseRange,
      next.activePhraseRange
    )
  ) {
    return false;
  }

  return true;
}
