"use client";

import type { ExtractProgress, ExtractResult } from "@/lib/pdf/extract-pdf-text";
import { extractTextFromPdfFile } from "@/lib/pdf/extract-pdf-text";
import { isPdfUserError, type PdfErrorCode } from "@/lib/pdf/errors";
import type { DocumentLanguage } from "@/lib/language/document-language";
import {
  markDocumentFailed,
  markDocumentNeedsOcr,
  markDocumentReady
} from "@/lib/documents/client";

export type DocumentProcessingOutcome =
  | {
      kind: "ready";
      pageCount: number;
      paragraphs: string[];
      language: DocumentLanguage;
      textLength: number;
    }
  | {
      kind: "needs_ocr";
      errorCode: PdfErrorCode;
    }
  | {
      kind: "failed";
      errorCode: PdfErrorCode;
    };

type ProcessPdfDocumentParams = {
  file: File;
  documentId: string;
  storagePath: string;
  originalFileName: string;
  onProgress?: (progress: ExtractProgress) => void;
};

function mapExtractionErrorToOutcome(error: unknown): {
  kind: "needs_ocr" | "failed";
  errorCode: PdfErrorCode;
  messageOverride?: string;
} {
  if (isPdfUserError(error)) {
    if (error.code === "SCANNED" || error.code === "NO_TEXT") {
      return { kind: "needs_ocr", errorCode: "SCANNED" };
    }

    return { kind: "failed", errorCode: error.code };
  }

  return { kind: "failed", errorCode: "UNKNOWN" };
}

export async function processPdfDocumentForDocument(params: ProcessPdfDocumentParams): Promise<DocumentProcessingOutcome> {
  try {
    const result: ExtractResult = await extractTextFromPdfFile(
      params.file,
      params.onProgress
    );

    await markDocumentReady(params.documentId, {
      pageCount: result.pageCount,
      paragraphs: result.paragraphs,
      language: result.language,
      storagePath: params.storagePath,
      originalFileName: params.originalFileName
    });

    return {
      kind: "ready",
      pageCount: result.pageCount,
      paragraphs: result.paragraphs,
      language: result.language,
      textLength: result.textLength
    };
  } catch (err) {
    const mapped = mapExtractionErrorToOutcome(err);

    if (mapped.kind === "needs_ocr") {
      await markDocumentNeedsOcr(params.documentId, mapped.errorCode);
      return { kind: "needs_ocr", errorCode: mapped.errorCode };
    }

    await markDocumentFailed(params.documentId, mapped.errorCode);
    return { kind: "failed", errorCode: mapped.errorCode };
  }
}

