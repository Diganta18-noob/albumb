import Image from "next/image";
import Link from "next/link";
import type { Chapter } from "@chronicles/types";
import { TextReveal } from "@/components/motion/TextReveal";
import { FadeIn, Parallax } from "@/components/motion/Parallax";
import { memoriesForChapter } from "@/lib/data";
import { monthLabel, frame } from "@/lib/utils";

/**
 * The month-wise timeline. Each chapter is a full-bleed spread with its own
 * plate, story, and a strip of the frames it contains.
 *
 * Chapter sections carry `id="chapter-YYYY-MM"` — the film spine reads those
 * to decide which sprocket is lit.
 */
export function ChapterTimeline({ chapters }: { chapters: Chapter[] }) {
  return (
    <div className="relative">
      {chapters.map((chapter, i) => {
        const frames = memoriesForChapter(chapter.id);
        const cover = chapter.coverImage;
        const flip = i % 2 === 1;

        return (
          <section
            key={chapter.id}
            id={`chapter-${chapter.yearMonth}`}
            aria-labelledby={`chapter-title-${chapter.id}`}
            className="relative border-t px-6 py-24 md:px-14 md:py-32"
            style={{ borderColor: "var(--line)" }}
          >
            <div
              className={`mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                flip ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Plate */}
              <Parallax distance={44} scale className="rounded-sm">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm md:aspect-[3/4]">
                  {cover && (
                    <Image
                      src={cover.url}
                      alt={`${chapter.title} — ${monthLabel(chapter.yearMonth)}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 46vw"
                      placeholder={cover.blurDataURL ? "blur" : undefined}
                      blurDataURL={cover.blurDataURL}
                      className="object-cover"
                    />
                  )}
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, color-mix(in oklab, var(--surface) 55%, transparent), transparent 45%)",
                    }}
                  />
                </div>
              </Parallax>

              {/* Story */}
              <div>
                <FadeIn>
                  <div className="mb-5 flex items-baseline gap-4">
                    <span
                      className="font-mono text-[var(--text-step-2)] leading-none"
                      style={{ color: "var(--warm)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mono-label" style={{ color: "var(--cool)" }}>
                      {monthLabel(chapter.yearMonth)}
                    </span>
                  </div>
                </FadeIn>

                <TextReveal
                  as="h2"
                  id={`chapter-title-${chapter.id}`}
                  lines={[chapter.title]}
                  className="text-[var(--text-step-4)]"
                />

                <FadeIn delay={0.1}>
                  <p
                    className="mt-4 text-[var(--text-step-1)] text-[var(--text-dim)]"
                    style={{ fontStyle: "italic" }}
                  >
                    {chapter.tagline}
                  </p>
                </FadeIn>

                <FadeIn delay={0.16}>
                  <div className="mt-7 space-y-4 text-[var(--text-dim)]">
                    {chapter.story.split("\n\n").slice(0, 2).map((para, pi) => (
                      <p key={pi}>{para}</p>
                    ))}
                  </div>
                </FadeIn>

                {/* Frame strip for this chapter. */}
                <FadeIn delay={0.22}>
                  <ul className="mt-9 flex flex-wrap gap-2.5">
                    {frames.map((m) => (
                      <li key={m.id}>
                        <Link
                          href={`/memory/${m.slug}`}
                          className="group relative block size-[68px] overflow-hidden rounded-[3px] border transition-colors"
                          style={{ borderColor: "var(--line)" }}
                        >
                          {m.images[0] && (
                            <Image
                              src={m.images[0].squareUrl ?? m.images[0].url}
                              alt={m.title}
                              fill
                              sizes="68px"
                              className="object-cover transition-all duration-700 group-hover:scale-110"
                              style={{ filter: "grayscale(1) contrast(1.05)" }}
                            />
                          )}
                          <span
                            aria-hidden
                            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                            style={{
                              background:
                                "linear-gradient(to top, color-mix(in oklab, var(--warm) 55%, transparent), transparent)",
                            }}
                          />
                          <span
                            aria-hidden
                            className="absolute bottom-1 left-1.5 font-mono text-[0.6rem] opacity-70"
                            style={{ color: "var(--color-paper)" }}
                          >
                            {frame(m.frameNumber)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </FadeIn>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
