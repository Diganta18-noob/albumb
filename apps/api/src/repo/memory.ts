import type { Memory, Person, Chapter, Category, Album, Tag, Certificate, Project, LocationPoint, GuestbookEntry, User, Reaction } from "@chronicles/types";
import { REACTION_TYPES } from "@chronicles/types";
import type { Repository, MemoryFilter, MemoryCursor, CursorPage, RepositoryStats } from "./types";

/** Cursor encoding — base64 JSON so we can't leak internals. */
function encodeCursor(payload: unknown): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}
function decodeCursor(cursor: string): Record<string, unknown> {
  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function memoryMatches(m: Memory, filter: MemoryFilter): boolean {
  if (!filter.includeArchived && m.archived) return false;
  if (filter.chapter && m.chapter !== filter.chapter) return false;
  if (filter.category && m.category !== filter.category) return false;
  if (filter.tag && !m.tags.includes(filter.tag)) return false;
  if (filter.personId && !m.people.includes(filter.personId)) return false;
  if (filter.favoriteOnly && !m.favorite) return false;
  if (filter.q) {
    const q = filter.q.toLowerCase();
    const haystack = [m.title, m.excerpt, m.story, m.location.name, m.location.city, m.photographer, ...m.tags, ...m.people]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

/** Day-of-month key, deterministic and stable for "memory of the day". */
function dayBucket(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function daysTogether(from: string, to: string): number {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

/**
 * In-memory repository. Hydrated from the seed content the same way MongoRepo
 * would be, so every query shape is exercised identically offline.
 */
export class MemoryRepo implements Repository {
  readonly kind = "memory" as const;

  private memories: Memory[] = [];
  private people: Person[] = [];
  private chapters: Chapter[] = [];
  private categories: Category[] = [];
  private albums: Album[] = [];
  private tags: Tag[] = [];
  private certificates: Certificate[] = [];
  private projects: Project[] = [];
  private locations: LocationPoint[] = [];
  private guestbook: GuestbookEntry[] = [];
  private users: User[] = [];

  async connect(): Promise<void> {}
  async close(): Promise<void> {}

  async seedIfEmpty(): Promise<void> {
    if (this.memories.length > 0) return;
    const {
      memories,
      people,
      chapters,
      categories,
      albums,
      tags,
      certificates,
      projects,
      mapLocations,
    } = await import("@chronicles/content");

    this.memories = [...memories];
    this.people = [...people];
    this.chapters = [...chapters];
    this.categories = [...categories];
    this.albums = albums;
    this.tags = tags;
    this.certificates = certificates;
    this.projects = projects;
    this.locations = mapLocations();
  }

  /* ------------------------- memories ------------------------- */

  async listMemories(filter: MemoryFilter = {}, cursor: MemoryCursor = {}): Promise<CursorPage<Memory>> {
    let items = this.memories.filter((m) => memoryMatches(m, filter));
    items.sort((a, b) => b.date.localeCompare(a.date));

    let offset = 0;
    if (cursor.cursor) {
      const decoded = decodeCursor(cursor.cursor);
      if (typeof decoded.offset === "number") offset = decoded.offset;
    }
    const limit = Math.min(Math.max(cursor.limit ?? 24, 1), 100);
    const page = items.slice(offset, offset + limit);
    const nextOffset = offset + limit;
    const hasMore = nextOffset < items.length;

    return {
      items: page,
      nextCursor: hasMore ? encodeCursor({ offset: nextOffset }) : null,
      hasMore,
      total: items.length,
    };
  }

  async getMemory(idOrSlug: string): Promise<Memory | null> {
    return this.memories.find((m) => m.id === idOrSlug || m.slug === idOrSlug) ?? null;
  }

  async getMemoryById(id: string): Promise<Memory | null> {
    return this.memories.find((m) => m.id === id) ?? null;
  }

  async createMemory(input: Memory): Promise<Memory> {
    this.memories.push(input);
    return input;
  }

  async updateMemory(id: string, patch: Partial<Memory>): Promise<Memory | null> {
    const idx = this.memories.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    const current = this.memories[idx];
    if (!current) return null;
    const next = { ...current, ...patch, id };
    this.memories[idx] = next;
    return next;
  }

  async deleteMemory(id: string): Promise<boolean> {
    const before = this.memories.length;
    this.memories = this.memories.filter((m) => m.id !== id);
    return this.memories.length !== before;
  }

  async listMemoriesByChapter(chapter: string): Promise<Memory[]> {
    return this.memories
      .filter((m) => m.chapter === chapter)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async listMemoriesByCategory(category: string): Promise<Memory[]> {
    return this.memories
      .filter((m) => m.category === category)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async listMemoriesByPerson(personId: string): Promise<Memory[]> {
    return this.memories
      .filter((m) => m.people.includes(personId))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async listFavorites(): Promise<Memory[]> {
    return this.memories.filter((m) => m.favorite).sort((a, b) => b.viewCount - a.viewCount);
  }

  async randomMemory(): Promise<Memory | null> {
    if (this.memories.length === 0) return null;
    const pool = this.memories.filter((m) => !m.archived);
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)] ?? null;
  }

  async incrementViews(id: string): Promise<Memory | null> {
    const m = await this.getMemoryById(id);
    if (!m) return null;
    return this.updateMemory(id, { viewCount: (m.viewCount ?? 0) + 1 });
  }

  async addReaction(id: string, type: string): Promise<Memory | null> {
    if (!REACTION_TYPES.includes(type as (typeof REACTION_TYPES)[number])) return null;
    const m = await this.getMemoryById(id);
    if (!m) return null;
    const reactions: Reaction[] = [...(m.reactions ?? [])];
    const existing = reactions.find((r) => r.type === type);
    if (existing) existing.count += 1;
    else reactions.push({ type: type as Reaction["type"], count: 1 });
    return this.updateMemory(id, { reactions });
  }

  async addComment(
    id: string,
    comment: { authorName: string; body: string; emoji?: string },
  ): Promise<Memory | null> {
    const m = await this.getMemoryById(id);
    if (!m) return null;
    const c = {
      id: `c-${Date.now()}`,
      authorName: comment.authorName,
      body: comment.body,
      emoji: comment.emoji,
      createdAt: new Date().toISOString(),
    };
    return this.updateMemory(id, { comments: [...(m.comments ?? []), c] });
  }

  async memoryOfTheDay(): Promise<Memory | null> {
    if (this.memories.length === 0) return null;
    const pool = this.memories.filter((m) => !m.archived);
    if (pool.length === 0) return null;
    const key = dayBucket(new Date());
    let h = 0x811c9dc5;
    for (let i = 0; i < key.length; i++) {
      h ^= key.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return pool[h % pool.length] ?? null;
  }

  async thisDayYearsAgo(): Promise<Memory | null> {
    const today = new Date();
    return (
      this.memories.find((m) => {
        const d = new Date(m.date);
        return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
      }) ?? null
    );
  }

  async recentMemories(): Promise<Memory[]> {
    return [...this.memories]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 12);
  }

  /* ------------------------- people ------------------------- */

  async listPeople(): Promise<Person[]> {
    return [...this.people];
  }
  async getPerson(idOrSlug: string): Promise<Person | null> {
    return this.people.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null;
  }
  async createPerson(input: Person): Promise<Person> {
    this.people.push(input);
    return input;
  }
  async updatePerson(id: string, patch: Partial<Person>): Promise<Person | null> {
    const idx = this.people.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const current = this.people[idx];
    if (!current) return null;
    const next = { ...current, ...patch, id };
    this.people[idx] = next;
    return next;
  }
  async deletePerson(id: string): Promise<boolean> {
    const before = this.people.length;
    this.people = this.people.filter((p) => p.id !== id);
    return this.people.length !== before;
  }

  /* ------------------------- chapters ------------------------- */

  async listChapters(): Promise<Chapter[]> {
    return [...this.chapters];
  }
  async getChapter(yearMonth: string): Promise<Chapter | null> {
    return this.chapters.find((c) => c.yearMonth === yearMonth) ?? null;
  }
  async createChapter(input: Chapter): Promise<Chapter> {
    this.chapters.push(input);
    return input;
  }
  async updateChapter(id: string, patch: Partial<Chapter>): Promise<Chapter | null> {
    const idx = this.chapters.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const current = this.chapters[idx];
    if (!current) return null;
    const next = { ...current, ...patch, id };
    this.chapters[idx] = next;
    return next;
  }
  async deleteChapter(id: string): Promise<boolean> {
    const before = this.chapters.length;
    this.chapters = this.chapters.filter((c) => c.id !== id);
    return this.chapters.length !== before;
  }

  /* ------------------------- categories ------------------------- */

  async listCategories(): Promise<Category[]> {
    return [...this.categories];
  }
  async getCategory(slug: string): Promise<Category | null> {
    return this.categories.find((c) => c.slug === slug) ?? null;
  }
  async createCategory(input: Category): Promise<Category> {
    this.categories.push(input);
    return input;
  }
  async updateCategory(id: string, patch: Partial<Category>): Promise<Category | null> {
    const idx = this.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const current = this.categories[idx];
    if (!current) return null;
    const next = { ...current, ...patch, id };
    this.categories[idx] = next;
    return next;
  }
  async deleteCategory(id: string): Promise<boolean> {
    const before = this.categories.length;
    this.categories = this.categories.filter((c) => c.id !== id);
    return this.categories.length !== before;
  }

  /* ------------------------- albums ------------------------- */

  async listAlbums(): Promise<Album[]> {
    return [...this.albums];
  }
  async getAlbum(id: string): Promise<Album | null> {
    return this.albums.find((a) => a.id === id) ?? null;
  }
  async createAlbum(input: Album): Promise<Album> {
    this.albums.push(input);
    return input;
  }
  async updateAlbum(id: string, patch: Partial<Album>): Promise<Album | null> {
    const idx = this.albums.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    const current = this.albums[idx];
    if (!current) return null;
    const next = { ...current, ...patch, id };
    this.albums[idx] = next;
    return next;
  }
  async deleteAlbum(id: string): Promise<boolean> {
    const before = this.albums.length;
    this.albums = this.albums.filter((a) => a.id !== id);
    return this.albums.length !== before;
  }

  /* ------------------------- tags ------------------------- */

  async listTags(): Promise<Tag[]> {
    return [...this.tags];
  }
  async getTag(slug: string): Promise<Tag | null> {
    return this.tags.find((t) => t.slug === slug) ?? null;
  }
  async createTag(input: Tag): Promise<Tag> {
    this.tags.push(input);
    return input;
  }
  async updateTag(id: string, patch: Partial<Tag>): Promise<Tag | null> {
    const idx = this.tags.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const current = this.tags[idx];
    if (!current) return null;
    const next = { ...current, ...patch, id };
    this.tags[idx] = next;
    return next;
  }
  async deleteTag(id: string): Promise<boolean> {
    const before = this.tags.length;
    this.tags = this.tags.filter((t) => t.id !== id);
    return this.tags.length !== before;
  }

  /* ------------------------- certificates ------------------------- */

  async listCertificates(): Promise<Certificate[]> {
    return [...this.certificates];
  }
  async getCertificate(id: string): Promise<Certificate | null> {
    return this.certificates.find((c) => c.id === id) ?? null;
  }
  async createCertificate(input: Certificate): Promise<Certificate> {
    this.certificates.push(input);
    return input;
  }
  async updateCertificate(id: string, patch: Partial<Certificate>): Promise<Certificate | null> {
    const idx = this.certificates.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const current = this.certificates[idx];
    if (!current) return null;
    const next = { ...current, ...patch, id };
    this.certificates[idx] = next;
    return next;
  }
  async deleteCertificate(id: string): Promise<boolean> {
    const before = this.certificates.length;
    this.certificates = this.certificates.filter((c) => c.id !== id);
    return this.certificates.length !== before;
  }

  /* ------------------------- projects ------------------------- */

  async listProjects(): Promise<Project[]> {
    return [...this.projects];
  }
  async getProject(id: string): Promise<Project | null> {
    return this.projects.find((p) => p.id === id) ?? null;
  }
  async createProject(input: Project): Promise<Project> {
    this.projects.push(input);
    return input;
  }
  async updateProject(id: string, patch: Partial<Project>): Promise<Project | null> {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const current = this.projects[idx];
    if (!current) return null;
    const next = { ...current, ...patch, id };
    this.projects[idx] = next;
    return next;
  }
  async deleteProject(id: string): Promise<boolean> {
    const before = this.projects.length;
    this.projects = this.projects.filter((p) => p.id !== id);
    return this.projects.length !== before;
  }

  /* ------------------------- locations ------------------------- */

  async listLocations(): Promise<LocationPoint[]> {
    return [...this.locations];
  }

  /* ------------------------- guestbook ------------------------- */

  async listGuestbook(): Promise<GuestbookEntry[]> {
    return [...this.guestbook].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async createGuestbookEntry(input: GuestbookEntry): Promise<GuestbookEntry> {
    this.guestbook.push(input);
    return input;
  }
  async deleteGuestbookEntry(id: string): Promise<boolean> {
    const before = this.guestbook.length;
    this.guestbook = this.guestbook.filter((g) => g.id !== id);
    return this.guestbook.length !== before;
  }

  /* ------------------------- users ------------------------- */

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }
  async createUser(input: User): Promise<User> {
    this.users.push(input);
    return input;
  }
  async listUsers(): Promise<User[]> {
    return [...this.users];
  }

  /* ------------------------- stats ------------------------- */

  async getStats(): Promise<RepositoryStats> {
    const cities = new Set(this.memories.map((m) => m.location.city).filter(Boolean));
    return {
      memories: this.memories.filter((m) => !m.archived).length,
      photos: this.memories.reduce((n, m) => n + m.images.length, 0),
      people: this.people.filter((p) => !p.nickname || p.role !== "Mentor").length,
      projects: this.projects.length,
      certificates: this.certificates.length,
      cities: cities.size,
      daysTogether: daysTogether("2025-11-03", "2026-03-27"),
    };
  }
}
