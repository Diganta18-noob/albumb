import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Parallax, FadeIn } from "@/components/motion/Parallax";
import { TextReveal } from "@/components/motion/TextReveal";
import { StoryPlates } from "@/components/sections/StoryPlates";
import { Reactions } from "@/components/sections/Reactions";
import {
  memories,
  memoryBySlug,
  neighbours,
  peopleById,
  categoriesBySlug,
  chapters,
} from "@/lib/data";
import { stamp, frame, monthLabel } from "@/lib/utils";

export function generateStaticParams() {
  return memories.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const memory = memoryBySlug(slug);
  if (!memory) return { title: "Frame not found" };

  return {
    title: memory.title,
    description: memory.excerpt,
    openGraph: {
      title: memory.title,
      description: memory.excerpt,
      images: memory.images[0] ? [{ url: memory.images[0].url }] : undefined,
      type: "article",
    },
  };
}

/**
 * The print.
 *
 * A frame chosen from the contact sheet, enlarged: full-bleed opening plate,
 * then a single measured column of story with the metadata running alongside
 * as a caption rail. The rail is deliberately mono and cool-toned — the
 * technical record — while the story stays warm serif. Same duotone rule as
 * everywhere else, applied at the scale of a magazine spread.
 */
export default async function MemoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const memory = memoryBySlug(slug);
  if (!memory) notFound();

  const cover = memory.images[0];
  const { prev, next } = neighbours(memory.id);
  const cast = memory.people.map((id) => peopleById.get(id)).filter((p) => p !== undefined);
  const category = categoriesBySlug.get(memory.category);
  const chapter = chapters.find((c) => c.yearMonth === memory.chapter);
  const paragraphs = memory.story.split("\n\n").filter(Boolean);

  return (
    <article>
      {/* Opening plate */}
      <header className="relative h-[78svh] min-h-[520px] w-full overflow-hidden">
        <Parallax distance={60} scale className="absolute inset-0">
          {cover && (
            <Image
              src={cover.url}
              alt={memory.title}
              fill
              priority
              sizes="100vw"
              placeholder={cover.blurDataURL ? "blur" : undefined}
              blurDataURL={cover.blurDataURL}
              className="object-cover"
            />
          )}
        </Parallax>

        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--surface) 2%, color-mix(in oklab, var(--surface) 55%, transparent) 32%, transparent 72%)",
          }}
        />

        <div className="absolute inset-x-0 bottom-0 px-6 pb-12 md:px-14 md:pb-16">
          <div className="mx-auto max-w-[1100px]">
            <FadeIn>
              <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                <span
                  className="font-mono text-[0.72rem] tracking-[0.2em]"
                  style={{ color: "var(--warm)" }}
                >
                  FRAME {frame(memory.frameNumber)}
                </span>
                <span className="mono-label" style={{ color: "var(--cool-bright)" }}>
                  {stamp(memory.date)}
                </span>
                {category && (
                  <Link
                    href={`/wall?category=${category.slug}`}
                    className="mono-label rounded transition-colors hover:text-[var(--warm)]"
                  >
                    {category.name}
                  </Link>
                )}
              </div>
            </FadeIn>

            <TextReveal
              as="h1"
              lines={[memory.title]}
              className="text-[var(--text-step-5)]"
              delay={0.1}
            />

            <FadeIn delay={0.28}>
              <p
                className="mt-5 max-w-[54ch] text-[var(--text-step-1)]"
                style={{ color: "var(--text-dim)", fontStyle: "italic" }}
              >
                {memory.excerpt}
              </p>
            </FadeIn>
          </div>
        </div>
      </header>

      {/* Story + caption rail */}
      <div className="px-6 pb-24 pt-16 md:px-14 md:pt-20">
        <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
          <div>
            <FadeIn>
              <div className="space-y-6 text-[1.08rem] leading-[1.75]" style={{ color: "var(--text-dim)" }}>
                {paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[4.2rem] first-letter:leading-[0.78] first-letter:text-[var(--warm)]"
                        : undefined
                    }
                  >
                    {para}
                  </p>
                ))}
              </div>
            </FadeIn>

            {memory.quote && (
              <FadeIn delay={0.1}>
                <blockquote
                  className="my-12 border-l-2 pl-6"
                  style={{ borderColor: "var(--warm)" }}
                >
                  <p
                    className="font-display text-[var(--text-step-2)] leading-[1.15]"
                    style={{ color: "var(--text)" }}
                  >
                    “{memory.quote}”
                  </p>
                </blockquote>
              </FadeIn>
            )}

            <StoryPlates memory={memory} people={cast} />

            <div
              className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t pt-8"
              style={{ borderColor: "var(--line)" }}
            >
              <Reactions memoryId={memory.id} seed={memory.reactions} />
              <span className="mono-label">{memory.viewCount.toLocaleString()} views</span>
            </div>
          </div>

          {/* The caption rail — the technical record, in the cool voice. */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <dl
              className="space-y-5 border-t pt-6 lg:border-t-0 lg:pt-0"
              style={{ borderColor: "var(--line)" }}
            >
              <Field label="Location">
                {memory.location.name}
                <span className="block" style={{ color: "var(--text-muted)" }}>
                  {[memory.location.city, memory.location.country].filter(Boolean).join(", ")}
                </span>
                {memory.location.lat !== undefined && memory.location.lng !== undefined && (
                  <span className="mono-label mt-1 block" style={{ color: "var(--cool)" }}>
                    {memory.location.lat.toFixed(4)}, {memory.location.lng.toFixed(4)}
                  </span>
                )}
              </Field>

              {chapter && (
                <Field label="Chapter">
                  <Link
                    href={`/timeline#chapter-${chapter.yearMonth}`}
                    className="rounded transition-colors hover:text-[var(--warm)]"
                  >
                    {chapter.title}
                    <span className="mono-label mt-0.5 block">{monthLabel(chapter.yearMonth)}</span>
                  </Link>
                </Field>
              )}

              <Field label="Mood">{memory.mood}</Field>
              <Field label="Weather">{memory.weather}</Field>
              {memory.photographer && <Field label="Photographer">{memory.photographer}</Field>}
              <Field label="Reading">{memory.readingTimeMinutes} min</Field>

              {memory.tags.length > 0 && (
                <Field label="Tags">
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    {memory.tags.map((t) => (
                      <Link
                        key={t}
                        href={`/search?tag=${encodeURIComponent(t)}`}
                        className="mono-label rounded-full border px-2.5 py-1 transition-colors hover:border-[var(--warm)] hover:text-[var(--warm)]"
                        style={{ borderColor: "var(--line)" }}
                      >
                        {t}
                      </Link>
                    ))}
                  </span>
                </Field>
              )}
            </dl>
          </aside>
        </div>
      </div>

      {/* The page turn */}
      <nav
        aria-label="Adjacent frames"
        className="grid border-t sm:grid-cols-2"
        style={{ borderColor: "var(--line)" }}
      >
        <Turn side="prev" memory={prev} />
        <Turn side="next" memory={next} />
      </nav>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mono-label" style={{ color: "var(--cool)" }}>
        {label}
      </dt>
      <dd className="mt-1 text-[0.95rem] capitalize leading-snug">{children}</dd>
    </div>
  );
}

