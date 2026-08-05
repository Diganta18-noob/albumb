import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TextReveal } from "@/components/motion/TextReveal";
import { FadeIn, Parallax } from "@/components/motion/Parallax";
import { people, personBySlug, memoriesForPerson, memoryBySlug } from "@/lib/data";
import { stamp, frame } from "@/lib/utils";

export function generateStaticParams() {
  return people.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const person = personBySlug(slug);
  if (!person) return { title: "Not in the cohort" };

  return {
    title: person.nickname ? `${person.name} — “${person.nickname}”` : person.name,
    description: person.bio || person.favoriteQuote,
    openGraph: {
      title: person.name,
      description: person.bio || person.favoriteQuote,
      images: person.avatar ? [{ url: person.avatar.url }] : undefined,
      type: "profile",
    },
  };
}

/**
 * The personnel card.
 *
 * A yearbook page is a record about a person and a portrait of them, and those
 * are two different voices. The portrait plate and the pull quote carry the warm
 * one; the index card beside it stays mono and cool — the same duotone split the
 * memory spreads use, at the scale of a single person.
 */
export default async function PersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const person = personBySlug(slug);
  if (!person) notFound();

  const frames = memoriesForPerson(person.id);
  const favorite = person.favoriteMemoryId ? memoryBySlug(person.favoriteMemoryId) : undefined;

  const roster = people;
  const at = roster.findIndex((p) => p.id === person.id);
  const prev = at > 0 ? roster[at - 1] : null;
  const next = at < roster.length - 1 ? roster[at + 1] : null;

  return (
    <article className="px-6 pb-24 pt-28 md:px-14 md:pt-36">
      <div className="mx-auto max-w-[1200px]">
        <FadeIn>
          <Link
            href="/yearbook"
            className="mono-label transition-colors hover:text-[var(--warm)]"
            style={{ color: "var(--cool)" }}
          >
            ← The cohort
          </Link>
        </FadeIn>

        {/* Portrait + record */}
        <header className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-16">
          <FadeIn>
            <div
              className="relative overflow-hidden rounded-sm border"
              style={{ borderColor: "var(--line)" }}
            >
              <Parallax distance={26} className="relative aspect-[4/5] w-full">
                {person.avatar && (
                  <Image
                    src={person.avatar.url}
                    alt={person.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 440px"
                    placeholder={person.avatar.blurDataURL ? "blur" : undefined}
                    blurDataURL={person.avatar.blurDataURL}
                    className="object-cover"
                  />
                )}
              </Parallax>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, color-mix(in oklab, var(--surface) 60%, transparent), transparent 55%)",
                }}
              />
              <span
                className="mono-label absolute left-4 top-3"
                style={{ color: "var(--warm-bright)" }}
              >
                {person.period}
              </span>
            </div>
          </FadeIn>

          <div>
            <FadeIn delay={0.08}>
              <span className="mono-label" style={{ color: "var(--cool)" }}>
                {person.role}
              </span>
            </FadeIn>

            <TextReveal
              as="h1"
              lines={[person.name]}
              className="mt-2 text-[var(--text-step-4)]"
              delay={0.1}
            />

            {person.nickname && (
              <FadeIn delay={0.2}>
                <p
                  className="mt-1 font-hand text-[2.4rem] leading-none"
                  style={{ color: "var(--warm)" }}
                >
                  “{person.nickname}”
                </p>
              </FadeIn>
            )}

            {person.favoriteQuote && (
              <FadeIn delay={0.26}>
                <blockquote
                  className="mt-7 border-l-2 pl-5"
                  style={{ borderColor: "var(--warm)" }}
                >
                  <p className="font-display text-[var(--text-step-2)] leading-[1.15]">
                    “{person.favoriteQuote}”
                  </p>
                </blockquote>
              </FadeIn>
            )}

            {person.bio && (
              <FadeIn delay={0.32}>
                <p
                  className="mt-7 max-w-[52ch] text-[1.06rem] leading-[1.75]"
                  style={{ color: "var(--text-dim)" }}
                >
                  {person.bio}
                </p>
              </FadeIn>
            )}

            <FadeIn delay={0.38}>
              <dl
                className="mt-8 grid gap-5 border-t pt-6 sm:grid-cols-2"
                style={{ borderColor: "var(--line)" }}
              >
                {person.department && <Field label="Department">{person.department}</Field>}
                <Field label="Frames appeared in">{frames.length}</Field>
                {person.funFact && (
                  <div className="sm:col-span-2">
                    <Field label="On the record">{person.funFact}</Field>
                  </div>
                )}
              </dl>
            </FadeIn>
          </div>
        </header>

        {/* Achievements */}
        {person.achievements.length > 0 && (
          <section className="mt-16">
            <FadeIn>
              <h2
                className="mb-6 font-display text-[var(--text-step-2)] leading-none"
                style={{ color: "var(--cool)" }}
              >
                Earned
              </h2>
            </FadeIn>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {person.achievements.map((a, i) => (
                <FadeIn key={i} delay={i * 0.06}>
                  <li
                    className="rounded-sm border p-5"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <span
                      className="mono-label block"
                      style={{ color: "var(--warm-bright)" }}
                    >
                      ✦
                    </span>
                    <p className="mt-2 text-[0.98rem] leading-snug">{a}</p>
                  </li>
                </FadeIn>
              ))}
            </ul>
          </section>
        )}

        {/* Best memory callout */}
        {favorite && (
          <section className="mt-16">
            <FadeIn>
              <h2
                className="mb-6 font-display text-[var(--text-step-2)] leading-none"
                style={{ color: "var(--cool)" }}
              >
                Best memory
              </h2>
            </FadeIn>
            <FadeIn delay={0.08}>
              <Link
                href={`/memory/${favorite.slug}`}
                className="group relative block overflow-hidden rounded-sm border transition-colors hover:border-[var(--warm)]"
                style={{ borderColor: "var(--line)" }}
              >
                {favorite.images[0] && (
                  <div className="relative aspect-[3/2] w-full overflow-hidden lg:aspect-[21/9]">
                    <Image
                      src={favorite.images[0].url}
                      alt={favorite.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 1200px"
                      placeholder={favorite.images[0].blurDataURL ? "blur" : undefined}
                      blurDataURL={favorite.images[0].blurDataURL}
                      className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, color-mix(in oklab, var(--surface) 75%, transparent), transparent 60%)",
                      }}
                    />
                  </div>
                )}
                <div className="p-6 sm:absolute sm:inset-x-0 sm:bottom-0">
                  <span
                    className="mono-label block"
                    style={{ color: "var(--cool-bright)" }}
                  >
                    {stamp(favorite.date)}
                  </span>
                  <h3 className="mt-2 font-display text-[var(--text-step-3)] leading-none">
                    {favorite.title}
                  </h3>
                  {person.bestMemory && (
                    <p
                      className="mt-4 max-w-[58ch] text-[0.98rem] leading-relaxed"
                      style={{ color: "var(--text-dim)", fontStyle: "italic" }}
                    >
                      {person.bestMemory}
                    </p>
                  )}
                </div>
              </Link>
            </FadeIn>
          </section>
        )}

        {/* All frames they appear in */}
        {frames.length > 0 && (
          <section className="mt-16">
            <FadeIn>
              <div className="mb-6 flex items-baseline gap-4">
                <h2
                  className="font-display text-[var(--text-step-2)] leading-none"
                  style={{ color: "var(--cool)" }}
                >
                  Appears in
                </h2>
                <span className="h-px flex-1" style={{ background: "var(--line)" }} />
                <span className="mono-label">{frames.length} frames</span>
              </div>
            </FadeIn>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {frames.map((m, i) => {
                const img = m.images[0];
                return (
                  <FadeIn key={m.id} delay={Math.min(i * 0.05, 0.36)}>
                    <Link
                      href={`/memory/${m.slug}`}
                      className="group relative block overflow-hidden rounded-sm border transition-colors hover:border-[var(--warm)]"
                      style={{ borderColor: "var(--line)" }}
                    >
                      {img && (
                        <div className="relative aspect-[4/5] w-full">
                          <Image
                            src={img.url}
                            alt={m.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            placeholder={img.blurDataURL ? "blur" : undefined}
                            blurDataURL={img.blurDataURL}
                            className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                          />
                          <span
                            aria-hidden
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(to top, color-mix(in oklab, var(--surface) 68%, transparent), transparent 50%)",
                            }}
                          />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <span
                          className="mono-label block"
                          style={{ color: "var(--warm-bright)" }}
                        >
                          {frame(m.frameNumber)}
                        </span>
                        <h3 className="mt-1 text-[1.1rem] leading-tight">{m.title}</h3>
                      </div>
                    </Link>
                  </FadeIn>
                );
              })}
            </div>
          </section>
        )}

        {/* Navigation */}
        <nav
          className="mt-20 grid border-t sm:grid-cols-2"
          style={{ borderColor: "var(--line)" }}
          aria-label="Adjacent cohort members"
        >
          {prev ? (
            <Link
              href={`/yearbook/${prev.slug}`}
              className="group flex items-center gap-4 border-b px-6 py-8 transition-colors hover:border-[var(--warm)] sm:border-b-0 sm:border-r"
              style={{ borderColor: "var(--line)" }}
            >
              {prev.avatar && (
                <div className="relative size-14 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={prev.avatar.squareUrl ?? prev.avatar.url}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <span className="mono-label block" style={{ color: "var(--cool)" }}>
                  ← Previous
                </span>
                <span className="mt-1 block font-display text-[1.2rem] leading-tight">
                  {prev.name}
                </span>
              </div>
            </Link>
          ) : (
            <div
              className="grid place-items-center border-b px-6 py-8 sm:border-b-0 sm:border-r"
              style={{ borderColor: "var(--line)" }}
            >
              <span className="mono-label">Start of cohort</span>
            </div>
          )}

          {next ? (
            <Link
              href={`/yearbook/${next.slug}`}
              className="group flex items-center justify-end gap-4 px-6 py-8 text-right transition-colors hover:border-[var(--warm)]"
            >
              <div>
                <span className="mono-label block" style={{ color: "var(--cool)" }}>
                  Next →
                </span>
                <span className="mt-1 block font-display text-[1.2rem] leading-tight">
                  {next.name}
                </span>
              </div>
              {next.avatar && (
                <div className="relative size-14 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={next.avatar.squareUrl ?? next.avatar.url}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              )}
            </Link>
          ) : (
            <div className="grid place-items-center px-6 py-8">
              <span className="mono-label">End of cohort</span>
            </div>
          )}
        </nav>
      </div>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mono-label" style={{ color: "var(--cool)" }}>
        {label}
      </dt>
      <dd className="mt-1 text-[0.98rem] leading-snug">{children}</dd>
    </div>
  );
}
