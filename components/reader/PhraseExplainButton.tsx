"use client";

import { memo } from "react";
import { READER_INTERACTION } from "@/lib/reader/reader-interaction";

type PhraseExplainButtonProps = {
  rect: DOMRect;
  onExplain: () => void;
};

function PhraseExplainButton({
  rect,
  onExplain
}: PhraseExplainButtonProps) {
  const estimatedButtonHeight = 34;
  const safeBottomPx = 24; // mobile nav / safe area spacing (approx)
  const safeTopPx = 56; // keep clear of the reader header

  const desiredBelowTop = rect.bottom + 14;
  const desiredAboveTop = rect.top - 10 - estimatedButtonHeight;

  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : 800;
  const maxTop = viewportHeight - safeBottomPx - estimatedButtonHeight;

  const clampedTop =
    desiredBelowTop <= maxTop
      ? Math.max(safeTopPx, desiredBelowTop)
      : Math.min(maxTop, Math.max(safeTopPx, desiredAboveTop));

  const centerX = rect.left + rect.width / 2;
  const safeSidePx = 16;
  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : 360;
  const clampedCenterX = Math.min(
    Math.max(centerX, safeSidePx),
    viewportWidth - safeSidePx
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden={false}
    >
      <button
        type="button"
        {...{ [READER_INTERACTION.phraseAction]: "" }}
        style={{
          top: `${clampedTop}px`,
          left: `${clampedCenterX}px`,
          transform: "translateX(-50%)"
        }}
        className="pointer-events-auto fixed rounded-md border border-white/[0.12] bg-[#161820]/95 px-4 py-2 text-sm font-medium text-zinc-100 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-colors hover:border-accent/30 hover:bg-[#1a1d28] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 lg:px-3 lg:py-1.5 lg:text-xs"
        onMouseDown={(event) => event.preventDefault()}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onExplain();
        }}
      >
        Explain phrase
      </button>
    </div>
  );
}

export default memo(PhraseExplainButton);
