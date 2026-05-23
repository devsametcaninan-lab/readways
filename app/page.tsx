import Navbar from "@/components/Navbar";
import ContentMarquee from "@/components/ContentMarquee";
import ProductMockup from "@/components/ProductMockup";

const features = [
  {
    title: "Upload PDF",
    description: "Drop any PDF. Your next lesson is ready in seconds."
  },
  {
    title: "Learn in Context",
    description: "Tap a word. See meaning, usage, and context—right in the sentence."
  },
  {
    title: "Flashcards & Quiz",
    description: "Cards and quizzes from what you read. Review what actually sticks."
  }
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-20 pt-12 md:px-10">
      <section className="flex w-full max-w-4xl flex-col items-start pt-20 md:pt-28">
        <h1 className="max-w-4xl text-balance text-5xl font-medium tracking-tight leading-[1.08] text-white md:text-7xl lg:text-[5.25rem]">
          The language learning system for real readers.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-400 md:mt-10 md:text-xl">
          Upload PDFs, learn words in context, and build vocabulary while you read.
        </p>
        <button className="mt-10 rounded-full border border-accent/30 bg-accent px-7 py-3 text-sm font-medium text-white shadow-premium transition hover:-translate-y-0.5 hover:bg-[#6D7EFF] md:mt-12">
          Start Reading
        </button>
      </section>

      <ProductMockup />

      <ContentMarquee />

      <section className="mt-20 grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm transition hover:border-accent/60 hover:bg-card"
          >
            <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{feature.description}</p>
          </article>
        ))}
      </section>
      </main>
    </>
  );
}
