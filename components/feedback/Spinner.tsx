"use client";

type SpinnerProps = {
  className?: string;
  size?: "sm" | "md";
};

const sizeClass = {
  sm: "h-3.5 w-3.5 border-[1.5px]",
  md: "h-4 w-4 border-2"
};

export default function Spinner({ className = "", size = "sm" }: SpinnerProps) {
  return (
    <span
      className={`inline-block shrink-0 animate-spin rounded-full border-white/20 border-t-zinc-100 ${sizeClass[size]} ${className}`}
      aria-hidden="true"
    />
  );
}