/**
 * Prev/next as a physical page turn: the neighbouring plate sits behind a
 * scrim and lifts on hover, hinged from the edge it turns toward.
 */
function Turn({
  side,
  memory,
}: {
  side: "prev" | "next";
  memory: { slug: string; title: string; frameNumber?: number; images: { url: string; blurDataURL?: string }[] } | null;
}) {
  if (!memory) {
    return (
      <div
        className="grid min-h-[180px] place-items-center px-6 py-12 sm:border-l"
        style={{ borderColor: "var(--line)" }}
      >
        <span className="mono-label">{side === "prev" ? "Start of roll" : "End of roll"}</span>
      </div>
    );
  }

  const img = memory.images[0];

  return (
    <Link
      href={`/memory/${memory.slug}`}
      className={`group relative grid min-h-[180px] items-center overflow-hidden px-6 py-12 md:px-14 ${
        side === "next" ? "sm:border-l sm:text-right" : ""
      }`}
      style={{ borderColor: "var(--line)" }}
    >
      {img && (
        <Image
          src={img.url}
          alt=""
          fill
          sizes="50vw"
          placeholder={img.blurDataURL ? "blur" : undefined}
          blurDataURL={img.blurDataURL}
          className="object-cover opacity-20 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-35"
          style={{ filter: "grayscale(0.7)" }}
        />
      )}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ background: "color-mix(in oklab, var(--surface) 62%, transparent)" }}
      />
      <span className="relative">
        <span className="mono-label block" style={{ color: "var(--cool)" }}>
          {side === "prev" ? "← Previous frame" : "Next frame →"}
        </span>
        <span className="mt-2 block font-display text-[var(--text-step-2)] leading-none">
          {memory.title}
        </span>
        <span className="mono-label mt-2 block" style={{ color: "var(--warm)" }}>
          {frame(memory.frameNumber)}
        </span>
      </span>
    </Link>
  );
}
