import { parseApiErrorMessage } from "@/lib/api/client-error";
import { collectBrowserMetadata } from "./collect-browser-metadata";
import type { FeedbackType } from "./types";

export type SubmitFeedbackParams = {
  type: FeedbackType;
  message: string;
  route: string;
};

export async function submitFeedback(params: SubmitFeedbackParams): Promise<void> {
  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: params.type,
      message: params.message,
      route: params.route,
      metadata: collectBrowserMetadata()
    })
  });

  if (!response.ok) {
    const message = await parseApiErrorMessage(
      response,
      "Could not send feedback. Please try again."
    );
    throw new Error(message);
  }
}
