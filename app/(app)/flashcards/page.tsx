import FlashcardsReviewView from "@/components/flashcards/FlashcardsReviewView";
import { getDueFlashcardsForUser } from "@/lib/flashcards/server";

export default async function FlashcardsPage() {
  const { deck, stats } = await getDueFlashcardsForUser();

  return <FlashcardsReviewView initialDeck={deck} initialStats={stats} />;
}
