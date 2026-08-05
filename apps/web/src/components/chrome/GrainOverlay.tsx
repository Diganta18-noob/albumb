/**
 * Real film grain via SVG feTurbulence, plus a darkroom vignette.
 *
 * This is the cheapest, highest-impact texture available: it makes the site
 * read as photographic rather than "web dark mode". Fixed, non-interactive,
 * and painted on its own compositor layer so it never triggers repaints.
 */
export function GrainOverlay() {
  return (
    <>
      <svg aria-hidden className="pointer-events-none fixed size-0">
        <filter id="film-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves={4}
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix in="noise" type="saturate" values="0" />
        </filter>
      </svg>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] mix-blend-overlay"
        style={{
          filter: "url(#film-grain)",
          opacity: "var(--grain-opacity)",
          contain: "strict",
        }}
      />

      {/* Safelight vignette — the darkroom's falloff toward the edges. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[59]"
        style={{
          background:
            "radial-gradient(120% 95% at 50% 38%, transparent 42%, color-mix(in oklab, var(--surface-sunk) 88%, transparent) 100%)",
          opacity: "var(--vignette)",
          contain: "strict",
        }}
      />
    </>
  );
}
