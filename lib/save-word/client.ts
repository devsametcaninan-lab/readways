import { parseApiErrorMessage } from "@/lib/api/client-error";
import type { SaveWordResponse } from "./types";

export async function fetchSaveWord(params: {
  documentId: string;
  wordExplanationId: string;
  word: string;
}): Promise<SaveWordResponse> {
  const response = await fetch("/api/save-word", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Could not save word."));
  }

  return response.json() as Promise<SaveWordResponse>;
}
