import AppCard from "@/components/app/AppCard";

export default function ReaderDemoPage() {
  return (
    <div className="flex h-full min-h-[calc(100vh-3rem)] flex-col lg:min-h-screen">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0a0b10] px-4 text-[11px] text-slate-500">
        <span className="text-slate-400">The_Economist_Article.pdf</span>
        <span>Page 12 · 68% complete</span>
        <span className="hidden sm:inline">Highlight mode</span>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex-1 overflow-y-auto bg-[#0c0d13] px-6 py-8 md:px-12 md:py-10">
          <h2 className="mb-6 text-[15px] font-medium text-slate-200">
            Why deliberate reading beats passive study
          </h2>
          <div className="mx-auto max-w-prose space-y-5 text-[15px] leading-[1.9] text-slate-500">
            <p>
              Most learners treat vocabulary as a separate task—lists, drills, apps that never
              touch what they actually want to read.
            </p>
            <p>
              Great readers build{" "}
              <span className="border-b-2 border-accent/80 bg-accent/[0.12] px-0.5 text-slate-100">
                deliberate
              </span>{" "}
              habits. They choose material that challenges them without feeling overwhelming.
            </p>
            <p>
              With the right tools, fluency can feel almost effortless. Each sentence becomes a
              chance to grow vocabulary in context.
            </p>
          </div>
        </div>

        <aside className="hidden w-[300px] shrink-0 border-l border-white/[0.06] bg-[#090a0e] p-5 lg:block">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
            Vocabulary
          </p>
          <h3 className="mt-3 text-xl font-medium text-white">deliberate</h3>
          <p className="mt-1 text-[12px] text-slate-600">adjective · /dɪˈlɪbərət/</p>
          <p className="mt-5 text-[13px] leading-relaxed text-slate-400">
            Done consciously and intentionally — describing how skilled readers approach difficult
            texts.
          </p>
          <button
            type="button"
            className="mt-6 w-full rounded-md border border-accent/25 bg-accent/90 py-2.5 text-[13px] font-medium text-white"
          >
            Save to Flashcards
          </button>
        </aside>
      </div>
    </div>
  );
}
