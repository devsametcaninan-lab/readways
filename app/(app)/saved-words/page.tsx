import SavedWordsView from "@/components/saved-words/SavedWordsView";
import { getSavedWordsForUser } from "@/lib/saved-words/server";

export default async function SavedWordsPage() {
  const words = await getSavedWordsForUser();

  return <SavedWordsView initialWords={words} />;
}
