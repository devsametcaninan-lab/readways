import type { ExplainPanelFields } from "./explain-word-client";

export const EXPLAIN_LOCAL_CACHE_STORAGE_PREFIX = "readways:explain:v1:";
export const EXPLAIN_LOCAL_CACHE_VERSION = 1;
/** Aligns with server-side explanations; stale entries fall through to the API. */
export const EXPLAIN_LOCAL_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const EXPLAIN_LOCAL_CACHE_MAX_ENTRIES = 200;
const PERSIST_DEBOUNCE_MS = 250;

export type ExplainLocalCacheEntry = {
  fields: ExplainPanelFields;
  displayLabel: string;
  savedAt: number;
};

type PersistedExplainCacheStore = {
  version: typeof EXPLAIN_LOCAL_CACHE_VERSION;
  entries: Record<string, ExplainLocalCacheEntry>;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function storageKey(documentId: string): string {
  return `${EXPLAIN_LOCAL_CACHE_STORAGE_PREFIX}${documentId}`;
}

function isValidPanelFields(value: unknown): value is ExplainPanelFields {
  if (!value || typeof value !== "object") {
    return false;
  }

  const fields = value as Record<string, unknown>;

  return (
    typeof fields.wordExplanationId === "string" &&
    typeof fields.word === "string" &&
    typeof fields.definition === "string" &&
    typeof fields.contextMeaning === "string" &&
    typeof fields.pronunciation === "string" &&
    typeof fields.sentence === "string" &&
    (fields.explanationSource === "cache" || fields.explanationSource === "ai") &&
    typeof fields.explanationLanguageLabel === "string"
  );
}

function isValidCacheEntry(value: unknown): value is ExplainLocalCacheEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    isValidPanelFields(entry.fields) &&
    typeof entry.displayLabel === "string" &&
    typeof entry.savedAt === "number" &&
    Number.isFinite(entry.savedAt)
  );
}

function parsePersistedStore(raw: string): Map<string, ExplainLocalCacheEntry> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      (parsed as PersistedExplainCacheStore).version !== EXPLAIN_LOCAL_CACHE_VERSION
    ) {
      return new Map();
    }

    const entries = (parsed as PersistedExplainCacheStore).entries;
    if (!entries || typeof entries !== "object") {
      return new Map();
    }

    const map = new Map<string, ExplainLocalCacheEntry>();
    const now = Date.now();

    for (const [key, entry] of Object.entries(entries)) {
      if (!isValidCacheEntry(entry)) {
        continue;
      }

      if (now - entry.savedAt > EXPLAIN_LOCAL_CACHE_TTL_MS) {
        continue;
      }

      map.set(key, entry);
    }

    return map;
  } catch {
    return new Map();
  }
}

function serializeStore(memory: Map<string, ExplainLocalCacheEntry>): string {
  const entries: Record<string, ExplainLocalCacheEntry> = {};
  for (const [key, entry] of memory.entries()) {
    entries[key] = entry;
  }

  const store: PersistedExplainCacheStore = {
    version: EXPLAIN_LOCAL_CACHE_VERSION,
    entries
  };

  return JSON.stringify(store);
}

export type ExplainLocalCache = {
  get: (requestKey: string) => ExplainLocalCacheEntry | null;
  set: (requestKey: string, entry: ExplainLocalCacheEntry) => void;
};

export function createExplainLocalCache(documentId: string): ExplainLocalCache {
  const memory = new Map<string, ExplainLocalCacheEntry>();
  let hydrated = false;
  let persistTimer: ReturnType<typeof setTimeout> | null = null;

  function ensureHydrated(): void {
    if (hydrated || !isBrowser()) {
      hydrated = true;
      return;
    }

    hydrated = true;

    try {
      const raw = window.localStorage.getItem(storageKey(documentId));
      if (!raw) {
        return;
      }

      const restored = parsePersistedStore(raw);
      for (const [key, entry] of restored.entries()) {
        memory.set(key, entry);
      }
    } catch {
      // Fall back to in-memory only.
    }
  }

  function evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of memory.entries()) {
      if (now - entry.savedAt > EXPLAIN_LOCAL_CACHE_TTL_MS) {
        memory.delete(key);
      }
    }
  }

  function evictOverflow(): void {
    if (memory.size <= EXPLAIN_LOCAL_CACHE_MAX_ENTRIES) {
      return;
    }

    const sorted = [...memory.entries()].sort((a, b) => a[1].savedAt - b[1].savedAt);
    const removeCount = memory.size - EXPLAIN_LOCAL_CACHE_MAX_ENTRIES;

    for (let index = 0; index < removeCount; index += 1) {
      const key = sorted[index]?.[0];
      if (key) {
        memory.delete(key);
      }
    }
  }

  function persistToStorage(): void {
    if (!isBrowser()) {
      return;
    }

    try {
      window.localStorage.setItem(storageKey(documentId), serializeStore(memory));
    } catch {
      // Quota exceeded or private mode — in-memory cache still works.
    }
  }

  function schedulePersist(): void {
    if (!isBrowser()) {
      return;
    }

    if (persistTimer) {
      clearTimeout(persistTimer);
    }

    persistTimer = setTimeout(() => {
      persistTimer = null;
      persistToStorage();
    }, PERSIST_DEBOUNCE_MS);
  }

  return {
    get(requestKey) {
      ensureHydrated();
      evictExpired();

      const entry = memory.get(requestKey);
      if (!entry) {
        return null;
      }

      if (Date.now() - entry.savedAt > EXPLAIN_LOCAL_CACHE_TTL_MS) {
        memory.delete(requestKey);
        schedulePersist();
        return null;
      }

      return entry;
    },

    set(requestKey, entry) {
      ensureHydrated();
      memory.set(requestKey, entry);
      evictOverflow();
      schedulePersist();
    }
  };
}
