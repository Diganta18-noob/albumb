import type { Metadata } from "next";
import { Suspense } from "react";
import { TextReveal } from "@/components/motion/TextReveal";
import { FadeIn } from "@/components/motion/Parallax";
import { SearchExplorer } from "@/components/sections/SearchExplorer";
import { memories, people, chapters, categories, tags } from "@/lib/data";

export const metadata: Metadata = {
  title: "Search",
  description: "Find the frame you're looking for.",
};

export default function SearchPage() {
  const moods = [...new Set(memories.map((m) => m.mood))].sort();
  const cities = [
    ...new Set(memories.map((m) => m.location.city).filter((c): c is string => Boolean(c))),
  ].sort();

  return (
    <div className="px-6 pb-24 pt-28 md:px-14 md:pt-36">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-12 max-w-[60ch]">
          <FadeIn>
            <span className="mono-label" style={{ color: "var(--cool)" }}>
              The Finder
            </span>
          </FadeIn>
          <TextReveal
            as="h1"
            lines={["Search the", "contact sheet."]}
            className="mt-3 text-[var(--text-step-5)]"
          />
          <FadeIn delay={0.15}>
            <p className="mt-5 text-[var(--text-step-1)]" style={{ color: "var(--text-dim)" }}>
              Cross out what you don't want. What's left is the selection.
            </p>
          </FadeIn>
        </header>

        <Suspense fallback={<div className="py-24 text-center">Loading…</div>}>
          <SearchExplorer
            memories={memories}
            people={people}
            chapters={chapters}
            categories={categories}
            tags={tags}
            cities={cities}
            moods={moods}
          />
        </Suspense>
      </div>
    </div>
  );
}
