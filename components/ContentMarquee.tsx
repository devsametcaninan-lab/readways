import { Fragment, type ReactNode } from "react";

type MarqueeItem = {
  label: string;
  icon: ReactNode;
};

function IconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-slate-500"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const contentTypes: MarqueeItem[] = [
  {
    label: "Research Papers",
    icon: (
      <IconBase>
        <path d="M3 2.5h7l3 3V13.5H3V2.5z" />
        <path d="M10 2.5V5.5h3" />
        <path d="M5.5 8h5M5.5 10.5h5" />
      </IconBase>
    )
  },
  {
    label: "Technical Docs",
    icon: (
      <IconBase>
        <path d="M3 4.5 6 2l3 2.5M3 11.5 6 14l3-2.5M8.5 2v12" />
      </IconBase>
    )
  },
  {
    label: "News Articles",
    icon: (
      <IconBase>
        <rect x="2.5" y="3" width="11" height="10" rx="1" />
        <path d="M5 6h6M5 8.5h6M5 11h3.5" />
      </IconBase>
    )
  },
  {
    label: "Essays",
    icon: (
      <IconBase>
        <path d="M4 2.5h6.5L13 5v8.5H4V2.5z" />
        <path d="M7.5 8.5 9.5 10.5 12 7" />
      </IconBase>
    )
  },
  {
    label: "Academic Reading",
    icon: (
      <IconBase>
        <path d="M2.5 5.5 8 3l5.5 2.5V12l-5.5 2.5L2.5 12V5.5z" />
        <path d="M8 3v11.5" />
      </IconBase>
    )
  },
  {
    label: "Language Immersion",
    icon: (
      <IconBase>
        <circle cx="8" cy="8" r="5.5" />
        <path d="M2.5 8h11M8 2.5c1.8 2 1.8 9 0 11M8 2.5c-1.8 2-1.8 9 0 11" />
      </IconBase>
    )
  },
  {
    label: "Scientific PDFs",
    icon: (
      <IconBase>
        <path d="M6 3v2.5M10 3v2.5M5.5 11.5h5" />
        <path d="M4.5 5.5h7l1 6.5H3.5l1-6.5z" />
      </IconBase>
    )
  },
  {
    label: "Books",
    icon: (
      <IconBase>
        <path d="M3 3.5h4.5v9H3a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" />
        <path d="M8.5 3.5H13a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H8.5" />
        <path d="M8.5 3.5v9" />
      </IconBase>
    )
  },
  {
    label: "Documentation",
    icon: (
      <IconBase>
        <path d="M3 4h7l3 2.5V13H3V4z" />
        <path d="M10 4v2.5h3" />
        <path d="M5.5 8.5h4" />
      </IconBase>
    )
  },
  {
    label: "Long-form Reading",
    icon: (
      <IconBase>
        <path d="M5 2.5h6v11H5z" />
        <path d="M7 5.5h2M7 8h2M7 10.5h2" />
      </IconBase>
    )
  }
];

function MarqueeTrack() {
  return (
    <div className="flex shrink-0 items-center px-6">
      {contentTypes.map((item, index) => (
        <Fragment key={item.label}>
          <span className="flex items-center gap-2.5 whitespace-nowrap px-5 text-base text-slate-300 md:text-[17px]">
            {item.icon}
            {item.label}
          </span>
          {index < contentTypes.length - 1 && (
            <span className="text-slate-600" aria-hidden>
              ·
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}

export default function ContentMarquee() {
  return (
    <section
      className="relative -mx-6 mt-2 w-[calc(100%+3rem)] overflow-hidden border-y border-white/[0.06] py-6 md:-mx-10 md:w-[calc(100%+5rem)]"
      aria-label="Content types you can read in ReadWays"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0a0b10] to-transparent sm:w-24"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0a0b10] to-transparent sm:w-24"
      />

      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        <MarqueeTrack />
        <div aria-hidden>
          <MarqueeTrack />
        </div>
      </div>
    </section>
  );
}
