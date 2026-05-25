"use client";

import { useMemo, useState } from "react";
import {
  statusLabels,
  type SavedWordItem,
  type WordStatus
} from "@/lib/saved-words/types";
import StatusBadge from "./StatusBadge";
import WordDetailModal from "./WordDetailModal";

type FilterValue = "all" | WordStatus;

const filters: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "learning", label: statusLabels.learning },
  { value: "reviewing", label: statusLabels.reviewing },
  { value: "mastered", label: statusLabels.mastered }
];

type SavedWordsViewProps = {
  initialWords: SavedWordItem[];
};

export default function SavedWordsView({ initialWords }: SavedWordsViewProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [selectedWord, setSelectedWord] = useState<SavedWordItem | null>(null);
  const [reviewQueued, setReviewQueued] = useState<string | null>(null);

  const filteredWords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return initialWords.filter((item) => {
      const matchesFilter = filter === "all" || item.status === filter;
      const matchesSearch =
        !query ||
        item.word.toLowerCase().includes(query) ||
        item.meaning.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [initialWords, search, filter]);

  const handleReviewAgain = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReviewQueued(id);
    window.setTimeout(() => setReviewQueued(null), 2000);
  };

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">Saved Words</h1>
        <p className="mt-2 text-sm text-zinc-400">Words you&apos;ve collected while reading.</p>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Search words, meanings, or sources…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-white/[0.12] bg-[#12141d] px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 transition focus:border-white/20 focus:outline-none sm:max-w-md"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterValue)}
          className="rounded-lg border border-white/[0.12] bg-[#12141d] px-4 py-2.5 text-sm text-zinc-300 transition focus:border-white/20 focus:outline-none sm:w-44"
        >
          {filters.map((f) => (
            <option key={f.value} value={f.value} className="bg-[#12141d]">
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {filteredWords.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.12] bg-[#12141d] px-6 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <p className="text-base font-medium text-zinc-200">Your vocabulary collection is empty.</p>
          <p className="mt-2 text-sm text-zinc-400">
            Start reading and save words from your documents.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredWords.map((item) => (
            <article
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedWord(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedWord(item);
                }
              }}
              className="group flex cursor-pointer flex-col rounded-xl border border-white/[0.12] bg-[#12141d] p-5 text-left shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-[#141820] hover:shadow-[0_16px_48px_rgba(124,140,255,0.08)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-medium text-zinc-100 group-hover:text-white">
                    {item.word}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">{item.pronunciation}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">{item.meaning}</p>
              <p className="mt-3 text-xs text-zinc-500">{item.source}</p>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.08] pt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWord(item);
                  }}
                  className="rounded-md border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 transition hover:border-white/[0.16] hover:text-zinc-200"
                >
                  View context
                </button>
                <button
                  type="button"
                  onClick={(e) => handleReviewAgain(item.id, e)}
                  className="rounded-md border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 transition hover:border-white/[0.16] hover:text-zinc-200"
                >
                  {reviewQueued === item.id ? "Queued" : "Review again"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <WordDetailModal word={selectedWord} onClose={() => setSelectedWord(null)} />
    </div>
  );
}
