export type SidebarIconType =
  | "library"
  | "reader"
  | "saved"
  | "flashcards"
  | "progress"
  | "settings";

export default function SidebarNavIcon({
  type,
  active
}: {
  type: SidebarIconType;
  active?: boolean;
}) {
  const className = `h-3.5 w-3.5 shrink-0 ${active ? "text-accentSoft" : "text-slate-600"}`;

  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {type === "library" && (
        <>
          <path d="M3 3.5h4v9H3a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" />
          <path d="M8.5 3.5H12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H8.5" />
          <path d="M8.5 3.5v9" />
        </>
      )}
      {type === "reader" && (
        <>
          <path d="M3 2.5h7l3 3V13.5H3V2.5z" />
          <path d="M10 2.5V5.5h3" />
          <path d="M5.5 8h5M5.5 10.5h3.5" />
        </>
      )}
      {type === "saved" && <path d="M4 2.5h8v11l-4-2.5L4 13.5V2.5z" />}
      {type === "flashcards" && (
        <>
          <rect x="3" y="4" width="9" height="7" rx="1" />
          <rect x="5" y="2.5" width="9" height="7" rx="1" />
        </>
      )}
      {type === "progress" && <path d="M3 11.5V8.5M6.5 11.5V6M10 11.5V9.5M13 11.5V4" />}
      {type === "settings" && (
        <>
          <circle cx="8" cy="8" r="2" />
          <path d="M8 2.5v1.5M8 12v1.5M2.5 8h1.5M12 8h1.5M4.2 4.2l1 1M10.8 10.8l1 1M11.8 4.2l-1 1M5.2 10.8l-1 1" />
        </>
      )}
    </svg>
  );
}
