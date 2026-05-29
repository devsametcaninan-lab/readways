import AppStateCard, { AppStatePage } from "@/components/app/AppStateCard";
import { getServerT } from "@/lib/i18n/server";

export default function ReaderEmptyState() {
  const t = getServerT();

  return (
    <AppStatePage>
      <div className="w-full max-w-md">
        <AppStateCard
          icon="reader"
          title={t("app.readerNoDocumentTitle")}
          description={t("app.readerNoDocumentBody")}
          action={{ label: t("app.savedWordsGoLibrary"), href: "/library" }}
          secondaryAction={{ label: t("app.uploadPdfTitle"), href: "/library?upload=1", variant: "secondary" }}
        />
      </div>
    </AppStatePage>
  );
}
