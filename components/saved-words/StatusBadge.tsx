import type { WordStatus } from "@/lib/saved-words/types";
import { useI18n } from "@/lib/i18n/provider";

const styles: Record<WordStatus, string> = {
  learning: "border-accent/30 bg-accent/10 text-accentSoft",
  reviewing: "border-white/[0.14] bg-white/[0.05] text-zinc-300",
  mastered: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300/90"
};

export default function StatusBadge({ status }: { status: WordStatus }) {
  const { t } = useI18n();
  const localizedLabel =
    status === "learning"
      ? t("app.statusLearning")
      : status === "reviewing"
        ? t("app.statusReviewing")
        : t("app.statusMastered");

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${styles[status]}`}
    >
      {localizedLabel}
    </span>
  );
}
