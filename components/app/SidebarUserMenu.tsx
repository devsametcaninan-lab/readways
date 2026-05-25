"use client";

import { SignOutForm } from "@/components/feedback/SignOutButton";
import type { AppUserDisplay } from "./use-app-user";

function UserAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initial = name.trim().charAt(0).toUpperCase() || "R";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="h-8 w-8 shrink-0 rounded-full border border-white/[0.12] object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] text-[12px] font-medium text-zinc-300"
      aria-hidden
    >
      {initial}
    </span>
  );
}

export default function SidebarUserMenu({ user }: { user: AppUserDisplay }) {
  return (
    <div className="border-t border-white/[0.1] p-3">
      <div className="flex items-center gap-2.5">
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-zinc-200">{user.name}</p>
          {user.email ? (
            <p className="truncate text-[11px] text-zinc-500">{user.email}</p>
          ) : null}
        </div>
      </div>

      <SignOutForm />
    </div>
  );
}
