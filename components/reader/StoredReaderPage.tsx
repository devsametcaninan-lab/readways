"use client";

import { use, useEffect, useState } from "react";
import { getDocument, type StoredReaderDocument } from "@/lib/document-storage";
import ReaderDocumentMissing from "./ReaderDocumentMissing";
import ReaderView from "./ReaderView";

type StoredReaderPageProps = {
  params: Promise<{ documentId: string }>;
};

export default function StoredReaderPage({ params }: StoredReaderPageProps) {
  const { documentId } = use(params);
  const [document, setDocument] = useState<StoredReaderDocument | null | undefined>(undefined);

  useEffect(() => {
    setDocument(getDocument(documentId));
  }, [documentId]);

  if (document === undefined) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-16">
        <p className="text-sm text-zinc-500">Loading document…</p>
      </div>
    );
  }

  if (!document) {
    return <ReaderDocumentMissing documentId={documentId} />;
  }

  return <ReaderView variant="stored" storedDocument={document} />;
}
