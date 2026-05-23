import Link from "next/link";
import AppCard from "@/components/app/AppCard";
import { appText } from "@/components/app/app-typography";
import type { Document } from "@/lib/mock-data";

type DocumentCardProps = {
  document: Document;
};

export default function DocumentCard({ document: doc }: DocumentCardProps) {
  return (
    <AppCard className="flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),0_0_28px_rgba(124,140,255,0.08)]">
      <div className="min-w-0 flex-1">
        <p className={`truncate ${appText.titleLg}`}>{doc.title}</p>
        <p className={`mt-1.5 ${appText.metaSmall}`}>
          {doc.source} · Updated {doc.updatedAt}
        </p>

        <div className="mt-5">
          <div className={`mb-1.5 flex justify-between ${appText.metaSmall}`}>
            <span>Reading progress</span>
            <span>{doc.progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.1]">
            <div
              className="h-full rounded-full bg-accent/70 transition-[width] duration-300"
              style={{ width: `${doc.progress}%` }}
            />
          </div>
        </div>

        <p className={`mt-4 ${appText.metaSmall}`}>
          <span className="text-zinc-300">{doc.savedWordsCount}</span> saved words
        </p>
      </div>

      <Link
        href="/reader/demo"
        className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 transition hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-white"
      >
        Continue reading
      </Link>
    </AppCard>
  );
}
