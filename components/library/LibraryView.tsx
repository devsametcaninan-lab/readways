"use client";

import AppStateCard from "@/components/app/AppStateCard";
import { appText } from "@/components/app/app-typography";
import UploadPdfButton from "@/components/upload/UploadPdfButton";
import { useUserDocuments } from "@/lib/documents/use-user-documents";
import DocumentCard from "./DocumentCard";

export default function LibraryView() {
  const { documents, loading, error, reload } = useUserDocuments();

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">Library</h1>
          <p className={`mt-2 ${appText.body}`}>Your uploaded PDFs and reading materials.</p>
        </div>
        <UploadPdfButton />
      </div>

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
          title="Couldn't load your library"
          description="Check your connection and try again. Your documents are still safe."
          action={{ label: "Try again", onClick: reload }}
        />
      ) : documents.length > 0 ? (
        <>
          <p className={`mb-4 ${appText.label}`}>Recent documents</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </>
      ) : (
        <AppStateCard
          icon="upload"
          title="No documents yet"
          description="Upload your first PDF to start building vocabulary while you read."
        >
          <div className="mt-6 flex justify-center">
            <UploadPdfButton />
          </div>
        </AppStateCard>
      )}
    </div>
  );
}
