import type { ExplainWordPayload } from "@/lib/ai-dictionary/types";
import { cleanPhraseText } from "./phrase-selection";
import {
  explainWordPayloadToPanelFields,
  type ExplainClickKind
} from "./explain-word-client";
import type { ExplainLocalCache, ExplainLocalCacheEntry } from "./explain-local-cache";
import { cleanDisplayWord } from "./text-tokens";

export function storeExplainResultInLocalCache(
  cache: ExplainLocalCache,
  requestKey: string,
  payload: ExplainWordPayload,
  rawWord: string,
  kind: ExplainClickKind
): ExplainLocalCacheEntry | null {
  const fields = explainWordPayloadToPanelFields(payload);

  if (
    !fields.wordExplanationId ||
    !fields.definition.trim() ||
    !fields.contextMeaning.trim()
  ) {
    return null;
  }

  const displayLabel =
    kind === "phrase"
      ? cleanPhraseText(rawWord) || cleanPhraseText(fields.word)
      : cleanDisplayWord(fields.word) || cleanDisplayWord(rawWord);

  const entry: ExplainLocalCacheEntry = {
    fields,
    displayLabel,
    savedAt: Date.now()
  };

  cache.set(requestKey, entry);
  return entry;
}
