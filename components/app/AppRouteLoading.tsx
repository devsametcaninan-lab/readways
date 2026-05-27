"use client";

import Spinner from "@/components/feedback/Spinner";
import { useI18n } from "@/lib/i18n/provider";

type AppRouteLoadingProps = {
  label?: string;
  fullScreen?: boolean;
};

export default function AppRouteLoading({
  label,
  fullScreen = false
}: AppRouteLoadingProps) {
  const { t } = useI18n();
  const resolvedLabel = label ?? t("auth.loadingWorkspace");

  return (
    <div
      className={
        fullScreen
          ? "flex min-h-screen items-center justify-center bg-[#0a0b10] px-6"
          : "flex min-h-[min(70vh,520px)] items-center justify-center px-6 py-16"
      }
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <Spinner className="h-5 w-5 text-zinc-400" />
        <p className="text-sm text-zinc-500">{resolvedLabel}</p>
      </div>
    </div>
  );
}
