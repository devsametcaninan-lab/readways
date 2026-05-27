import { getServerT } from "@/lib/i18n/server";

function CardWatermark({ variant }: { variant: "large" | "small" }) {
  if (variant === "large") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent/[0.06] blur-2xl" />
        <div className="absolute bottom-8 left-8 h-32 w-32 rounded-full bg-white/[0.02] blur-xl" />
        <p className="absolute bottom-6 right-8 select-none text-[72px] font-medium leading-none text-white/[0.02]">
          &ldquo;
        </p>
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      <div className="absolute -right-6 top-6 h-24 w-24 rounded-full bg-accent/[0.05] blur-xl" />
    </div>
  );
}

function TestimonialCard({
  quote,
  role,
  featured = false
}: {
  quote: string;
  role: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 md:duration-500 md:hover:-translate-y-0.5 ${
        featured
          ? "min-h-[320px] border-white/[0.1] bg-gradient-to-br from-[#0e0f16] via-[#0b0c11] to-[#0a0b10] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.4)] md:min-h-[420px] md:p-11 md:hover:border-white/[0.16] md:hover:shadow-[0_32px_80px_rgba(124,140,255,0.1)]"
          : "border-white/[0.08] bg-gradient-to-br from-card/40 to-[#0a0b10] p-6 md:p-7 md:hover:border-white/[0.14] md:hover:shadow-[0_20px_50px_rgba(124,140,255,0.08)]"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,140,255,0.06)_0%,transparent_55%)] opacity-80"
      />
      <CardWatermark variant={featured ? "large" : "small"} />

      <div className="relative z-10 flex flex-1 flex-col justify-between">
        <p
          className={`leading-snug tracking-tight text-slate-200 transition-colors duration-300 group-hover:text-white ${
            featured
              ? "text-2xl md:text-[1.75rem] md:leading-[1.35] lg:text-[2rem]"
              : "text-lg md:text-xl md:leading-relaxed"
          }`}
        >
          &ldquo;{quote}&rdquo;
        </p>
        <p
          className={`text-slate-600 transition-colors duration-300 group-hover:text-slate-500 ${
            featured ? "mt-10 text-sm" : "mt-6 text-[12px]"
          }`}
        >
          {role}
        </p>
      </div>
    </article>
  );
}

export default function TestimonialsSection() {
  const t = getServerT();

  return (
    <section className="mt-16 md:mt-20">
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[min(400px,50vh)] w-[min(800px,100%)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,140,255,0.08)_0%,transparent_70%)] opacity-50 blur-[100px]"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-medium tracking-tight text-white md:text-4xl">
            {t("landing.testimonialsTitle")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-400">
            {t("landing.testimonialsDescription")}
          </p>
        </div>

        <div className="relative mt-14 grid gap-4 md:mt-16 md:grid-cols-[1.35fr_1fr] md:gap-5 lg:gap-6">
          <TestimonialCard
            featured
            quote={t("landing.testimonial1Quote")}
            role={t("landing.testimonial1Role")}
          />
          <div className="flex flex-col gap-4 md:gap-5">
            <TestimonialCard
              quote={t("landing.testimonial2Quote")}
              role={t("landing.testimonial2Role")}
            />
            <TestimonialCard
              quote={t("landing.testimonial3Quote")}
              role={t("landing.testimonial3Role")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
