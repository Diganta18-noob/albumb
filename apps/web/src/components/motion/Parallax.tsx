"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Scroll parallax on transform only. `distance` is in pixels of total travel
 * across the element's full pass through the viewport.
 */
export function Parallax({
  children,
  className,
  distance = 80,
  scale = false,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  scale?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.4 });
  const y = useTransform(smooth, [0, 1], [distance, -distance]);
  const s = useTransform(smooth, [0, 0.5, 1], scale ? [1.12, 1.02, 1.12] : [1, 1, 1]);

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      {/* `relative` so `next/image` with `fill` positions against this box. */}
      <motion.div style={reduced ? undefined : { y, scale: s }} className="relative size-full">
        {children}
      </motion.div>
    </div>
  );
}

/** Fades and lifts a block as it enters. The default section entrance. */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.95, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
