"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/feedback/ToastProvider";
import { deleteSavedWord, queueSavedWordReview } from "@/lib/saved-words/client";
import { groupSavedWordsByDocument } from "@/lib/saved-words/group";
import { filterSavedWords, type SavedWordsFilter } from "@/lib/saved-words/search";
import type { SavedWordItem } from "@/lib/saved-words/types";
import { useI18n } from "@/lib/i18n/provider";
import SavedWordCard from "./SavedWordCard";
import SavedWordsEmptyState from "./SavedWordsEmptyState";
import SavedWordsToolbar from "./SavedWordsToolbar";
import WordDetailModal from "./WordDetailModal";

type SavedWordsViewProps = {
  initialWords: SavedWordItem[];
};

export default function SavedWordsView({ initialWords }: SavedWordsViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const [words, setWords] = useState(initialWords);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SavedWordsFilter>("all");
  const [selectedWord, setSelectedWord] = useState<SavedWordItem | null>(null);

  useEffect(() => {
    setWords(initialWords);
  }, [initialWords]);

  const filteredWords = useMemo(
    () => filterSavedWords(words, search, filter),
    [words, search, filter]
  );

  const groupedWords = useMemo(
    () => groupSavedWordsByDocument(filteredWords),
    [filteredWords]
  );

  const handleReviewAgain = useCallback(
    async (item: SavedWordItem) => {
      try {
        await queueSavedWordReview(item.id);
        toast.success(t("app.savedWordsQueuedReview"));
        router.push("/flashcards");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t("app.savedWordsQueueError");
        toast.error(message);
      }
    },
    [router, t, toast]
  );

  const handleRemove = useCallback(
    async (item: SavedWordItem) => {
      try {
        await deleteSavedWord(item.id);
        setWords((current) => current.filter((word) => word.id !== item.id));

        if (selectedWord?.id === item.id) {
          setSelectedWord(null);
        }

        toast.success(`“${item.word}” ${t("app.savedWordsRemovedFromVault")}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t("app.savedWordsRemoveError");
        toast.error(message);
        throw error;
      }
    },
    [selectedWord?.id, t, toast]
  );

  const hasVault = words.length > 0;
  const hasVisibleResults = filteredWords.length > 0;

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <header className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">
          {t("app.savedWordsTitle")}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
          {t("app.savedWordsSubtitle")}
        </p>
      </header>

      {hasVault ? (
        <SavedWordsToolbar
          search={search}
          filter={filter}
          totalCount={words.length}
          visibleCount={filteredWords.length}
          onSearchChange={setSearch}
          onFilterChange={setFilter}
        />
      ) : null}

      {!hasVault ? (
        <SavedWordsEmptyState variant="vault" />
      ) : !hasVisibleResults ? (
        <SavedWordsEmptyState
          variant="no-results"
          onClearFilters={() => {
            setSearch("");
            setFilter("all");
          }}
        />
      ) : (
        <div className="space-y-10">
          {groupedWords.map((group) => (
            <section key={group.key} aria-labelledby={`source-${group.key}`}>
              <h2
                id={`source-${group.key}`}
                className="mb-4 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500"
              >
                {group.title}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.words.map((item) => (
                  <SavedWordCard
                    key={item.id}
                    item={item}
                    onOpenDetail={setSelectedWord}
                    onReviewAgain={handleReviewAgain}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <WordDetailModal
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
        onReviewAgain={handleReviewAgain}
        onRemove={handleRemove}
      />
    </div>
  );
}
