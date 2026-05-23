"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { appNavItems, isNavActive } from "./nav-config";
import SidebarNavIcon from "./SidebarNavIcon";
import { mockUser } from "@/lib/mock-data";

export default function AppSidebar({
  mobileOpen,
  onClose
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const nav = (
    <>
      <div className="border-b border-white/[0.1] px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <Image
            src="/readways-logo-navbar-transparent.png"
            alt="ReadWays"
            width={120}
            height={28}
            className="h-7 w-auto object-contain"
          />
        </Link>
        <p className="mt-2 text-[11px] font-medium text-zinc-400">{mockUser.plan}</p>
      </div>

      <nav className="flex-1 space-y-0.5 p-2">
        {appNavItems.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors duration-200 ${
                active
                  ? "border border-white/[0.06] bg-white/[0.05] text-white"
                  : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-300"
              }`}
            >
              <SidebarNavIcon type={item.icon} active={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.1] p-3">
        <p className="text-[11px] font-medium text-zinc-300">Signed in as</p>
        <p className="mt-1 text-[13px] text-zinc-500">{mockUser.name}</p>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-white/[0.06] bg-[#07080c] lg:flex">
        {nav}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="relative flex h-full w-[260px] max-w-[85vw] flex-col border-r border-white/[0.08] bg-[#07080c] shadow-2xl">
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
