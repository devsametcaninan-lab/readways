"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/feedback/ToastProvider";
import Spinner from "@/components/feedback/Spinner";
import {
  createProcessingDocument,
  markDocumentFailed,
  markDocumentNeedsOcr
} from "@/lib/documents/client";
import { rollbackProcessingDocument } from "@/lib/documents/rollback-upload";
import {
  isDocumentStorageUploadError,
  storeDocumentPdfFile
} from "@/lib/documents/upload-storage";
import { notifyDocumentsUpdated } from "@/lib/documents/events";
import { formatFileSize } from "@/lib/format";
import { MAX_PDF_BYTES, MAX_PDF_PAGES } from "@/lib/pdf/constants";
import { trackAnalyticsEventClient } from "@/lib/analytics/client";
import type { ExtractProgress } from "@/lib/pdf/extract-pdf-text";
import { isPdfUserError } from "@/lib/pdf/errors";
import { validatePdfFileBasics } from "@/lib/pdf/validate-pdf-file";
import { runPdfExtractionWithJob } from "@/lib/documents/processing/pdf-extraction-with-job";
import AppStateInline from "@/components/app/AppStateInline";
import UpgradeCta from "@/components/billing/UpgradeCta";
import { assertPdfUploadAllowed, BillingLimitError } from "@/lib/billing/client";
import {
  feedbackForPdfErrorCode,
  feedbackForStorageFailure,
  type UploadFeedback
} from "@/lib/app/upload-feedback";

type UploadState = "empty" | "selected" | "working" | "ready";

type UploadPdfModalProps = {
  open: boolean;
  onClose: () => void;
};

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function progressPercent(progress: ExtractProgress): number {
  switch (progress.phase) {
    case "validating":
      return 6;
    case "loading":
      return 14;
    case "extracting":
      if (progress.totalPages === 0) {
        return 20;
      }
      return 20 + Math.round((progress.currentPage / progress.totalPages) * 68);
    case "cleaning":
      return 96;
    default:
      return 0;
  }
}

function progressLabel(progress: ExtractProgress): string {
  switch (progress.phase) {
    case "validating":
      return "Validating PDF…";
    case "loading":
      return "Opening PDF…";
    case "extracting":
      return progress.totalPages > 0
        ? `Extracting text · page ${progress.currentPage} of ${progress.totalPages}`
        : "Extracting text…";
    case "cleaning":
      return "Cleaning document…";
    default:
      return "Preparing document…";
  }
}

