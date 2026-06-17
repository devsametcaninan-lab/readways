"use client";

import { memo, type PointerEvent, type RefObject } from "react";
import type { ExplainClickPayload } from "@/lib/reader/explain-word-client";
import type { PhraseHighlightRange } from "@/lib/reader/phrase-selection";
import type { PhraseSelectionResolved } from "@/lib/reader/phrase-selection";
import type { PreparedParagraph } from "@/lib/reader/prepare-paragraphs";
import type { WordToken } from "@/lib/reader/text-tokens";
import ReaderOnboardingHints from "@/components/onboarding/ReaderOnboardingHints";
import PhraseSelectionHint from "./PhraseSelectionHint";
import PhraseExplainButton from "./PhraseExplainButton";
import ReaderArticle from "./ReaderArticle";
import ReaderPreparingOverlay from "./ReaderPreparingOverlay";
import { READER_INTERACTION } from "@/lib/reader/reader-interaction";
import { readerColumnClass, readerTitleClass } from "./reader-typography";

export type ReaderDocumentColumnProps = {
  title: string;
  articleRef: RefObject<HTMLElement | null>;
  paragraphs: PreparedParagraph[];
  isPreparing: boolean;
  activeHighlightKey: string | null;
  activePhraseRange: PhraseHighlightRange | null;
  pendingPhrase: PhraseSelectionResolved | null;
  onWordClick: (payload: ExplainClickPayload) => void;
  onWordIntent?: (token: WordToken, paragraph: PreparedParagraph) => void;
  onExplainPhrase: () => void;
  /** Mobile-only: adds extra bottom padding so the vocabulary bottom sheet doesn't cover reading text. */
  mobileExtraPaddingBottomPx?: number;
  onReaderPointerUp?: (event: PointerEvent<HTMLDivElement>) => void;
};

function ReaderDocumentColumn({
  title,
  articleRef,
  paragraphs,
  isPreparing,
  activeHighlightKey,
  activePhraseRange,
  pendingPhrase,
  onWordClick,
  onWordIntent,
  onExplainPhrase,
  mobileExtraPaddingBottomPx,
  onReaderPointerUp
}: ReaderDocumentColumnProps) {
  return (
    <div
      className={`relative ${readerColumnClass}`}
      {...{ [READER_INTERACTION.column]: "" }}
      onPointerUp={onReaderPointerUp}
      style={
        mobileExtraPaddingBottomPx
          ? { paddingBottom: mobileExtraPaddingBottomPx }
          : undefined
      }
    >
      <h1 className={readerTitleClass}>{title}</h1>

      {!isPreparing ? <PhraseSelectionHint /> : null}

      {isPreparing ? (
        <ReaderPreparingOverlay />
      ) : (
        <ReaderArticle
          articleRef={articleRef}
          paragraphs={paragraphs}
          activeHighlightKey={activeHighlightKey}
          activePhraseRange={activePhraseRange}
          onWordClick={onWordClick}
          onWordIntent={onWordIntent}
        />
      )}

      {pendingPhrase ? (
        <PhraseExplainButton rect={pendingPhrase.rect} onExplain={onExplainPhrase} />
      ) : null}

      {!isPreparing ? <ReaderOnboardingHints /> : null}
    </div>
  );
}

function readerDocumentColumnPropsEqual(
  prev: ReaderDocumentColumnProps,
  next: ReaderDocumentColumnProps
): boolean {
  if (prev.title !== next.title) return false;
  if (prev.isPreparing !== next.isPreparing) return false;
  if (prev.paragraphs !== next.paragraphs) return false;
  if (prev.activeHighlightKey !== next.activeHighlightKey) return false;
  if (prev.activePhraseRange !== next.activePhraseRange) return false;
  if (prev.onWordClick !== next.onWordClick) return false;
  if (prev.onWordIntent !== next.onWordIntent) return false;
  if (prev.onExplainPhrase !== next.onExplainPhrase) return false;
  if (prev.articleRef !== next.articleRef) return false;
  if (prev.mobileExtraPaddingBottomPx !== next.mobileExtraPaddingBottomPx)
    return false;
  if (prev.onReaderPointerUp !== next.onReaderPointerUp) return false;

  const prevPhrase = prev.pendingPhrase;
  const nextPhrase = next.pendingPhrase;

  if (prevPhrase === nextPhrase) return true;
  if (!prevPhrase || !nextPhrase) return false;

  return (
    prevPhrase.phrase === nextPhrase.phrase &&
    prevPhrase.paragraphIndex === nextPhrase.paragraphIndex &&
    prevPhrase.start === nextPhrase.start &&
    prevPhrase.end === nextPhrase.end &&
    prevPhrase.rect.top === nextPhrase.rect.top &&
    prevPhrase.rect.left === nextPhrase.rect.left &&
    prevPhrase.rect.width === nextPhrase.rect.width &&
    prevPhrase.rect.height === nextPhrase.rect.height
  );
}

export default memo(ReaderDocumentColumn, readerDocumentColumnPropsEqual);
