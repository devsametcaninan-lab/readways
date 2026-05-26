"use client";

import { trackAnalyticsEventClient } from "@/lib/analytics/client";
import {
  createDocumentJobClient,
  markDocumentJobCompletedClient,
  markDocumentJobFailedClient,
  updateDocumentJobStatusClient
} from "@/lib/document-jobs/client";
import type { ExtractProgress } from "@/lib/pdf/extract-pdf-text";
import {
  processPdfDocumentForDocument,
  type DocumentProcessingOutcome
} from "./process-pdf-document";

type RunPdfExtractionWithJobParams = {
  documentId: string;
  file: File;
  storagePath: string;
  originalFileName: string;
  onProgress?: (progress: ExtractProgress) => void;
};

export type PdfExtractionWithJobResult = {
  outcome: DocumentProcessingOutcome;
  jobId: string;
};

function failureMessageForOutcome(
  outcome: Extract<DocumentProcessingOutcome, { kind: "needs_ocr" | "failed" }>
): string {
  return outcome.errorCode;
}

export async function runPdfExtractionWithJob(
  params: RunPdfExtractionWithJobParams
): Promise<PdfExtractionWithJobResult> {
  const job = await createDocumentJobClient({
    documentId: params.documentId,
    jobType: "pdf_extraction",
    metadata: {
      originalFileName: params.originalFileName,
      storagePath: params.storagePath
    }
  });

  trackAnalyticsEventClient({
    eventName: "document_job_created",
    metadata: {
      jobId: job.id,
      documentId: params.documentId,
      jobType: job.job_type
    }
  });

  await updateDocumentJobStatusClient({
    jobId: job.id,
    status: "processing",
    incrementAttempts: true
  });

  try {
    const outcome = await processPdfDocumentForDocument({
      file: params.file,
      documentId: params.documentId,
      storagePath: params.storagePath,
      originalFileName: params.originalFileName,
      onProgress: params.onProgress
    });

    if (outcome.kind === "ready") {
      await markDocumentJobCompletedClient({
        jobId: job.id,
        metadata: {
          pageCount: outcome.pageCount,
          language: outcome.language,
          textLength: outcome.textLength
        }
      });

      trackAnalyticsEventClient({
        eventName: "document_job_completed",
        metadata: {
          jobId: job.id,
          documentId: params.documentId,
          jobType: job.job_type,
          pageCount: outcome.pageCount
        }
      });
    } else {
      await markDocumentJobFailedClient({
        jobId: job.id,
        errorMessage: failureMessageForOutcome(outcome),
        metadata: {
          outcome: outcome.kind,
          errorCode: outcome.errorCode
        }
      });

      trackAnalyticsEventClient({
        eventName: "document_job_failed",
        metadata: {
          jobId: job.id,
          documentId: params.documentId,
          jobType: job.job_type,
          outcome: outcome.kind,
          errorCode: outcome.errorCode
        }
      });
    }

    return { outcome, jobId: job.id };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "PDF extraction failed unexpectedly.";

    await markDocumentJobFailedClient({
      jobId: job.id,
      errorMessage,
      metadata: { outcome: "exception" }
    }).catch(() => undefined);

    trackAnalyticsEventClient({
      eventName: "document_job_failed",
      metadata: {
        jobId: job.id,
        documentId: params.documentId,
        jobType: job.job_type,
        outcome: "exception"
      }
    });

    throw err;
  }
}
