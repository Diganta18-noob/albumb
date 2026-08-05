import type { Metadata } from "next";
import { TextReveal } from "@/components/motion/TextReveal";
import { FadeIn } from "@/components/motion/Parallax";
import { SurveyMap } from "@/components/sections/SurveyMap";
import { memoriesInFrameOrder } from "@/lib/data";

export const metadata: Metadata = {
  title: "Places",
  description: "Every frame, plotted where it happened.",
};

export default function PlacesPage() {
  const memories = memoriesInFrameOrder();

  return (
    <div className="px-6 pb-24 pt-28 md:px-14 md:pt-36">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-12 max-w-[62ch]">
          <FadeIn>
            <span className="mono-label" style={{ color: "var(--cool)" }}>
              The Survey
            </span>
          </FadeIn>
          <TextReveal
            as="h1"
            lines={["It all happened", "inside 200km."]}
            className="mt-3 text-[var(--text-step-4)]"
          />
          <FadeIn delay={0.15}>
            <p className="mt-5 text-[var(--text-step-1)]" style={{ color: "var(--text-dim)" }}>
              Five months, and almost every frame within walking distance of the same building.
              The one exception is the hillside house, and everyone still talks about it.
            </p>
          </FadeIn>
        </header>

        <SurveyMap memories={memories} />
      </div>
    </div>
  );
}
