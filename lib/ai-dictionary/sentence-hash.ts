import { createHash } from "node:crypto";

/**
 * Stable hash for a sentence context (used with normalized word for cache lookup).
 */
export function createSentenceHash(sentence: string): string {
  return createHash("sha256").update(sentence.trim(), "utf8").digest("hex");
}
