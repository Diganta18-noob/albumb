import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TextReveal } from "@/components/motion/TextReveal";
import { FadeIn } from "@/components/motion/Parallax";
import { TiltCard } from "@/components/motion/TiltCard";
import { people } from "@/lib/data";

export const metadata: Metadata = {
  title: "Yearbook",
  description: "The twelve who made it through, together.",
};

export default function YearbookPage() {
  const trainees = people.filter((p) => p.role !== "Mentor");
  const mentors = people.filter((p) => p.role === "Mentor");

  return (
    <div className="px-6 pb-24 pt-28 md:px-14 md:pt-36">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-14 max-w-[60ch]">
          <FadeIn>
            <span className="mono-label" style={{ color: "var(--cool)" }}>
              The Cohort — 2025.11 → 2026.03
            </span>
          </FadeIn>
          <TextReveal
            as="h1"
            lines={["The twelve", "who made it", "through."]}
            className="mt-3 text-[var(--text-step-5)]"
          />
          <FadeIn delay={0.15}>
            <p
              className="mt-5 text-[var(--text-step-1)]"
              style={{ color: "var(--text-dim)" }}
            >
              We arrived as strangers from twelve different cities. By March we had nicknames,
              inside jokes, and a group chat that never stopped.
            </p>
          </FadeIn>
        </header>

        {/* Trainees */}
        <section aria-labelledby="trainees-title" className="mb-20">
          <h2 id="trainees-title" className="sr-only">
            Trainees
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trainees.map((p, i) => (
              <FadeIn key={p.id} delay={Math.min(i * 0.06, 0.4)}>
                <li>
                  <TiltCard intensity={6}>
                    <Link
                      href={`/yearbook/${p.slug}`}
                      className="group relative block overflow-hidden rounded-sm border transition-colors hover:border-[var(--warm)]"
                      style={{ borderColor: "var(--line)" }}
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden">
                        {p.avatar && (
                          <Image
                            src={p.avatar.url}
                            alt={p.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            placeholder={p.avatar.blurDataURL ? "blur" : undefined}
                            blurDataURL={p.avatar.blurDataURL}
                            className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                          />
                        )}
                        <div
                          aria-hidden
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to top, color-mix(in oklab, var(--surface) 72%, transparent), transparent 52%)",
                          }}
                        />
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h3 className="font-display text-[var(--text-step-2)] leading-none">
                          {p.name}
                        </h3>
                        {p.nickname && (
                          <p className="mono-label mt-2">"{p.nickname}"</p>
                        )}
                      </div>
                    </Link>
                  </TiltCard>
                </li>
              </FadeIn>
            ))}
          </ul>
        </section>

        {/* Mentors */}
        {mentors.length > 0 && (
          <section aria-labelledby="mentors-title">
            <FadeIn>
              <h2
                id="mentors-title"
                className="mb-6 font-display text-[var(--text-step-3)] leading-none"
                style={{ color: "var(--cool)" }}
              >
                Our guides
              </h2>
            </FadeIn>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mentors.map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.08}>
                  <li>
                    <Link
                      href={`/yearbook/${p.slug}`}
                      className="group flex items-center gap-4 rounded-sm border p-4 transition-colors hover:border-[var(--cool)]"
                      style={{ borderColor: "var(--line)" }}
                    >
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-full">
                        {p.avatar && (
                          <Image
                            src={p.avatar.squareUrl ?? p.avatar.url}
                            alt={p.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-display text-[var(--text-step-1)] leading-tight">
                          {p.name}
                        </h3>
                        {p.nickname && (
                          <p className="mono-label mt-1">"{p.nickname}"</p>
                        )}
                        <p className="mono-label mt-1.5" style={{ color: "var(--cool)" }}>
                          {p.role}
                        </p>
                      </div>
                    </Link>
                  </li>
                </FadeIn>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
