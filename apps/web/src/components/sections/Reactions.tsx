"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { REACTION_TYPES, type Reaction, type ReactionType } from "@chronicles/types";
import { postToApi } from "@/lib/data";
import { useReducedMotion } from "@/lib/motion";

const GLYPH: Record<ReactionType, string> = {
  heart: "♥",
  fire: "✦",
  smile: "☺",
  clap: "✧",
  tears: "◈",
};

const LABEL: Record<ReactionType, string> = {
  heart: "Loved this",
  fire: "This one hit",
  smile: "Made me smile",
  clap: "Deserved",
  tears: "Made me cry",
};

const KEY = "chronicles:reactions";

/**
 * Reactions that work for a signed-out guest.
 *
 * The count renders from seed data on the server, so the number is in the HTML.
 * A visitor's own taps live in localStorage and are added on top, then posted
 * to the API when one is configured. Nothing here blocks on the network.
 */
export function Reactions({ memoryId, seed }: { memoryId: string; seed: Reaction[] }) {
  const reduced = useReducedMotion();
  const [mine, setMine] = useState<ReactionType[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const all = raw ? (JSON.parse(raw) as Record<string, ReactionType[]>) : {};
      setMine(all[memoryId] ?? []);
    } catch {
      /* private mode or corrupt value — start clean */
    }
  }, [memoryId]);

  function toggle(type: ReactionType) {
    const has = mine.includes(type);
    const next = has ? mine.filter((t) => t !== type) : [...mine, type];
    setMine(next);

    try {
      const raw = localStorage.getItem(KEY);
      const all = raw ? (JSON.parse(raw) as Record<string, ReactionType[]>) : {};
      all[memoryId] = next;
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch {
      /* nothing to persist to — the in-session state still updates */
    }

    if (!has) void postToApi(`/memories/${memoryId}/reactions/${type}`);
  }

  const counts = new Map(seed.map((r) => [r.type, r.count]));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {REACTION_TYPES.map((type) => {
        const active = mine.includes(type);
        const total = (counts.get(type) ?? 0) + (active ? 1 : 0);

        return (
          <motion.button
            key={type}
            type="button"
            onClick={() => toggle(type)}
            aria-pressed={active}
            aria-label={LABEL[type]}
            title={LABEL[type]}
            whileTap={reduced ? undefined : { scale: 0.9 }}
            className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 transition-colors"
            style={{
              borderColor: active ? "var(--warm)" : "var(--line)",
              background: active ? "color-mix(in oklab, var(--warm) 14%, transparent)" : undefined,
              color: active ? "var(--warm-bright)" : undefined,
            }}
          >
            <span aria-hidden className="text-[0.9rem] leading-none">
              {GLYPH[type]}
            </span>
            <span className="mono-label" style={active ? { color: "var(--warm-bright)" } : undefined}>
              {total}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
