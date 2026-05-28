"use client";

import { useCallback, useMemo, useState } from "react";
import AppStateCard from "@/components/app/AppStateCard";
import { appText } from "@/components/app/app-typography";
import LibraryFirstUpload from "@/components/library/LibraryFirstUpload";
import WelcomeOnboarding from "@/components/onboarding/WelcomeOnboarding";
import UploadPdfButton from "@/components/upload/UploadPdfButton";
import { useUserDocuments } from "@/lib/documents/use-user-documents";
import { useI18n } from "@/lib/i18n/provider";
import DocumentCard from "./DocumentCard";

export default function LibraryView() {
  const { t } = useI18n();
  const { documents, loading, error, reload } = useUserDocuments();
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

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">
            {t("app.libraryTitle")}
          </h1>
          <p className={`mt-2 ${appText.body}`}>{t("app.librarySubtitle")}</p>
        </div>
        <UploadPdfButton />
      </div>

      <WelcomeOnboarding />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[220px] animate-pulse rounded-xl border border-white/[0.12] bg-[#12141d]"
            />
          ))}
        </div>
      ) : error ? (
        <AppStateCard
          variant="error"
          icon="library"
          title={t("app.libraryLoadErrorTitle")}
          description={t("app.libraryLoadErrorBody")}
          action={{ label: t("app.commonTryAgain"), onClick: reload }}
        />
      ) : visibleDocuments.length > 0 ? (
        <>
          <p className={`mb-4 ${appText.label}`}>{t("app.libraryRecentDocuments")}</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDeleted={handleDocumentDeleted}
              />
            ))}
          </div>
        </>
      ) : (
        <LibraryFirstUpload />
      )}
    </div>
  );
}
