import Link from "next/link";
import type { DocumentStatus } from "@/lib/supabase/schema";

type ReaderDocumentUnavailableProps = {
  documentId: string;
  status: DocumentStatus;
};

const messages: Record<DocumentStatus, { title: string; body: string }> = {
  processing: {
    title: "Document is processing",
    body: "Your PDF is still being prepared. Return to the library and try again in a moment."
  },
  ready: {
    title: "Document unavailable",
    body: "This document is not ready to open in the reader yet."
  },
  failed: {
    title: "Document could not be processed",
    body: "Text extraction failed for this PDF. Try uploading a text-based PDF again."
  }
};

export default function ReaderDocumentUnavailable({
  documentId,
  status
}: ReaderDocumentUnavailableProps) {
  const copy = messages[status];

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-base font-medium text-zinc-200">{copy.title}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">{copy.body}</p>
      <p className="mt-3 font-mono text-[11px] text-zinc-600">{documentId}</p>
      <Link
        href="/library"
        className="mt-8 rounded-lg border border-accent/30 bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D7EFF]"
      >
        Back to Library
      </Link>
    </div>
  );
}
