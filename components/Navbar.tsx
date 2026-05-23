"use client";

import { useEffect, useState } from "react";

const navLinks = [
  { label: "Product", href: "#workflow" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Login", href: "#login" }
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? "border-b border-white/[0.08] bg-[#0a0b10]/80 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-[#0a0b10]/65"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-6 px-6 md:px-10">
        <a
          href="#hero"
          className="inline-flex shrink-0 items-center transition-opacity duration-300 hover:opacity-90"
        >
          <img
            src="/readways-logo-navbar-transparent.png"
            alt="ReadWays"
            className="h-8 w-auto object-contain"
          />
        </a>

        <div className="hidden items-center gap-10 md:flex">
          <ul className="flex items-center gap-9">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-[13px] text-slate-400 transition-colors duration-300 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#start"
            className="rounded-full border border-accent/30 bg-accent px-4 py-2 text-xs font-medium text-white shadow-premium transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-[#6D7EFF] hover:shadow-[0_12px_40px_rgba(124,140,255,0.22)]"
          >
            Get started
          </a>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] p-2.5 text-slate-400 transition-all duration-300 hover:border-white/[0.14] hover:text-white md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5"
            aria-hidden
          >
            {mobileOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      <div
        className={`overflow-hidden border-t border-white/[0.06] bg-[#0a0b10]/95 backdrop-blur-xl transition-all duration-300 ease-out md:hidden ${
          mobileOpen ? "max-h-[420px] opacity-100" : "max-h-0 border-t-transparent opacity-0"
        }`}
      >
        <div className="px-6 py-6">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors duration-300 hover:bg-white/[0.04] hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#start"
            className="mt-5 flex w-full items-center justify-center rounded-full border border-accent/30 bg-accent px-4 py-2.5 text-[13px] font-medium text-white shadow-premium transition-all duration-300 hover:bg-[#6D7EFF] hover:shadow-[0_12px_40px_rgba(124,140,255,0.2)]"
            onClick={() => setMobileOpen(false)}
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}
