const sidebarItems = [
  { label: "Library", active: false },
  { label: "Saved Words", active: false },
  { label: "Flashcards", active: false },
  { label: "Reading Progress", active: true },
  { label: "Settings", active: false }
];

const flashcards = [
  { term: "effortless", due: "Now" },
  { term: "deliberate", due: "2h" },
  { term: "coherent", due: "Tomorrow" }
];

function NavIcon({ active }: { active?: boolean }) {
  return (
    <span
      className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-accent" : "bg-white/20"}`}
      aria-hidden
    />
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
      {children}
    </p>
  );
}

export default function ProductMockup() {
  return (
    <section
      className="relative mt-8 w-full pb-8 pt-2 md:mt-10 md:pb-12"
      aria-label="ReadWays product preview"
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
            <span className="hidden sm:inline">Share</span>
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
                  key={item.label}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] ${
                    item.active
                      ? "border border-white/[0.06] bg-white/[0.05] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      : "text-slate-500"
                  }`}
                >
                  <NavIcon active={item.active} />
                  {item.label}
                </div>
              ))}
            </nav>
            <div className="border-t border-white/[0.06] p-3">
              <PanelLabel>Today&apos;s goal</PanelLabel>
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
                <span className="text-slate-500">Page 12</span>
                <span className="h-3 w-px bg-white/[0.08]" />
                <span>68% complete</span>
                <span className="h-3 w-px bg-white/[0.08]" />
                <span className="hidden text-slate-500 sm:inline">Highlight mode</span>
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
                <span className="text-[10px] text-slate-600">Inspector</span>
                <span className="text-[10px] text-slate-700">AI</span>
              </div>

              <div className="flex-1 px-4 py-5">
                <PanelLabel>Vocabulary</PanelLabel>
                <h3 className="mt-2.5 text-[22px] font-medium tracking-tight text-white">effortless</h3>
                <p className="mt-1 text-[12px] text-slate-600">adjective · /ˈefərtləs/</p>

                <div className="mt-6 space-y-5 border-t border-white/[0.06] pt-5">
                  <div>
                    <PanelLabel>Definition</PanelLabel>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                      requiring little or no effort; achieved with ease
                    </p>
                  </div>
                  <div>
                    <PanelLabel>In your text</PanelLabel>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                      Used to contrast passive study with natural fluency—the author suggests tools can make
                      progress feel <span className="text-slate-300">effortless</span> without removing
                      challenge.
                    </p>
                  </div>
                  <div>
                    <PanelLabel>Example</PanelLabel>
                    <p className="mt-2 text-[13px] italic leading-relaxed text-slate-600">
                      &ldquo;With practice, reading in a second language can feel effortless.&rdquo;
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-6 w-full rounded-md border border-accent/20 bg-accent/90 px-3 py-2.5 text-[13px] font-medium text-white shadow-[0_8px_24px_rgba(124,140,255,0.15)]"
                >
                  Save to Flashcards
                </button>
              </div>
            </aside>
          </div>
        </div>

        {/* Bottom widgets bar */}
        <div className="flex flex-col gap-4 border-t border-white/[0.06] bg-[#07080c] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <PanelLabel>Flashcards</PanelLabel>
            <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-0.5">
              {flashcards.map((card) => (
                <div
                  key={card.term}
                  className="flex shrink-0 items-center justify-between gap-4 rounded-lg border border-white/[0.07] bg-[#0b0c11] px-3.5 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
                >
                  <div>
                    <p className="text-[12px] font-medium text-slate-200">{card.term}</p>
                    <p className="mt-0.5 text-[10px] text-slate-600">Due {card.due}</p>
                  </div>
                  <span className="text-[10px] text-slate-600">↗</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden min-w-[140px] flex-col gap-1.5 rounded-lg border border-white/[0.07] bg-[#0b0c11] px-3.5 py-2.5 sm:flex">
              <div className="flex items-center justify-between">
                <PanelLabel>Session</PanelLabel>
                <span className="text-[10px] text-slate-500">12 / 24</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-1/2 rounded-full bg-accent/50" />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-[#0b0c11] px-3.5 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
              <div>
                <p className="text-[12px] font-medium text-slate-300">Quick quiz</p>
                <p className="mt-0.5 text-[10px] text-slate-600">3 cards due</p>
              </div>
              <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-500">
                Start
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
