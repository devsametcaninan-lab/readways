import { NextResponse } from "next/server";
import type { ApiErrorBody, ExplainWordPayload, ExplainWordUsage } from "./types";

export function jsonError(status: number, message: string): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: message }, { status });
}

export function jsonRateLimited(
  message: string,
  usage: ExplainWordUsage
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: message, usage }, { status: 429 });
}

export function jsonExplainWord(payload: ExplainWordPayload): NextResponse<ExplainWordPayload> {
  return NextResponse.json(payload);
}
