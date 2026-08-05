import mongoose, { Schema, type Model } from "mongoose";
import type {
  Memory, Person, Chapter, Category, Album, Tag,
  Certificate, Project, LocationPoint, GuestbookEntry, User, Reaction,
} from "@chronicles/types";
import { REACTION_TYPES } from "@chronicles/types";
import type { Repository, MemoryFilter, MemoryCursor, CursorPage, RepositoryStats } from "./types";
import { daysTogether } from "./memory";

/**
 * Documents carry our own string `id`, not Mongo's ObjectId, so the two
 * drivers return byte-identical payloads and the web app can't tell them apart.
 */
const base = { _id: false as const };

const imageDef = {
  url: String, squareUrl: String, width: Number, height: Number,
  blurDataURL: String, palette: [String], storageKey: String,
};

const locationDef = {
  name: String, city: String, country: String, lat: Number, lng: Number,
};

const memorySchema = new Schema<Memory>(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, default: "" },
    story: { type: String, default: "" },
    date: { type: String, required: true, index: true },
    chapter: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    location: { type: locationDef, default: {} },
    photographer: { type: String, default: "" },
    people: { type: [String], default: [], index: true },
    tags: { type: [String], default: [], index: true },
    images: { type: [imageDef], default: [] },
    video: { url: String, poster: String, storageKey: String },
    mood: { type: String, default: "nostalgic" },
    weather: { type: String, default: "clear" },
    quote: { type: String, default: "" },
    readingTimeMinutes: { type: Number, default: 2 },
    favorite: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },
    reactions: { type: [{ type: { type: String }, count: Number, ...base }], default: [] },
    comments: {
      type: [{ id: String, authorName: String, body: String, emoji: String, createdAt: String, ...base }],
      default: [],
    },
    viewCount: { type: Number, default: 0 },
    frameNumber: { type: Number },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { versionKey: false },
);

// Backs the search section; weights favour titles over body prose.
memorySchema.index(
  { title: "text", excerpt: "text", story: "text", tags: "text" },
  { weights: { title: 10, excerpt: 5, tags: 3, story: 1 } },
);

const personSchema = new Schema<Person>(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, default: "Trainee" },
    department: { type: String, default: "" },
    nickname: { type: String, default: "" },
    favoriteQuote: { type: String, default: "" },
    bestMemory: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatar: imageDef,
    gallery: { type: [imageDef], default: [] },
    achievements: { type: [String], default: [] },
    period: { type: String, default: "" },
    funFact: { type: String, default: "" },
    favoriteMemoryId: String,
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { versionKey: false },
);

const chapterSchema = new Schema<Chapter>(
  {
    id: { type: String, required: true, unique: true, index: true },
    yearMonth: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    tagline: { type: String, default: "" },
    story: { type: String, default: "" },
    coverImage: imageDef,
    heroMemoryId: String,
    mood: { type: String, default: "nostalgic" },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { versionKey: false },
);

const categorySchema = new Schema<Category>(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
    coverImage: imageDef,
    accent: { type: String, default: "brass" },
    createdAt: { type: String, required: true },
  },
  { versionKey: false },
);

const albumSchema = new Schema<Album>(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    path: { type: String, default: "" },
    parentId: String,
    description: { type: String, default: "" },
    coverImage: imageDef,
    memoryIds: { type: [String], default: [] },
    archived: { type: Boolean, default: false },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { versionKey: false },
);

const tagSchema = new Schema<Tag>(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    count: { type: Number, default: 0 },
    createdAt: { type: String, required: true },
  },
  { versionKey: false },
);

const certificateSchema = new Schema<Certificate>(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    issuer: { type: String, default: "" },
    issuedOn: { type: String, required: true },
    description: { type: String, default: "" },
    image: imageDef,
    personIds: { type: [String], default: [] },
    createdAt: { type: String, required: true },
  },
  { versionKey: false },
);

const projectSchema = new Schema<Project>(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    summary: { type: String, default: "" },
    stack: { type: [String], default: [] },
    repoUrl: String,
    demoUrl: String,
    image: imageDef,
    memoryId: String,
    personIds: { type: [String], default: [] },
    createdAt: { type: String, required: true },
  },
  { versionKey: false },
);

const locationSchema = new Schema<LocationPoint>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    kind: { type: String, default: "other" },
    memoryIds: { type: [String], default: [] },
    createdAt: { type: String, required: true },
  },
  { versionKey: false },
);

