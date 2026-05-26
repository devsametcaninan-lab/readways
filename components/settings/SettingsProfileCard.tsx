"use client";

import AppCard from "@/components/app/AppCard";
import { useAppUser } from "@/components/app/use-app-user";

export default function SettingsProfileCard() {
  const { name, email, planLabel, loading } = useAppUser();

  return (
    <AppCard>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
        Profile
      </p>
      <p className="mt-3 text-sm text-slate-300">Name</p>
      <p className="mt-1 text-base text-white">
        {loading ? "…" : name}
      </p>
      <p className="mt-4 text-sm text-slate-300">Email</p>
      <p className="mt-1 text-base text-white">
        {loading ? "…" : email || "—"}
      </p>
      <p className="mt-4 text-sm text-slate-300">Plan</p>
      <p className="mt-1 text-base text-white">
        {loading ? "…" : planLabel}
      </p>
    </AppCard>
  );
}
