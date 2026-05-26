/** data-* hooks for reader hit-testing (outside dismiss, phrase vs word). */

export const READER_INTERACTION = {
  word: "data-reader-word",
  vocabulary: "data-reader-vocabulary",
  phraseAction: "data-reader-phrase-action",
  column: "data-reader-column",
  article: "data-reader-article"
} as const;

export function isReaderProtectedTarget(node: Node | null): boolean {
  if (!(node instanceof Element)) {
    return false;
  }

  return Boolean(
    node.closest(`[${READER_INTERACTION.word}]`) ||
      node.closest(`[${READER_INTERACTION.vocabulary}]`) ||
      node.closest(`[${READER_INTERACTION.phraseAction}]`)
  );
}

export function hasActiveTextSelectionIn(root: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    return false;
  }

  if (!selection.toString().trim()) {
    return false;
  }

  const anchor = selection.anchorNode;
  const focus = selection.focusNode;

  return (
    (anchor !== null && root.contains(anchor)) ||
    (focus !== null && root.contains(focus))
  );
}

/** Ignore micro-movements so drag-to-select is not treated as a word tap. */
export function isPointerTap(
  start: { x: number; y: number } | null,
  end: { x: number; y: number },
  thresholdPx = 8
): boolean {
  if (!start) {
    return true;
  }

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return dx * dx + dy * dy <= thresholdPx * thresholdPx;
}
