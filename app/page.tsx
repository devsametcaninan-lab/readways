import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import Link from "next/link";
import ContentMarquee from "@/components/ContentMarquee";
import FeatureShowcase from "@/components/FeatureShowcase";
import ReadingWorkflow from "@/components/ReadingWorkflow";
import KnowledgeOrbit from "@/components/KnowledgeOrbit";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FinalCta from "@/components/FinalCta";
import ProductMockup from "@/components/ProductMockup";

export const metadata: Metadata = {
  title: "ReadWays - Learn vocabulary while reading PDFs",
  description:
    "Upload PDFs, click words in context, save vocabulary as flashcards, and review what you learn."
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-20 pt-12 md:px-10">
      <section id="hero" className="flex w-full max-w-4xl flex-col items-start pt-20 md:pt-28">
        <h1 className="max-w-4xl text-balance text-3xl font-medium tracking-tight leading-[1.1] text-white md:text-5xl lg:text-[3.75rem]">
          The language learning system for real readers.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-400 md:mt-10 md:text-xl">
          Upload PDFs, learn words in context, and build vocabulary while you read.
        </p>
        <Link
          href="/signup"
          className="mt-10 rounded-full border border-accent/30 bg-accent px-7 py-3 text-sm font-medium text-white shadow-premium transition hover:-translate-y-0.5 hover:bg-[#6D7EFF] md:mt-12"
        >
          Start Reading
        </Link>
      </section>

      <ProductMockup />

      <ContentMarquee />

      <FeatureShowcase />

      <ReadingWorkflow />

      <KnowledgeOrbit />

      <PricingSection />

      <TestimonialsSection />

      <FinalCta />
      </main>
    </>
  );
}
