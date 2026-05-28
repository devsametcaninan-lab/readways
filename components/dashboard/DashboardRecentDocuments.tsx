"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import AppCard from "@/components/app/AppCard";
import AppStateCard from "@/components/app/AppStateCard";
import { appText } from "@/components/app/app-typography";
import DeleteDocumentModal from "@/components/documents/DeleteDocumentModal";
import { useUserDocuments } from "@/lib/documents/use-user-documents";
import { useDeleteDocument } from "@/lib/documents/use-delete-document";
import type { DocumentListItem } from "@/lib/documents/types";
import { useI18n } from "@/lib/i18n/provider";

function DashboardDocumentCard({
  doc,
  onDeleted
}: {
  doc: DocumentListItem;
  onDeleted: (documentId: string) => void;
}) {
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

  const canRead = doc.status === "ready";
  const href = canRead ? `/reader/${doc.id}` : "/library";
  const readingState = canRead
    ? doc.progress == null
      ? t("app.documentNotStarted")
      : `${doc.progress}%`
    : statusLabel[doc.status];

  const handleConfirmDelete = async () => {
    const ok = await deleteDocumentById(doc.id);

    if (ok) {
      setConfirmOpen(false);
      onDeleted(doc.id);
    }
  };

  return (
    <>
      <AppCard className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className={`min-w-0 flex-1 truncate ${appText.title}`}>{doc.title}</p>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            className="min-h-[40px] shrink-0 rounded-md border border-white/[0.1] px-3 py-2 text-[12px] text-zinc-500 transition hover:border-red-500/25 hover:bg-red-500/[0.06] hover:text-red-200/90 disabled:opacity-50"
          >
            {deleting ? "…" : t("app.documentDelete")}
          </button>
        </div>
        <p className={`mt-1.5 ${appText.metaSmall}`}>
          {t("app.dashboardPdfUpdatedPrefix")} {doc.updatedAtLabel}
          {doc.status !== "ready" ? ` · ${statusLabel[doc.status]}` : ""}
        </p>
        <div className={`mt-4 flex items-center justify-between ${appText.metaSmall}`}>
          <span>{t("app.documentReadingStatus")}</span>
          <span>{readingState}</span>
        </div>
        <Link
          href={href}
          className={`mt-4 inline-block text-[12px] transition-colors ${
            canRead
              ? "text-accentSoft hover:text-white"
              : "text-zinc-500 hover:text-zinc-400"
          }`}
        >
          {canRead ? `${t("app.documentContinueReading")} →` : `${t("app.dashboardViewInLibrary")} →`}
        </Link>
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

export default function DashboardRecentDocuments() {
  const { t } = useI18n();
  const { documents, loading, error, reload } = useUserDocuments(3);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const handleDocumentDeleted = useCallback((documentId: string) => {
    setRemovedIds((current) =>
      current.includes(documentId) ? current : [...current, documentId]
    );
  }, []);

  const visibleDocuments = useMemo(
    () => documents.filter((doc) => !removedIds.includes(doc.id)),
    [documents, removedIds]
  );

  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[148px] animate-pulse rounded-xl border border-white/[0.12] bg-[#12141d]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <AppStateCard
        compact
        variant="error"
        icon="library"
        title={t("app.dashboardRecentLoadErrorTitle")}
        description={t("app.dashboardRecentLoadErrorBody")}
        action={{ label: t("app.commonTryAgain"), onClick: reload }}
      />
    );
  }

  if (visibleDocuments.length === 0) {
    return (
      <AppStateCard
        compact
        icon="upload"
        title={t("app.dashboardNoDocumentsTitle")}
        description={t("app.dashboardNoDocumentsBody")}
        action={{ label: t("app.dashboardOpenLibrary"), href: "/library" }}
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {visibleDocuments.map((doc) => (
        <DashboardDocumentCard
          key={doc.id}
          doc={doc}
          onDeleted={handleDocumentDeleted}
        />
      ))}
    </div>
  );
}
