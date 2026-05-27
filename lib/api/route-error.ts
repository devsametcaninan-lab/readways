import { jsonError } from "@/lib/ai-dictionary/http";
import { logServerError } from "@/lib/logging/server-log";
import type { NextResponse } from "next/server";
import type { ApiErrorBody } from "@/lib/ai-dictionary/types";

const DEFAULT_ROUTE_ERROR = "Something went wrong. Please try again.";

export function handleRouteError(
  route: string,
  error: unknown,
  options?: { message?: string }
): NextResponse<ApiErrorBody> {
  logServerError(route, error);
  return jsonError(500, options?.message ?? DEFAULT_ROUTE_ERROR);
}
