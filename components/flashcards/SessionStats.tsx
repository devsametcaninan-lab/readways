import { appText } from "@/components/app/app-typography";
import type { SessionStats as SessionStatsType } from "@/lib/flashcards/types";
import { useI18n } from "@/lib/i18n/provider";

type SessionStatsProps = {
  stats: SessionStatsType;
};

export default function SessionStats({ stats }: SessionStatsProps) {
  const { t } = useI18n();
  const items = [
    { label: t("app.flashcardsStatsDueToday"), value: stats.dueToday },
    { label: t("app.flashcardsStatsLearning"), value: stats.learning },
    { label: t("app.flashcardsStatsMastered"), value: stats.mastered }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/[0.12] bg-[#12141d] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <p className={appText.statLabel}>{item.label}</p>
          <p className="mt-1 text-xl font-medium tabular-nums tracking-tight text-white">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
