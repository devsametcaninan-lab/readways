import { NextResponse } from "next/server";
import type { ApiErrorBody, ExplainWordPayload } from "./types";

export function jsonError(status: number, message: string): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: message }, { status });
}

export function jsonExplainWord(payload: ExplainWordPayload): NextResponse<ExplainWordPayload> {
  return NextResponse.json(payload);
}