const guestbookSchema = new Schema<GuestbookEntry>(
  {
    id: { type: String, required: true, unique: true, index: true },
    visitorName: { type: String, required: true },
    memory: { type: String, required: true },
    emoji: { type: String, default: "✨" },
    photo: imageDef,
    approved: { type: Boolean, default: true },
    createdAt: { type: String, required: true },
  },
  { versionKey: false },
);

const userSchema = new Schema<User>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    passwordHash: String,
    avatar: imageDef,
    role: { type: String, default: "editor" },
    provider: { type: String, default: "email" },
    googleId: String,
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { versionKey: false },
);

/** Strips Mongo internals so responses match the in-memory driver exactly. */
function clean<T>(doc: unknown): T {
  const o = doc as Record<string, unknown>;
  delete o._id;
  delete o.__v;
  return o as T;
}

function cleanAll<T>(docs: unknown[]): T[] {
  return docs.map((d) => clean<T>(d));
}

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

export class MongoRepo implements Repository {
  readonly kind = "mongo" as const;

  private Memory!: Model<Memory>;
  private Person!: Model<Person>;
  private Chapter!: Model<Chapter>;
  private Category!: Model<Category>;
  private Album!: Model<Album>;
  private Tag!: Model<Tag>;
  private Certificate!: Model<Certificate>;
  private Project!: Model<Project>;
  private LocationPoint!: Model<LocationPoint>;
  private Guestbook!: Model<GuestbookEntry>;
  private User!: Model<User>;

  constructor(private uri: string) {}

  async connect(): Promise<void> {
    await mongoose.connect(this.uri);
    const m = mongoose.models;
    this.Memory = (m.Memory as Model<Memory>) ?? mongoose.model<Memory>("Memory", memorySchema);
    this.Person = (m.Person as Model<Person>) ?? mongoose.model<Person>("Person", personSchema);
    this.Chapter = (m.Chapter as Model<Chapter>) ?? mongoose.model<Chapter>("Chapter", chapterSchema);
    this.Category = (m.Category as Model<Category>) ?? mongoose.model<Category>("Category", categorySchema);
    this.Album = (m.Album as Model<Album>) ?? mongoose.model<Album>("Album", albumSchema);
    this.Tag = (m.Tag as Model<Tag>) ?? mongoose.model<Tag>("Tag", tagSchema);
    this.Certificate = (m.Certificate as Model<Certificate>) ?? mongoose.model<Certificate>("Certificate", certificateSchema);
    this.Project = (m.Project as Model<Project>) ?? mongoose.model<Project>("Project", projectSchema);
    this.LocationPoint = (m.LocationPoint as Model<LocationPoint>) ?? mongoose.model<LocationPoint>("LocationPoint", locationSchema);
    this.Guestbook = (m.Guestbook as Model<GuestbookEntry>) ?? mongoose.model<GuestbookEntry>("Guestbook", guestbookSchema);
    this.User = (m.User as Model<User>) ?? mongoose.model<User>("User", userSchema);
  }

  async close(): Promise<void> {
    await mongoose.disconnect();
  }

  async seedIfEmpty(): Promise<void> {
    if ((await this.Memory.countDocuments()) > 0) return;
    const content = await import("@chronicles/content");
    await Promise.all([
      this.Memory.insertMany(content.memories),
      this.Person.insertMany(content.people),
      this.Chapter.insertMany(content.chapters),
      this.Category.insertMany(content.categories),
      this.Album.insertMany(content.albums),
      this.Tag.insertMany(content.tags),
      this.Certificate.insertMany(content.certificates),
      this.Project.insertMany(content.projects),
      this.LocationPoint.insertMany(
        content.mapLocations().map((l) => ({ ...l, createdAt: new Date().toISOString() })),
      ),
    ]);
  }

  /* ------------------------- memories ------------------------- */

  private memoryQuery(filter: MemoryFilter): Record<string, unknown> {
    const q: Record<string, unknown> = {};
    if (!filter.includeArchived) q.archived = false;
    if (filter.chapter) q.chapter = filter.chapter;
    if (filter.category) q.category = filter.category;
    if (filter.tag) q.tags = filter.tag;
    if (filter.personId) q.people = filter.personId;
    if (filter.favoriteOnly) q.favorite = true;
    if (filter.q) q.$text = { $search: filter.q };
    return q;
  }

