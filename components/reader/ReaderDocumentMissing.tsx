import Link from "next/link";

type ReaderDocumentMissingProps = {
  documentId: string;
};

export default function ReaderDocumentMissing({ documentId }: ReaderDocumentMissingProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-base font-medium text-zinc-200">Document not found</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
        This document was not found or you do not have access to it. It may have been removed from
        your library.
      </p>
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
