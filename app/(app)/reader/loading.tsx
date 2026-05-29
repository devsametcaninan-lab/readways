import AppRouteLoading from "@/components/app/AppRouteLoading";
import { getServerT } from "@/lib/i18n/server";

export default function ReaderLoading() {
  const t = getServerT();
  return <AppRouteLoading label={t("app.readerOpeningDocument")} />;
}
