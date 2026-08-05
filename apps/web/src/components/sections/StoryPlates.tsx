"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import type { Memory, Person } from "@chronicles/types";
import { Lightbox } from "@/components/media/Lightbox";
import { useReducedMotion } from "@/lib/motion";
import { frame } from "@/lib/utils";

/**
 * The plates inside a story — every frame after the opening one.
 *
 * Kept client-side because it owns the lightbox; the surrounding article stays
 * a Server Component so the story text is in the HTML for search and sharing.
 */
export function StoryPlates({
  memory,
  people,
}: {
  memory: Memory;
  people: Person[];
}) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const plates = memory.images.slice(1);

  return (
    <>
      {plates.length > 0 && (
        <section aria-label="More frames from this memory" className="mt-16">
          <div className="mb-6 flex items-baseline gap-4">
            <span className="mono-label" style={{ color: "var(--cool)" }}>
              Frames from this roll
            </span>
            <span className="h-px flex-1" style={{ background: "var(--line)" }} />
            <span className="mono-label">{frame(memory.images.length)}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {plates.map((img, i) => (
              <motion.button
                key={img.url}
                type="button"
                onClick={() => setOpen(i + 1)}
                aria-label={`Enlarge frame ${i + 2} of ${memory.title}`}
                className="group relative block overflow-hidden rounded-sm border"
                style={{ borderColor: "var(--line)" }}
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-6% 0px" }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="relative block aspect-[4/3] w-full">
                  <Image
                    src={img.url}
                    alt={`${memory.title} — frame ${i + 2}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 46vw"
                    placeholder={img.blurDataURL ? "blur" : undefined}
                    blurDataURL={img.blurDataURL}
                    className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                </span>
                <span
                  aria-hidden
                  className="absolute left-3 top-2.5 font-mono text-[0.66rem] tracking-widest"
                  style={{ color: "var(--warm-bright)" }}
                >
                  {frame(i + 2)}
                </span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {people.length > 0 && (
        <section aria-label="People in this memory" className="mt-16">
          <span className="mono-label" style={{ color: "var(--cool)" }}>
            In this frame
          </span>
          <ul className="mt-4 flex flex-wrap gap-3">
            {people.map((p) => (
              <li key={p.id}>
                <a
                  href={`/yearbook/${p.slug}`}
                  className="group flex items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-4 transition-colors hover:border-[var(--warm)]"
                  style={{ borderColor: "var(--line)" }}
                >
                  <span className="relative block size-9 overflow-hidden rounded-full">
                    {p.avatar && (
                      <Image
                        src={p.avatar.squareUrl ?? p.avatar.url}
                        alt=""
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <span>
                    <span className="block text-[0.95rem] leading-tight">{p.name}</span>
                    {p.nickname && (
                      <span className="mono-label block leading-tight">“{p.nickname}”</span>
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AnimatePresence>
        {open !== null && (
          <Lightbox
            images={memory.images}
            index={open}
            onIndex={setOpen}
            onClose={() => setOpen(null)}
            title={memory.title}
            caption={memory.excerpt}
          />
        )}
      </AnimatePresence>
    </>
  );
}
