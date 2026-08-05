import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TextReveal } from "@/components/motion/TextReveal";
import { FadeIn } from "@/components/motion/Parallax";
import { categories, categoryCounts, memoriesForCategory } from "@/lib/data";
import { frame } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Categories",
  description: "Twelve ways to cut the same five months.",
};

/** Category accents map onto the duotone; nothing gets a colour of its own. */
const ACCENT: Record<string, string> = {
  brass: "var(--warm)",
  cyan: "var(--cool)",
  oxblood: "var(--color-oxblood)",
  ash: "var(--text-muted)",
};

export default function CategoriesPage() {
  const counts = categoryCounts();
  const total = categories.reduce((n, c) => n + (counts[c.slug] ?? 0), 0);

  return (
    <div className="px-6 pb-24 pt-28 md:px-14 md:pt-36">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-14 max-w-[62ch]">
          <FadeIn>
            <span className="mono-label" style={{ color: "var(--cool)" }}>
              The Index · {total} frames filed
            </span>
          </FadeIn>
          <TextReveal
            as="h1"
            lines={["Twelve ways to cut", "the same five months."]}
            className="mt-3 text-[var(--text-step-4)]"
          />
          <FadeIn delay={0.15}>
            <p className="mt-5 text-[var(--text-step-1)]" style={{ color: "var(--text-dim)" }}>
              Every frame lives in exactly one drawer. Some drawers are almost empty — that's
              the record too.
            </p>
          </FadeIn>
        </header>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const n = counts[c.slug] ?? 0;
            const accent = ACCENT[c.accent] ?? "var(--warm)";
            const sample = memoriesForCategory(c.slug)[0];
            const cover = c.coverImage ?? sample?.images[0];

            return (
              <FadeIn key={c.id} delay={Math.min(i * 0.05, 0.4)}>
                <li>
                  <Link
                    href={n > 0 ? `/wall?category=${c.slug}` : `/search?category=${c.slug}`}
                    aria-label={`${c.name} — ${n} ${n === 1 ? "frame" : "frames"}`}
                    className="group relative block overflow-hidden rounded-sm border transition-colors hover:border-[var(--warm)]"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <div className="relative aspect-[3/2] w-full overflow-hidden">
                      {cover && (
                        <Image
                          src={cover.url}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          placeholder={cover.blurDataURL ? "blur" : undefined}
                          blurDataURL={cover.blurDataURL}
                          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                          style={{ opacity: n === 0 ? 0.35 : 1 }}
                        />
                      )}
                      <span
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, color-mix(in oklab, var(--surface) 82%, transparent) 8%, color-mix(in oklab, var(--surface) 20%, transparent) 55%, transparent)",
                        }}
                      />
                      {/* The accent hairline is the only place a category asserts itself. */}
                      <span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                        style={{ background: accent }}
                      />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                      <div>
                        <h2 className="font-display text-[var(--text-step-2)] leading-none">
                          {c.name}
                        </h2>
                        <p
                          className="mt-2 max-w-[26ch] text-[0.92rem] leading-snug"
                          style={{ color: "var(--text-dim)" }}
                        >
                          {c.description}
                        </p>
                      </div>
                      <span
                        className="shrink-0 font-mono text-[1.6rem] leading-none tabular-nums"
                        style={{ color: n === 0 ? "var(--text-muted)" : accent }}
                      >
                        {frame(n)}
                      </span>
                    </div>
                  </Link>
                </li>
              </FadeIn>
            );
          })}
        </ul>

        <FadeIn>
          <p
            className="mt-12 border-t pt-6 text-center"
            style={{ borderColor: "var(--line)", color: "var(--text-dim)" }}
          >
            Or see where it all happened —{" "}
            <Link
              href="/places"
              className="underline decoration-[var(--warm)] decoration-1 underline-offset-4 transition-colors hover:text-[var(--warm)]"
            >
              the map
            </Link>
            .
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
