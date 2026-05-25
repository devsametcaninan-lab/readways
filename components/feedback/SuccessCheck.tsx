type SuccessCheckProps = {
  className?: string;
};

export default function SuccessCheck({ className = "" }: SuccessCheckProps) {
  return (
    <svg
      className={`animate-check-pop h-4 w-4 shrink-0 text-emerald-400/90 ${className}`}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 10.5 8.2 13.7 15 6.9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
