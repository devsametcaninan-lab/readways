import { logDevDebug } from "@/lib/logging/dev-log";

export type ExplainApiTimingBreakdown = {
  totalMs: number;
  authMs?: number;
  parseBodyMs?: number;
  validationMs?: number;
  documentOwnershipMs?: number;
  documentLanguageMs?: number;
  cacheLookupMs?: number;
  usageSnapshotMs?: number;
  allowanceMs?: number;
  openAiMs?: number;
  aiValidationMs?: number;
  insertMs?: number;
  usageIncrementMs?: number;
};

export type ExplainClientTiming = {
  clickAt: number;
  requestSentAt?: number;
  responseReceivedAt?: number;
  panelDispatchAt?: number;
  panelRenderedAt?: number;
  kind: "word" | "phrase";
  wordLength: number;
  sentenceLength: number;
  cacheStatus?: "hit" | "miss";
  server?: ExplainApiTimingBreakdown;
};

export function roundedMs(value: number | undefined): number | undefined {
  if (value == null || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.max(0, Math.round(value));
}

export function elapsedMs(from: number, to: number): number {
  return Math.max(0, Math.round(to - from));
}

export function withTimingHeaders(
  response: Response,
  cacheStatus: "hit" | "miss",
  timing: ExplainApiTimingBreakdown
): Response {
  response.headers.set("X-ReadWays-Cache", cacheStatus);

  const totalMs = roundedMs(timing.totalMs) ?? 0;
  response.headers.set("X-ReadWays-Timing-Total-Ms", String(totalMs));

  const headerParts = [`total;dur=${totalMs}`];
  const map: Array<[string, number | undefined]> = [
    ["auth", timing.authMs],
    ["parse_body", timing.parseBodyMs],
    ["validation", timing.validationMs],
    ["document_ownership", timing.documentOwnershipMs],
    ["document_language", timing.documentLanguageMs],
    ["cache_lookup", timing.cacheLookupMs],
    ["usage_snapshot", timing.usageSnapshotMs],
    ["allowance", timing.allowanceMs],
    ["openai", timing.openAiMs],
    ["ai_validation", timing.aiValidationMs],
    ["insert", timing.insertMs],
    ["usage_increment", timing.usageIncrementMs]
  ];

  for (const [name, value] of map) {
    const ms = roundedMs(value);
    if (ms == null) {
      continue;
    }
    response.headers.set(`X-ReadWays-Timing-${name}-Ms`, String(ms));
    headerParts.push(`${name};dur=${ms}`);
  }

  response.headers.set("Server-Timing", headerParts.join(", "));
  return response;
}

function readTimingHeader(response: Response, name: string): number | undefined {
  const raw = response.headers.get(`X-ReadWays-Timing-${name}-Ms`);
  if (!raw) {
    return undefined;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : undefined;
}

export function parseExplainTimingHeaders(response: Response): ExplainApiTimingBreakdown {
  const totalHeader = response.headers.get("X-ReadWays-Timing-Total-Ms");
  const parsedTotal = totalHeader ? Number(totalHeader) : NaN;
  const totalMs =
    Number.isFinite(parsedTotal) ? Math.max(0, Math.round(parsedTotal)) : 0;

  return {
    totalMs,
    authMs: readTimingHeader(response, "auth"),
    parseBodyMs: readTimingHeader(response, "parse_body"),
    validationMs: readTimingHeader(response, "validation"),
    documentOwnershipMs: readTimingHeader(response, "document_ownership"),
    documentLanguageMs: readTimingHeader(response, "document_language"),
    cacheLookupMs: readTimingHeader(response, "cache_lookup"),
    usageSnapshotMs: readTimingHeader(response, "usage_snapshot"),
    allowanceMs: readTimingHeader(response, "allowance"),
    openAiMs: readTimingHeader(response, "openai"),
    aiValidationMs: readTimingHeader(response, "ai_validation"),
    insertMs: readTimingHeader(response, "insert"),
    usageIncrementMs: readTimingHeader(response, "usage_increment")
  };
}

export function parseExplainCacheStatus(response: Response): "hit" | "miss" | undefined {
  const value = response.headers.get("X-ReadWays-Cache");
  if (value === "hit" || value === "miss") {
    return value;
  }

  return undefined;
}

export function logExplainApiTiming(
  cacheStatus: "hit" | "miss",
  timing: ExplainApiTimingBreakdown,
  meta: {
    documentId: string;
    wordLength: number;
    sentenceLength: number;
    explanationKind: "word" | "phrase";
  }
): void {
  logDevDebug("explain-word:api", {
    cacheStatus,
    explanationKind: meta.explanationKind,
    documentId: meta.documentId,
    wordLength: meta.wordLength,
    sentenceLength: meta.sentenceLength,
    totalMs: roundedMs(timing.totalMs),
    authMs: roundedMs(timing.authMs),
    parseBodyMs: roundedMs(timing.parseBodyMs),
    validationMs: roundedMs(timing.validationMs),
    documentOwnershipMs: roundedMs(timing.documentOwnershipMs),
    documentLanguageMs: roundedMs(timing.documentLanguageMs),
    cacheLookupMs: roundedMs(timing.cacheLookupMs),
    usageSnapshotMs: roundedMs(timing.usageSnapshotMs),
    allowanceMs: roundedMs(timing.allowanceMs),
    openAiMs: roundedMs(timing.openAiMs),
    aiValidationMs: roundedMs(timing.aiValidationMs),
    insertMs: roundedMs(timing.insertMs),
    usageIncrementMs: roundedMs(timing.usageIncrementMs)
  });
}

export function logExplainClientTiming(timing: ExplainClientTiming): void {
  const clickToRequestMs =
    timing.requestSentAt != null
      ? elapsedMs(timing.clickAt, timing.requestSentAt)
      : undefined;
  const requestToResponseMs =
    timing.requestSentAt != null && timing.responseReceivedAt != null
      ? elapsedMs(timing.requestSentAt, timing.responseReceivedAt)
      : undefined;
  const responseToPanelDispatchMs =
    timing.responseReceivedAt != null && timing.panelDispatchAt != null
      ? elapsedMs(timing.responseReceivedAt, timing.panelDispatchAt)
      : undefined;
  const responseToPanelRenderedMs =
    timing.responseReceivedAt != null && timing.panelRenderedAt != null
      ? elapsedMs(timing.responseReceivedAt, timing.panelRenderedAt)
      : undefined;
  const clickToPanelRenderedMs =
    timing.panelRenderedAt != null
      ? elapsedMs(timing.clickAt, timing.panelRenderedAt)
      : undefined;

  logDevDebug("explain-word:client", {
    kind: timing.kind,
    wordLength: timing.wordLength,
    sentenceLength: timing.sentenceLength,
    cacheStatus: timing.cacheStatus,
    clickToRequestMs,
    networkMs: requestToResponseMs,
    responseToPanelDispatchMs,
    responseToPanelRenderedMs,
    clickToPanelRenderedMs,
    serverTotalMs: roundedMs(timing.server?.totalMs),
    serverOpenAiMs: roundedMs(timing.server?.openAiMs),
    serverCacheLookupMs: roundedMs(timing.server?.cacheLookupMs),
    serverAllowanceMs: roundedMs(timing.server?.allowanceMs)
  });
}
