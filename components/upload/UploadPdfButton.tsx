"use client";

import { useUploadPdf } from "./UploadPdfContext";
import { useI18n } from "@/lib/i18n/provider";

type UploadPdfButtonProps = {
  className?: string;
  label?: string;
};

const defaultClassName =
  "shrink-0 rounded-full border border-accent/30 bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-premium transition hover:bg-[#6D7EFF]";

export default function UploadPdfButton({
  className = defaultClassName,
  label
}: UploadPdfButtonProps) {
  const { t } = useI18n();
  const { openUpload } = useUploadPdf();
  const resolvedLabel = label ?? t("app.uploadPdfTitle");

  return (
    <button type="button" onClick={openUpload} className={className}>
      {resolvedLabel}
    </button>
  );
}
