"use client";

import { useUploadPdf } from "./UploadPdfContext";

type UploadPdfButtonProps = {
  className?: string;
  label?: string;
};

const defaultClassName =
  "shrink-0 rounded-full border border-accent/30 bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-premium transition hover:bg-[#6D7EFF]";

export default function UploadPdfButton({
  className = defaultClassName,
  label = "Upload PDF"
}: UploadPdfButtonProps) {
  const { openUpload } = useUploadPdf();

  return (
    <button type="button" onClick={openUpload} className={className}>
      {label}
    </button>
  );
}
