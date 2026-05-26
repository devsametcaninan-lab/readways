"use client";

import Link from "next/link";
import { trackAnalyticsEventClient } from "@/lib/analytics/client";
import { upgradeCtaLabel } from "@/lib/billing/messages";

type UpgradeCtaProps = {
  source: string;
  className?: string;
};

export default function UpgradeCta({ source, className = "" }: UpgradeCtaProps) {
  return (
    <Link
      href="/settings#upgrade"
      onClick={() => {
        trackAnalyticsEventClient({
          eventName: "upgrade_cta_clicked",
          metadata: { source }
        });
      }}
      className={`inline-flex items-center justify-center rounded-md border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-medium text-[#c5cdff] transition-colors hover:bg-accent/20 hover:text-white ${className}`}
    >
      {upgradeCtaLabel()}
    </Link>
  );
}
