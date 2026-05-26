"use client";

import AppStateCard from "@/components/app/AppStateCard";
import UploadPdfButton from "@/components/upload/UploadPdfButton";
import { PDF_UPLOAD_LIMITS_DETAIL } from "@/lib/upload/limits-label";

export default function LibraryFirstUpload() {
  return (
    <AppStateCard
      icon="upload"
      title="Start with your first PDF"
      description="Upload a document and build vocabulary while you read — tap words for meanings, save what matters, and review later."
      className="max-w-xl mx-auto"
    >
      <p className="mx-auto mt-4 max-w-sm rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12px] leading-relaxed text-zinc-500">
        {PDF_UPLOAD_LIMITS_DETAIL}
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <UploadPdfButton
          label="Upload your first PDF"
          className="min-h-[44px] w-full rounded-lg border border-accent/30 bg-accent px-6 py-3 text-sm font-medium text-white shadow-[0_8px_28px_rgba(124,140,255,0.18)] transition hover:bg-[#6D7EFF] sm:w-auto"
        />
      </div>
    </AppStateCard>
  );
}
