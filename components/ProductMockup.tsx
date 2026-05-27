import type { ReactNode } from "react";
import { getServerT } from "@/lib/i18n/server";

const sidebarItems = [
  { labelKey: "landing.mockupLibrary", active: false, icon: "library" },
  { labelKey: "landing.mockupSavedWords", active: false, icon: "saved" },
  { labelKey: "landing.mockupFlashcards", active: false, icon: "flashcards" },
  { labelKey: "landing.mockupReadingProgress", active: true, icon: "progress" },
  { labelKey: "landing.mockupSettings", active: false, icon: "settings" }
] as const;

const flashcards = [
  { term: "effortless", due: "Now" },
  { term: "deliberate", due: "2h" },
  { term: "coherent", due: "Tomorrow" }
];

function SidebarNavIcon({ type, active }: { type: (typeof sidebarItems)[number]["icon"]; active?: boolean }) {
  const className = `h-3.5 w-3.5 shrink-0 ${active ? "text-accentSoft" : "text-slate-600"}`;

  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {type === "library" && (
        <>
          <path d="M3 3.5h4v9H3a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" />
          <path d="M8.5 3.5H12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H8.5" />
          <path d="M8.5 3.5v9" />
        </>
      )}
      {type === "saved" && (
        <>
          <path d="M4 2.5h8v11l-4-2.5L4 13.5V2.5z" />
        </>
      )}
      {type === "flashcards" && (
        <>
          <rect x="3" y="4" width="9" height="7" rx="1" />
          <rect x="5" y="2.5" width="9" height="7" rx="1" />
        </>
      )}
      {type === "progress" && (
        <>
          <path d="M3 11.5V8.5M6.5 11.5V6M10 11.5V9.5M13 11.5V4" />
        </>
      )}
      {type === "settings" && (
        <>
          <circle cx="8" cy="8" r="2" />
          <path d="M8 2.5v1.5M8 12v1.5M2.5 8h1.5M12 8h1.5M4.2 4.2l1 1M10.8 10.8l1 1M11.8 4.2l-1 1M5.2 10.8l-1 1" />
        </>
      )}
    </svg>
  );
}

function PanelLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
      {children}
    </p>
  );
}

