import { extractSentence } from "./text-tokens";

export const PHRASE_MIN_WORDS = 2;
export const PHRASE_MAX_WORDS = 6;

export type PhraseHighlightRange = {
  paragraphIndex: number;
  start: number;
  end: number;
};

export type PhraseSelectionResolved = {
  phrase: string;
  paragraphIndex: number;
  start: number;
  end: number;
  sentence: string;
  rect: DOMRect;
};

export function cleanPhraseText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function countPhraseWords(text: string): number {
  const cleaned = cleanPhraseText(text);
  if (!cleaned) {
    return 0;
  }

  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function validatePhraseSelection(
  text: string
): { ok: true; phrase: string } | { ok: false } {
  const phrase = cleanPhraseText(text);
  const wordCount = countPhraseWords(phrase);

  if (!phrase || wordCount < PHRASE_MIN_WORDS || wordCount > PHRASE_MAX_WORDS) {
    return { ok: false };
  }

  return { ok: true, phrase };
}

export function normalizePhrase(phrase: string): string {
  return cleanPhraseText(phrase).toLowerCase();
}

export function highlightKeyForPhrase(
  paragraphIndex: number,
  start: number,
  end: number
): string {
  return `phrase:${paragraphIndex}:${start}:${end}`;
}

export function tokenOverlapsRange(
  tokenStart: number,
  tokenEnd: number,
  range: PhraseHighlightRange
): boolean {
  return tokenStart < range.end && tokenEnd > range.start;
}

function findParagraphElement(
  node: Node,
  articleRoot: HTMLElement
): HTMLElement | null {
  let current: Node | null = node;

  while (current) {
    if (current instanceof HTMLElement && current.dataset.paragraphIndex !== undefined) {
      return current;
    }
    if (current === articleRoot) {
      break;
    }
    current = current.parentNode;
  }

  return null;
}

function getTextOffset(
  paragraphEl: HTMLElement,
  targetNode: Node,
  targetOffset: number
): number {
  const preRange = document.createRange();
  preRange.selectNodeContents(paragraphEl);
  preRange.setEnd(targetNode, targetOffset);
  return preRange.toString().length;
}

export function resolvePhraseSelection(params: {
  articleRoot: HTMLElement;
  paragraphs: string[];
}): PhraseSelectionResolved | null {
  const { articleRoot, paragraphs } = params;
  const selection = window.getSelection();

  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const validated = validatePhraseSelection(range.toString());
  if (!validated.ok) {
    return null;
  }

  const startParagraph = findParagraphElement(range.startContainer, articleRoot);
  const endParagraph = findParagraphElement(range.endContainer, articleRoot);

  if (!startParagraph || !endParagraph || startParagraph !== endParagraph) {
    return null;
  }

  const paragraphIndex = Number(startParagraph.dataset.paragraphIndex);
  if (Number.isNaN(paragraphIndex)) {
    return null;
  }

  const start = getTextOffset(
    startParagraph,
    range.startContainer,
    range.startOffset
  );
  const end = getTextOffset(endParagraph, range.endContainer, range.endOffset);

  if (end <= start) {
    return null;
  }

  const paragraphText = paragraphs[paragraphIndex] ?? "";
  const sentence = extractSentence(paragraphText, start);
  const rawRect = range.getBoundingClientRect();
  // Rounding reduces selection jitter on mobile (prevents button flicker).
  const rect = new DOMRect(
    Math.round(rawRect.left),
    Math.round(rawRect.top),
    Math.round(rawRect.width),
    Math.round(rawRect.height)
  );

  if (rect.width === 0 && rect.height === 0) {
    return null;
  }

  return {
    phrase: validated.phrase,
    paragraphIndex,
    start,
    end,
    sentence,
    rect
  };
}

export function clearBrowserSelection(): void {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }
  selection.removeAllRanges();
}
