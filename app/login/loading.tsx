import AppRouteLoading from "@/components/app/AppRouteLoading";
import { getServerT } from "@/lib/i18n/server";

export default function LoginLoading() {
  const t = getServerT();
  return <AppRouteLoading label={t("common.loading")} fullScreen />;
}
