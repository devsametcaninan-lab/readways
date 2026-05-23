import Link from "next/link";

type ReaderDocumentMissingProps = {
  documentId: string;
};

export default function ReaderDocumentMissing({ documentId }: ReaderDocumentMissingProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-base font-medium text-zinc-200">Document not found</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
        This reading session is missing or was cleared from your browser. Uploaded documents are
        stored locally on this device only.
      </p>
      <p className="mt-3 font-mono text-[11px] text-zinc-600">{documentId}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/library"
          className="rounded-lg border border-accent/30 bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D7EFF]"
        >
          Back to Library
        </Link>
        <Link
          href="/reader/demo"
          className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-sm text-zinc-300 transition hover:border-white/[0.16] hover:bg-white/[0.06]"
        >
          Open demo reader
        </Link>
      </div>
    </div>
  );
}
