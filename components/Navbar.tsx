"use client";

import { useState } from "react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Login", href: "#login" }
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/70 backdrop-blur-md">
      <nav className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6 md:px-10">
        <a href="#" className="inline-flex shrink-0 items-center">
          <img
            src="/readways-logo-navbar-transparent.png"
            alt="ReadWays"
            className="h-10 w-auto object-contain"
          />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-slate-300 transition hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#start"
            className="rounded-full border border-accent/30 bg-accent px-5 py-2 text-sm font-medium text-white shadow-premium transition hover:-translate-y-0.5 hover:bg-[#6D7EFF]"
          >
            Get started
          </a>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-slate-300 transition hover:text-white md:hidden"
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

      {mobileOpen && (
        <div className="border-t border-border bg-surface/90 px-6 py-4 backdrop-blur-md md:hidden">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-slate-300 transition hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#start"
            className="mt-4 inline-flex rounded-full border border-accent/30 bg-accent px-5 py-2 text-sm font-medium text-white shadow-premium transition hover:bg-[#6D7EFF]"
            onClick={() => setMobileOpen(false)}
          >
            Get started
          </a>
        </div>
      )}
    </header>
  );
}
