import AppStateCard, { AppStatePage } from "@/components/app/AppStateCard";
import { getServerT } from "@/lib/i18n/server";

export default function ReaderDocumentMissing() {
  const t = getServerT();

  return (
    <AppStatePage>
      <div className="w-full max-w-md">
        <AppStateCard
          variant="warning"
          icon="document"
          title={t("app.readerDocumentNotFound")}
          description={t("app.readerDocumentNotFoundBody")}
          action={{ label: t("app.readerBackLibrary"), href: "/library" }}
        />
      </div>
    </AppStatePage>
  );
}
