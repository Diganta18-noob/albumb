import type { Metadata } from "next";
import { TextReveal } from "@/components/motion/TextReveal";
import { FadeIn } from "@/components/motion/Parallax";
import { ChapterTimeline } from "@/components/sections/ChapterTimeline";
import { chapters } from "@/lib/data";

export const metadata: Metadata = {
  title: "Timeline",
  description: "Five months, in order. November 2025 to March 2026.",
};

export default function TimelinePage() {
  return (
    <div className="pb-8 pt-28 md:pt-36">
      <header className="mb-4 px-6 md:px-14">
        <div className="mx-auto max-w-[1400px]">
          <FadeIn>
            <span className="mono-label" style={{ color: "var(--cool)" }}>
              2025.11 → 2026.03
            </span>
          </FadeIn>
          <TextReveal
            as="h1"
            lines={["Five months,", "in order."]}
            className="mt-3 text-[var(--text-step-5)]"
          />
          <FadeIn delay={0.15}>
            <p
              className="mt-5 max-w-[56ch] text-[var(--text-step-1)]"
              style={{ color: "var(--text-dim)" }}
            >
              It only looks like a straight line from here. At the time it was one long
              week that kept starting over.
            </p>
          </FadeIn>
        </div>
      </header>

      <ChapterTimeline chapters={chapters} />
    </div>
  );
}
