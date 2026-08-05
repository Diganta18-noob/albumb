"use client";

import { useEffect, useState } from "react";

/**
 * Single source of truth for motion gating. Every GSAP timeline and Framer
 * variant checks this; the CSS media query in globals.css is the backstop.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Three.js and other heavy effects only run when the device can afford it.
 * Cheap heuristics beat a benchmark here — we just need to avoid melting a
 * low-end phone for ambient dust motes.
 */
export function useCanAffordEffects(): boolean {
  const reduced = useReducedMotion();
  const [afford, setAfford] = useState(false);

  useEffect(() => {
    if (reduced) {
      setAfford(false);
      return;
    }
    const cores = navigator.hardwareConcurrency ?? 4;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.innerWidth < 768;
    setAfford(cores >= 4 && mem >= 4 && !(coarse && narrow));
  }, [reduced]);

  return afford;
}

/** Framer variants used across sections, so reveals share one rhythm. */
export const reveal = {
  hidden: { opacity: 0, y: 24 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export const revealStagger = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/** Print-emerge: how a photo arrives, like an image surfacing in developer. */
export const emerge = {
  hidden: { opacity: 0, scale: 1.04, filter: "blur(12px)" },
  shown: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as const },
  },
};
