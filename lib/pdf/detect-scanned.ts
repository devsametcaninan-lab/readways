import {
  MIN_AVERAGE_CHARS_PER_PAGE,
  MIN_EXTRACTED_TEXT_LENGTH,
  MIN_LETTER_RATIO,
  MIN_PAGES_WITH_TEXT_RATIO
} from "./constants";
import { pdfError } from "./errors";
import {
  cleanDocumentText,
  cleanPageText,
  countMeaningfulCharacters,
  letterRatio
} from "./clean-text";

export type ScannedDetectionInput = {
  pageTexts: string[];
  cleanedFullText: string;
};

export function assertReadableExtractedText(input: ScannedDetectionInput): void {
  const cleaned = cleanDocumentText(input.cleanedFullText);
  const textLength = countMeaningfulCharacters(cleaned);

  if (textLength < MIN_EXTRACTED_TEXT_LENGTH) {
    throw pdfError("SCANNED");
  }

  if (letterRatio(cleaned) < MIN_LETTER_RATIO) {
    throw pdfError("NO_TEXT");
  }

  const nonEmptyPages = input.pageTexts.filter(
    (page) => countMeaningfulCharacters(cleanPageText(page)) > 0
  ).length;

  const pageCount = Math.max(input.pageTexts.length, 1);

  if (pageCount > 1) {
    const averageChars = textLength / pageCount;

    if (averageChars < MIN_AVERAGE_CHARS_PER_PAGE) {
      throw pdfError("SCANNED");
    }

    if (nonEmptyPages / pageCount < MIN_PAGES_WITH_TEXT_RATIO) {
      throw pdfError("SCANNED");
    }
  }

  if (!cleaned.trim()) {
    throw pdfError("NO_TEXT");
  }
}
