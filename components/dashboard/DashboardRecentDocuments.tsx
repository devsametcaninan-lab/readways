"use client";

import Link from "next/link";
import AppCard from "@/components/app/AppCard";
import { appText } from "@/components/app/app-typography";
import { useUserDocuments } from "@/lib/documents/use-user-documents";
import type { DocumentListItem } from "@/lib/documents/types";

export default function DashboardRecentDocuments() {
  const { documents, loading, error } = useUserDocuments(3);

  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[148px] animate-pulse rounded-xl border border-white/[0.12] bg-[#12141d]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <AppCard className="p-4">
        <p className="text-sm text-red-400/90">{error}</p>
      </AppCard>
    );
  }

  if (documents.length === 0) {
    return (
      <AppCard className="p-4">
        <p className="text-sm text-zinc-400">No documents yet. Upload a PDF to get started.</p>
      </AppCard>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {documents.map((doc) => {
        const statusLabel: Record<DocumentListItem["status"], string> = {
          processing: "Processing",
          ready: "Ready",
          needs_ocr: "Needs OCR",
          failed: "Failed"
        };

        const canRead = doc.status === "ready";
        const href = canRead ? `/reader/${doc.id}` : "/library";

        return (
          <AppCard key={doc.id} className="p-4">
            <p className={`truncate ${appText.title}`}>{doc.title}</p>
            <p className={`mt-1.5 ${appText.metaSmall}`}>
              PDF · Updated {doc.updatedAtLabel}
              {doc.status !== "ready" ? ` · ${statusLabel[doc.status]}` : ""}
            </p>
            <div className="mt-4">
              <div className={`mb-1.5 flex justify-between ${appText.metaSmall}`}>
                <span>Progress</span>
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
              href={href}
              className={`mt-4 inline-block text-[12px] transition-colors ${
                canRead
                  ? "text-accentSoft hover:text-white"
                  : "text-zinc-500 hover:text-zinc-400"
              }`}
            >
              {canRead ? "Continue reading →" : "View in library →"}
            </Link>
          </AppCard>
        );
      })}
    </div>
  );
}
