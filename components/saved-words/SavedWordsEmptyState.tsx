import AppStateCard from "@/components/app/AppStateCard";
import { useI18n } from "@/lib/i18n/provider";

type SavedWordsEmptyStateProps =
  | { variant: "vault" }
  | { variant: "no-results"; onClearFilters: () => void };

export default function SavedWordsEmptyState(props: SavedWordsEmptyStateProps) {
  const { t } = useI18n();
  if (props.variant === "no-results") {
    return (
      <AppStateCard
        icon="search"
        title={t("app.savedWordsNoResultsTitle")}
        description={t("app.savedWordsNoResultsBody")}
        action={{ label: t("app.savedWordsClearSearchFilters"), onClick: props.onClearFilters, variant: "secondary" }}
      />
    );
  }

  return (
    <AppStateCard
      icon="library"
      title={t("app.savedWordsEmptyTitle")}
      description={t("app.savedWordsEmptyBody")}
      action={{ label: t("app.savedWordsGoLibrary"), href: "/library" }}
      secondaryAction={{ label: t("app.savedWordsOpenReader"), href: "/reader", variant: "secondary" }}
    />
  );
}
