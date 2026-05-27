import { getServerT } from "@/lib/i18n/server";

export default function ReadingWorkflow() {
  const t = getServerT();

  return (
    <section id="workflow" className="mt-16 md:mt-20">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
        <div>
          <h2 className="max-w-lg text-balance text-3xl font-medium tracking-tight text-white md:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {t("landing.workflowTitle")}
          </h2>
        </div>
        <div className="flex items-end md:pb-1">
          <p className="max-w-md text-lg leading-relaxed text-slate-400">
            {t("landing.workflowDescription")}
          </p>
        </div>
      </div>

      {/* Cinematic reading scene */}
      <div className="relative mt-16 md:mt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(480px,65vh)] w-[min(800px,100%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,140,255,0.12)_0%,transparent_68%)] opacity-60 blur-[100px]"
        />

        <div className="relative flex min-h-[480px] items-center justify-center px-2 py-12 md:min-h-[560px] md:py-16">
          {/* Background flashcards — atmospheric */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-[6%] top-[18%] w-36 -rotate-6 rounded-lg border border-white/[0.06] bg-[#0c0d12]/80 p-4 opacity-[0.22] blur-[0.5px] md:left-[10%] md:w-44">
              <p className="text-[11px] text-slate-600">coherent</p>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-700">logically connected</p>
            </div>
            <div className="absolute right-[8%] top-[22%] w-40 rotate-3 rounded-lg border border-white/[0.06] bg-[#0c0d12]/80 p-4 opacity-[0.18] blur-[1px] md:right-[12%] md:w-48">
              <p className="text-[11px] text-slate-600">immersion</p>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-700">deep involvement</p>
            </div>
            <div className="absolute bottom-[20%] left-[14%] hidden w-36 rotate-2 rounded-lg border border-white/[0.05] bg-[#0c0d12]/70 p-4 opacity-[0.15] sm:block">
              <p className="text-[11px] text-slate-700">articulate</p>
            </div>
            <div className="absolute bottom-[18%] right-[10%] w-36 -rotate-3 rounded-lg border border-white/[0.05] bg-[#0c0d12]/70 p-4 opacity-[0.2] md:right-[14%] md:w-40">
              <p className="text-[11px] text-slate-600">nuanced</p>
              <p className="mt-2 text-[10px] text-slate-700">subtle distinction</p>
            </div>
          </div>

          {/* Center — reading moment */}
          <div className="relative z-10 w-full max-w-2xl">
            <div className="rounded-2xl border border-white/[0.1] bg-[#0b0c11]/90 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.55)] backdrop-blur-sm md:p-12">
              <p className="text-center text-[11px] tracking-wide text-slate-600">
                {t("landing.workflowPaperLabel")}
              </p>

              <div className="mt-8 space-y-6 text-center text-[15px] leading-[2] text-slate-500 md:text-[16px] md:leading-[2.1]">
                <p>
                  {t("landing.workflowParagraphOne")}
                </p>
                <p className="relative inline-block text-left md:text-center">
                  {t("landing.workflowParagraphTwoBefore")}
                  <span className="relative inline-block">
                    <span className="border-b-2 border-accent/80 bg-accent/[0.1] px-1 text-slate-200">
                      {t("landing.workflowParagraphTwoHighlight")}
                    </span>
                    <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-accent/90" />
                  </span>
                  {t("landing.workflowParagraphTwoAfter")}
                </p>
              </div>
            </div>

            {/* Floating meaning popup */}
            <div className="absolute left-1/2 top-[58%] z-20 w-[min(100%,280px)] -translate-x-1/2 animate-[fadeUp_0.8s_ease-out_both] motion-reduce:animate-none md:top-[54%]">
              <div className="rounded-xl border border-white/[0.14] bg-[#0e0f16]/95 p-5 shadow-[0_24px_60px_rgba(124,140,255,0.18)] backdrop-blur-md">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-lg font-medium text-white">deliberate</p>
                  <p className="text-[12px] text-slate-500">/dɪˈlɪbərət/</p>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
                  {t("landing.workflowPopupMeaning")}
                </p>
                <button
                  type="button"
                  className="mt-5 w-full rounded-lg border border-accent/20 bg-accent/90 px-4 py-2.5 text-[13px] font-medium text-white transition-colors duration-300 hover:bg-accent"
                >
                  {t("landing.saveFlashcard")}
                </button>
              </div>
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
