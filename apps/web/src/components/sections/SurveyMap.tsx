"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import type { Memory } from "@chronicles/types";
import { useReducedMotion } from "@/lib/motion";
import { stamp, frame } from "@/lib/utils";

/**
 * The survey plot.
 *
 * A world map would be dishonest here: every coordinate in the archive falls
 * inside one Indian state, so a globe renders as a single indistinguishable
 * dot. Plotted at the scale the story actually occupied, the geography says
 * something true instead — a tight cluster around one campus, and one trip
 * two hundred kilometres west that everyone still talks about.
 *
 * The graticule is drawn from the real bounding box and labelled in decimal
 * degrees: the same cool, technical voice the caption rails use.
 */

type Site = {
  key: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  names: string[];
  memories: Memory[];
};

const PAD = 0.12; // fraction of span added around the extremes
const W = 1000;
const H = 620;

export function SurveyMap({ memories }: { memories: Memory[] }) {
  const reduced = useReducedMotion();

  /* Three lecture halls share one coordinate; they are one place on a map and
     one pin. Grouping by rounded degrees merges them without losing names. */
  const sites = useMemo<Site[]>(() => {
    const bag = new Map<string, Site>();
    for (const m of memories) {
      const { lat, lng } = m.location;
      if (lat === undefined || lng === undefined) continue;
      const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
      const site = bag.get(key);
      if (site) {
        site.memories.push(m);
        if (!site.names.includes(m.location.name)) site.names.push(m.location.name);
      } else {
        bag.set(key, {
          key,
          lat,
          lng,
          city: m.location.city ?? "",
          country: m.location.country ?? "",
          names: [m.location.name],
          memories: [m],
        });
      }
    }
    return [...bag.values()].sort((a, b) => b.memories.length - a.memories.length);
  }, [memories]);

  const [selected, setSelected] = useState<string>(() => sites[0]?.key ?? "");
  const site = sites.find((s) => s.key === selected) ?? sites[0];

  /* Equirectangular fit to the data's own bounding box. At this scale the
     projection distortion is far below a pixel, so anything fancier would be
     ceremony. */
  const box = useMemo(() => {
    const lats = sites.map((s) => s.lat);
    const lngs = sites.map((s) => s.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const spanLat = Math.max(maxLat - minLat, 0.05);
    const spanLng = Math.max(maxLng - minLng, 0.05);
    return {
      minLat: minLat - spanLat * PAD,
      maxLat: maxLat + spanLat * PAD,
      minLng: minLng - spanLng * PAD,
      maxLng: maxLng + spanLng * PAD,
    };
  }, [sites]);

  const project = (lat: number, lng: number) => ({
    x: ((lng - box.minLng) / (box.maxLng - box.minLng)) * W,
    y: H - ((lat - box.minLat) / (box.maxLat - box.minLat)) * H,
  });

  const gridLngs = ticks(box.minLng, box.maxLng, 5);
  const gridLats = ticks(box.minLat, box.maxLat, 4);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
      <figure
        className="relative overflow-hidden rounded-sm border"
        style={{ borderColor: "var(--line)", background: "var(--surface-sunk)" }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full"
          role="img"
          aria-label={`Plot of ${sites.length} locations across ${memories.length} frames`}
        >
          {/* Graticule */}
          <g style={{ stroke: "var(--line)" }} strokeWidth={1}>
            {gridLngs.map((lng) => {
              const { x } = project(0, lng);
              return <line key={`v${lng}`} x1={x} y1={0} x2={x} y2={H} />;
            })}
            {gridLats.map((lat) => {
              const { y } = project(lat, 0);
              return <line key={`h${lat}`} x1={0} y1={y} x2={W} y2={y} />;
            })}
          </g>

          {/* Degree labels — decimal, the way the caption rails read */}
          <g
            fontSize={13}
            fontFamily="var(--font-mono)"
            letterSpacing="0.12em"
            style={{ fill: "var(--text-muted)" }}
          >
            {gridLngs.map((lng) => {
              const { x } = project(0, lng);
              return (
                <text key={`vl${lng}`} x={x + 6} y={H - 10}>
                  {lng.toFixed(2)}°E
                </text>
              );
            })}
            {gridLats.map((lat) => {
              const { y } = project(lat, 0);
              return (
                <text key={`hl${lat}`} x={10} y={y - 8}>
                  {lat.toFixed(2)}°N
                </text>
              );
            })}
          </g>

          {/* The route between sites: they went out there and came back */}
          {sites.length > 1 && (
            <motion.path
              d={sites
                .slice()
                .sort((a, b) => b.lng - a.lng)
                .map((s, i) => {
                  const { x, y } = project(s.lat, s.lng);
                  return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
                })
                .join(" ")}
              fill="none"
              strokeWidth={1.5}
              strokeDasharray="6 8"
              style={{ stroke: "var(--cool)" }}
              initial={reduced ? { pathLength: 1, opacity: 0.5 } : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: reduced ? 0 : 2.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            />
          )}

          {/* Pins */}
          {sites.map((s, i) => {
            const { x, y } = project(s.lat, s.lng);
            const on = s.key === selected;
            const r = 7 + Math.min(s.memories.length, 12) * 1.4;

            return (
              <g key={s.key}>
                {/* Registration cross — a surveyor's mark, not a teardrop pin */}
                <motion.g
                  initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: reduced ? 0 : 0.8,
                    delay: reduced ? 0 : 0.6 + i * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{ transformOrigin: `${x}px ${y}px` }}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill="none"
                    strokeWidth={on ? 2 : 1.25}
                    style={{ stroke: on ? "var(--warm-bright)" : "var(--cool)" }}
                  />
                  <line
                    x1={x - r - 8}
                    y1={y}
                    x2={x + r + 8}
                    y2={y}
                    strokeWidth={1}
                    style={{ stroke: on ? "var(--warm)" : "var(--cool)", opacity: 0.7 }}
                  />
                  <line
                    x1={x}
                    y1={y - r - 8}
                    x2={x}
                    y2={y + r + 8}
                    strokeWidth={1}
                    style={{ stroke: on ? "var(--warm)" : "var(--cool)", opacity: 0.7 }}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={3}
                    style={{ fill: on ? "var(--warm-bright)" : "var(--cool-bright)" }}
                  />
                </motion.g>

                <text
                  x={x + r + 16}
                  y={y - 4}
                  fontSize={15}
                  fontFamily="var(--font-mono)"
                  letterSpacing="0.14em"
                  style={{ fill: on ? "var(--warm-bright)" : "var(--text-dim)" }}
                >
                  {s.city.toUpperCase()}
                </text>
                <text
                  x={x + r + 16}
                  y={y + 15}
                  fontSize={13}
                  fontFamily="var(--font-mono)"
                  letterSpacing="0.14em"
                  style={{ fill: "var(--text-muted)" }}
                >
                  {s.memories.length} {s.memories.length === 1 ? "FRAME" : "FRAMES"}
                </text>

                {/* Generous invisible hit area over the small drawn mark */}
                <circle
                  cx={x}
                  cy={y}
                  r={Math.max(r + 14, 30)}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => setSelected(s.key)}
                  onMouseEnter={() => setSelected(s.key)}
                />
              </g>
            );
          })}
        </svg>

        <figcaption
          className="mono-label absolute left-4 top-3"
          style={{ color: "var(--cool)" }}
        >
          Karnataka, India · {sites.length} sites
        </figcaption>
      </figure>

      {/* The site record */}
      <aside>
        <ul className="mb-8 space-y-1">
          {sites.map((s) => {
            const on = s.key === selected;
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => setSelected(s.key)}
                  aria-pressed={on}
                  className="flex w-full items-baseline gap-3 border-l-2 py-2 pl-3 text-left transition-colors"
                  style={{
                    borderColor: on ? "var(--warm)" : "var(--line)",
                    color: on ? "var(--text)" : "var(--text-dim)",
                  }}
                >
                  <span className="flex-1">
                    <span className="block text-[1.02rem] leading-tight">{s.city}</span>
                    <span className="mono-label block">
                      {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                    </span>
                  </span>
                  <span
                    className="mono-label shrink-0"
                    style={{ color: on ? "var(--warm)" : undefined }}
                  >
                    {frame(s.memories.length)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {site && (
          <div className="border-t pt-6" style={{ borderColor: "var(--line)" }}>
            <h2 className="font-display text-[var(--text-step-2)] leading-none">{site.city}</h2>
            <p className="mono-label mt-2" style={{ color: "var(--cool)" }}>
              {site.country} · {site.names.length}{" "}
              {site.names.length === 1 ? "site" : "sites"}
            </p>
            <ul className="mt-3 space-y-0.5">
              {site.names.map((n) => (
                <li key={n} className="text-[0.92rem]" style={{ color: "var(--text-dim)" }}>
                  {n}
                </li>
              ))}
            </ul>

            <ul className="mt-6 space-y-3">
              {site.memories.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/memory/${m.slug}`}
                    className="group flex items-center gap-3 transition-colors hover:text-[var(--warm)]"
                  >
                    {m.images[0] && (
                      <span className="relative block size-14 shrink-0 overflow-hidden rounded-sm">
                        <Image
                          src={m.images[0].url}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="mono-label block" style={{ color: "var(--cool)" }}>
                        {stamp(m.date)}
                      </span>
                      <span className="block truncate text-[0.95rem] leading-tight">
                        {m.title}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}

/** Round tick values inside a range, so labels read 12.50 rather than 12.4731. */
function ticks(min: number, max: number, count: number): number[] {
  const raw = (max - min) / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag * 10;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) {
    out.push(Number(v.toFixed(6)));
  }
  return out;
}