export default function UploadPdfModal({ open, onClose }: UploadPdfModalProps) {
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const successToastShownRef = useRef(false);
  const [state, setState] = useState<UploadState>("empty");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusLabel, setStatusLabel] = useState("Uploading…");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<UploadFeedback | null>(null);

  const reset = useCallback(() => {
    setState("empty");
    setFile(null);
    setProgress(0);
    setStatusLabel("Uploading…");
    setDocumentId(null);
    setPageCount(null);
    setIsDragging(false);
    setUploadFeedback(null);
    if (inputRef.current) inputRef.current.value = "";
    successToastShownRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (open && state === "ready" && !successToastShownRef.current) {
      successToastShownRef.current = true;
      toast.success("PDF uploaded successfully");
    }
  }, [open, state, toast]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state !== "working") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, state]);

  const handleFile = (next: File) => {
    if (!isPdfFile(next)) {
      const message = "Only PDF files are supported.";
      setUploadFeedback({
        variant: "warning",
        title: "PDF files only",
        description: message
      });
      toast.error(message);
      return;
    }

    try {
      validatePdfFileBasics(next);
    } catch (err) {
      if (isPdfUserError(err)) {
        const feedback = feedbackForPdfErrorCode(err.code);
        setUploadFeedback(feedback);
        toast.error(feedback.title);
        setFile(null);
        setState("empty");
        return;
      }
    }

    setUploadFeedback(null);
    setFile(next);
    setState("selected");
    setProgress(0);
    setDocumentId(null);
    setPageCount(null);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) handleFile(picked);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  };

  const startExtraction = async () => {
    if (!file) return;

    setState("working");
    setProgress(0);
    setStatusLabel("Uploading…");
    setUploadFeedback(null);

    let pendingDocumentId: string | null = null;
    let storagePath: string | null = null;

    try {
      try {
        await assertPdfUploadAllowed();
      } catch (limitErr) {
        if (limitErr instanceof BillingLimitError) {
          setState("selected");
          setUploadFeedback({
            variant: "info",
            title: limitErr.title,
            description: limitErr.message,
            showUpgradeCta: true
          });
          toast.error(limitErr.title);

          trackAnalyticsEventClient({
            eventName: "limit_reached",
            metadata: {
              feature: "pdf_upload",
              used: limitErr.usage?.used,
              limit: limitErr.usage?.limit
            }
          });

          trackAnalyticsEventClient({
            eventName: "paywall_shown",
            metadata: { source: "upload_pdf_modal", feature: "pdf_upload" }
          });

          return;
        }

        throw limitErr;
      }

      pendingDocumentId = await createProcessingDocument(file);
      setDocumentId(pendingDocumentId);
      setProgress(6);
      setStatusLabel("Uploading…");

      const stored = await storeDocumentPdfFile(pendingDocumentId, file);
      storagePath = stored.storagePath;
      setProgress(12);
      setStatusLabel("Stored securely…");

      trackAnalyticsEventClient({
        eventName: "pdf_storage_uploaded",
        metadata: {
          documentId: pendingDocumentId,
          fileSize: file.size
        }
      });

      const { outcome } = await runPdfExtractionWithJob({
        file,
        documentId: pendingDocumentId,
        storagePath: stored.storagePath,
        originalFileName: stored.originalFileName,
        onProgress: (extractProgress) => {
          setProgress(
            12 + Math.round(progressPercent(extractProgress) * 0.86)
          );
          setStatusLabel(progressLabel(extractProgress));
        }
      });

      notifyDocumentsUpdated();

      if (outcome.kind === "ready") {
        setStatusLabel("Ready to read");
        setPageCount(outcome.pageCount);
        setProgress(100);
        setState("ready");

        trackAnalyticsEventClient({
          eventName: "pdf_uploaded",
          metadata: {
            documentId: pendingDocumentId,
            pageCount: outcome.pageCount,
            language: outcome.language,
            textLength: outcome.textLength,
            stored: true
          }
        });

        trackAnalyticsEventClient({
          eventName: "document_processing_ready",
          metadata: {
            documentId: pendingDocumentId,
            pageCount: outcome.pageCount,
            language: outcome.language
          }
        });

        return;
      }

      if (outcome.kind === "needs_ocr") {
        const feedback = feedbackForPdfErrorCode("SCANNED");
        setState("selected");
        setProgress(100);
        setStatusLabel("Needs OCR");
        setUploadFeedback(feedback);
        toast.error(feedback.title);

        trackAnalyticsEventClient({
          eventName: "document_needs_ocr",
          metadata: {
            documentId: pendingDocumentId,
            errorCode: outcome.errorCode
          }
        });

        return;
      }

      const feedback = feedbackForPdfErrorCode(outcome.errorCode);
      setState("selected");
      setProgress(100);
      setStatusLabel("Failed to parse");
      setUploadFeedback(feedback);
      toast.error(feedback.title);

      trackAnalyticsEventClient({
        eventName: "document_processing_failed",
        metadata: {
          documentId: pendingDocumentId,
          errorCode: outcome.errorCode
        }
      });

      trackAnalyticsEventClient({
        eventName: "pdf_parse_failed",
        metadata: {
          documentId: pendingDocumentId,
          errorCode: outcome.errorCode,
          hadStorage: true
        }
      });
    } catch (err) {
      if (isDocumentStorageUploadError(err)) {
        if (pendingDocumentId) {
          await rollbackProcessingDocument({
            documentId: pendingDocumentId,
            storagePath
          }).catch(() => undefined);

          trackAnalyticsEventClient({
            eventName: "pdf_storage_failed",
            metadata: {
              documentId: pendingDocumentId,
              reason: err.code
            }
          });
        }

        notifyDocumentsUpdated();
        setDocumentId(null);
        setState("selected");
        setUploadFeedback(feedbackForStorageFailure(err.message));
        toast.error("Upload didn't finish");
        return;
      }

      if (pendingDocumentId) {
        const errorCode = isPdfUserError(err) ? err.code : undefined;

        if (errorCode === "SCANNED" || errorCode === "NO_TEXT") {
          await markDocumentNeedsOcr(pendingDocumentId, "SCANNED").catch(
            () => undefined
          );

          trackAnalyticsEventClient({
            eventName: "document_needs_ocr",
            metadata: {
              documentId: pendingDocumentId,
              errorCode: errorCode ?? "SCANNED"
            }
          });
        } else {
          await markDocumentFailed(pendingDocumentId, errorCode).catch(
            () => undefined
          );

          trackAnalyticsEventClient({
            eventName: "document_processing_failed",
            metadata: {
              documentId: pendingDocumentId,
              errorCode: errorCode ?? "UNKNOWN"
            }
          });
        }

        notifyDocumentsUpdated();

        trackAnalyticsEventClient({
          eventName: "pdf_parse_failed",
          metadata: {
            documentId: pendingDocumentId,
            errorCode: errorCode ?? "UNKNOWN",
            hadStorage: Boolean(storagePath)
          }
        });
      }

      setState("selected");
      if (isPdfUserError(err)) {
        const feedback = feedbackForPdfErrorCode(err.code);
        setUploadFeedback(feedback);
        toast.error(feedback.title);
      } else if (err instanceof Error) {
        setUploadFeedback({
          variant: "error",
          title: "Couldn't prepare this PDF",
          description: err.message
        });
        toast.error("Couldn't prepare this PDF");
      } else {
        setUploadFeedback({
          variant: "error",
          title: "Couldn't prepare this PDF",
          description: "Try another file, or upload a PDF with selectable text."
        });
        toast.error("Couldn't prepare this PDF");
      }
    }
  };

  const handleOpenReader = () => {
    if (!documentId) return;
    onClose();
    router.push(`/reader/${documentId}`);
  };

  if (!open) return null;

  const isBusy = state === "working";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-pdf-title"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={isBusy ? undefined : onClose}
        disabled={isBusy}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/[0.12] bg-[#12141d] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.6)] md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="upload-pdf-title" className="text-xl font-medium tracking-tight text-white md:text-2xl">
              Upload PDF
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">
              Text-based PDFs only · up to 10 MB · {MAX_PDF_PAGES} pages
            </p>
          </div>
          {!isBusy && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/[0.12] px-2.5 py-1 text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
            >
              Close
            </button>
          )}
        </div>

        {state === "ready" ? (
          <div className="mt-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
              <svg className="h-5 w-5 text-accentSoft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-4 text-base font-medium text-white">Ready to read</p>
            <p className="mt-2 text-sm text-zinc-400">
              {file?.name}
              {pageCount != null ? ` · ${pageCount} page${pageCount === 1 ? "" : "s"} prepared` : ""}
            </p>
            <p className="mt-1 text-[12px] text-zinc-500">Stored securely</p>
            <button
              type="button"
              onClick={handleOpenReader}
              className="mt-6 w-full rounded-lg border border-accent/30 bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D7EFF]"
            >
              Open in Reader
            </button>
          </div>
        ) : (
          <>
            <div
              onDragEnter={(e) => {
                e.preventDefault();
                if (!isBusy) setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={isBusy ? undefined : onDrop}
              className={`mt-6 rounded-xl border border-dashed px-6 py-10 text-center transition ${
                isDragging
                  ? "border-accent/40 bg-accent/[0.06] shadow-[0_0_32px_rgba(124,140,255,0.12)]"
                  : "border-white/[0.16] bg-[#0e1016] hover:border-white/[0.2]"
              } ${isBusy ? "pointer-events-none opacity-80" : ""}`}
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.03]">
                <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="mt-4 text-sm text-zinc-300">
                {state === "empty" ? "Drag and drop your PDF here" : "Drop a different PDF to replace"}
              </p>
              <p className="mt-1 text-[12px] text-zinc-500">
                PDF files only · Max {formatFileSize(MAX_PDF_BYTES)} · Up to {MAX_PDF_PAGES} pages
              </p>
              {!isBusy && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mt-5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 transition hover:border-white/[0.16] hover:bg-white/[0.06]"
                >
                  Choose file
                </button>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={onInputChange}
                disabled={isBusy}
              />
            </div>

            {uploadFeedback ? (
              <div className="mt-3">
                <AppStateInline
                  variant={uploadFeedback.variant}
                  title={uploadFeedback.title}
                  description={uploadFeedback.description}
                />
                {uploadFeedback.showUpgradeCta ? (
                  <div className="mt-3">
                    <UpgradeCta source="upload_pdf_modal" className="w-full" />
                  </div>
                ) : null}
              </div>
            ) : null}

            {file && (
              <div className="mt-4 rounded-xl border border-white/[0.12] bg-[#0e1016] px-4 py-3.5">
                <p className="truncate text-sm font-medium text-zinc-100">{file.name}</p>
                <p className="mt-1 text-[12px] text-zinc-500">{formatFileSize(file.size)}</p>
              </div>
            )}

            {state === "working" && (
              <div className="mt-5">
                <p className="mb-2 flex items-center gap-2 text-sm text-zinc-300">
                  <Spinner />
                  {statusLabel}
                </p>
                <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
                  <span>Preparing your document</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.1]">
                  <div
                    className="h-full rounded-full bg-accent/80 transition-[width] duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {state === "selected" && (
              <button
                type="button"
                onClick={startExtraction}
                disabled={isBusy}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D7EFF] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Extract and prepare
              </button>
            )}

            {state === "empty" && (
              <p className="mt-4 text-center text-[12px] text-zinc-600">
                Text is extracted in your browser and saved to your ReadWays library.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
