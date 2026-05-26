import type { SavedWordItem } from "./types";

export type SavedWordsDocumentGroup = {
  key: string;
  documentId: string | null;
  title: string;
  words: SavedWordItem[];
};

const UNKNOWN_SOURCE_KEY = "__unknown__";

export function groupSavedWordsByDocument(items: SavedWordItem[]): SavedWordsDocumentGroup[] {
  const map = new Map<string, SavedWordsDocumentGroup>();

  for (const item of items) {
    const key = item.documentId ?? UNKNOWN_SOURCE_KEY;
    const existing = map.get(key);

    if (existing) {
      existing.words.push(item);
      continue;
    }

    map.set(key, {
      key,
      documentId: item.documentId,
      title: item.source,
      words: [item]
    });
  }

  const groups = Array.from(map.values());

  for (const group of groups) {
    group.words.sort(
      (a, b) => new Date(b.savedAtIso).getTime() - new Date(a.savedAtIso).getTime()
    );
  }

  groups.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));

  return groups;
}
