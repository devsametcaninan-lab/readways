import type { ReactNode } from "react";

export default function AppCard({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-white/[0.12] bg-[#12141d] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-white/[0.16] hover:bg-[#141820] ${className}`}
    >
      {children}
    </div>
  );
}
