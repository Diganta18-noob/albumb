import Image from "next/image";
import Link from "next/link";
import type { Memory } from "@chronicles/types";
import { TextReveal } from "@/components/motion/TextReveal";
import { FadeIn } from "@/components/motion/Parallax";
import { TiltCard } from "@/components/motion/TiltCard";
import { Counter } from "@/components/motion/Counter";
import { stamp, frame } from "@/lib/utils";

interface Totals {
  memories: number;
  photos: number;
  people: number;
  projects: number;
  certificates: number;
  cities: number;
  daysTogether: number;
}

/**
 * The contact sheet — every frame in the archive, numbered, in one grid.
 *
 * This is the design thesis made literal: photos live as small numbered
 * frames, and choosing one enlarges it to a full magazine print. Frames are
 * desaturated until hover, the way a contact sheet is a working document
 * rather than the finished print.
 */
export function ContactSheet({
  memories,
  totals,
}: {
  memories: Memory[];
  totals: Totals;
}) {
  return (
    <section
      id="contact-sheet"
      aria-labelledby="contact-sheet-title"
      className="relative border-t px-6 py-24 md:px-14 md:py-32"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
          <div>
            <FadeIn>
              <span className="mono-label" style={{ color: "var(--cool)" }}>
                The Archive — Sheet 01
              </span>
            </FadeIn>
            <TextReveal
              as="h2"
              id="contact-sheet-title"
              lines={["Every frame", "we kept."]}
              className="mt-3 text-[var(--text-step-4)]"
            />
          </div>

          {/* Animated counters — the statistics section, folded in here where
              the numbers actually describe what you're looking at. */}
          <FadeIn delay={0.15}>
            <dl className="flex flex-wrap gap-x-9 gap-y-4">
              <Stat label="Frames" value={totals.photos} />
              <Stat label="Stories" value={totals.memories} />
              <Stat label="People" value={totals.people} />
              <Stat label="Days" value={totals.daysTogether} />
            </dl>
          </FadeIn>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {memories.map((m, i) => {
            const img = m.images[0];
            return (
              <li key={m.id}>
                <FadeIn delay={Math.min(i * 0.03, 0.4)}>
                  <TiltCard intensity={6}>
                    <Link
                      href={`/memory/${m.slug}`}
                      className="group relative block overflow-hidden rounded-sm border"
                      style={{ borderColor: "var(--line)" }}
                    >
                      <div className="relative aspect-square w-full overflow-hidden">
                        {img && (
                          <Image
                            src={img.squareUrl ?? img.url}
                            alt={m.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            placeholder={img.blurDataURL ? "blur" : undefined}
                            blurDataURL={img.blurDataURL}
                            className="object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                            style={{ filter: "grayscale(0.85) contrast(1.04)" }}
                          />
                        )}
                        {/* Colour blooms in on hover — the print developing. */}
                        <span
                          aria-hidden
                          className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                          style={{
                            backdropFilter: "saturate(2.4)",
                            WebkitBackdropFilter: "saturate(2.4)",
                          }}
                        />
                        <span
                          aria-hidden
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to top, color-mix(in oklab, var(--surface-sunk) 82%, transparent) 2%, transparent 52%)",
                          }}
                        />
                      </div>

                      {/* Grease-pencil frame number. */}
                      <span
                        aria-hidden
                        className="absolute left-2.5 top-2 font-mono text-[0.68rem] tracking-widest"
                        style={{ color: "var(--warm)" }}
                      >
                        {frame(m.frameNumber)}
                      </span>

                      {m.favorite && (
                        <span
                          aria-hidden
                          className="absolute right-2.5 top-2.5 block size-1.5 rounded-full"
                          style={{ background: "var(--warm-bright)" }}
                        />
                      )}

                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <h3 className="font-display text-[1.05rem] leading-tight">{m.title}</h3>
                        <p className="mono-label mt-1.5">
                          {stamp(m.date)} · {m.location.city}
                        </p>
                      </div>
                    </Link>
                  </TiltCard>
                </FadeIn>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dd
        className="font-mono text-[var(--text-step-2)] leading-none"
        style={{ color: "var(--warm)" }}
      >
        <Counter to={value} />
      </dd>
      <dt className="mono-label mt-1.5">{label}</dt>
    </div>
  );
}
