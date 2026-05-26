export const MAX_PDF_BYTES = 10 * 1024 * 1024;
export const MAX_PDF_PAGES = 30;

/** Minimum non-whitespace characters across the whole document. */
export const MIN_EXTRACTED_TEXT_LENGTH = 80;

/** Minimum average non-whitespace characters per page (multi-page docs). */
export const MIN_AVERAGE_CHARS_PER_PAGE = 24;

/** Minimum share of letters in non-whitespace content. */
export const MIN_LETTER_RATIO = 0.22;

/** Minimum share of pages that contain any extractable text. */
export const MIN_PAGES_WITH_TEXT_RATIO = 0.15;

export const MAX_EXTRACTED_CHAR_COUNT = 600_000;
