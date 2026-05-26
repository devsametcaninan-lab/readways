async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) {
      return body.error;
    }
  } catch {
    // ignore
  }

  return "Something went wrong. Please try again.";
}

export async function deleteSavedWord(savedWordId: string): Promise<void> {
  const response = await fetch(`/api/saved-words/${savedWordId}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

export async function queueSavedWordReview(savedWordId: string): Promise<void> {
  const response = await fetch(`/api/saved-words/${savedWordId}/queue-review`, {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}
