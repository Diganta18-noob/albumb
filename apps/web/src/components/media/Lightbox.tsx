"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Image as ImageAsset } from "@chronicles/types";
import { useReducedMotion } from "@/lib/motion";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { frame } from "@/lib/utils";

/**
 * The enlarger.
 *
 * A frame chosen from the contact sheet is projected full-screen: the image
 * sits on a bed of its own colour, blown up and blurred behind it, the way
 * light spills around the easel in a darkroom. The extracted palette is shown
 * as swatches — it is real data from the file, so it earns its place.
 *
 * Keyboard is a first-class path: ← → to move, + − 0 to zoom, Esc to close.
 */
export function Lightbox({
  images,
  index,
  onIndex,
  onClose,
  title,
  caption,
}: {
  images: ImageAsset[];
  index: number;
  onIndex: (next: number) => void;
  onClose: () => void;
  title: string;
  caption?: string;
}) {
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [shared, setShared] = useState(false);

  const current = images[index];
  const many = images.length > 1;

  const go = useCallback(
    (delta: number) => {
      if (!many) return;
      setZoom(1);
      setPan({ x: 0, y: 0 });
      onIndex((index + delta + images.length) % images.length);
    },
    [index, images.length, many, onIndex],
  );

  const zoomTo = useCallback((next: number) => {
    const clamped = Math.min(3.4, Math.max(1, next));
    setZoom(clamped);
    if (clamped === 1) setPan({ x: 0, y: 0 });
  }, []);

  /* Scroll lock + focus management. */
  useEffect(() => {
    restoreFocus.current = document.activeElement as HTMLElement | null;
    lockScroll();
    closeButton.current?.focus();
    return () => {
      unlockScroll();
      restoreFocus.current?.focus?.();
    };
  }, []);

  /* Keyboard. Also traps Tab inside the dialog. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          return;
        case "ArrowRight":
          e.preventDefault();
          go(1);
          return;
        case "ArrowLeft":
          e.preventDefault();
          go(-1);
          return;
        case "+":
        case "=":
          e.preventDefault();
          zoomTo(zoom + 0.5);
          return;
        case "-":
          e.preventDefault();
          zoomTo(zoom - 0.5);
          return;
        case "0":
          e.preventDefault();
          zoomTo(1);
          return;
        case "Tab": {
          const focusables = dialog.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
          );
          if (!focusables || focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (!first || !last) return;
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
          return;
        }
        default:
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, zoom, zoomTo]);

  /* Drag to pan, but only once the print is enlarged. */
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom === 1) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const limit = 260 * zoom;
    setPan({
      x: Math.max(-limit, Math.min(limit, d.px + (e.clientX - d.x))),
      y: Math.max(-limit, Math.min(limit, d.py + (e.clientY - d.y))),
    });
  };

  const endDrag = () => {
    drag.current = null;
  };

  async function download() {
    if (!current) return;
    const name = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${frame(index + 1)}.jpg`;
    try {
      const res = await fetch(current.url, { mode: "cors" });
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = name;
      a.click();
      URL.revokeObjectURL(href);
    } catch {
      // Cross-origin without CORS headers — hand the file to the browser.
      window.open(current.url, "_blank", "noopener,noreferrer");
    }
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2200);
    } catch {
      /* dismissed — nothing to report */
    }
  }

  if (!current) return null;

  const tint = current.palette?.[0] ? `#${current.palette[0]}` : "var(--color-brass)";

  return (
    <motion.div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — frame ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-[90] flex flex-col"
      initial={reduced ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduced ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* The bed of light: the frame's own colour, blurred huge. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "color-mix(in oklab, var(--color-ink-sunk) 94%, black)" }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.blurDataURL ?? current.url}
          alt=""
          className="absolute left-1/2 top-1/2 size-[130%] -translate-x-1/2 -translate-y-1/2 object-cover"
          style={{ filter: "blur(72px) saturate(1.7)", opacity: 0.42 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(115% 80% at 50% 42%, color-mix(in oklab, ${tint} 22%, transparent), transparent 68%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(130% 90% at 50% 50%, transparent 38%, color-mix(in oklab, black 78%, transparent))",
          }}
        />
      </div>

      {/* Chrome — glass belongs here and nowhere else. */}
      <div className="relative z-10 flex items-start justify-between gap-3 p-3 md:p-5">
        <div className="glass flex items-center gap-3 rounded-full px-4 py-2">
          <span className="font-mono text-[0.68rem] tracking-widest" style={{ color: "var(--warm)" }}>
            {frame(index + 1)}
          </span>
          <span className="mono-label">/ {frame(images.length)}</span>
          {current.palette && current.palette.length > 0 && (
            <span aria-hidden className="ml-1 hidden items-center gap-1 sm:flex">
              {current.palette.slice(0, 5).map((hex, i) => (
                <span
                  key={`${hex}-${i}`}
                  className="block size-2 rounded-full"
                  style={{ background: `#${hex}` }}
                />
              ))}
            </span>
          )}
        </div>

        <div className="glass flex items-center gap-1 rounded-full p-1">
          <Control label="Zoom out" onClick={() => zoomTo(zoom - 0.5)} disabled={zoom <= 1}>
            −
          </Control>
          <span className="mono-label w-11 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
          <Control label="Zoom in" onClick={() => zoomTo(zoom + 0.5)} disabled={zoom >= 3.4}>
            +
          </Control>
          <Control label="Download this frame" onClick={download}>
            ↓
          </Control>
          <Control label={shared ? "Link copied" : "Share this memory"} onClick={share}>
            {shared ? "✓" : "↗"}
          </Control>
          <Control label="Close" onClick={onClose} ref={closeButton}>
            ✕
          </Control>
        </div>
      </div>

      {/* The print. */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 md:px-16">
        {many && (
          <Arrow side="left" onClick={() => go(-1)} />
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.url}
            className="relative flex size-full items-center justify-center"
            initial={reduced ? false : { opacity: 0, scale: 1.02, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.url}
              alt={caption ? `${title} — ${caption}` : title}
              draggable={false}
              onDoubleClick={() => zoomTo(zoom > 1 ? 1 : 2.2)}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className="max-h-full max-w-full select-none object-contain"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                transition: drag.current ? "none" : "transform 420ms cubic-bezier(0.16,1,0.3,1)",
                cursor: zoom > 1 ? "grab" : "zoom-in",
                boxShadow: "0 40px 120px -30px rgba(0,0,0,0.9)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {many && <Arrow side="right" onClick={() => go(1)} />}
      </div>

      {/* Caption plate. */}
      <div className="relative z-10 flex justify-center p-4 md:p-6">
        <div className="glass max-w-[62ch] rounded-2xl px-5 py-3 text-center">
          <h2 className="font-display text-[1.35rem] leading-tight">{title}</h2>
          {caption && (
            <p className="mt-1.5 text-[0.95rem]" style={{ color: "var(--text-dim)" }}>
              {caption}
            </p>
          )}
          <p className="mono-label mt-2.5">
            ← → to move · + − to zoom · Esc to close
          </p>
        </div>
      </div>
    </motion.div>
  );
}

const Control = function Control({
  children,
  label,
  onClick,
  disabled,
  ref,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid size-9 place-items-center rounded-full text-[0.95rem] transition-colors hover:bg-[color-mix(in_oklab,var(--warm)_22%,transparent)] disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
};

function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous frame" : "Next frame"}
      className={`glass absolute ${
        side === "left" ? "left-2 md:left-4" : "right-2 md:right-4"
      } top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full transition-transform duration-500 hover:scale-110`}
    >
      <span aria-hidden className="text-lg leading-none">
        {side === "left" ? "‹" : "›"}
      </span>
    </button>
  );
}
