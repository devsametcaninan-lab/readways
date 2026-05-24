import Link from "next/link";

export default function ReaderEmptyState() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-base font-medium text-zinc-200">No document open</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
        Upload a PDF from your library, then open it here to read and save vocabulary in
        context.
      </p>
      <Link
        href="/library"
        className="mt-8 rounded-lg border border-accent/30 bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D7EFF]"
      >
        Go to Library
      </Link>
    </div>
  );
}
