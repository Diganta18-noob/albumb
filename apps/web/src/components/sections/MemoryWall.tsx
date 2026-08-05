"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { Memory } from "@chronicles/types";
import { Lightbox } from "@/components/media/Lightbox";
import { useReducedMotion } from "@/lib/motion";
import { stamp, frame } from "@/lib/utils";

const BATCH = 12;

/**
 * The wall — every frame loose on the table, in their natural proportions.
 *
 * The contact sheet on the home page is disciplined: uniform squares, strict
 * chronology. This is its opposite, and that contrast is the point. Tiles keep
 * each photo's real aspect ratio in a masonry, so the wall has the ragged
 * silhouette of prints spread out rather than a tidy grid.
 */
export function MemoryWall({
  memories,
  categories,
  initialCategory = "all",
}: {
  memories: Memory[];
  categories: { slug: string; name: string }[];
  initialCategory?: string;
}) {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<string>(initialCategory);
  const [shown, setShown] = useState(BATCH);
  const [open, setOpen] = useState<{ memory: Memory; index: number } | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => (filter === "all" ? memories : memories.filter((m) => m.category === filter)),
    [filter, memories],
  );

  const slice = visible.slice(0, shown);
  const more = shown < visible.length;

  /* Infinite scroll. The observer is cheaper than a scroll listener and
     survives Lenis's transform-based scrolling, which offsets don't. */
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !more) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setShown((n) => n + BATCH);
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [more, filter]);

  const choose = useCallback((slug: string) => {
    setFilter(slug);
    setShown(BATCH);
  }, []);

  const used = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of memories) counts.set(m.category, (counts.get(m.category) ?? 0) + 1);
    return categories.filter((c) => counts.has(c.slug));
  }, [categories, memories]);

  return (
    <>
      {/* Filters */}
      <div className="mb-10 flex flex-wrap items-center gap-2">
        <Chip active={filter === "all"} onClick={() => choose("all")}>
          All · {memories.length}
        </Chip>
        {used.map((c) => (
          <Chip key={c.slug} active={filter === c.slug} onClick={() => choose(c.slug)}>
            {c.name}
          </Chip>
        ))}
      </div>

      {/* Masonry. CSS columns rather than a JS layout engine — no measurement
          pass, no reflow thrash, and it degrades to one column on its own. */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-4">
        {slice.map((m, i) => {
          const img = m.images[0];
          if (!img) return null;
          const ratio = img.width && img.height ? img.width / img.height : 4 / 5;

          return (
            <motion.figure
              key={m.id}
              className="break-inside-avoid"
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-4% 0px" }}
              transition={{
                duration: 0.85,
                delay: reduced ? 0 : Math.min((i % BATCH) * 0.04, 0.32),
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div
                className="group relative overflow-hidden rounded-sm border"
                style={{ borderColor: "var(--line)" }}
              >
                <button
                  type="button"
                  onClick={() => setOpen({ memory: m, index: 0 })}
                  className="block w-full"
                  aria-label={`Enlarge ${m.title}`}
                >
                  <span
                    className="relative block w-full"
                    style={{ aspectRatio: `${ratio}` }}
                  >
                    <Image
                      src={img.url}
                      alt={m.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      placeholder={img.blurDataURL ? "blur" : undefined}
                      blurDataURL={img.blurDataURL}
                      className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                    />
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(to top, color-mix(in oklab, var(--color-ink-sunk) 88%, transparent), transparent 58%)",
                    }}
                  />
                  <span
                    aria-hidden
                    className="absolute left-3 top-2.5 font-mono text-[0.66rem] tracking-widest opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ color: "var(--warm-bright)" }}
                  >
                    {frame(m.frameNumber)}
                  </span>
                  {m.images.length > 1 && (
                    <span className="mono-label absolute right-3 top-2.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      +{m.images.length - 1}
                    </span>
                  )}
                </button>

                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="mono-label" style={{ color: "var(--cool-bright)" }}>
                    {stamp(m.date)} · {m.location.city || m.location.name}
                  </p>
                  <h3 className="mt-1 font-display text-[1.3rem] leading-tight">{m.title}</h3>
                  <Link
                    href={`/memory/${m.slug}`}
                    className="mono-label pointer-events-auto mt-2 inline-block underline decoration-[color-mix(in_oklab,var(--warm)_60%,transparent)] underline-offset-4 hover:text-[var(--warm)]"
                  >
                    Read the story →
                  </Link>
                </figcaption>
              </div>
            </motion.figure>
          );
        })}
      </div>

      {more && (
        <div ref={sentinel} className="grid place-items-center py-16">
          <span className="mono-label animate-pulse">Developing more frames…</span>
        </div>
      )}

      {!more && visible.length > 0 && (
        <p className="mono-label py-16 text-center">
          End of roll · {visible.length} frames
        </p>
      )}

      <AnimatePresence>
        {open && (
          <Lightbox
            images={open.memory.images}
            index={open.index}
            onIndex={(index) => setOpen((o) => (o ? { ...o, index } : o))}
            onClose={() => setOpen(null)}
            title={open.memory.title}
            caption={open.memory.excerpt}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="mono-label rounded-full border px-3.5 py-1.5 transition-colors"
      style={{
        borderColor: active ? "var(--warm)" : "var(--line)",
        color: active ? "var(--warm-bright)" : undefined,
        background: active ? "color-mix(in oklab, var(--warm) 12%, transparent)" : undefined,
      }}
    >
      {children}
    </button>
  );
}
