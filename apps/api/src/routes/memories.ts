import { Router } from "express";
import type { Memory } from "@chronicles/types";
import { memorySchema, commentSchema } from "@chronicles/types";
import { getRepository } from "../repo";
import { requireAuth } from "../auth";
import { ok, wrap, zodParse, notFound, badRequest, param } from "./util";

export const memoriesRouter = Router();

/**
 * GET /memories
 * Cursor-paginated wall feed. Filters compose: ?chapter, ?category, ?tag,
 * ?person, ?q, ?favorite=1
 */
memoriesRouter.get(
  "/",
  wrap(async (req, res) => {
    const repo = await getRepository();
    const { chapter, category, tag, person, q, favorite, cursor, limit } = req.query;
    const page = await repo.listMemories(
      {
        chapter: typeof chapter === "string" ? chapter : undefined,
        category: typeof category === "string" ? category : undefined,
        tag: typeof tag === "string" ? tag : undefined,
        personId: typeof person === "string" ? person : undefined,
        q: typeof q === "string" ? q : undefined,
        favoriteOnly: favorite === "1" || favorite === "true",
      },
      {
        cursor: typeof cursor === "string" ? cursor : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
      },
    );
    ok(res, page.items, {
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
      total: page.total,
    });
  }),
);

/**
 * Public feed helpers used by the "memory features" section.
 *
 * Mounted BEFORE /:idOrSlug — Express matches in registration order, so a
 * literal /random would otherwise be swallowed as a slug lookup.
 */
const feed = Router();

feed.get("/favorites", async (_req, res) => {
  const repo = await getRepository();
  ok(res, await repo.listFavorites());
});
feed.get("/random", async (_req, res) => {
  const repo = await getRepository();
  ok(res, await repo.randomMemory());
});
feed.get("/of-the-day", async (_req, res) => {
  const repo = await getRepository();
  ok(res, await repo.memoryOfTheDay());
});
feed.get("/this-day-years-ago", async (_req, res) => {
  const repo = await getRepository();
  ok(res, await repo.thisDayYearsAgo());
});
feed.get("/recent", async (_req, res) => {
  const repo = await getRepository();
  ok(res, await repo.recentMemories());
});

memoriesRouter.use(feed);

/** GET /memories/:idOrSlug */
memoriesRouter.get(
  "/:idOrSlug",
  wrap(async (req, res) => {
    const repo = await getRepository();
    const memory = await repo.getMemory(param(req, "idOrSlug"));
    if (!memory) throw notFound("Memory not found.");
    ok(res, memory);
  }),
);

/** POST /memories — admin */
memoriesRouter.post(
  "/",
  requireAuth,
  wrap(async (req, res) => {
    const repo = await getRepository();
    const input = zodParse(memorySchema, req.body);
    const existing = await repo.getMemory(input.id);
    if (existing) throw badRequest(`A memory with id "${input.id}" already exists.`);
    const created = await repo.createMemory(input);
    ok(res, created, { created: true });
  }),
);

/** PUT /memories/:id — admin */
memoriesRouter.put(
  "/:id",
  requireAuth,
  wrap(async (req, res) => {
    const repo = await getRepository();
    const patch = zodParse(memorySchema.partial(), req.body);
    const updated = await repo.updateMemory(param(req, "id"), patch);
    if (!updated) throw notFound("Memory not found.");
    ok(res, updated);
  }),
);

/** DELETE /memories/:id — admin */
memoriesRouter.delete(
  "/:id",
  requireAuth,
  wrap(async (req, res) => {
    const repo = await getRepository();
    const deleted = await repo.deleteMemory(param(req, "id"));
    if (!deleted) throw notFound("Memory not found.");
    ok(res, { deleted: true });
  }),
);

/** POST /memories/:id/views — public, fire-and-forget */
memoriesRouter.post(
  "/:id/views",
  wrap(async (req, res) => {
    const repo = await getRepository();
    await repo.incrementViews(param(req, "id"));
    ok(res, { ok: true });
  }),
);

/** POST /memories/:id/reactions/:type — public */
memoriesRouter.post(
  "/:id/reactions/:type",
  wrap(async (req, res) => {
    const repo = await getRepository();
    const updated = await repo.addReaction(param(req, "id"), param(req, "type"));
    if (!updated) throw notFound("Memory not found.");
    ok(res, updated);
  }),
);

/** POST /memories/:id/comments — public */
memoriesRouter.post(
  "/:id/comments",
  wrap(async (req, res) => {
    const repo = await getRepository();
    const body = zodParse(commentSchema.omit({ id: true, createdAt: true }), req.body);
    const updated = await repo.addComment(param(req, "id"), body);
    if (!updated) throw notFound("Memory not found.");
    ok(res, updated);
  }),
);
