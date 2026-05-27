import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";

export default function PricingSection() {
  const t = getServerT();
  const plans = [
    {
      name: t("landing.pricingFreeName"),
      price: t("landing.pricingFreePrice"),
      priceNote: null,
      badge: null,
      features: [
        t("landing.pricingFreeFeature1"),
        t("landing.pricingFreeFeature2"),
        t("landing.pricingFreeFeature3"),
        t("landing.pricingFreeFeature4"),
        t("landing.pricingFreeFeature5")
      ],
      cta: t("common.getStarted"),
      highlighted: false
    },
    {
      name: t("landing.pricingProName"),
      price: "$12",
      priceNote: t("landing.pricingProPerMonth"),
      badge: t("landing.pricingProBadge"),
      features: [
        t("landing.pricingProFeature1"),
        t("landing.pricingProFeature2"),
        t("landing.pricingProFeature3"),
        t("landing.pricingProFeature4"),
        t("landing.pricingProFeature5"),
        t("landing.pricingProFeature6")
      ],
      cta: t("landing.pricingProCta"),
      highlighted: true
    }
  ];

  return (
    <section id="pricing" className="mt-16 text-center md:mt-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-balance text-3xl font-medium tracking-tight text-white md:text-4xl">
          {t("landing.pricingTitle")}
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-slate-400">
          {t("landing.pricingDescription")}
        </p>
      </div>

      <div className="relative mt-14 md:mt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(360px,50vh)] w-[min(700px,90%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,140,255,0.1)_0%,transparent_70%)] opacity-40 blur-[90px]"
        />

        <div className="relative mx-auto grid max-w-4xl gap-6 md:grid-cols-2 md:gap-8">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`group flex flex-col rounded-2xl border p-8 text-left transition-all duration-300 md:p-10 md:duration-500 md:hover:-translate-y-1 motion-reduce:md:hover:translate-y-0 ${
                plan.highlighted
                  ? "border-accent/25 bg-card/50 shadow-[0_24px_60px_rgba(124,140,255,0.12)] md:hover:border-accent/35 md:hover:shadow-[0_28px_70px_rgba(124,140,255,0.2)]"
                  : "border-white/[0.08] bg-card/30 md:hover:border-white/20 md:hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
              }`}
            >
              {plan.badge && (
                <span className="mb-6 inline-flex w-fit rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-medium tracking-wide text-accentSoft">
                  {plan.badge}
                </span>
              )}
              {!plan.badge && <div className="mb-6 h-[26px]" />}

              <p className="text-sm text-slate-500">{plan.name}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <p className="text-4xl font-medium tracking-tight text-white md:text-[2.5rem]">
                  {plan.price}
                </p>
                {plan.priceNote && (
                  <span className="text-base text-slate-500">{plan.priceNote}</span>
                )}
              </div>

              <ul className="mt-8 flex-1 space-y-3.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm leading-relaxed text-slate-400"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.highlighted ? "/signup?plan=pro" : "/signup?plan=free"}
                className={`mt-10 w-full rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 md:duration-500 ${
                  plan.highlighted
                    ? "border border-accent/30 bg-accent text-white shadow-premium hover:bg-[#6D7EFF]"
                    : "border border-white/[0.12] bg-white/[0.04] text-slate-200 hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-16 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent md:mt-20"
        role="separator"
        aria-hidden
      />
    </section>
  );
}
