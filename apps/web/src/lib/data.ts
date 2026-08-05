import {
  memories,
  memoriesById,
  people,
  peopleById,
  chapters,
  chaptersByMonth,
  categories,
  categoriesBySlug,
  categoryCounts,
  albums,
  tags,
  certificates,
  projects,
  stats,
  mapLocations,
} from "@chronicles/content";
import type { Memory, Person, Chapter } from "@chronicles/types";

/**
 * The data layer.
 *
 * Server Components read the seed content directly, so the site renders
 * complete with no API running. When NEXT_PUBLIC_API_URL is set, client
 * interactions (reactions, comments, views) post to the live API — the
 * read path stays local so SSR never blocks on a cold Render dyno.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
export const apiEnabled = API_URL.length > 0;

export const SITE_TITLE = process.env.NEXT_PUBLIC_SITE_TITLE ?? "Training Chronicles";

export {
  memories, memoriesById, people, peopleById, chapters, chaptersByMonth,
  categories, categoriesBySlug, categoryCounts, albums, tags,
  certificates, projects, stats, mapLocations,
};

/** Chronological order — the contact sheet reads top-left to bottom-right. */
export function memoriesInFrameOrder(): Memory[] {
  return [...memories].sort((a, b) => (a.frameNumber ?? 0) - (b.frameNumber ?? 0));
}

/**
 * Chapters are keyed by yearMonth on a memory (`2025-11`) but carry a prefixed
 * id (`ch-2025-11`). Accept either so callers can pass whichever they hold.
 */
export function memoriesForChapter(chapterIdOrMonth: string): Memory[] {
  const month = chapterIdOrMonth.replace(/^ch-/, "");
  return memoriesInFrameOrder().filter((m) => m.chapter === month);
}

export function memoriesForCategory(slug: string): Memory[] {
  return memoriesInFrameOrder().filter((m) => m.category === slug);
}

export function memoriesForPerson(personId: string): Memory[] {
  return memoriesInFrameOrder().filter((m) => m.people.includes(personId));
}

export function memoryBySlug(slug: string): Memory | undefined {
  return memories.find((m) => m.slug === slug || m.id === slug);
}

export function personBySlug(slug: string): Person | undefined {
  return people.find((p) => p.slug === slug || p.id === slug);
}

export function chapterById(id: string): Chapter | undefined {
  return chapters.find((c) => c.id === id);
}

/** Neighbours for the magazine reader's prev/next spread. */
export function neighbours(id: string): { prev: Memory | null; next: Memory | null } {
  const ordered = memoriesInFrameOrder();
  const i = ordered.findIndex((m) => m.id === id);
  if (i === -1) return { prev: null, next: null };
  return { prev: ordered[i - 1] ?? null, next: ordered[i + 1] ?? null };
}

export const favorites = (): Memory[] => memories.filter((m) => m.favorite);

/** Deterministic per-day pick so SSR and hydration agree within a day. */
export function memoryOfTheDay(isoDay: string): Memory | undefined {
  const pool = memories.filter((m) => !m.archived);
  if (pool.length === 0) return undefined;
  let h = 0x811c9dc5;
  for (let i = 0; i < isoDay.length; i++) {
    h ^= isoDay.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return pool[Math.abs(h) % pool.length];
}

/** POSTs that only matter when a live API is configured; silent no-op otherwise. */
export async function postToApi(path: string, body?: unknown): Promise<unknown> {
  if (!apiEnabled) return null;
  try {
    const res = await fetch(`${API_URL}/api/v1${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
