import { extractedTextToParagraphs } from "@/lib/documents/text";
import { MAX_EXTRACTED_CHAR_COUNT } from "./constants";
import { pdfError } from "./errors";
import { assertReadableExtractedText } from "./detect-scanned";
import { cleanDocumentText, cleanPageText, countMeaningfulCharacters } from "./clean-text";

export type NormalizedPdfText = {
  pageCount: number;
  paragraphs: string[];
  textLength: number;
  cleanedFullText: string;
};

export function normalizeExtractedPdfText(
  pageTexts: string[],
  pageCount: number
): NormalizedPdfText {
  const cleanedPages = pageTexts
    .map((page) => cleanPageText(page))
    .filter((page) => page.length > 0);

  const cleanedFullText = cleanDocumentText(cleanedPages.join("\n\n"));

  assertReadableExtractedText({
    pageTexts,
    cleanedFullText
  });

  if (cleanedFullText.length > MAX_EXTRACTED_CHAR_COUNT) {
    throw pdfError("TOO_MUCH_TEXT");
  }

  const paragraphs = extractedTextToParagraphs(cleanedFullText);

  if (paragraphs.length === 0) {
    throw pdfError("SCANNED");
  }

  const textLength = countMeaningfulCharacters(cleanedFullText);

  return {
    pageCount,
    paragraphs,
    textLength,
    cleanedFullText
  };
}
