import type { ExplainWordPayload } from "@/lib/ai-dictionary/types";
import type { ExplainClickKind } from "./explain-word-client";
import { storeExplainResultInLocalCache } from "./explain-cache-entry";
import type { ExplainLocalCache, ExplainLocalCacheEntry } from "./explain-local-cache";

const inflightByKey = new Map<string, Promise<ExplainLocalCacheEntry | null>>();

export function isExplainFetchInFlight(requestKey: string): boolean {
  return inflightByKey.has(requestKey);
}

export async function resolveExplainIntoCache(params: {
  requestKey: string;
  cache: ExplainLocalCache;
  rawWord: string;
  kind: ExplainClickKind;
  signal?: AbortSignal;
  fetchPayload: () => Promise<ExplainWordPayload>;
}): Promise<ExplainLocalCacheEntry | null> {
  const cached = params.cache.get(params.requestKey);
  if (cached) {
    return cached;
  }

  const existing = inflightByKey.get(params.requestKey);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    try {
      const payload = await params.fetchPayload();
      if (params.signal?.aborted) {
        return null;
      }

      return storeExplainResultInLocalCache(
        params.cache,
        params.requestKey,
        payload,
        params.rawWord,
        params.kind
      );
    } catch (error) {
      if (error instanceof Error && "paywall" in error) {
        throw error;
      }

      return null;
    } finally {
      inflightByKey.delete(params.requestKey);
    }
  })();

  inflightByKey.set(params.requestKey, promise);
  return promise;
}
