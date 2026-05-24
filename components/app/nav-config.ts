import type { SidebarIconType } from "./SidebarNavIcon";

export type AppNavItem = {
  label: string;
  href: string;
  icon: SidebarIconType;
};

export const appNavItems: AppNavItem[] = [
  { label: "Library", href: "/library", icon: "library" },
  { label: "Reader", href: "/reader", icon: "reader" },
  { label: "Saved Words", href: "/saved-words", icon: "saved" },
  { label: "Flashcards", href: "/flashcards", icon: "flashcards" },
  { label: "Progress", href: "/dashboard", icon: "progress" },
  { label: "Settings", href: "/settings", icon: "settings" }
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
