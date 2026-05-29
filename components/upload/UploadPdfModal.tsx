"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/feedback/ToastProvider";
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
import { useUserDocuments } from "@/lib/documents/use-user-documents";
import { formatFileSize } from "@/lib/format";
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
import { pdfUploadLimitsShortLabel } from "@/lib/upload/limits-label";
import { trackUploadError } from "@/lib/upload/track-upload-error";
import UploadProgressSteps from "@/components/upload/UploadProgressSteps";
import {
  workflowStepFromExtractProgress,
  type UploadWorkflowStepId
} from "@/lib/upload/workflow-steps";
import { useI18n } from "@/lib/i18n/provider";

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

export default function UploadPdfModal({ open, onClose }: UploadPdfModalProps) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();
  const { documents } = useUserDocuments();
  const inputRef = useRef<HTMLInputElement>(null);
  const successToastShownRef = useRef(false);
  const isFirstUploadRef = useRef(false);
  const uploadCancelledRef = useRef(false);
  const uploadInFlightRef = useRef(false);
  const uploadContextRef = useRef<{
    documentId: string | null;
    storagePath: string | null;
  }>({ documentId: null, storagePath: null });
  const [state, setState] = useState<UploadState>("empty");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [workflowStep, setWorkflowStep] = useState<UploadWorkflowStepId>("upload");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<UploadFeedback | null>(null);

  const reset = useCallback(() => {
    setState("empty");
    setFile(null);
    setProgress(0);
    setWorkflowStep("upload");
    setDocumentId(null);
    setPageCount(null);
    setIsDragging(false);
    setUploadFeedback(null);
    if (inputRef.current) inputRef.current.value = "";
    successToastShownRef.current = false;
    uploadCancelledRef.current = false;
    uploadContextRef.current = { documentId: null, storagePath: null };
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }

    isFirstUploadRef.current = documents.length === 0;
  }, [open, reset, documents.length]);

  useEffect(() => {
    if (open && state === "ready" && !successToastShownRef.current) {
      successToastShownRef.current = true;
      toast.success(t("app.uploadReadyTitle"));
    }
  }, [open, state, t, toast]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state !== "working") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, state]);

  const trackFirstUploadFailed = (metadata: Record<string, unknown>) => {
    if (!isFirstUploadRef.current) return;

    trackAnalyticsEventClient({
      eventName: "first_upload_failed",
      metadata
    });
  };

  const handleFile = (next: File) => {
    if (!isPdfFile(next)) {
      const message = t("app.uploadOnlyPdf");
      setUploadFeedback({
        variant: "warning",
        title: t("app.uploadPdfOnlyTitle"),
        description: message
      });
      toast.error(message);
      return;
    }

    try {
      validatePdfFileBasics(next);
    } catch (err) {
      if (isPdfUserError(err)) {
        const feedback = feedbackForPdfErrorCode(err.code, t);
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
    setWorkflowStep("upload");
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

  const handleUploadAnother = () => {
    reset();
  };

  const recoverAfterUploadFailure = useCallback(
    (feedback: UploadFeedback) => {
      setState("selected");
      setProgress(0);
      setWorkflowStep("upload");
      setDocumentId(null);
      uploadContextRef.current = { documentId: null, storagePath: null };
      setUploadFeedback(feedback);
    },
    []
  );

  const handleCancelUpload = useCallback(async () => {
    uploadCancelledRef.current = true;
    const { documentId: pendingId, storagePath } = uploadContextRef.current;

    if (pendingId) {
      await rollbackProcessingDocument({
        documentId: pendingId,
        storagePath
      }).catch(() => undefined);
      notifyDocumentsUpdated();
    }

    uploadContextRef.current = { documentId: null, storagePath: null };
    setDocumentId(null);
    setState("selected");
    setProgress(0);
    setWorkflowStep("upload");
    toast.info(t("app.uploadCancelled"));
  }, [t, toast]);

  const startExtraction = async () => {
    if (!file || uploadInFlightRef.current) return;

    uploadCancelledRef.current = false;
    uploadInFlightRef.current = true;
    setState("working");
    setProgress(0);
    setWorkflowStep("upload");
    setUploadFeedback(null);

    if (isFirstUploadRef.current) {
      trackAnalyticsEventClient({ eventName: "first_upload_started" });
    }

    let pendingDocumentId: string | null = null;
    let storagePath: string | null = null;

    const isCancelled = () => uploadCancelledRef.current;

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
      if (isCancelled()) {
        await rollbackProcessingDocument({
          documentId: pendingDocumentId,
          storagePath: null
        }).catch(() => undefined);
        notifyDocumentsUpdated();
        return;
      }

      uploadContextRef.current = { documentId: pendingDocumentId, storagePath: null };
      setDocumentId(pendingDocumentId);
      setProgress(8);

      const stored = await storeDocumentPdfFile(pendingDocumentId, file);
      storagePath = stored.storagePath;
      uploadContextRef.current = {
        documentId: pendingDocumentId,
        storagePath
      };

      if (isCancelled()) {
        await rollbackProcessingDocument({
          documentId: pendingDocumentId,
          storagePath
        }).catch(() => undefined);
        notifyDocumentsUpdated();
        return;
      }

      setProgress(18);
      setWorkflowStep("extract");

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
          if (isCancelled()) {
            return;
          }

          setWorkflowStep(workflowStepFromExtractProgress(extractProgress));
          setProgress(18 + Math.round(progressPercent(extractProgress) * 0.72));
        }
      });

      if (isCancelled()) {
        await rollbackProcessingDocument({
          documentId: pendingDocumentId,
          storagePath
        }).catch(() => undefined);
        notifyDocumentsUpdated();
        return;
      }

      setWorkflowStep("save");
      setProgress(94);
      notifyDocumentsUpdated();

      if (outcome.kind === "ready") {
        uploadContextRef.current = { documentId: null, storagePath: null };
        setPageCount(outcome.pageCount);
        setProgress(100);
        setWorkflowStep("ready");
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

        if (isFirstUploadRef.current) {
          trackAnalyticsEventClient({
            eventName: "first_upload_completed",
            metadata: {
              documentId: pendingDocumentId,
              pageCount: outcome.pageCount
            }
          });
        }

        return;
      }

      if (outcome.kind === "needs_ocr") {
        const feedback = feedbackForPdfErrorCode("SCANNED", t);
        recoverAfterUploadFailure(feedback);
        toast.error(feedback.title);

        trackUploadError({
          errorCode: outcome.errorCode,
          documentId: pendingDocumentId,
          stage: "extraction",
          reason: "needs_ocr"
        });

        trackAnalyticsEventClient({
          eventName: "document_needs_ocr",
          metadata: {
            documentId: pendingDocumentId,
            errorCode: outcome.errorCode
          }
        });

        trackFirstUploadFailed({
          documentId: pendingDocumentId,
          errorCode: outcome.errorCode,
          reason: "needs_ocr"
        });

        return;
      }

      const feedback = feedbackForPdfErrorCode(outcome.errorCode, t);
      recoverAfterUploadFailure(feedback);
      toast.error(feedback.title);

      trackUploadError({
        errorCode: outcome.errorCode,
        documentId: pendingDocumentId,
        stage: "extraction"
      });

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

      trackFirstUploadFailed({
        documentId: pendingDocumentId,
        errorCode: outcome.errorCode
      });

      return;
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
        recoverAfterUploadFailure(feedbackForStorageFailure(err.message, t));
        toast.error(t("app.uploadDidNotFinish"));

        trackUploadError({
          documentId: pendingDocumentId,
          stage: "storage",
          reason: err.code
        });

        trackFirstUploadFailed({
          documentId: pendingDocumentId,
          reason: "storage_failed"
        });

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

      if (isCancelled()) {
        return;
      }

      if (isPdfUserError(err)) {
        const feedback = feedbackForPdfErrorCode(err.code, t);
        recoverAfterUploadFailure(feedback);
        toast.error(feedback.title);

        trackUploadError({
          errorCode: err.code,
          documentId: pendingDocumentId,
          stage: "extraction"
        });

        trackFirstUploadFailed({
          documentId: pendingDocumentId,
          errorCode: err.code
        });
      } else if (err instanceof Error) {
        recoverAfterUploadFailure({
          variant: "error",
          title: t("app.uploadProcessFailedTitle"),
          description: t("app.uploadProcessFailedBody")
        });
        toast.error(t("app.uploadProcessFailedTitle"));

        trackUploadError({
          documentId: pendingDocumentId,
          stage: "extraction",
          reason: "unknown"
        });

        trackFirstUploadFailed({
          documentId: pendingDocumentId,
          reason: "unknown"
        });
      } else {
        recoverAfterUploadFailure({
          variant: "error",
          title: t("app.uploadProcessFailedTitle"),
          description: t("app.uploadProcessFailedBody")
        });
        toast.error(t("app.uploadProcessFailedTitle"));

        trackUploadError({
          documentId: pendingDocumentId,
          stage: "extraction",
          reason: "unknown"
        });

        trackFirstUploadFailed({
          documentId: pendingDocumentId,
          reason: "unknown"
        });
      }
    } finally {
      uploadInFlightRef.current = false;

      if (uploadCancelledRef.current) {
        uploadCancelledRef.current = false;
        setState("selected");
        setProgress(0);
        setWorkflowStep("upload");
        setDocumentId(null);
        uploadContextRef.current = { documentId: null, storagePath: null };
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
      className="fixed inset-0 z-50 flex items-end justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-pdf-title"
    >
      <button
        type="button"
        aria-label={t("common.close")}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={isBusy ? undefined : onClose}
        disabled={isBusy}
      />

      <div className="relative z-10 flex max-h-[min(92dvh,680px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-[#12141d] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
        <div className="overflow-y-auto overscroll-contain p-5 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="upload-pdf-title"
                className="text-lg font-medium tracking-tight text-white sm:text-xl md:text-2xl"
              >
                {t("app.uploadPdfTitle")}
              </h2>
              <p className="mt-1.5 text-sm text-zinc-400">{pdfUploadLimitsShortLabel(t)}</p>
            </div>
            {!isBusy && state !== "ready" && (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[40px] shrink-0 rounded-md border border-white/[0.12] px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
              >
                {t("app.uploadClose")}
              </button>
            )}
          </div>

          {state === "ready" ? (
            <div className="mt-6 sm:mt-8">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/[0.08]">
                  <svg
                    className="h-5 w-5 text-emerald-300/90"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="mt-4 text-base font-medium text-white">{t("app.uploadReadyTitle")}</p>
                {file ? (
                  <p className="mt-2 truncate px-2 text-sm text-zinc-400">
                    {file.name}
                    {pageCount != null
                      ? ` · ${
                          pageCount === 1
                            ? t("app.readerPageSingular").replace("{count}", String(pageCount))
                            : t("app.readerPagePlural").replace("{count}", String(pageCount))
                        }`
                      : ""}
                  </p>
                ) : null}
              </div>

              <div className="mt-6">
                <UploadProgressSteps activeStep="ready" />
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleOpenReader}
                  className="min-h-[48px] w-full rounded-lg border border-accent/30 bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-[#6D7EFF]"
                >
                  {t("app.uploadOpenReader")}
                </button>
                <button
                  type="button"
                  onClick={handleUploadAnother}
                  className="min-h-[48px] w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-5 py-3 text-sm text-zinc-300 transition hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-zinc-100"
                >
                  {t("app.uploadAnotherPdf")}
                </button>
              </div>
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
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setIsDragging(false);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isBusy) setIsDragging(true);
                }}
                onDrop={isBusy ? undefined : onDrop}
                className={`mt-5 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200 sm:mt-6 sm:px-6 sm:py-10 ${
                  isDragging
                    ? "scale-[1.01] border-accent/50 bg-accent/[0.08] shadow-[inset_0_0_0_1px_rgba(124,140,255,0.15)]"
                    : "border-white/[0.14] bg-[#0e1016] hover:border-white/[0.22] hover:bg-[#10131a]"
                } ${isBusy ? "pointer-events-none opacity-70" : ""}`}
              >
                <div
                  className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-200 ${
                    isDragging
                      ? "border-accent/30 bg-accent/10"
                      : "border-white/[0.12] bg-white/[0.03]"
                  }`}
                >
                  <svg
                    className={`h-5 w-5 transition-colors ${isDragging ? "text-accentSoft" : "text-zinc-400"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p className="mt-4 text-sm font-medium text-zinc-200">
                  {isDragging
                    ? t("app.uploadReleaseToAdd")
                    : state === "empty"
                      ? t("app.uploadDragDrop")
                      : t("app.uploadDropReplace")}
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-500">
                  {pdfUploadLimitsShortLabel(t)}
                </p>
                {!isBusy && (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="mt-5 min-h-[44px] rounded-lg border border-white/[0.14] bg-white/[0.05] px-5 py-2.5 text-sm text-zinc-200 transition hover:border-white/[0.2] hover:bg-white/[0.08]"
                  >
                    {t("app.uploadChooseFile")}
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

              {file && state !== "working" && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-white/[0.12] bg-[#0e1016] px-4 py-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04]">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                      PDF
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium text-zinc-100">{file.name}</p>
                    <p className="mt-0.5 text-[12px] text-zinc-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              )}

              {uploadFeedback ? (
                <div className="mt-3">
                  <AppStateInline
                    variant={uploadFeedback.variant}
                    title={uploadFeedback.title}
                    description={uploadFeedback.description}
                  />
                  {uploadFeedback.showUpgradeCta ? (
                    <div className="mt-3">
                      <UpgradeCta source="upload_pdf_modal" className="w-full min-h-[44px]" />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {state === "working" && (
                <div className="mt-5">
                  <UploadProgressSteps activeStep={workflowStep} />
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
                      <span className="text-zinc-400">{t("app.uploadPreparing")}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-accent/70 transition-[width] duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleCancelUpload()}
                    className="mt-4 min-h-[44px] w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-5 py-2.5 text-sm text-zinc-300 transition hover:border-white/[0.16] hover:bg-white/[0.05]"
                  >
                    {t("app.uploadCancel")}
                  </button>
                </div>
              )}

              {state === "selected" && (
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={startExtraction}
                    disabled={isBusy || !file}
                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-[#6D7EFF] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {uploadFeedback ? t("app.uploadTryAgain") : t("app.uploadExtractPrepare")}
                  </button>
                  {uploadFeedback ? (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadFeedback(null);
                        if (inputRef.current) {
                          inputRef.current.value = "";
                        }
                        setFile(null);
                        setState("empty");
                      }}
                      className="min-h-[44px] rounded-lg border border-white/[0.12] bg-white/[0.03] px-5 py-2.5 text-sm text-zinc-400 transition hover:text-zinc-200"
                    >
                      {t("app.uploadChooseDifferent")}
                    </button>
                  ) : null}
                </div>
              )}

              {state === "empty" && (
                <p className="mt-4 text-center text-[12px] leading-relaxed text-zinc-600">
                  {t("app.uploadBrowserExtractHint")}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
