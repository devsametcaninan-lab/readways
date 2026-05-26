import AppStateCard from "@/components/app/AppStateCard";

type SavedWordsEmptyStateProps =
  | { variant: "vault" }
  | { variant: "no-results"; onClearFilters: () => void };

export default function SavedWordsEmptyState(props: SavedWordsEmptyStateProps) {
  if (props.variant === "no-results") {
    return (
      <AppStateCard
        icon="search"
        title="No matches in your vault"
        description="Try a different search or filter. Your saved words are still here."
        action={{ label: "Clear search & filters", onClick: props.onClearFilters, variant: "secondary" }}
      />
    );
  }

  return (
    <AppStateCard
      icon="library"
      title="No saved words yet"
      description="Tap any word while reading to get an explanation, then save it as a flashcard. Your vocabulary will collect here."
      action={{ label: "Go to Library", href: "/library" }}
      secondaryAction={{ label: "Open Reader", href: "/reader", variant: "secondary" }}
    />
  );
}
