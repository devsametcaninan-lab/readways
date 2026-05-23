import Link from "next/link";
import AppCard from "@/components/app/AppCard";
import { appText } from "@/components/app/app-typography";
import { libraryDocuments } from "@/lib/mock-data";

export default function LibraryPage() {
  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">Library</h1>
          <p className={`mt-2 ${appText.body}`}>Your uploaded PDFs and reading materials.</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-accent/30 bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D7EFF]"
        >
          Upload PDF
        </button>
      </div>

      <div className="space-y-3">
        {libraryDocuments.map((doc) => (
          <AppCard key={doc.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className={`truncate ${appText.title}`}>{doc.title}</p>
              <p className={`mt-1.5 ${appText.metaSmall}`}>
                {doc.source} · Updated {doc.updatedAt}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32">
                <div className={`mb-1 flex justify-between ${appText.metaSmall}`}>
                  <span>{doc.progress}%</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/[0.1]">
                  <div
                    className="h-full rounded-full bg-accent/70"
                    style={{ width: `${doc.progress}%` }}
                  />
                </div>
              </div>
              <Link
                href="/reader/demo"
                className="shrink-0 text-[12px] text-accentSoft transition-colors hover:text-white"
              >
                Open
              </Link>
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  );
}
