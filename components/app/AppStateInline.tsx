import type { AppStateVariant } from "./AppStateCard";

type AppStateInlineProps = {
  variant?: AppStateVariant;
  title: string;
  description?: string;
  className?: string;
};

const variantStyles: Record<AppStateVariant, string> = {
  default: "border-white/[0.12] bg-[#12141d]",
  error: "border-red-500/20 bg-red-500/[0.06]",
  warning: "border-amber-500/20 bg-amber-500/[0.06]",
  success: "border-emerald-500/20 bg-emerald-500/[0.06]",
  info: "border-accent/20 bg-accent/[0.06]"
};

const titleStyles: Record<AppStateVariant, string> = {
  default: "text-zinc-200",
  error: "text-red-200/90",
  warning: "text-amber-100/90",
  success: "text-emerald-200/90",
  info: "text-[#c5cdff]"
};

/** Compact inline state for modals and side panels. */
export default function AppStateInline({
  variant = "default",
  title,
  description,
  className = ""
}: AppStateInlineProps) {
  return (
    <div className={`rounded-lg border px-4 py-3.5 ${variantStyles[variant]} ${className}`}>
      <p className={`text-sm font-medium ${titleStyles[variant]}`}>{title}</p>
      {description ? (
        <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{description}</p>
      ) : null}
    </div>
  );
}
