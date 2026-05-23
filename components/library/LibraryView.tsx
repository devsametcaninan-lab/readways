"use client";

import { appText } from "@/components/app/app-typography";
import UploadPdfButton from "@/components/upload/UploadPdfButton";
import { libraryDocuments } from "@/lib/mock-data";
import DocumentCard from "./DocumentCard";

export default function LibraryView() {
  const hasDocuments = libraryDocuments.length > 0;

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">Library</h1>
          <p className={`mt-2 ${appText.body}`}>Your uploaded PDFs and reading materials.</p>
        </div>
        <UploadPdfButton />
      </div>

      {hasDocuments ? (
        <>
          <p className={`mb-4 ${appText.label}`}>Recent documents</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {libraryDocuments.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-white/[0.12] bg-[#12141d] px-6 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <p className="text-base font-medium text-zinc-200">No documents yet</p>
          <p className="mt-2 text-sm text-zinc-400">
            Upload a PDF to start reading and saving vocabulary from your texts.
          </p>
          <div className="mt-6 flex justify-center">
            <UploadPdfButton className="rounded-full border border-accent/30 bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D7EFF]" />
          </div>
        </div>
      )}
    </div>
  );
}
