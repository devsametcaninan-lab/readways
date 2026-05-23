import type { ReactNode } from "react";

function LineArt({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-auto w-full max-w-[220px] text-white/25 transition-all duration-300 group-hover:text-white/45 md:duration-500"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function PdfStackVisual() {
  return (
    <LineArt>
      <rect x="52" y="28" width="88" height="108" rx="4" />
      <rect x="40" y="20" width="88" height="108" rx="4" />
      <rect x="28" y="12" width="88" height="108" rx="4" />
      <path d="M44 36h52M44 48h52M44 60h36" />
      <path d="M56 12v14h16" />
    </LineArt>
  );
}

function ContextVisual() {
  return (
    <LineArt>
      <path d="M24 88h152" />
      <path d="M24 104h120" />
      <path d="M24 72h96" />
      <rect x="88" y="58" width="72" height="36" rx="4" strokeWidth="1" />
      <path d="M96 70h40M96 78h28" />
      <path d="M88 88h24" strokeWidth="1.5" />
      <path d="M112 88h8" stroke="#9FA9FF" strokeWidth="1.5" opacity="0.7" />
      <path d="M120 88h56" strokeWidth="1" />
    </LineArt>
  );
}

function FlashcardVisual() {
  return (
    <LineArt>
      <rect x="48" y="36" width="104" height="72" rx="5" />
      <rect x="56" y="28" width="104" height="72" rx="5" />
      <rect x="64" y="20" width="104" height="72" rx="5" />
      <path d="M80 48h72M80 60h56M80 72h40" />
      <circle cx="148" cy="76" r="8" />
      <path d="M145 76l2 2 4-4" />
    </LineArt>
  );
}

const features = [
  {
    title: "Read real content",
    description:
      "Upload PDFs, articles, essays, research papers, or books and read them in a focused, distraction-free workspace.",
    Visual: PdfStackVisual
  },
  {
    title: "Understand words in context",
    description:
      "Click any unfamiliar word and get its meaning based on the sentence you are reading, not just a generic dictionary definition.",
    Visual: ContextVisual
  },
  {
    title: "Remember with flashcards",
    description:
      "Save words instantly and review them later with flashcards built from the original sentence and context.",
    Visual: FlashcardVisual
  }
];

export default function FeatureShowcase() {
  return (
    <section className="mt-24 md:mt-32">
      <div className="max-w-3xl">
        <h2 className="text-balance text-3xl font-medium tracking-tight text-white md:text-4xl">
          Built for deep reading, not passive memorization.
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-slate-400">
          ReadWays turns real PDFs into an interactive language learning workspace — so every article,
          essay, or book becomes vocabulary practice.
        </p>
      </div>

      <div className="mt-14 overflow-visible rounded-2xl border border-white/[0.08] bg-card/30 md:mt-16">
        <div className="grid divide-y divide-white/[0.06] md:grid-cols-3 md:divide-x md:divide-y-0">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group flex min-h-[380px] flex-col border border-transparent px-8 py-10 transition-all duration-300 md:min-h-[420px] md:px-9 md:py-12 md:duration-500 md:hover:-translate-y-1 md:hover:border-white/20 md:hover:shadow-[0_20px_50px_rgba(124,140,255,0.12)]"
            >
              <div className="flex flex-1 items-center justify-center pb-10 pt-4">
                <feature.Visual />
              </div>
              <div>
                <h3 className="text-lg font-medium tracking-tight text-white/90 transition-colors duration-300 group-hover:text-white md:text-xl md:duration-500">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500 md:text-[15px]">
                  {feature.description}
                </p>
              </div>
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
