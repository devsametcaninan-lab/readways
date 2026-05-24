import Link from "next/link";
import AppCard from "@/components/app/AppCard";
import { appText } from "@/components/app/app-typography";
import type { DocumentListItem } from "@/lib/documents/types";

type DocumentCardProps = {
  document: DocumentListItem;
};

const statusLabel: Record<DocumentListItem["status"], string> = {
  processing: "Processing",
  ready: "Ready",
  failed: "Failed"
};

export default function DocumentCard({ document: doc }: DocumentCardProps) {
  const canRead = doc.status === "ready";
  const href = canRead ? `/reader/${doc.id}` : undefined;

  const body = (
    <>
      <div className="min-w-0 flex-1">
        <p className={`truncate ${appText.titleLg}`}>{doc.title}</p>
        <p className={`mt-1.5 ${appText.metaSmall}`}>
          {doc.source} · Updated {doc.updatedAtLabel}
          {doc.status !== "ready" ? ` · ${statusLabel[doc.status]}` : ""}
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
          {doc.pageCount > 0 ? (
            <span className="text-zinc-600"> · {doc.pageCount} pages</span>
          ) : null}
        </p>
      </div>

      <span
        className={`mt-5 inline-flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-sm transition ${
          canRead
            ? "border-white/[0.12] bg-white/[0.04] text-zinc-200 hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-white"
            : "cursor-default border-white/[0.08] bg-white/[0.02] text-zinc-500"
        }`}
      >
        {canRead ? "Continue reading" : statusLabel[doc.status]}
      </span>
    </>
  );

  return (
    <AppCard className="flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),0_0_28px_rgba(124,140,255,0.08)]">
      {href ? (
        <Link href={href} className="flex h-full flex-col">
          {body}
        </Link>
      ) : (
        <div className="flex h-full flex-col">{body}</div>
      )}
    </AppCard>
  );
}
