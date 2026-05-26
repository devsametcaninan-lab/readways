import type { ApiErrorBody } from "@/lib/ai-dictionary/types";
import { isRateLimitMessage } from "@/lib/feedback/messages";

export type ExplainLimitPaywall = {
  title: string;
  message: string;
};

export function parseExplainLimitPaywall(body: ApiErrorBody | null): ExplainLimitPaywall | null {
  if (!body) {
    return null;
  }

  if (body.code === "limit_reached" || isRateLimitMessage(body.error)) {
    return {
      title: body.title ?? "Daily AI limit reached",
      message: body.error
    };
  }

  return null;
}
