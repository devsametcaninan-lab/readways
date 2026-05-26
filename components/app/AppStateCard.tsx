import Link from "next/link";
import type { ReactNode } from "react";

export type AppStateVariant = "default" | "error" | "warning" | "success" | "info";

export type AppStateIcon =
  | "library"
  | "upload"
  | "search"
  | "flashcards"
  | "reader"
  | "ocr"
  | "processing"
  | "document"
  | "auth"
  | "ai"
  | "check";

type AppStateAction =
  | { label: string; href: string; variant?: "primary" | "secondary" }
  | { label: string; onClick: () => void; variant?: "primary" | "secondary" };

export type AppStateCardProps = {
  variant?: AppStateVariant;
  icon?: AppStateIcon;
  title: string;
  description: string;
  action?: AppStateAction;
  secondaryAction?: AppStateAction;
  className?: string;
  compact?: boolean;
  children?: ReactNode;
};

const variantStyles: Record<AppStateVariant, string> = {
  default:
    "border-white/[0.12] bg-[#12141d] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  error: "border-red-500/20 bg-red-500/[0.06]",
  warning: "border-amber-500/20 bg-amber-500/[0.06]",
  success: "border-emerald-500/20 bg-emerald-500/[0.06]",
  info: "border-accent/20 bg-accent/[0.06]"
};

const iconAccent: Record<AppStateVariant, string> = {
  default: "border-white/[0.12] bg-white/[0.04] text-zinc-400",
  error: "border-red-500/25 bg-red-500/[0.08] text-red-300/90",
  warning: "border-amber-500/25 bg-amber-500/[0.08] text-amber-200/90",
  success: "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300/90",
  info: "border-accent/30 bg-accent/[0.08] text-[#c5cdff]"
};

function StateIcon({ name }: { name: AppStateIcon }) {
  const stroke = "currentColor";
  const common = {
    fill: "none",
    viewBox: "0 0 24 24",
    stroke,
    strokeWidth: 1.5,
    className: "h-5 w-5",
    "aria-hidden": true as const
  };

  switch (name) {
    case "library":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z" />
        </svg>
      );
    case "flashcards":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v9a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 18V9a2.25 2.25 0 00-2.25-2.25m-12 0V9a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0018 9V6.878" />
        </svg>
      );
    case "reader":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case "ocr":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case "processing":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      );
    case "document":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case "auth":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499a1.875 1.875 0 011.312-.66z" />
        </svg>
      );
    case "ai":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}

function ActionButton({ action }: { action: AppStateAction }) {
  const isPrimary = (action.variant ?? "primary") === "primary";
  const className = isPrimary
    ? "rounded-lg border border-accent/30 bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D7EFF]"
    : "rounded-lg border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-white/[0.16] hover:bg-white/[0.06]";

  if ("href" in action) {
    return (
      <Link href={action.href} className={`inline-flex justify-center ${className}`}>
        {action.label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}

export function AppStatePage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      {children}
    </div>
  );
}

export default function AppStateCard({
  variant = "default",
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
  compact = false,
  children
}: AppStateCardProps) {
  const padding = compact ? "px-5 py-8" : "px-6 py-14 md:py-16";

  return (
    <div
      className={`rounded-2xl border text-center ${variantStyles[variant]} ${padding} ${className}`}
    >
      {icon ? (
        <div
          className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border ${iconAccent[variant]}`}
        >
          <StateIcon name={icon} />
        </div>
      ) : null}

      <p
        className={`font-medium text-zinc-100 ${icon ? "mt-5" : ""} ${compact ? "text-[15px]" : "text-base"}`}
      >
        {title}
      </p>
      <p
        className={`mx-auto mt-2 max-w-md leading-relaxed text-zinc-400 ${
          compact ? "text-[13px]" : "text-sm"
        }`}
      >
        {description}
      </p>

      {children}

      {action || secondaryAction ? (
        <div
          className={`mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row ${
            compact ? "mt-5" : ""
          }`}
        >
          {action ? <ActionButton action={action} /> : null}
          {secondaryAction ? <ActionButton action={secondaryAction} /> : null}
        </div>
      ) : null}
    </div>
  );
}