  async listMemories(filter: MemoryFilter = {}, cursor: MemoryCursor = {}): Promise<CursorPage<Memory>> {
    const q = this.memoryQuery(filter);
    const limit = Math.min(Math.max(cursor.limit ?? 24, 1), 100);
    let offset = 0;
    if (cursor.cursor) {
      const d = decodeCursor(cursor.cursor);
      if (typeof d.offset === "number") offset = d.offset;
    }
    const [docs, total] = await Promise.all([
      this.Memory.find(q).sort({ date: -1 }).skip(offset).limit(limit).lean(),
      this.Memory.countDocuments(q),
    ]);
    const nextOffset = offset + limit;
    const hasMore = nextOffset < total;
    return {
      items: cleanAll<Memory>(docs),
      nextCursor: hasMore ? encodeCursor({ offset: nextOffset }) : null,
      hasMore,
      total,
    };
  }

  async getMemory(idOrSlug: string): Promise<Memory | null> {
    const doc = await this.Memory.findOne({ $or: [{ id: idOrSlug }, { slug: idOrSlug }] }).lean();
    return doc ? clean<Memory>(doc) : null;
  }

  async getMemoryById(id: string): Promise<Memory | null> {
    const doc = await this.Memory.findOne({ id }).lean();
    return doc ? clean<Memory>(doc) : null;
  }

  async createMemory(input: Memory): Promise<Memory> {
    await this.Memory.create(input);
    return input;
  }

  async updateMemory(id: string, patch: Partial<Memory>): Promise<Memory | null> {
    const doc = await this.Memory.findOneAndUpdate(
      { id },
      { $set: { ...patch, updatedAt: new Date().toISOString() } },
      { new: true },
    ).lean();
    return doc ? clean<Memory>(doc) : null;
  }

  async deleteMemory(id: string): Promise<boolean> {
    const r = await this.Memory.deleteOne({ id });
    return r.deletedCount > 0;
  }

  async listMemoriesByChapter(chapter: string): Promise<Memory[]> {
    return cleanAll<Memory>(await this.Memory.find({ chapter, archived: false }).sort({ date: -1 }).lean());
  }

  async listMemoriesByCategory(category: string): Promise<Memory[]> {
    return cleanAll<Memory>(await this.Memory.find({ category, archived: false }).sort({ date: -1 }).lean());
  }

  async listMemoriesByPerson(personId: string): Promise<Memory[]> {
    return cleanAll<Memory>(await this.Memory.find({ people: personId, archived: false }).sort({ date: -1 }).lean());
  }

  async listFavorites(): Promise<Memory[]> {
    return cleanAll<Memory>(await this.Memory.find({ favorite: true, archived: false }).sort({ viewCount: -1 }).lean());
  }

  async randomMemory(): Promise<Memory | null> {
    const docs = await this.Memory.aggregate([{ $match: { archived: false } }, { $sample: { size: 1 } }]);
    return docs[0] ? clean<Memory>(docs[0]) : null;
  }

  async incrementViews(id: string): Promise<Memory | null> {
    const doc = await this.Memory.findOneAndUpdate({ id }, { $inc: { viewCount: 1 } }, { new: true }).lean();
    return doc ? clean<Memory>(doc) : null;
  }

  async addReaction(id: string, type: string): Promise<Memory | null> {
    if (!REACTION_TYPES.includes(type as (typeof REACTION_TYPES)[number])) return null;
    // Try to bump an existing counter; if the type isn't present yet, push it.
    const bumped = await this.Memory.findOneAndUpdate(
      { id, "reactions.type": type },
      { $inc: { "reactions.$.count": 1 } },
      { new: true },
    ).lean();
    if (bumped) return clean<Memory>(bumped);
    const pushed = await this.Memory.findOneAndUpdate(
      { id },
      { $push: { reactions: { type, count: 1 } as Reaction } },
      { new: true },
    ).lean();
    return pushed ? clean<Memory>(pushed) : null;
  }

  async addComment(
    id: string,
    comment: { authorName: string; body: string; emoji?: string },
  ): Promise<Memory | null> {
    const doc = await this.Memory.findOneAndUpdate(
      { id },
      {
        $push: {
          comments: {
            id: `c-${Date.now()}`,
            authorName: comment.authorName,
            body: comment.body,
            emoji: comment.emoji,
            createdAt: new Date().toISOString(),
          },
        },
      },
      { new: true },
    ).lean();
    return doc ? clean<Memory>(doc) : null;
  }

