/** Disable with NEXT_PUBLIC_EXPLAIN_PREFETCH=0 */
export function isExplainPrefetchEnabled(): boolean {
  return process.env.NEXT_PUBLIC_EXPLAIN_PREFETCH !== "0";
}

export const EXPLAIN_PREFETCH_MAX_CONCURRENT = 3;
export const EXPLAIN_PREFETCH_ROOT_MARGIN = "240px 0px";
export const EXPLAIN_PREFETCH_INITIAL_PARAGRAPHS = 2;
