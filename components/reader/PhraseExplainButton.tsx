"use client";

import { memo } from "react";

type PhraseExplainButtonProps = {
  rect: DOMRect;
  onExplain: () => void;
};

function PhraseExplainButton({
  rect,
  onExplain
}: PhraseExplainButtonProps) {
  const top = rect.bottom + 8;
  const left = rect.left + rect.width / 2;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30"
      aria-hidden={false}
    >
      <button
        type="button"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          transform: "translateX(-50%)"
        }}
        className="pointer-events-auto fixed rounded-md border border-white/[0.12] bg-[#161820]/95 px-3 py-1.5 text-xs font-medium text-zinc-100 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-colors hover:border-accent/30 hover:bg-[#1a1d28] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onExplain}
      >
        Explain phrase
      </button>
    </div>
  );
}

export default memo(PhraseExplainButton);
