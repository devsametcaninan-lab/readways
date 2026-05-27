"use client";

import AppStateCard, { AppStatePage } from "@/components/app/AppStateCard";

type AppRouteErrorProps = {
  reset: () => void;
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
};

export default function AppRouteError({
  reset,
  title = "Something went wrong",
  description = "This page hit an unexpected error. Your account and saved data are safe — try again or return to the dashboard.",
  backHref = "/dashboard",
  backLabel = "Back to dashboard"
}: AppRouteErrorProps) {
  return (
    <AppStatePage>
      <div className="w-full max-w-md">
        <AppStateCard
          variant="error"
          title={title}
          description={description}
          action={{ label: "Try again", onClick: reset, variant: "primary" }}
          secondaryAction={{ label: backLabel, href: backHref, variant: "secondary" }}
        />
      </div>
    </AppStatePage>
  );
}
