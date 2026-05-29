"use client";

import Link from "next/link";
import { useState } from "react";
import AppCard from "@/components/app/AppCard";
import { appText } from "@/components/app/app-typography";
import DeleteDocumentModal from "@/components/documents/DeleteDocumentModal";
import { useDeleteDocument } from "@/lib/documents/use-delete-document";
import type { DocumentListItem } from "@/lib/documents/types";
import { useI18n } from "@/lib/i18n/provider";

type DocumentCardProps = {
  document: DocumentListItem;
  onDeleted?: (documentId: string) => void;
};

export default function DocumentCard({ document: doc, onDeleted }: DocumentCardProps) {
  const { t } = useI18n();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { isDeleting, deleteDocumentById } = useDeleteDocument();
  const deleting = isDeleting(doc.id);
  const statusLabel: Record<DocumentListItem["status"], string> = {
    processing: t("app.documentStatusProcessing"),
    ready: t("app.documentStatusReady"),
    needs_ocr: t("app.documentStatusNeedsOcr"),
    failed: t("app.documentStatusFailed")
  };

  const canRead = doc.canOpenInReader;
  const href = canRead ? `/reader/${doc.id}` : undefined;
  const readingState = canRead
    ? doc.progress == null
      ? t("app.documentNotStarted")
      : `${doc.progress}%`
    : statusLabel[doc.status];

  const handleConfirmDelete = async () => {
    const ok = await deleteDocumentById(doc.id);

    if (ok) {
      setConfirmOpen(false);
      onDeleted?.(doc.id);
    }
  };

  return (
    <>
      <AppCard className="flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),0_0_28px_rgba(124,140,255,0.08)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {href ? (
              <Link href={href} className="block min-w-0">
                <p className={`truncate ${appText.titleLg}`}>{doc.title}</p>
              </Link>
            ) : (
              <p className={`truncate ${appText.titleLg}`}>{doc.title}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            className="min-h-[40px] shrink-0 rounded-md border border-white/[0.1] px-3 py-2 text-[12px] text-zinc-500 transition hover:border-red-500/25 hover:bg-red-500/[0.06] hover:text-red-200/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? t("app.documentDeleting") : t("app.documentDelete")}
          </button>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <p className={`${appText.metaSmall}`}>
            {doc.source} · {t("app.documentUpdatedAt")} {doc.updatedAtLabel}
            {doc.status !== "ready" ? ` · ${statusLabel[doc.status]}` : ""}
          </p>

          <div className={`mt-5 flex items-center justify-between ${appText.metaSmall}`}>
          <span>{t("app.documentReadingStatus")}</span>
            <span>{readingState}</span>
          </div>

          <p className={`mt-4 ${appText.metaSmall}`}>
          <span className="text-zinc-300">{doc.savedWordsCount}</span> {t("app.documentSavedWordsCount")}
            {doc.pageCount > 0 ? (
            <span className="text-zinc-600"> · {doc.pageCount} {t("app.documentPages")}</span>
            ) : null}
          </p>

          {doc.failureMessage ? (
            <p className="mt-3 text-[12px] leading-relaxed text-zinc-500">
              {doc.failureMessage}
            </p>
          ) : null}
        </div>

        {href ? (
          <Link
            href={href}
            className={`mt-5 inline-flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-sm transition ${
              canRead
                ? "border-white/[0.12] bg-white/[0.04] text-zinc-200 hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-white"
                : "cursor-default border-white/[0.08] bg-white/[0.02] text-zinc-500"
            }`}
          >
            {t("app.documentContinueReading")}
          </Link>
        ) : (
          <span className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-sm text-zinc-500">
            {statusLabel[doc.status]}
          </span>
        )}
      </AppCard>

      <DeleteDocumentModal
        open={confirmOpen}
        title={doc.title}
        deleting={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </>
  );
}
