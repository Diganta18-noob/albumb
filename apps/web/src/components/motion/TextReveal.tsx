"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Per-line mask reveal — the type slides up from behind its own edge, the way
 * a print emerges from an enlarger's mask. Splits on explicit line breaks so
 * the caller controls the ragging rather than the browser.
 */
export function TextReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.12,
  as: Tag = "h2",
  id,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  /** Set when a section uses aria-labelledby to point at this heading. */
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const reduced = useReducedMotion();

  return (
    <Tag className={className} id={id} ref={ref as never}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className={cn("block", lineClassName)}
            initial={reduced ? { y: 0 } : { y: "108%" }}
            animate={inView || reduced ? { y: 0 } : undefined}
            transition={{
              duration: 1.05,
              delay: reduced ? 0 : delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/**
 * Word-by-word fade for body copy. Used sparingly — long passages get a
 * single block fade instead, because per-word on a paragraph reads as noise.
 */
export function WordFade({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();
  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
          animate={inView || reduced ? { opacity: 1, y: 0 } : undefined}
          transition={{
            duration: 0.6,
            delay: reduced ? 0 : delay + i * 0.018,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </p>
  );
}
