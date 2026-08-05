import type { Metadata } from "next";
import { TextReveal } from "@/components/motion/TextReveal";
import { FadeIn } from "@/components/motion/Parallax";
import { MemoryWall } from "@/components/sections/MemoryWall";
import { memoriesInFrameOrder, categories } from "@/lib/data";

export const metadata: Metadata = {
  title: "The Wall",
  description: "Every frame we kept, loose on the table.",
};

export default async function WallPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const all = memoriesInFrameOrder();
  const valid = categories.some((c) => c.slug === category) ? category : undefined;

  return (
    <div className="px-6 pb-24 pt-28 md:px-14 md:pt-36">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-12 max-w-[60ch]">
          <FadeIn>
            <span className="mono-label" style={{ color: "var(--cool)" }}>
              The Archive — Loose Prints
            </span>
          </FadeIn>
          <TextReveal
            as="h1"
            lines={["The wall."]}
            className="mt-3 text-[var(--text-step-5)]"
          />
          <FadeIn delay={0.15}>
            <p className="mt-5 text-[var(--text-step-1)]" style={{ color: "var(--text-dim)" }}>
              Every frame at its own size, in no particular order — the way they ended up on
              the table the night we tried to pick a favourite and couldn&rsquo;t.
            </p>
          </FadeIn>
        </header>

        <MemoryWall
          memories={all}
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
          initialCategory={valid ?? "all"}
        />
      </div>
    </div>
  );
}
