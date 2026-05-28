import AppStateCard from "@/components/app/AppStateCard";
import { useI18n } from "@/lib/i18n/provider";

type ReviewCompleteProps = {
  reviewedCount: number;
  onReviewAgain: () => void;
};

export default function ReviewComplete({ reviewedCount, onReviewAgain }: ReviewCompleteProps) {
  const { t } = useI18n();
  return (
    <div className="mx-auto w-full max-w-md">
      <AppStateCard
        variant="success"
        icon="check"
        title={t("app.flashcardsReviewCompleteTitle")}
        description={
          reviewedCount === 1
            ? t("app.flashcardsReviewCompleteSingle")
            : `${t("app.flashcardsReviewCompleteMultiplePrefix")} ${reviewedCount} ${t("app.flashcardsReviewCompleteMultipleSuffix")}`
        }
        action={{ label: t("app.flashcardsReviewAgain"), onClick: onReviewAgain }}
        secondaryAction={{ label: t("app.flashcardsSavedWordsAction"), href: "/saved-words", variant: "secondary" }}
      />
    </div>
  );
}
