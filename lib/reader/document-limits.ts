/** Paragraph count above which tokenization is deferred off the main thread. */
export const DEFERRED_PREP_PARAGRAPH_COUNT = 64;

/** Total extracted characters above which preparation is deferred. */
export const DEFERRED_PREP_CHAR_COUNT = 80_000;

/** Target max characters per reader paragraph chunk. */
export const MAX_PARAGRAPH_CHARS = 2_400;

/** Word-count target when auto-chunking long plain text. */
export const TARGET_PARAGRAPH_WORDS = 55;

export function shouldDeferReaderPrep(paragraphs: string[]): boolean {
  if (paragraphs.length >= DEFERRED_PREP_PARAGRAPH_COUNT) {
    return true;
  }

  let totalChars = 0;
  for (const paragraph of paragraphs) {
    totalChars += paragraph.length;
    if (totalChars >= DEFERRED_PREP_CHAR_COUNT) {
      return true;
    }
  }

  return false;
}
