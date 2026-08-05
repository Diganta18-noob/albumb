"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Memory, Person, Chapter, Category } from "@chronicles/types";
import { useReducedMotion } from "@/lib/motion";
import { stamp, frame, monthLabel } from "@/lib/utils";
import { buildIndex, runSearch, activeCount, EMPTY_FACETS, type Facets } from "@/lib/search";

type FacetKey = Exclude<keyof Facets, "q">;

/**
 * The finder.
 *
 * A contact sheet you interrogate. Facets are the grease-pencil marks a photo
 * editor makes on a sheet — cross out what you don't want, and what's left is
 * the selection. Everything runs locally against the seed, so results land on
 * the same frame as the keystroke and the URL stays shareable.
 */
export function SearchExplorer({
  memories,
  people,
  chapters,
  categories,
  tags,
  cities,
  moods,
}: {
  memories: Memory[];
  people: Person[];
  chapters: Chapter[];
  categories: Category[];
  tags: { slug: string; name: string; count: number }[];
  cities: string[];
  moods: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const reduced = useReducedMotion();
  const input = useRef<HTMLInputElement>(null);

  const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const index = useMemo(() => buildIndex(memories, peopleById), [memories, peopleById]);

  /* Deep links land here: /search?tag=hackathon from a memory's caption rail. */
  const [facets, setFacets] = useState<Facets>(() => ({
    ...EMPTY_FACETS,
    q: params.get("q") ?? "",
    tag: params.getAll("tag"),
    person: params.getAll("person"),
    category: params.getAll("category"),
    mood: params.getAll("mood"),
    chapter: params.getAll("chapter"),
    city: params.getAll("city"),
  }));

  const results = useMemo(
    () => runSearch(index, facets, peopleById),
    [index, facets, peopleById],
  );
  const active = activeCount(facets);

  /* Mirror state into the URL so a search can be sent to someone. Replace
     rather than push — every keystroke in the history would trap the back
     button. */
  useEffect(() => {
    const next = new URLSearchParams();
    if (facets.q.trim()) next.set("q", facets.q.trim());
    for (const key of ["person", "category", "mood", "tag", "chapter", "city"] as FacetKey[]) {
      for (const v of facets[key]) next.append(key, v);
    }
    const qs = next.toString();
    router.replace(qs ? `/search?${qs}` : "/search", { scroll: false });
  }, [facets, router]);

  /* `/` focuses the field, the way every tool this cohort used behaves. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        input.current?.focus();
      }
      if (e.key === "Escape" && typing) input.current?.blur();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = useCallback((key: FacetKey, value: string) => {
    setFacets((f) => {
      const on = f[key].includes(value);
      return { ...f, [key]: on ? f[key].filter((v) => v !== value) : [...f[key], value] };
    });
  }, []);

  const clear = useCallback(() => setFacets({ ...EMPTY_FACETS }), []);

  /* Counts reflect what each option would return *given the other facets* —
     so an option that leads to zero results can be greyed rather than clicked
     into a dead end. */
  const countFor = useCallback(
    (key: FacetKey, value: string) =>
      runSearch(index, { ...facets, [key]: [value] }, peopleById).length,
    [index, facets, peopleById],
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
      {/* The mark-up rail */}
      <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100svh-8rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
        <div className="relative">
          <input
            ref={input}
            type="search"
            value={facets.q}
            onChange={(e) => setFacets((f) => ({ ...f, q: e.target.value }))}
            placeholder="Search the roll…"
            aria-label="Search memories"
            className="w-full rounded-sm border bg-transparent px-3 py-2.5 pr-10 text-[0.95rem] outline-none transition-colors focus:border-[var(--warm)]"
            style={{ borderColor: "var(--line)" }}
          />
          <kbd
            aria-hidden
            className="mono-label pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          >
            /
          </kbd>
        </div>

        {active > 0 && (
          <button
            type="button"
            onClick={clear}
            className="mono-label mt-3 transition-colors hover:text-[var(--warm)]"
            style={{ color: "var(--cool)" }}
          >
            Clear {active} {active === 1 ? "mark" : "marks"} ✕
          </button>
        )}

        <Group title="People">
          {people.map((p) => (
            <Option
              key={p.id}
              on={facets.person.includes(p.id)}
              n={countFor("person", p.id)}
              onClick={() => toggle("person", p.id)}
            >
              {p.name}
            </Option>
          ))}
        </Group>

        <Group title="Chapter">
          {chapters.map((c) => (
            <Option
              key={c.id}
              on={facets.chapter.includes(c.yearMonth)}
              n={countFor("chapter", c.yearMonth)}
              onClick={() => toggle("chapter", c.yearMonth)}
            >
              {monthLabel(c.yearMonth)}
            </Option>
          ))}
        </Group>

        <Group title="Category">
          {categories.map((c) => (
            <Option
              key={c.id}
              on={facets.category.includes(c.slug)}
              n={countFor("category", c.slug)}
              onClick={() => toggle("category", c.slug)}
            >
              {c.name}
            </Option>
          ))}
        </Group>

        <Group title="Mood">
          {moods.map((m) => (
            <Option
              key={m}
              on={facets.mood.includes(m)}
              n={countFor("mood", m)}
              onClick={() => toggle("mood", m)}
            >
              {m}
            </Option>
          ))}
        </Group>

        <Group title="Place">
          {cities.map((c) => (
            <Option
              key={c}
              on={facets.city.includes(c)}
              n={countFor("city", c)}
              onClick={() => toggle("city", c)}
            >
              {c}
            </Option>
          ))}
        </Group>

        <Group title="Tags">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => {
              const on = facets.tag.includes(t.slug);
              return (
                <button
                  key={t.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle("tag", t.slug)}
                  className="mono-label rounded-full border px-2.5 py-1 transition-colors"
                  style={{
                    borderColor: on ? "var(--warm)" : "var(--line)",
                    color: on ? "var(--warm-bright)" : undefined,
                    background: on
                      ? "color-mix(in oklab, var(--warm) 12%, transparent)"
                      : undefined,
                  }}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </Group>
      </aside>

      {/* Results */}
      <div>
        <div
          className="mb-8 flex items-baseline gap-4 border-b pb-4"
          style={{ borderColor: "var(--line)" }}
        >
          <span className="mono-label" style={{ color: "var(--cool)" }}>
            {results.length === memories.length
              ? `All ${results.length} frames`
              : `${results.length} of ${memories.length} frames`}
          </span>
          <span className="h-px flex-1" style={{ background: "var(--line)" }} />
        </div>

        {results.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-[var(--text-step-3)] leading-none">
              Nothing on this roll.
            </p>
            <p className="mt-4" style={{ color: "var(--text-dim)" }}>
              No frame matches every mark. Try removing one.
            </p>
            <button
              type="button"
              onClick={clear}
              className="mono-label mt-6 rounded-full border px-4 py-2 transition-colors hover:border-[var(--warm)] hover:text-[var(--warm)]"
              style={{ borderColor: "var(--line)" }}
            >
              Clear all marks
            </button>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {results.map((m, i) => (
                <motion.li
                  key={m.id}
                  layout={!reduced}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.97 }}
                  transition={{
                    duration: 0.5,
                    delay: reduced ? 0 : Math.min(i * 0.025, 0.25),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={`/memory/${m.slug}`}
                    className="group relative block overflow-hidden rounded-sm border transition-colors hover:border-[var(--warm)]"
                    style={{ borderColor: "var(--line)" }}
                  >
                    {m.images[0] && (
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={m.images[0].url}
                          alt={m.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          placeholder={m.images[0].blurDataURL ? "blur" : undefined}
                          blurDataURL={m.images[0].blurDataURL}
                          className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                        />
                        <span
                          aria-hidden
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to top, color-mix(in oklab, var(--surface) 72%, transparent), transparent 55%)",
                          }}
                        />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <span className="mono-label block" style={{ color: "var(--cool-bright)" }}>
                        {stamp(m.date)} · {m.location.city || m.location.name}
                      </span>
                      <h3 className="mt-1 font-display text-[1.25rem] leading-tight">
                        {m.title}
                      </h3>
                    </div>
                    <span
                      className="mono-label absolute left-3 top-2.5"
                      style={{ color: "var(--warm-bright)" }}
                    >
                      {frame(m.frameNumber)}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mono-label mb-2.5" style={{ color: "var(--cool)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * A facet row. The count is the honest part — it says what clicking will do
 * before you click, and a zero disables the row rather than offering a dead end.
 */
function Option({
  children,
  on,
  n,
  onClick,
}: {
  children: React.ReactNode;
  on: boolean;
  n: number;
  onClick: () => void;
}) {
  const dead = n === 0 && !on;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      disabled={dead}
      className="flex w-full items-baseline gap-2 py-1 text-left text-[0.9rem] transition-colors disabled:cursor-not-allowed"
      style={{
        color: on ? "var(--warm-bright)" : dead ? "var(--text-muted)" : "var(--text-dim)",
        opacity: dead ? 0.4 : 1,
      }}
    >
      <span
        aria-hidden
        className="w-3 shrink-0 font-mono text-[0.7rem]"
        style={{ color: on ? "var(--warm)" : "transparent" }}
      >
        ✕
      </span>
      <span className="flex-1 capitalize">{children}</span>
      <span className="mono-label shrink-0">{n}</span>
    </button>
  );
}
