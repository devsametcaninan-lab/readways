export default function UserAvatar({
  name,
  avatarUrl,
  size = "md"
}: {
  name: string;
  avatarUrl: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "R";
  const sizeClass =
    size === "lg"
      ? "h-14 w-14 text-base"
      : size === "sm"
        ? "h-8 w-8 text-[12px]"
        : "h-10 w-10 text-[13px]";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${sizeClass} shrink-0 rounded-full border border-white/[0.12] object-cover`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] font-medium text-zinc-300 ${sizeClass}`}
      aria-hidden
    >
      {initial}
    </span>
  );
}
