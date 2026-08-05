"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { TextReveal } from "@/components/motion/TextReveal";
import { useReducedMotion } from "@/lib/motion";
import { DustMotes } from "@/components/hero/DustMotes";
import type { Memory } from "@chronicles/types";
import { stamp, frame } from "@/lib/utils";

/**
 * The cinematic opening.
 *
 * Load is orchestrated, not simultaneous: the plate surfaces from blur first,
 * then the title masks up line by line, then the chrome fades in. That order
 * is the whole first impression — everything arriving at once reads cheap.
 */
export function Hero({ cover }: { cover: Memory }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const plateY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const plateScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const image = cover.images[0];

  return (
    <section
      ref={ref}
      className="relative flex h-dvh min-h-[640px] w-full items-end overflow-hidden"
    >
      {/* The plate. Slow zoom continues after load so it never feels static. */}
      <motion.div
        className="absolute inset-0"
        style={reduced ? undefined : { y: plateY, scale: plateScale }}
      >
        <motion.div
          className="relative size-full"
          initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 1.08, filter: "blur(18px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {image && (
            <Image
              src={image.url}
              alt=""
              fill
              priority
              sizes="100vw"
              quality={90}
              placeholder={image.blurDataURL ? "blur" : undefined}
              blurDataURL={image.blurDataURL}
              className="object-cover"
            />
          )}
        </motion.div>
      </motion.div>

      {/* Grade: crush the plate toward ink so type stays legible over any photo. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--surface) 4%, color-mix(in oklab, var(--surface) 72%, transparent) 38%, color-mix(in oklab, var(--surface) 24%, transparent) 72%, color-mix(in oklab, var(--surface) 45%, transparent) 100%)",
        }}
      />

      <DustMotes />

      <motion.div
        className="relative z-10 w-full px-6 pb-16 md:px-14 md:pb-20"
        style={reduced ? undefined : { y: copyY, opacity: copyOpacity }}
      >
        <motion.div
          className="mb-6 flex items-center gap-3"
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <span
            aria-hidden
            className="block h-px w-12"
            style={{ background: "var(--warm)" }}
          />
          <span className="mono-label" style={{ color: "var(--warm)" }}>
            Frame {frame(cover.frameNumber)} — {stamp(cover.date)}
          </span>
        </motion.div>

        <TextReveal
          as="h1"
          lines={["Every Moment", "Has A Story"]}
          className="display-xl max-w-[16ch]"
          delay={0.55}
          stagger={0.14}
        />

        <motion.p
          className="mt-7 max-w-[34ch] text-[var(--text-dim)] md:text-[var(--text-step-1)]"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontStyle: "italic" }}
        >
          From strangers to lifelong memories.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-5"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="#chapter-2025-11"
            className="group relative overflow-hidden rounded-full px-7 py-3.5"
            style={{ background: "var(--warm)", color: "var(--color-ink)" }}
          >
            <span className="mono-label relative z-10" style={{ color: "inherit" }}>
              Start Reading
            </span>
            <span
              aria-hidden
              className="absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
              style={{ background: "var(--warm-bright)" }}
            />
          </Link>

          <Link
            href="/wall"
            className="mono-label rounded-full border px-6 py-3.5 transition-colors hover:text-[var(--warm)]"
            style={{ borderColor: "var(--line)" }}
          >
            Jump to the wall
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator — a film advance lever, not a bouncing chevron. */}
      <motion.div
        aria-hidden
        className="absolute bottom-7 right-6 z-10 hidden items-center gap-3 md:right-14 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        style={{ opacity: copyOpacity }}
      >
        <span className="mono-label">Scroll</span>
        <span className="relative block h-14 w-px" style={{ background: "var(--line)" }}>
          <motion.span
            className="absolute inset-x-0 top-0 block h-4"
            style={{ background: "var(--warm)" }}
            animate={reduced ? undefined : { y: [0, 40, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