  async memoryOfTheDay(): Promise<Memory | null> {
    const total = await this.Memory.countDocuments({ archived: false });
    if (total === 0) return null;
    const d = new Date();
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    let h = 0x811c9dc5;
    for (let i = 0; i < key.length; i++) {
      h ^= key.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    const doc = await this.Memory.findOne({ archived: false }).skip(h % total).lean();
    return doc ? clean<Memory>(doc) : null;
  }

  async thisDayYearsAgo(): Promise<Memory | null> {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const doc = await this.Memory.findOne({ date: { $regex: `-${mm}-${dd}$` } }).lean();
    return doc ? clean<Memory>(doc) : null;
  }

  async recentMemories(): Promise<Memory[]> {
    return cleanAll<Memory>(await this.Memory.find({ archived: false }).sort({ createdAt: -1 }).limit(12).lean());
  }

  /* ------------------------- people ------------------------- */

  async listPeople(): Promise<Person[]> {
    return cleanAll<Person>(await this.Person.find().lean());
  }
  async getPerson(idOrSlug: string): Promise<Person | null> {
    const doc = await this.Person.findOne({ $or: [{ id: idOrSlug }, { slug: idOrSlug }] }).lean();
    return doc ? clean<Person>(doc) : null;
  }
  async createPerson(input: Person): Promise<Person> {
    await this.Person.create(input);
    return input;
  }
  async updatePerson(id: string, patch: Partial<Person>): Promise<Person | null> {
    const doc = await this.Person.findOneAndUpdate({ id }, { $set: patch }, { new: true }).lean();
    return doc ? clean<Person>(doc) : null;
  }
  async deletePerson(id: string): Promise<boolean> {
    return (await this.Person.deleteOne({ id })).deletedCount > 0;
  }

  /* ------------------------- chapters ------------------------- */

  async listChapters(): Promise<Chapter[]> {
    return cleanAll<Chapter>(await this.Chapter.find().sort({ yearMonth: 1 }).lean());
  }
  async getChapter(yearMonth: string): Promise<Chapter | null> {
    const doc = await this.Chapter.findOne({ yearMonth }).lean();
    return doc ? clean<Chapter>(doc) : null;
  }
  async createChapter(input: Chapter): Promise<Chapter> {
    await this.Chapter.create(input);
    return input;
  }
  async updateChapter(id: string, patch: Partial<Chapter>): Promise<Chapter | null> {
    const doc = await this.Chapter.findOneAndUpdate({ id }, { $set: patch }, { new: true }).lean();
    return doc ? clean<Chapter>(doc) : null;
  }
  async deleteChapter(id: string): Promise<boolean> {
    return (await this.Chapter.deleteOne({ id })).deletedCount > 0;
  }

  /* ------------------------- categories ------------------------- */

  async listCategories(): Promise<Category[]> {
    return cleanAll<Category>(await this.Category.find().lean());
  }
  async getCategory(slug: string): Promise<Category | null> {
    const doc = await this.Category.findOne({ slug }).lean();
    return doc ? clean<Category>(doc) : null;
  }
  async createCategory(input: Category): Promise<Category> {
    await this.Category.create(input);
    return input;
  }
  async updateCategory(id: string, patch: Partial<Category>): Promise<Category | null> {
    const doc = await this.Category.findOneAndUpdate({ id }, { $set: patch }, { new: true }).lean();
    return doc ? clean<Category>(doc) : null;
  }
  async deleteCategory(id: string): Promise<boolean> {
    return (await this.Category.deleteOne({ id })).deletedCount > 0;
  }

  /* ------------------------- albums ------------------------- */

  async listAlbums(): Promise<Album[]> {
    return cleanAll<Album>(await this.Album.find().lean());
  }
  async getAlbum(id: string): Promise<Album | null> {
    const doc = await this.Album.findOne({ id }).lean();
    return doc ? clean<Album>(doc) : null;
  }
  async createAlbum(input: Album): Promise<Album> {
    await this.Album.create(input);
    return input;
  }
  async updateAlbum(id: string, patch: Partial<Album>): Promise<Album | null> {
    const doc = await this.Album.findOneAndUpdate({ id }, { $set: patch }, { new: true }).lean();
    return doc ? clean<Album>(doc) : null;
  }
  async deleteAlbum(id: string): Promise<boolean> {
    return (await this.Album.deleteOne({ id })).deletedCount > 0;
  }

  /* ------------------------- tags ------------------------- */

  async listTags(): Promise<Tag[]> {
    return cleanAll<Tag>(await this.Tag.find().sort({ count: -1 }).lean());
  }
  async getTag(slug: string): Promise<Tag | null> {
    const doc = await this.Tag.findOne({ slug }).lean();
    return doc ? clean<Tag>(doc) : null;
  }
  async createTag(input: Tag): Promise<Tag> {
    await this.Tag.create(input);
    return input;
  }
  async updateTag(id: string, patch: Partial<Tag>): Promise<Tag | null> {
    const doc = await this.Tag.findOneAndUpdate({ id }, { $set: patch }, { new: true }).lean();
    return doc ? clean<Tag>(doc) : null;
  }
  async deleteTag(id: string): Promise<boolean> {
    return (await this.Tag.deleteOne({ id })).deletedCount > 0;
  }

  /* ------------------------- certificates ------------------------- */

  async listCertificates(): Promise<Certificate[]> {
    return cleanAll<Certificate>(await this.Certificate.find().lean());
  }
  async getCertificate(id: string): Promise<Certificate | null> {
    const doc = await this.Certificate.findOne({ id }).lean();
    return doc ? clean<Certificate>(doc) : null;
  }
  async createCertificate(input: Certificate): Promise<Certificate> {
    await this.Certificate.create(input);
    return input;
  }
  async updateCertificate(id: string, patch: Partial<Certificate>): Promise<Certificate | null> {
    const doc = await this.Certificate.findOneAndUpdate({ id }, { $set: patch }, { new: true }).lean();
    return doc ? clean<Certificate>(doc) : null;
  }
  async deleteCertificate(id: string): Promise<boolean> {
    return (await this.Certificate.deleteOne({ id })).deletedCount > 0;
  }

  /* ------------------------- projects ------------------------- */

  async listProjects(): Promise<Project[]> {
    return cleanAll<Project>(await this.Project.find().lean());
  }
  async getProject(id: string): Promise<Project | null> {
    const doc = await this.Project.findOne({ id }).lean();
    return doc ? clean<Project>(doc) : null;
  }
  async createProject(input: Project): Promise<Project> {
    await this.Project.create(input);
    return input;
  }
  async updateProject(id: string, patch: Partial<Project>): Promise<Project | null> {
    const doc = await this.Project.findOneAndUpdate({ id }, { $set: patch }, { new: true }).lean();
    return doc ? clean<Project>(doc) : null;
  }
  async deleteProject(id: string): Promise<boolean> {
    return (await this.Project.deleteOne({ id })).deletedCount > 0;
  }

  /* ------------------------- locations ------------------------- */

  async listLocations(): Promise<LocationPoint[]> {
    return cleanAll<LocationPoint>(await this.LocationPoint.find().lean());
  }

  /* ------------------------- guestbook ------------------------- */

  async listGuestbook(): Promise<GuestbookEntry[]> {
    return cleanAll<GuestbookEntry>(await this.Guestbook.find({ approved: true }).sort({ createdAt: -1 }).lean());
  }
  async createGuestbookEntry(input: GuestbookEntry): Promise<GuestbookEntry> {
    await this.Guestbook.create(input);
    return input;
  }
  async deleteGuestbookEntry(id: string): Promise<boolean> {
    return (await this.Guestbook.deleteOne({ id })).deletedCount > 0;
  }

  /* ------------------------- users ------------------------- */

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.User.findOne({ email: email.toLowerCase() }).lean();
    return doc ? clean<User>(doc) : null;
  }
  async createUser(input: User): Promise<User> {
    await this.User.create({ ...input, email: input.email.toLowerCase() });
    return input;
  }
  async listUsers(): Promise<User[]> {
    return cleanAll<User>(await this.User.find().lean());
  }

  /* ------------------------- stats ------------------------- */

  async getStats(): Promise<RepositoryStats> {
    const [memories, people, projects, certificates, cities, photoAgg] = await Promise.all([
      this.Memory.countDocuments({ archived: false }),
      this.Person.countDocuments(),
      this.Project.countDocuments(),
      this.Certificate.countDocuments(),
      this.Memory.distinct("location.city"),
      this.Memory.aggregate<{ total: number }>([
        { $group: { _id: null, total: { $sum: { $size: "$images" } } } },
      ]),
    ]);
    return {
      memories,
      photos: photoAgg[0]?.total ?? 0,
      people,
      projects,
      certificates,
      cities: cities.filter(Boolean).length,
      daysTogether: daysTogether("2025-11-03", "2026-03-27"),
    };
  }
}
