"use client";

import type { SavedWordsFilter } from "@/lib/saved-words/search";
import { useI18n } from "@/lib/i18n/provider";

type SavedWordsToolbarProps = {
  search: string;
  filter: SavedWordsFilter;
  totalCount: number;
  visibleCount: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: SavedWordsFilter) => void;
};

export default function SavedWordsToolbar({
  search,
  filter,
  totalCount,
  visibleCount,
  onSearchChange,
  onFilterChange
}: SavedWordsToolbarProps) {
  const { t } = useI18n();
  const filters: { value: SavedWordsFilter; label: string }[] = [
    { value: "all", label: t("app.savedWordsFilterAll") },
    { value: "learning", label: t("app.statusLearning") },
    { value: "reviewing", label: t("app.statusReviewing") },
    { value: "mastered", label: t("app.statusMastered") }
  ];

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <input
            type="search"
            placeholder={t("app.savedWordsSearchPlaceholder")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-white/[0.12] bg-[#12141d] py-2.5 pl-4 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 transition focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
            aria-label={t("app.savedWordsSearchAria")}
          />
        </div>
        <p className="text-[12px] text-zinc-500 sm:ml-auto">
          {visibleCount === totalCount
            ? `${totalCount} ${t("app.savedWordsEntries")}`
            : `${visibleCount} ${t("app.savedWordsOfTotal")} ${totalCount}`}
        </p>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label={t("app.savedWordsFilterAria")}
      >
        {filters.map((item) => {
          const active = filter === item.value;

          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onFilterChange(item.value)}
              className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition ${
                active
                  ? "border-accent/30 bg-accent/15 text-accentSoft"
                  : "border-white/[0.1] bg-white/[0.02] text-zinc-400 hover:border-white/[0.16] hover:bg-white/[0.04] hover:text-zinc-200"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
