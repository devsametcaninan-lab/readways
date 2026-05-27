import type { SidebarIconType } from "./SidebarNavIcon";

export type AppNavItem = {
  labelKey:
    | "nav.library"
    | "nav.reader"
    | "nav.savedWords"
    | "nav.flashcards"
    | "nav.progress"
    | "nav.settings";
  href: string;
  icon: SidebarIconType;
};

export const appNavItems: AppNavItem[] = [
  { labelKey: "nav.library", href: "/library", icon: "library" },
  { labelKey: "nav.reader", href: "/reader", icon: "reader" },
  { labelKey: "nav.savedWords", href: "/saved-words", icon: "saved" },
  { labelKey: "nav.flashcards", href: "/flashcards", icon: "flashcards" },
  { labelKey: "nav.progress", href: "/dashboard", icon: "progress" },
  { labelKey: "nav.settings", href: "/settings", icon: "settings" }
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  if (href === "/reader") {
    return pathname === "/reader" || pathname.startsWith("/reader/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
