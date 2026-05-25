type ExplanationSkeletonProps = {
  lines?: number;
  className?: string;
};

export function PronunciationSkeleton() {
  return (
    <span
      className="inline-block h-3.5 w-28 rounded bg-white/[0.06]"
      aria-hidden="true"
    />
  );
}

export function ExplanationTextSkeleton({
  lines = 3,
  className = ""
}: ExplanationSkeletonProps) {
  const widths = ["100%", "92%", "78%"];

  return (
    <div
      className={`space-y-2 ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-3.5 rounded bg-white/[0.06]"
          style={{ width: widths[index] ?? "85%" }}
        />
      ))}
    </div>
  );
}
