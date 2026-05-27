"use client";

import AppStateCard, { AppStatePage } from "@/components/app/AppStateCard";
import { useI18n } from "@/lib/i18n/provider";

type AppRouteErrorProps = {
  reset: () => void;
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
};

export default function AppRouteError({
  reset,
  title,
  description,
  backHref = "/dashboard",
  backLabel
}: AppRouteErrorProps) {
  const { t } = useI18n();
  const resolvedTitle = title ?? t("auth.routeErrorTitle");
  const resolvedDescription = description ?? t("auth.routeErrorDescription");
  const resolvedBackLabel = backLabel ?? t("auth.backToDashboard");

  return (
    <AppStatePage>
      <div className="w-full max-w-md">
        <AppStateCard
          variant="error"
          title={resolvedTitle}
          description={resolvedDescription}
          action={{ label: t("common.tryAgain"), onClick: reset, variant: "primary" }}
          secondaryAction={{ label: resolvedBackLabel, href: backHref, variant: "secondary" }}
        />
      </div>
    </AppStatePage>
  );
}