export default function ProductMockup() {
  const t = getServerT();
  const flashcards = [
    { term: "effortless", due: t("landing.mockupDueNow") },
    { term: "deliberate", due: "2h" },
    { term: "coherent", due: t("landing.mockupDueTomorrow") }
  ];

  return (
    <section
      className="relative mt-8 w-full pb-8 pt-2 md:mt-10 md:pb-12"
      aria-label={t("landing.mockupAriaLabel")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(540px,72vh)] w-[min(940px,115%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,140,255,0.11)_0%,rgba(124,140,255,0.03)_45%,transparent_75%)] opacity-40 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[52%] h-[min(420px,58vh)] w-[min(780px,100%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(148,163,184,0.08)_0%,transparent_70%)] opacity-35 blur-[100px]"
      />

      <div className="relative z-10 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b0c11] shadow-[0_48px_120px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)]">
        {/* App chrome */}
        <div className="flex h-11 items-center justify-between border-b border-white/[0.06] bg-[#07080c] px-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <p className="truncate text-[12px] text-slate-500">
            ReadWays — <span className="text-slate-400">The_Economist_Article.pdf</span>
          </p>
          <div className="flex items-center gap-3 text-[10px] text-slate-600">
            <span>⌘K</span>
            <span className="hidden sm:inline">{t("landing.mockupShare")}</span>
          </div>
        </div>

        <div className="flex min-h-[520px] flex-col lg:min-h-[560px] lg:flex-row">
          {/* Left sidebar */}
          <aside className="hidden w-[200px] shrink-0 border-b border-white/[0.06] bg-[#07080c] lg:flex lg:flex-col lg:border-b-0 lg:border-r">
            <div className="border-b border-white/[0.06] px-4 py-4">
              <div className="flex items-center gap-2">
                <img
                  src="/readways-logo-navbar-transparent.png"
                  alt=""
                  className="h-7 w-auto object-contain"
                />
               
              </div>
            </div>
            <nav className="flex-1 space-y-0.5 p-2">
              {sidebarItems.map((item) => (
                <div
                  key={item.labelKey}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] ${
                    item.active
                      ? "border border-white/[0.06] bg-white/[0.05] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      : "text-slate-500"
                  }`}
                >
                  <SidebarNavIcon type={item.icon} active={item.active} />
                  {t(item.labelKey)}
                </div>
              ))}
            </nav>
            <div className="border-t border-white/[0.06] p-3">
              <PanelLabel>{t("landing.mockupTodaysGoal")}</PanelLabel>
              <p className="mt-1.5 text-[13px] font-medium text-slate-300">18 / 30 words</p>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-[60%] rounded-full bg-accent/60" />
              </div>
            </div>
          </aside>

          {/* Center + right */}
          <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
            {/* Center reading panel */}
            <div className="flex min-w-0 flex-1 flex-col border-b border-white/[0.06] bg-[#0c0d13] lg:border-b-0 lg:border-r">
              <div className="flex h-10 items-center gap-3 border-b border-white/[0.06] bg-[#0a0b10] px-4 text-[10px] text-slate-600">
                <span className="text-slate-500">{t("landing.mockupPage")} 12</span>
                <span className="h-3 w-px bg-white/[0.08]" />
                <span>68% {t("landing.mockupComplete")}</span>
                <span className="h-3 w-px bg-white/[0.08]" />
                <span className="hidden text-slate-500 sm:inline">{t("landing.mockupHighlightMode")}</span>
                <span className="ml-auto flex gap-1.5">
                  <span className="rounded border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-slate-500">
                    Aa
                  </span>
                  <span className="rounded border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-slate-500">
                    −
                  </span>
                  <span className="rounded border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-slate-500">
                    +
                  </span>
                </span>
              </div>

              <div className="flex-1 px-7 py-8 md:px-11 md:py-10">
                <h2 className="mb-7 text-[16px] font-medium tracking-tight text-slate-100">
                  Why deliberate reading beats passive study
                </h2>
                <div className="max-w-prose space-y-6 text-[14px] leading-[1.92] tracking-[0.01em] text-slate-500">
                  <p>
                    Most learners treat vocabulary as a separate task—lists, drills, apps that never touch
                    what they actually want to read. The gap between study and real comprehension stays wide.
                  </p>
                  <p>
                    Great readers build{" "}
                    <span className="cursor-default border-b border-accent/40 bg-accent/[0.07] text-slate-300">
                      deliberate
                    </span>{" "}
                    habits. They choose material that challenges them without feeling overwhelming, and they
                    return to the same texts until patterns become familiar.
                  </p>
                  <p>
                    With the right tools, fluency can feel almost{" "}
                    <span className="cursor-default border-b-2 border-accent/80 bg-accent/[0.12] px-0.5 text-slate-100">
                      effortless
                    </span>
                    . Each sentence becomes a chance to grow vocabulary in context—not from isolated lists
                    you forget by next week.
                  </p>
                  <p>
                    The shift is subtle: you stop translating in your head and start recognizing{" "}
                    <span className="cursor-default border-b border-accent/40 bg-accent/[0.07] text-slate-300">
                      coherent
                    </span>{" "}
                    meaning the way you do in your first language.
                  </p>
                </div>
              </div>
            </div>

            {/* Right vocabulary panel */}
            <aside className="flex w-full shrink-0 flex-col bg-[#090a0e] lg:w-[280px]">
              <div className="flex h-10 items-center justify-between border-b border-white/[0.06] bg-[#0a0b10] px-4">
                <span className="text-[10px] text-slate-600">{t("landing.mockupInspector")}</span>
                <span className="text-[10px] text-slate-700">AI</span>
              </div>

              <div className="flex-1 px-4 py-5">
                <PanelLabel>{t("landing.mockupVocabulary")}</PanelLabel>
                <h3 className="mt-2.5 text-[22px] font-medium tracking-tight text-white">effortless</h3>
                <p className="mt-1 text-[12px] text-slate-600">adjective · /ˈefərtləs/</p>

                <div className="mt-6 space-y-5 border-t border-white/[0.06] pt-5">
                  <div>
                    <PanelLabel>{t("landing.mockupDefinition")}</PanelLabel>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                      {t("landing.mockupDefinitionText")}
                    </p>
                  </div>
                  <div>
                    <PanelLabel>{t("landing.mockupInYourText")}</PanelLabel>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                      {t("landing.mockupInYourTextText")}
                    </p>
                  </div>
                  <div>
                    <PanelLabel>{t("landing.mockupExample")}</PanelLabel>
                    <p className="mt-2 text-[13px] italic leading-relaxed text-slate-600">
                      &ldquo;{t("landing.mockupExampleSentence")}&rdquo;
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-6 w-full rounded-md border border-accent/20 bg-accent/90 px-3 py-2.5 text-[13px] font-medium text-white shadow-[0_8px_24px_rgba(124,140,255,0.15)]"
                >
                  {t("landing.mockupSaveToFlashcards")}
                </button>
              </div>
            </aside>
          </div>
        </div>

        {/* Bottom widgets bar */}
        <div className="flex flex-col gap-4 border-t border-white/[0.06] bg-[#07080c] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <PanelLabel>{t("landing.mockupFlashcards")}</PanelLabel>
            <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-0.5">
              {flashcards.map((card) => (
                <div
                  key={card.term}
                  className="flex shrink-0 items-center justify-between gap-4 rounded-lg border border-white/[0.07] bg-[#0b0c11] px-3.5 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
                >
                  <div>
                    <p className="text-[12px] font-medium text-slate-200">{card.term}</p>
                    <p className="mt-0.5 text-[10px] text-slate-600">
                      {t("landing.mockupDuePrefix")
                        ? `${t("landing.mockupDuePrefix")} ${card.due}`
                        : card.due}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-600">↗</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden min-w-[140px] flex-col gap-1.5 rounded-lg border border-white/[0.07] bg-[#0b0c11] px-3.5 py-2.5 sm:flex">
              <div className="flex items-center justify-between">
                <PanelLabel>{t("landing.mockupSession")}</PanelLabel>
                <span className="text-[10px] text-slate-500">12 / 24</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-1/2 rounded-full bg-accent/50" />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-[#0b0c11] px-3.5 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
              <div>
                <p className="text-[12px] font-medium text-slate-300">{t("landing.mockupQuickQuiz")}</p>
                <p className="mt-0.5 text-[10px] text-slate-600">{t("landing.mockupCardsDue")}</p>
              </div>
              <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-500">
                {t("landing.mockupStart")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
