import AppStateCard, { AppStatePage } from "@/components/app/AppStateCard";
import type { DocumentStatus } from "@/lib/supabase/schema";
import { failureMessageForCode } from "@/lib/documents/failure-reason";
import type { PdfErrorCode } from "@/lib/pdf/errors";

type ReaderDocumentUnavailableProps = {
  status: DocumentStatus;
  failureCode?: PdfErrorCode | null;
};

type StatusPresentation = {
  variant: "default" | "error" | "warning" | "info";
  icon: "processing" | "ocr" | "document";
  title: string;
  body: string;
};

const statusCopy: Record<DocumentStatus, StatusPresentation> = {
  processing: {
    variant: "info",
    icon: "processing",
    title: "Still preparing your PDF",
    body: "We're extracting text so you can read and tap words for explanations. Check back in a moment from your library."
  },
  needs_ocr: {
    variant: "warning",
    icon: "ocr",
    title: "This PDF looks scanned",
    body: "OCR support is coming soon. For now, try uploading a text-based PDF with selectable text."
  },
  ready: {
    variant: "warning",
    icon: "document",
    title: "Not ready to open yet",
    body: "This document isn't available in the reader right now. Return to your library to see its status."
  },
  failed: {
    variant: "error",
    icon: "document",
    title: "Couldn't prepare this PDF",
    body: "Text extraction didn't succeed. Try a different file, or upload a PDF with selectable text."
  }
};

export default function ReaderDocumentUnavailable({
  status,
  failureCode = null
}: ReaderDocumentUnavailableProps) {
  const copy = statusCopy[status];
  const failureMessage = failureMessageForCode(failureCode);
  const description =
    status === "failed" && failureMessage ? failureMessage : copy.body;

  return (
    <AppStatePage>
      <div className="w-full max-w-md">
        <AppStateCard
          variant={copy.variant}
          icon={copy.icon}
          title={copy.title}
          description={description}
          action={{ label: "Back to Library", href: "/library" }}
        />
      </div>
    </AppStatePage>
  );
}
