import AppCard from "@/components/app/AppCard";
import type { ReactNode } from "react";

export default function SettingsSection({
  title,
  description,
  children,
  id
}: {
  title: string;
  description?: string;
  children: ReactNode;
  id?: string;
}) {
  const card = (
    <AppCard>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
        {title}
      </p>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
      ) : null}
      <div className={description ? "mt-5 space-y-5" : "mt-4 space-y-5"}>{children}</div>
    </AppCard>
  );

  if (!id) {
    return card;
  }

  return <div id={id}>{card}</div>;
}
