"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Pointer-tracked 3D tilt with a moving safelight sheen.
 *
 * Transform-only, so it composites on the GPU and holds 60fps. The sheen is
 * a radial gradient positioned from the same pointer values, which reads as
 * light raking across a glossy print rather than a generic hover glow.
 */
export function TiltCard({
  children,
  className,
  intensity = 8,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = { stiffness: 240, damping: 26, mass: 0.5 };
  const rx = useSpring(useTransform(py, [0, 1], [intensity, -intensity]), spring);
  const ry = useSpring(useTransform(px, [0, 1], [-intensity, intensity]), spring);

  const sheenX = useTransform(px, (v) => `${v * 100}%`);
  const sheenY = useTransform(py, (v) => `${v * 100}%`);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reduced) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      px.set((e.clientX - r.left) / r.width);
      py.set((e.clientY - r.top) / r.height);
    },
    [px, py, reduced],
  );

  const onLeave = useCallback(() => {
    px.set(0.5);
    py.set(0.5);
  }, [px, py]);

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("relative", className)}
      style={
        reduced
          ? undefined
          : { rotateX: rx, rotateY: ry, transformPerspective: 1200, transformStyle: "preserve-3d" }
      }
    >
      {children}
      {glare && !reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100"
          style={{
            background: useTransform(
              [sheenX, sheenY],
              ([x, y]) =>
                `radial-gradient(420px circle at ${x} ${y}, color-mix(in oklab, var(--warm) 22%, transparent), transparent 62%)`,
            ),
            mixBlendMode: "soft-light",
          }}
        />
      )}
    </motion.div>
  );
}
