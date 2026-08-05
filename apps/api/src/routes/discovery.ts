import { Router } from "express";
import { guestbookEntrySchema } from "@chronicles/types";
import { getRepository } from "../repo";
import { requireAuth } from "../auth";
import { ok, wrap, zodParse, notFound, param } from "./util";

/* ------------------------------------------------------------------ */
/* Search — the faceted section 11 surface                              */
/* ------------------------------------------------------------------ */

export const searchRouter = Router();

/**
 * GET /search?q=&person=&category=&tag=&from=&to=&location=
 * Returns matches plus the facet counts the UI needs to render its filters.
 */
searchRouter.get(
  "/",
  wrap(async (req, res) => {
    const repo = await getRepository();
    const { q, person, category, tag, from, to, location } = req.query;

    const page = await repo.listMemories(
      {
        q: typeof q === "string" && q.trim() ? q.trim() : undefined,
        personId: typeof person === "string" ? person : undefined,
        category: typeof category === "string" ? category : undefined,
        tag: typeof tag === "string" ? tag : undefined,
      },
      { limit: 100 },
    );

    let items = page.items;
    // Date and location aren't part of the repo filter contract — they're
    // search-only concerns, so they're applied here rather than widening it.
    if (typeof from === "string" && from) items = items.filter((m) => m.date >= from);
    if (typeof to === "string" && to) items = items.filter((m) => m.date <= to);
    if (typeof location === "string" && location) {
      const needle = location.toLowerCase();
      items = items.filter(
        (m) =>
          m.location.name.toLowerCase().includes(needle) ||
          m.location.city.toLowerCase().includes(needle),
      );
    }

    const facets = {
      categories: countBy(items.map((m) => m.category)),
      people: countBy(items.flatMap((m) => m.people)),
      tags: countBy(items.flatMap((m) => m.tags)),
      chapters: countBy(items.map((m) => m.chapter)),
      cities: countBy(items.map((m) => m.location.city).filter(Boolean)),
    };

    ok(res, items, { total: items.length, facets });
  }),
);

function countBy(values: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const v of values) out[v] = (out[v] ?? 0) + 1;
  return out;
}

/* ------------------------------------------------------------------ */
/* Guestbook                                                            */
/* ------------------------------------------------------------------ */

export const guestbookRouter = Router();

guestbookRouter.get(
  "/",
  wrap(async (_req, res) => {
    ok(res, await (await getRepository()).listGuestbook());
  }),
);

guestbookRouter.post(
  "/",
  wrap(async (req, res) => {
    const repo = await getRepository();
    const now = new Date().toISOString();
    const entry = zodParse(guestbookEntrySchema, {
      ...(req.body ?? {}),
      id: `g-${Date.now().toString(36)}`,
      createdAt: now,
    });
    ok(res, await repo.createGuestbookEntry(entry), { created: true });
  }),
);

guestbookRouter.delete(
  "/:id",
  requireAuth,
  wrap(async (req, res) => {
    const deleted = await (await getRepository()).deleteGuestbookEntry(param(req, "id"));
    if (!deleted) throw notFound("Entry not found.");
    ok(res, { deleted: true });
  }),
);

/* ------------------------------------------------------------------ */
/* Stats, locations, analytics                                          */
/* ------------------------------------------------------------------ */

export const statsRouter = Router();

statsRouter.get(
  "/",
  wrap(async (_req, res) => {
    ok(res, await (await getRepository()).getStats());
  }),
);

export const locationsRouter = Router();

locationsRouter.get(
  "/",
  wrap(async (_req, res) => {
    ok(res, await (await getRepository()).listLocations());
  }),
);

/** Admin analytics — most-viewed, most-loved, and per-chapter distribution. */
export const analyticsRouter = Router();

analyticsRouter.get(
  "/",
  requireAuth,
  wrap(async (_req, res) => {
    const repo = await getRepository();
    const { items } = await repo.listMemories({ includeArchived: true }, { limit: 100 });

    const reactionTotal = (m: (typeof items)[number]) =>
      m.reactions.reduce((n, r) => n + r.count, 0);

    ok(res, {
      totals: await repo.getStats(),
      mostViewed: [...items].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10)
        .map((m) => ({ id: m.id, title: m.title, viewCount: m.viewCount })),
      mostLoved: [...items].sort((a, b) => reactionTotal(b) - reactionTotal(a)).slice(0, 10)
        .map((m) => ({ id: m.id, title: m.title, reactions: reactionTotal(m) })),
      byChapter: countBy(items.map((m) => m.chapter)),
      byCategory: countBy(items.map((m) => m.category)),
      byMood: countBy(items.map((m) => m.mood)),
      archived: items.filter((m) => m.archived).length,
    });
  }),
);
