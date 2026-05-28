import AppStateCard, { AppStatePage } from "@/components/app/AppStateCard";
import type { DocumentStatus } from "@/lib/supabase/schema";
import { failureMessageForCode } from "@/lib/documents/failure-reason";
import type { PdfErrorCode } from "@/lib/pdf/errors";
import { getServerT } from "@/lib/i18n/server";

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

export default function ReaderDocumentUnavailable({
  status,
  failureCode = null
}: ReaderDocumentUnavailableProps) {
  const t = getServerT();
  const statusCopy: Record<DocumentStatus, StatusPresentation> = {
    processing: {
      variant: "info",
      icon: "processing",
      title: t("app.readerPreparingPdfTitle"),
      body: t("app.readerPreparingPdfBody")
    },
    needs_ocr: {
      variant: "warning",
      icon: "ocr",
      title: t("app.readerScannedPdfTitle"),
      body: t("app.readerScannedPdfBody")
    },
    ready: {
      variant: "warning",
      icon: "document",
      title: t("app.readerNotReadyTitle"),
      body: t("app.readerNotReadyBody")
    },
    failed: {
      variant: "error",
      icon: "document",
      title: t("app.readerPrepareFailedTitle"),
      body: t("app.readerPrepareFailedBody")
    }
  };

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
          action={{ label: t("app.readerBackLibrary"), href: "/library" }}
        />
      </div>
    </AppStatePage>
  );
}
