"use client";

import { useFormStatus } from "react-dom";
import { signOut } from "@/lib/auth/actions";
import { clearAppSessionState } from "@/lib/auth/session-client";
import Spinner from "./Spinner";

export default function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-white/[0.1] bg-white/[0.03] px-2.5 py-2 text-[12px] text-zinc-400 transition hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Spinner />
          Signing out…
        </>
      ) : (
        "Sign out"
      )}
    </button>
  );
}

export function SignOutForm() {
  return (
    <form
      action={signOut}
      className="mt-3"
      onSubmit={() => {
        clearAppSessionState();
      }}
    >
      <SignOutButton />
    </form>
  );
}
