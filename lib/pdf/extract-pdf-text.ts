"use client";

import {
  MAX_PDF_BYTES,
  MAX_PDF_PAGES,
  MIN_EXTRACTED_TEXT_LENGTH
} from "./constants";
import { PdfUserError } from "./errors";

export type ExtractProgress = {
  phase: "loading" | "extracting";
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

  if (name === "PasswordException" || /password/i.test(message)) {
    return new PdfUserError(
      "This PDF is encrypted. Please upload an unlocked PDF.",
      "ENCRYPTED"
    );
  }

  if (
    name === "InvalidPDFException" ||
    name === "MissingPDFException" ||
    /invalid|corrupt|format/i.test(message)
  ) {
    return new PdfUserError(
      "This PDF could not be read. It may be corrupted or not a valid PDF.",
      "CORRUPTED"
    );
  }

  return new PdfUserError(
    "Something went wrong while reading your PDF. Please try another file.",
    "UNKNOWN"
  );
}

function textToParagraphs(text: string): string[] {
  const byBreak = text
    .split(/\n{2,}/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter((block) => block.length > 0);

  if (byBreak.length > 1) return byBreak;

  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 3) return [normalized];

  const paragraphs: string[] = [];
  let chunk = "";

  for (const sentence of sentences) {
    chunk = chunk ? `${chunk} ${sentence}` : sentence;
    if (chunk.split(/\s+/).length >= 55) {
      paragraphs.push(chunk);
      chunk = "";
    }
  }

  if (chunk) paragraphs.push(chunk);
  return paragraphs.length > 0 ? paragraphs : [normalized];
}

export async function extractTextFromPdfFile(
  file: File,
  onProgress?: (progress: ExtractProgress) => void
): Promise<ExtractResult> {
  if (file.size > MAX_PDF_BYTES) {
    throw new PdfUserError(
      "This PDF exceeds the 10 MB limit. Please upload a smaller file.",
      "TOO_LARGE"
    );
  }

  const pdfjs = await getPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());

  onProgress?.({ phase: "loading", currentPage: 0, totalPages: 0 });

  let pdf;
  try {
    const task = pdfjs.getDocument({ data, useSystemFonts: true });
    pdf = await task.promise;
  } catch (error) {
    throw mapPdfLoadError(error);
  }

  const pageCount = pdf.numPages;

  if (pageCount > MAX_PDF_PAGES) {
    throw new PdfUserError(
      "This PDF is too long for the current version. Please upload a document up to 30 pages.",
      "TOO_MANY_PAGES"
    );
  }

  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    onProgress?.({ phase: "extracting", currentPage: pageNumber, totalPages: pageCount });

    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item && typeof item.str === "string" ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    pageTexts.push(pageText);
  }

  const fullText = pageTexts.join("\n\n");
  const textLength = fullText.replace(/\s/g, "").length;

  if (textLength < MIN_EXTRACTED_TEXT_LENGTH) {
    throw new PdfUserError(
      "This PDF looks like a scanned or image-based document. OCR support is coming soon.",
      "SCANNED"
    );
  }

  const paragraphs = textToParagraphs(fullText);

  if (paragraphs.length === 0) {
    throw new PdfUserError(
      "This PDF looks like a scanned or image-based document. OCR support is coming soon.",
      "SCANNED"
    );
  }

  return { pageCount, paragraphs, textLength };
}
