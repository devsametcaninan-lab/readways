import type { ApiErrorBody } from "@/lib/ai-dictionary/types";
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
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new Error(body?.error ?? "Could not save word.");
  }

  return response.json() as Promise<SaveWordResponse>;
}
