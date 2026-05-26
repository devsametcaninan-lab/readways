import type { SavedWordItem } from "./types";
import type { SavedWordStatus } from "@/lib/supabase/schema";

export type SavedWordsFilter = "all" | SavedWordStatus;

export function matchesSavedWordSearch(item: SavedWordItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }

  const haystack = [
    item.word,
    item.definition,
    item.contextualMeaning,
    item.source,
    item.contextSentence
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export function matchesSavedWordFilter(
  item: SavedWordItem,
  filter: SavedWordsFilter
): boolean {
  return filter === "all" || item.status === filter;
}

export function filterSavedWords(
  items: SavedWordItem[],
  query: string,
  filter: SavedWordsFilter
): SavedWordItem[] {
  return items.filter(
    (item) => matchesSavedWordSearch(item, query) && matchesSavedWordFilter(item, filter)
  );
}
