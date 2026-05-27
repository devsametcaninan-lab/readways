import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";

const footerLinks = [
  { labelKey: "nav.features", href: "#features" },
  { labelKey: "nav.pricing", href: "#pricing" },
  { labelKey: "nav.login", href: "/login" }
];

export default function FinalCta() {
  const t = getServerT();
  const year = new Date().getFullYear();

  return (
    <>
      <section id="start" className="relative mt-20 overflow-hidden py-24 text-center md:mt-28 md:py-32 lg:py-40">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0a0b10] to-transparent"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(420px,60vh)] w-[min(720px,100%)] -translate-x-1/2 -translate-y-1/2 animate-[ctaGlow_10s_ease-in-out_infinite] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,140,255,0.14)_0%,transparent_68%)] opacity-50 blur-[100px] motion-reduce:animate-none"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-[30%] top-[40%] h-48 w-48 animate-[ctaGlowAlt_12s_ease-in-out_infinite_2s] rounded-full bg-[radial-gradient(circle,rgba(148,163,184,0.08)_0%,transparent_70%)] blur-[80px] motion-reduce:animate-none"
        />

        <div className="relative z-10 mx-auto max-w-2xl px-2">
          <h2 className="text-balance text-4xl font-medium tracking-tight text-white md:text-5xl lg:text-6xl">
            {t("landing.finalTitle")}
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-slate-400 md:mt-8 md:text-xl">
            {t("landing.finalDescription")}
          </p>
          <Link
            href="/signup"
            className="mt-10 inline-flex rounded-full border border-accent/30 bg-accent px-8 py-3.5 text-sm font-medium text-white shadow-premium transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#6D7EFF] hover:shadow-[0_20px_60px_rgba(124,140,255,0.25)] md:mt-12"
          >
            {t("common.getStarted")}
          </Link>
          <p className="mt-6 text-sm text-slate-600 md:mt-8">
            {t("landing.finalFootnote")}
          </p>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-10 md:py-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-center">
          <a href="#" className="inline-flex shrink-0 items-center">
            <img
              src="/readways-logo-navbar-transparent.png"
              alt="ReadWays"
              className="h-8 w-auto object-contain opacity-90"
            />
          </a>

          <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {footerLinks.map((link) => (
              <Link
                key={link.labelKey}
                id={link.labelKey === "nav.login" ? "login" : undefined}
                href={link.href}
                className="text-sm text-slate-500 transition-colors duration-300 hover:text-slate-300"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          <p className="text-xs text-slate-600 md:text-right">
            © {year} ReadWays. {t("landing.footerRights")}
          </p>
        </div>
      </footer>
    </>
  );
}
