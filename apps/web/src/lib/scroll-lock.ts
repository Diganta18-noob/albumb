"use client";

/**
 * One scroll owner at a time.
 *
 * The lightbox needs the page to hold still, and `overflow: hidden` alone
 * doesn't do it — Lenis runs its own RAF loop and keeps transforming. The
 * instance registers itself here so locks can stop it too. Reference-counted
 * so a nested lock doesn't release the page early.
 */

interface Scroller {
  stop: () => void;
  start: () => void;
}

let scroller: Scroller | null = null;
let locks = 0;
let restore = "";

export function registerScroller(instance: Scroller): () => void {
  scroller = instance;
  if (locks > 0) instance.stop();
  return () => {
    if (scroller === instance) scroller = null;
  };
}

export function lockScroll(): void {
  locks += 1;
  if (locks > 1) return;

  // Compensate for the vanishing scrollbar so the layout doesn't jump.
  const gap = window.innerWidth - document.documentElement.clientWidth;
  restore = document.body.style.cssText;
  document.body.style.overflow = "hidden";
  if (gap > 0) document.body.style.paddingRight = `${gap}px`;
  scroller?.stop();
}

export function unlockScroll(): void {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;

  document.body.style.cssText = restore;
  scroller?.start();
}
