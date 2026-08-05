"use client";

import { useEffect, useState, useRef } from "react";
import { chapters } from "@/lib/data";
import { monthLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * The film spine — this site's signature element.
 *
 * A fixed vertical strip of sprocket notches, one per chapter. It is scroll
 * progress, chapter navigation, and the darkroom metaphor at once. On mobile
 * it collapses to a thin progress bar pinned to the top.
 *
 * Progress is read from a rAF-throttled scroll listener rather than a
 * ScrollTrigger so it stays correct with or without Lenis running.
 */
export function FilmSpine() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const read = () => {
      frame.current = null;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setProgress(p);

      // Which chapter section currently owns the viewport's upper third.
      const marks = chapters.map((c) => document.getElementById(`chapter-${c.yearMonth}`));
      const line = window.innerHeight * 0.35;
      let idx = 0;
      marks.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) idx = i;
      });
      setActive(idx);
    };

    const onScroll = () => {
      if (frame.current === null) frame.current = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  const current = chapters[active];

  return (
    <>
      {/* Desktop: the spine itself. */}
      <nav
        aria-label="Chapters"
        className="pointer-events-none fixed left-0 top-0 z-50 hidden h-dvh w-[72px] md:block"
      >
        <div
          aria-hidden
          className="absolute inset-y-0 left-[26px] w-px"
          style={{ background: "var(--line)" }}
        />
        {/* Exposed portion of the strip. */}
        <div
          aria-hidden
          className="absolute left-[26px] top-0 w-px origin-top"
          style={{
            height: "100%",
            transform: `scaleY(${progress})`,
            background: "linear-gradient(to bottom, var(--warm), var(--cool))",
            transition: "transform 120ms linear",
          }}
        />

        <ul className="pointer-events-auto absolute inset-y-0 left-0 flex flex-col justify-center gap-8 pl-[14px]">
          {chapters.map((c, i) => {
            const isActive = i === active;
            const isPast = i < active;
            return (
              <li key={c.id}>
                <a
                  href={`#chapter-${c.yearMonth}`}
                  className="group relative flex items-center gap-3 outline-offset-4"
                  aria-current={isActive ? "true" : undefined}
                >
                  {/* Sprocket notch. */}
                  <span
                    aria-hidden
                    className={cn(
                      "block size-[9px] shrink-0 rounded-[2px] border transition-all duration-500",
                      isActive && "scale-125",
                    )}
                    style={{
                      borderColor: isActive || isPast ? "var(--warm)" : "var(--line)",
                      background: isActive ? "var(--warm)" : "transparent",
                    }}
                  />
                  <span
                    className={cn(
                      "mono-label whitespace-nowrap opacity-0 transition-all duration-300",
                      "group-hover:opacity-100 group-focus-visible:opacity-100",
                      isActive && "opacity-100",
                    )}
                    style={{ color: isActive ? "var(--warm)" : undefined }}
                  >
                    {c.yearMonth.replace("-", ".")}
                  </span>
                  <span className="sr-only">{c.title}</span>
                </a>
              </li>
            );
          })}
        </ul>

        {/* Rotated datestamp at the foot of the spine. */}
        {current && (
          <div
            aria-hidden
            className="absolute bottom-8 left-[18px] origin-bottom-left -rotate-90 whitespace-nowrap"
          >
            <span className="mono-label" style={{ color: "var(--cool)" }}>
              {monthLabel(current.yearMonth)} — {current.title}
            </span>
          </div>
        )}
      </nav>

      {/* Mobile: a thin exposure bar. */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-[2px] md:hidden"
        style={{ background: "var(--line)" }}
      >
        <div
          className="h-full origin-left"
          style={{
            transform: `scaleX(${progress})`,
            background: "linear-gradient(to right, var(--warm), var(--cool))",
          }}
        />
      </div>
    </>
  );
}
