import { Hero } from "@/components/hero/Hero";
import { ChapterTimeline } from "@/components/sections/ChapterTimeline";
import { ContactSheet } from "@/components/sections/ContactSheet";
import { memoryBySlug, memoriesInFrameOrder, chapters, stats } from "@/lib/data";
import { notFound } from "next/navigation";

export default function HomePage() {
  const cover = memoryBySlug("farewell") ?? memoriesInFrameOrder()[0];
  if (!cover) notFound();

  const totals = stats();

  return (
    <>
      <Hero cover={cover} />
      <ChapterTimeline chapters={chapters} />
      <ContactSheet memories={memoriesInFrameOrder()} totals={totals} />
    </>
  );
}
