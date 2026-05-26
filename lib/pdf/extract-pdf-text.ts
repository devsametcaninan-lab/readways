"use client";

import { validatePdfFileBasics, validatePdfFileSignature, validatePdfPageCount } from "./validate-pdf-file";
import { textItemsToPageText } from "./extract-page-text";
import { normalizeExtractedPdfText } from "./normalize-extracted";
import { pdfError, PdfUserError } from "./errors";

export type ExtractPhase = "validating" | "loading" | "extracting" | "cleaning";

export type ExtractProgress = {
  phase: ExtractPhase;
  currentPage: number;
  totalPages: number;
};

export type ExtractResult = {
  pageCount: number;
  paragraphs: string[];
  textLength: number;
};

let workerConfigured = false;

async function getPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  if (typeof window !== "undefined" && !workerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    workerConfigured = true;
  }
  return pdfjs;
}

function mapPdfLoadError(error: unknown): PdfUserError {
  const name =
    error && typeof error === "object" && "name" in error
      ? String((error as { name: string }).name)
      : "";
  const message = error instanceof Error ? error.message : String(error);
  const code =
    error && typeof error === "object" && "code" in error
      ? Number((error as { code: number }).code)
      : undefined;

  if (
    name === "PasswordException" ||
    code === 1 ||
    /password|encrypted|needs password/i.test(message)
  ) {
    return pdfError("ENCRYPTED");
  }

  if (
    name === "InvalidPDFException" ||
    name === "MissingPDFException" ||
    name === "UnexpectedResponseException" ||
    /invalid pdf|illegal character|corrupt|not a pdf|format error/i.test(message)
  ) {
    return pdfError("CORRUPTED");
  }

  return pdfError("UNKNOWN");
}

export async function extractTextFromPdfFile(
  file: File,
  onProgress?: (progress: ExtractProgress) => void
): Promise<ExtractResult> {
  onProgress?.({ phase: "validating", currentPage: 0, totalPages: 0 });

  validatePdfFileBasics(file);
  await validatePdfFileSignature(file);

  const pdfjs = await getPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());

  onProgress?.({ phase: "loading", currentPage: 0, totalPages: 0 });

  let pdf;
  try {
    const task = pdfjs.getDocument({
      data,
      useSystemFonts: true,
      stopAtErrors: false
    });
    pdf = await task.promise;
  } catch (error) {
    throw mapPdfLoadError(error);
  }

  const pageCount = pdf.numPages;
  validatePdfPageCount(pageCount);

  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    onProgress?.({
      phase: "extracting",
      currentPage: pageNumber,
      totalPages: pageCount
    });

    try {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pageTexts.push(textItemsToPageText(content.items));
    } catch {
      pageTexts.push("");
    }
  }

  onProgress?.({ phase: "cleaning", currentPage: pageCount, totalPages: pageCount });

  const normalized = normalizeExtractedPdfText(pageTexts, pageCount);

  return {
    pageCount: normalized.pageCount,
    paragraphs: normalized.paragraphs,
    textLength: normalized.textLength
  };
}
