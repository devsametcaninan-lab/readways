import type { ReaderDocument } from "@/lib/documents/types";

/** @deprecated Use ReaderDocument from lib/documents/types — localStorage MVP only */
export type StoredReaderDocument = ReaderDocument & {
  createdAt: string;
};

const STORAGE_PREFIX = "readways:doc:";
const INDEX_KEY = "readways:document-ids";
const MAX_STORED_DOCUMENTS = 20;

function isBrowser() {
  return typeof window !== "undefined";
}

export function createDocumentId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function saveDocument(document: StoredReaderDocument): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(STORAGE_PREFIX + document.id, JSON.stringify(document));

    const ids = getDocumentIds().filter((id) => id !== document.id);
    ids.unshift(document.id);
    localStorage.setItem(INDEX_KEY, JSON.stringify(ids.slice(0, MAX_STORED_DOCUMENTS)));
  } catch {
    throw new Error("Could not save this document in browser storage. The file may be too large.");
  }
}

export function getDocument(id: string): StoredReaderDocument | null {
  if (!isBrowser()) return null;

  const raw = localStorage.getItem(STORAGE_PREFIX + id);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredReaderDocument;
    if (!parsed?.id || !Array.isArray(parsed.paragraphs)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getDocumentIds(): string[] {
  if (!isBrowser()) return [];

  const raw = localStorage.getItem(INDEX_KEY);
  if (!raw) return [];

  try {
    const ids = JSON.parse(raw) as string[];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}
