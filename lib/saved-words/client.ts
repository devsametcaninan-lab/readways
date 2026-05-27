import { parseApiErrorMessage } from "@/lib/api/client-error";

export async function deleteSavedWord(savedWordId: string): Promise<void> {
  const response = await fetch(`/api/saved-words/${savedWordId}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error(
      await parseApiErrorMessage(response, "Could not remove word. Please try again.")
    );
  }
}

export async function queueSavedWordReview(savedWordId: string): Promise<void> {
  const response = await fetch(`/api/saved-words/${savedWordId}/queue-review`, {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(
      await parseApiErrorMessage(response, "Could not queue review. Please try again.")
    );
  }
}
