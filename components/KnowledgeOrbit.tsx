import { getServerT } from "@/lib/i18n/server";

const floatSlow = "animate-[orbitFloat_8s_ease-in-out_infinite]";
const floatMid = "animate-[orbitFloat_10s_ease-in-out_infinite_1s]";
const floatFast = "animate-[orbitFloat_12s_ease-in-out_infinite_2s]";

export default function KnowledgeOrbit() {
  const t = getServerT();

  return (
    <section className="mt-16 md:mt-20">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
        <div>
          <p className="text-sm text-slate-500">
            {t("landing.orbitLabel")} <span className="text-slate-600">→</span>
          </p>
          <h2 className="mt-4 max-w-lg text-balance text-3xl font-medium tracking-tight text-white md:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {t("landing.orbitTitle")}
          </h2>
        </div>
        <div className="flex items-end md:pb-1">
          <p className="max-w-md text-lg leading-relaxed text-slate-400">
            {t("landing.orbitDescription")}
          </p>
        </div>
      </div>

      <div className="relative mt-14 md:mt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(520px,70vh)] w-[min(900px,100%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,140,255,0.14)_0%,transparent_65%)] opacity-50 blur-[110px]"
        />

        <div className="relative mx-auto flex min-h-[520px] max-w-4xl items-center justify-center py-16 md:min-h-[620px] md:py-20">
          {/* Orbit ring hint */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[min(440px,85vw)] w-[min(440px,85vw)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.1]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[min(520px,95vw)] w-[min(520px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/[0.16] shadow-[0_0_40px_rgba(124,140,255,0.06)]"
          />

          {/* Floating elements */}
          <div
            className={`absolute left-[4%] top-[14%] z-20 hidden max-w-[140px] rounded-lg border border-white/[0.1] bg-[#0e0f15]/90 p-3 shadow-[0_12px_40px_rgba(124,140,255,0.1)] backdrop-blur-sm sm:block ${floatMid} motion-reduce:animate-none`}
          >
            <p className="text-[10px] text-slate-500">{t("landing.orbitDefinition")}</p>
            <p className="mt-1 text-sm font-medium text-white">framework</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">basic structure</p>
          </div>

          <div
            className={`absolute right-[6%] top-[18%] z-20 rounded-full border border-white/[0.14] bg-[#0e0f15]/95 px-3 py-1.5 text-[11px] text-slate-300 backdrop-blur-sm sm:right-[10%] ${floatSlow} motion-reduce:animate-none`}
          >
            /ˈfreɪmwɜːrk/
          </div>

          <div
            className={`absolute right-[2%] top-[42%] z-20 hidden w-36 rounded-lg border border-white/[0.1] bg-[#0c0d12]/95 p-3 shadow-lg backdrop-blur-sm md:block ${floatFast} motion-reduce:animate-none`}
          >
            <p className="text-[10px] text-slate-500">{t("landing.orbitFlashcard")}</p>
            <p className="mt-2 text-sm font-medium text-slate-200">sustain</p>
            <p className="mt-1 text-[10px] text-slate-500">{t("landing.orbitFromArticle")}</p>
          </div>

          <div
            className={`absolute bottom-[22%] right-[8%] z-20 rounded-full border border-accent/30 bg-accent/[0.12] px-3 py-1 text-[11px] text-accentSoft ${floatMid} motion-reduce:animate-none`}
          >
            {t("landing.orbitSavedReliable")}
          </div>

          <div
            className={`absolute bottom-[18%] left-[6%] z-20 hidden max-w-[200px] rounded-lg border border-white/[0.12] bg-[#0e0f16]/95 p-3 shadow-[0_16px_48px_rgba(124,140,255,0.12)] backdrop-blur-md sm:block ${floatSlow} motion-reduce:animate-none`}
          >
            <p className="text-[11px] text-slate-400">{t("landing.orbitInContext")}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-300">
              &ldquo;…a <span className="text-white">deliberate</span> approach to…&rdquo;
            </p>
          </div>

          <div
            className={`absolute left-[8%] top-[48%] z-20 rounded-lg border border-white/[0.12] bg-[#0e0f15]/90 px-3 py-2 ${floatFast} motion-reduce:animate-none`}
          >
            <p className="text-[10px] text-slate-500">{t("landing.orbitReview")}</p>
            <p className="text-sm font-medium text-slate-200">{t("landing.orbitDue")}</p>
          </div>

          <div
            className={`absolute left-1/2 top-[6%] z-20 -translate-x-1/2 rounded-md border border-white/[0.12] bg-[#0e0f15]/90 px-2.5 py-1 text-[10px] text-slate-400 backdrop-blur-sm ${floatMid} motion-reduce:animate-none`}
          >
            {t("landing.orbitApproachMastered")}
          </div>

          <div
            className={`absolute bottom-[8%] left-1/2 z-20 -translate-x-1/2 rounded-lg border border-white/[0.1] bg-[#0e0f15]/90 px-4 py-2 backdrop-blur-sm ${floatSlow} motion-reduce:animate-none`}
          >
            <p className="text-center text-[11px] text-slate-400">{t("landing.orbitEffortlessCoherent")}</p>
          </div>

          {/* Mobile orbit elements — simplified */}
          <div
            className={`absolute left-2 top-[20%] z-20 max-w-[120px] rounded-lg border border-white/[0.08] bg-[#0e0f15]/90 p-2.5 sm:hidden ${floatMid} motion-reduce:animate-none`}
          >
            <p className="text-xs text-slate-300">framework</p>
          </div>
          <div
            className={`absolute right-2 top-[24%] z-20 rounded-full border border-white/[0.12] bg-[#0e0f15]/95 px-2 py-1 text-[10px] text-slate-400 sm:hidden ${floatSlow} motion-reduce:animate-none`}
          >
            {t("landing.orbitDue")}
          </div>

          {/* Central document */}
          <div className="relative z-30 w-full max-w-md px-4">
            <div className="rounded-2xl border border-white/[0.12] bg-[#0b0c11] p-7 shadow-[0_48px_120px_rgba(0,0,0,0.6),0_0_80px_rgba(124,140,255,0.08)] md:p-9">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <p className="text-[11px] text-slate-500">{t("landing.orbitResearchFile")}</p>
                <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
              </div>
              <p className="mt-6 text-[15px] leading-[1.9] text-slate-500">
                {t("landing.orbitParagraphOne")}
              </p>
              <p className="mt-4 text-[15px] leading-[1.9] text-slate-400">
                {t("landing.orbitParagraphTwoBefore")}
                <span className="border-b border-accent/60 bg-accent/[0.08] text-slate-200">
                  {t("landing.orbitParagraphTwoHighlight")}
                </span>
                {t("landing.orbitParagraphTwoAfter")}
              </p>
            </div>
          </div>
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
