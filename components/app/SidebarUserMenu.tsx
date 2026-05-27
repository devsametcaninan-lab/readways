"use client";

import UserAvatar from "@/components/app/UserAvatar";
import { SignOutForm } from "@/components/feedback/SignOutButton";
import type { AppUserDisplay } from "./use-app-user";

export default function SidebarUserMenu({ user }: { user: AppUserDisplay }) {
  return (
    <div className="border-t border-white/[0.1] p-3">
      <div className="flex items-center gap-2.5">
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
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
