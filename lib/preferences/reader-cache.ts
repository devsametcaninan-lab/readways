import { EXPLAIN_LOCAL_CACHE_STORAGE_PREFIX } from "@/lib/reader/explain-local-cache";

const LEGACY_DOC_PREFIX = "readways:doc:";
const LEGACY_DOC_INDEX = "readways:document-ids";
const PHRASE_HINT_SESSION_KEY = "readways:phrase-hint:dismissed";

export function clearLocalReaderCache(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  let removed = 0;

  for (const key of Object.keys(window.localStorage)) {
    if (
      key.startsWith(LEGACY_DOC_PREFIX) ||
      key === LEGACY_DOC_INDEX ||
      key.startsWith(EXPLAIN_LOCAL_CACHE_STORAGE_PREFIX)
    ) {
      window.localStorage.removeItem(key);
      removed += 1;
    }
  }

  window.sessionStorage.removeItem(PHRASE_HINT_SESSION_KEY);

  return removed;
}

export function isPhraseHintDismissedForSession(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(PHRASE_HINT_SESSION_KEY) === "1";
}

export function dismissPhraseHintForSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(PHRASE_HINT_SESSION_KEY, "1");
}
