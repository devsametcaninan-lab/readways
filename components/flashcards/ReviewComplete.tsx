import AppStateCard from "@/components/app/AppStateCard";

type ReviewCompleteProps = {
  reviewedCount: number;
  onReviewAgain: () => void;
};

export default function ReviewComplete({ reviewedCount, onReviewAgain }: ReviewCompleteProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      <AppStateCard
        variant="success"
        icon="check"
        title="Review complete"
        description={
          reviewedCount === 1
            ? "You reviewed 1 card this session. Nice work — your memory schedule has been updated."
            : `You reviewed ${reviewedCount} cards this session. Nice work — your memory schedule has been updated.`
        }
        action={{ label: "Review again", onClick: onReviewAgain }}
        secondaryAction={{ label: "Saved words", href: "/saved-words", variant: "secondary" }}
      />
    </div>
  );
}
