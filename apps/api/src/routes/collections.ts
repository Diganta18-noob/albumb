import { Router } from "express";
import type { AnyZodObject } from "zod";
import type {
  Person, Chapter, Category, Album, Tag, Certificate, Project,
} from "@chronicles/types";
import {
  personSchema, chapterSchema, categorySchema, albumSchema,
  tagSchema, certificateSchema, projectSchema,
} from "@chronicles/types";
import { getRepository, type Repository } from "../repo";
import { requireAuth } from "../auth";
import { ok, wrap, zodParse, notFound, badRequest, param } from "./util";

/** Fills the fields an admin form shouldn't have to send by hand. */
function withDefaults(body: unknown, prefix: string): Record<string, unknown> {
  const now = new Date().toISOString();
  const b = (body ?? {}) as Record<string, unknown>;
  return {
    ...b,
    id: b.id ?? `${prefix}-${Date.now().toString(36)}`,
    createdAt: b.createdAt ?? now,
    updatedAt: b.updatedAt ?? now,
  };
}

interface CollectionOps<T> {
  /** singular label used in error messages, e.g. "Person" */
  label: string;
  /** id prefix for generated ids, e.g. "p" */
  prefix: string;
  schema: AnyZodObject;
  list: (repo: Repository) => Promise<T[]>;
  get: (repo: Repository, id: string) => Promise<T | null>;
  create: (repo: Repository, input: T) => Promise<T>;
  update: (repo: Repository, id: string, patch: Partial<T>) => Promise<T | null>;
  remove: (repo: Repository, id: string) => Promise<boolean>;
}

/**
 * One CRUD surface, shared by every collection. Public GETs, authenticated
 * writes — the same shape the admin dashboard talks to for all seven models.
 */
function collection<T extends { id: string }>(ops: CollectionOps<T>): Router {
  const r = Router();

  r.get(
    "/",
    wrap(async (_req, res) => {
      ok(res, await ops.list(await getRepository()));
    }),
  );

  r.get(
    "/:id",
    wrap(async (req, res) => {
      const item = await ops.get(await getRepository(), param(req, "id"));
      if (!item) throw notFound(`${ops.label} not found.`);
      ok(res, item);
    }),
  );

  r.post(
    "/",
    requireAuth,
    wrap(async (req, res) => {
      const repo = await getRepository();
      const input = zodParse(ops.schema, withDefaults(req.body, ops.prefix)) as T;
      if (await ops.get(repo, input.id)) {
        throw badRequest(`${ops.label} "${input.id}" already exists.`);
      }
      ok(res, await ops.create(repo, input), { created: true });
    }),
  );

  r.put(
    "/:id",
    requireAuth,
    wrap(async (req, res) => {
      const repo = await getRepository();
      const patch = zodParse(ops.schema.partial(), req.body) as Partial<T>;
      const updated = await ops.update(repo, param(req, "id"), {
        ...patch,
        updatedAt: new Date().toISOString(),
      } as Partial<T>);
      if (!updated) throw notFound(`${ops.label} not found.`);
      ok(res, updated);
    }),
  );

  r.delete(
    "/:id",
    requireAuth,
    wrap(async (req, res) => {
      const deleted = await ops.remove(await getRepository(), param(req, "id"));
      if (!deleted) throw notFound(`${ops.label} not found.`);
      ok(res, { deleted: true });
    }),
  );

  return r;
}

export const peopleRouter = collection<Person>({
  label: "Person",
  prefix: "p",
  schema: personSchema,
  list: (r) => r.listPeople(),
  get: (r, id) => r.getPerson(id),
  create: (r, input) => r.createPerson(input),
  update: (r, id, patch) => r.updatePerson(id, patch),
  remove: (r, id) => r.deletePerson(id),
});

export const chaptersRouter = collection<Chapter>({
  label: "Chapter",
  prefix: "ch",
  schema: chapterSchema,
  list: (r) => r.listChapters(),
  get: (r, id) => r.getChapter(id),
  create: (r, input) => r.createChapter(input),
  update: (r, id, patch) => r.updateChapter(id, patch),
  remove: (r, id) => r.deleteChapter(id),
});

export const categoriesRouter = collection<Category>({
  label: "Category",
  prefix: "cat",
  schema: categorySchema,
  list: (r) => r.listCategories(),
  get: (r, id) => r.getCategory(id),
  create: (r, input) => r.createCategory(input),
  update: (r, id, patch) => r.updateCategory(id, patch),
  remove: (r, id) => r.deleteCategory(id),
});

export const albumsRouter = collection<Album>({
  label: "Album",
  prefix: "al",
  schema: albumSchema,
  list: (r) => r.listAlbums(),
  get: (r, id) => r.getAlbum(id),
  create: (r, input) => r.createAlbum(input),
  update: (r, id, patch) => r.updateAlbum(id, patch),
  remove: (r, id) => r.deleteAlbum(id),
});

export const tagsRouter = collection<Tag>({
  label: "Tag",
  prefix: "tag",
  schema: tagSchema,
  list: (r) => r.listTags(),
  get: (r, id) => r.getTag(id),
  create: (r, input) => r.createTag(input),
  update: (r, id, patch) => r.updateTag(id, patch),
  remove: (r, id) => r.deleteTag(id),
});

export const certificatesRouter = collection<Certificate>({
  label: "Certificate",
  prefix: "cert",
  schema: certificateSchema,
  list: (r) => r.listCertificates(),
  get: (r, id) => r.getCertificate(id),
  create: (r, input) => r.createCertificate(input),
  update: (r, id, patch) => r.updateCertificate(id, patch),
  remove: (r, id) => r.deleteCertificate(id),
});

export const projectsRouter = collection<Project>({
  label: "Project",
  prefix: "proj",
  schema: projectSchema,
  list: (r) => r.listProjects(),
  get: (r, id) => r.getProject(id),
  create: (r, input) => r.createProject(input),
  update: (r, id, patch) => r.updateProject(id, patch),
  remove: (r, id) => r.deleteProject(id),
});
