import type { HighlightMode } from "@/lib/preferences/types";

const wordBase =
  "m-0 inline cursor-pointer appearance-none border-0 bg-transparent p-0 align-baseline font-[inherit] text-[length:inherit] leading-[inherit] tracking-[inherit] transition-[color,background-color,box-shadow,text-decoration-color] duration-200 focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0c0d12]";

/** Inline word control — styling follows reader highlight preference */
export function wordHighlightClass(
  isActive: boolean,
  mode: HighlightMode = "focused"
): string {
  if (mode === "off") {
    return `${wordBase} text-inherit`;
  }

  if (mode === "subtle") {
    if (isActive) {
      return `${wordBase} rounded-[2px] text-zinc-100 underline decoration decoration-accent/50 underline-offset-[3px]`;
    }

    return `${wordBase} text-inherit hover:text-zinc-100`;
  }

  if (isActive) {
    return `${wordBase} rounded-[2px] text-zinc-50 underline decoration-2 decoration-accent/75 underline-offset-[3px] [text-shadow:0_0_20px_rgba(124,140,255,0.15)]`;
  }

  return `${wordBase} text-inherit hover:bg-accent/[0.06] hover:text-zinc-100`;
}
