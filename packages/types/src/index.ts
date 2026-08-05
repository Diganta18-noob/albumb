import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Shared primitives                                                    */
/* ------------------------------------------------------------------ */

export const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case required");

export const idSchema = z.string().min(1).max(80);

/** ISO 8601 date — we store "YYYY-MM-DD" for memories, full timestamps elsewhere. */
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const isoDateSchema = z.string().datetime({ offset: true });

export const yearMonthSchema = z.string().regex(/^\d{4}-\d{2}$/);

/* ------------------------------------------------------------------ */
/* Media                                                                */
/* ------------------------------------------------------------------ */

export const imageSchema = z.object({
  url: z.string().url(),
  /** 1:1 crop for avatars / polaroids */
  squareUrl: z.string().url().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  /** data:image/svg+xml placeholder for next/image blur-up */
  blurDataURL: z.string().optional(),
  /** dominant colors extracted from the image, hex without "#" */
  palette: z.array(z.string()).max(8).optional(),
  /** local driver: relative path used for deletion */
  storageKey: z.string().optional(),
});

export const videoSchema = z.object({
  url: z.string().url(),
  poster: z.string().url().optional(),
  storageKey: z.string().optional(),
});

/* ------------------------------------------------------------------ */
/* Location                                                             */
/* ------------------------------------------------------------------ */

export const locationSchema = z.object({
  name: z.string().min(1),
  city: z.string().default(""),
  country: z.string().default(""),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

/* ------------------------------------------------------------------ */
/* Reactions (social)                                                   */
/* ------------------------------------------------------------------ */

export const REACTION_TYPES = ["heart", "fire", "smile", "clap", "tears"] as const;

export const reactionSchema = z.object({
  type: z.enum(REACTION_TYPES),
  count: z.number().int().min(0).default(0),
});

/* ------------------------------------------------------------------ */
/* Comments                                                             */
/* ------------------------------------------------------------------ */

export const commentSchema = z.object({
  id: idSchema,
  authorName: z.string().min(1).max(80),
  body: z.string().min(1).max(2000),
  emoji: z.string().max(16).optional(),
  createdAt: isoDateSchema,
});

/* ------------------------------------------------------------------ */
/* Memory — the core unit                                               */
/* ------------------------------------------------------------------ */

export const memoryCategorySchema = z.enum([
  "friends",
  "mentors",
  "classroom",
  "team",
  "projects",
  "hackathons",
  "office",
  "funny",
  "trips",
  "graduation",
  "certificates",
  "farewell",
]);

export const moodSchema = z.enum([
  "joyful",
  "nostalgic",
  "proud",
  "humbled",
  "grateful",
  "bittersweet",
  "electric",
  "calm",
]);

export const weatherSchema = z.enum([
  "sunny",
  "clear",
  "partly-cloudy",
  "overcast",
  "rainy",
  "foggy",
  "cold",
  "warm",
]);

export const memorySchema = z.object({
  id: idSchema,
  slug: slugSchema,
  title: z.string().min(1).max(160),
  /** short editorial deck that appears on the wall tile */
  excerpt: z.string().max(280).default(""),
  /** full magazine story — plain paragraphs + markdown-ish quote lines */
  story: z.string().default(""),
  date: dateSchema,
  chapter: yearMonthSchema,
  category: memoryCategorySchema,
  location: locationSchema,
  photographer: z.string().default(""),
  people: z.array(idSchema).default([]),
  tags: z.array(z.string().min(1).max(40)).default([]),
  images: z.array(imageSchema).min(1),
  video: videoSchema.optional(),
  mood: moodSchema.default("nostalgic"),
  weather: weatherSchema.default("clear"),
  /** one-line favorite quote for this memory */
  quote: z.string().default(""),
  /** computed at write time */
  readingTimeMinutes: z.number().int().min(1).max(60).default(2),
  /** warm accent — the keeper frames */
  favorite: z.boolean().default(false),
  archived: z.boolean().default(false),
  reactions: z.array(reactionSchema).default([]),
  comments: z.array(commentSchema).default([]),
  viewCount: z.number().int().min(0).default(0),
  /** contact-sheet frame number, assigned by chapter */
  frameNumber: z.number().int().min(1).optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

/* ------------------------------------------------------------------ */
/* People (yearbook)                                                    */
/* ------------------------------------------------------------------ */

export const personSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  name: z.string().min(1).max(80),
  role: z.string().default("Trainee"),
  department: z.string().default(""),
  nickname: z.string().default(""),
  favoriteQuote: z.string().default(""),
  bestMemory: z.string().default(""),
  bio: z.string().default(""),
  avatar: imageSchema.optional(),
  gallery: z.array(imageSchema).default([]),
  achievements: z.array(z.string()).default([]),
  /** e.g. "11.2025 → 03.2026" */
  period: z.string().default(""),
  funFact: z.string().default(""),
  favoriteMemoryId: idSchema.optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

/* ------------------------------------------------------------------ */
/* Chapters — the timeline months                                       */
/* ------------------------------------------------------------------ */

export const chapterSchema = z.object({
  id: idSchema,
  /** "2025-11" */
  yearMonth: yearMonthSchema,
  title: z.string().min(1).max(120),
  /** editorial one-liner shown on the spine and timeline */
  tagline: z.string().default(""),
  /** larger chapter story */
  story: z.string().default(""),
  coverImage: imageSchema.optional(),
  heroMemoryId: idSchema.optional(),
  mood: z.string().default("nostalgic"),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

/* ------------------------------------------------------------------ */
/* Categories, albums, tags                                             */
/* ------------------------------------------------------------------ */

export const categorySchema = z.object({
  id: idSchema,
  slug: slugSchema,
  name: z.string().min(1).max(60),
  description: z.string().default(""),
  icon: z.string().default(""),
  coverImage: imageSchema.optional(),
  accent: z.string().default("brass"),
  createdAt: isoDateSchema,
});

export const albumSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  name: z.string().min(1).max(80),
  /** nested tree path, e.g. "2025/November" */
  path: z.string().default(""),
  parentId: idSchema.optional(),
  description: z.string().default(""),
  coverImage: imageSchema.optional(),
  memoryIds: z.array(idSchema).default([]),
  archived: z.boolean().default(false),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const tagSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  name: z.string().min(1).max(60),
  count: z.number().int().min(0).default(0),
  createdAt: isoDateSchema,
});

/* ------------------------------------------------------------------ */
/* Certificates & projects                                              */
/* ------------------------------------------------------------------ */

export const certificateSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  title: z.string().min(1).max(160),
  issuer: z.string().default(""),
  issuedOn: dateSchema,
  description: z.string().default(""),
  image: imageSchema.optional(),
  personIds: z.array(idSchema).default([]),
  createdAt: isoDateSchema,
});

export const projectSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  name: z.string().min(1).max(120),
  summary: z.string().default(""),
  stack: z.array(z.string()).default([]),
  repoUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  image: imageSchema.optional(),
  memoryId: idSchema.optional(),
  personIds: z.array(idSchema).default([]),
  createdAt: isoDateSchema,
});

/* ------------------------------------------------------------------ */
/* Locations & map                                                      */
/* ------------------------------------------------------------------ */

export const locationPointSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(80),
  city: z.string().default(""),
  country: z.string().default(""),
  lat: z.number(),
  lng: z.number(),
  kind: z.enum(["training", "trip", "office", "hackathon", "other"]).default("other"),
  memoryIds: z.array(idSchema).default([]),
  createdAt: isoDateSchema,
});

/* ------------------------------------------------------------------ */
/* Guestbook                                                            */
/* ------------------------------------------------------------------ */

export const guestbookEntrySchema = z.object({
  id: idSchema,
  visitorName: z.string().min(1).max(80),
  memory: z.string().min(1).max(2000),
  emoji: z.string().max(16).default("✨"),
  photo: imageSchema.optional(),
  approved: z.boolean().default(true),
  createdAt: isoDateSchema,
});

/* ------------------------------------------------------------------ */
/* Users & auth                                                         */
/* ------------------------------------------------------------------ */

export const userSchema = z.object({
  id: idSchema,
  email: z.string().email(),
  name: z.string().min(1).max(80),
  passwordHash: z.string().optional(),
  avatar: imageSchema.optional(),
  role: z.enum(["admin", "editor", "viewer"]).default("editor"),
  provider: z.enum(["email", "google"]).default("email"),
  googleId: z.string().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const googleTokenSchema = z.object({
  credential: z.string().min(1),
});

/* ------------------------------------------------------------------ */
/* Analytics                                                            */
/* ------------------------------------------------------------------ */

export const viewEventSchema = z.object({
  id: idSchema,
  memoryId: idSchema,
  /** coarse — "day:2026-08-03" or "month:2026-08" */
  bucket: z.string().min(1),
  count: z.number().int().min(0).default(1),
  createdAt: isoDateSchema,
});

/* ------------------------------------------------------------------ */
/* API envelope                                                         */
/* ------------------------------------------------------------------ */

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export const cursorPageSchema = z.object({
  items: z.array(z.unknown()),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
  total: z.number().int().min(0),
});

/* ------------------------------------------------------------------ */
/* Derived types                                                        */
/* ------------------------------------------------------------------ */

export type Image = z.infer<typeof imageSchema>;
export type Video = z.infer<typeof videoSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Reaction = z.infer<typeof reactionSchema>;
export type ReactionType = (typeof REACTION_TYPES)[number];
export type Comment = z.infer<typeof commentSchema>;
export type Memory = z.infer<typeof memorySchema>;
export type MemoryCategory = z.infer<typeof memoryCategorySchema>;
export type Mood = z.infer<typeof moodSchema>;
export type Weather = z.infer<typeof weatherSchema>;
export type Person = z.infer<typeof personSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Album = z.infer<typeof albumSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type Certificate = z.infer<typeof certificateSchema>;
export type Project = z.infer<typeof projectSchema>;
export type LocationPoint = z.infer<typeof locationPointSchema>;
export type GuestbookEntry = z.infer<typeof guestbookEntrySchema>;
export type User = z.infer<typeof userSchema>;
export type ViewEvent = z.infer<typeof viewEventSchema>;

export type MemoryInput = z.input<typeof memorySchema>;
export type PersonInput = z.input<typeof personSchema>;
export type ChapterInput = z.input<typeof chapterSchema>;

export const CATEGORY_META: Record<
  MemoryCategory,
  { name: string; tagline: string }
> = {
  friends: { name: "Friends", tagline: "The people who made it home." },
  mentors: { name: "Mentors", tagline: "Those who showed us the way." },
  classroom: { name: "Classroom", tagline: "Where the mornings were hardest." },
  team: { name: "Team Activities", tagline: "Chaos, choreographed." },
  projects: { name: "Projects", tagline: "Things we built at 2am." },
  hackathons: { name: "Hackathons", tagline: "36 hours, no sleep, one demo." },
  office: { name: "Office", tagline: "The everyday we miss now." },
  funny: { name: "Funny Moments", tagline: "The frames we can't stop laughing at." },
  trips: { name: "Trips", tagline: "Escapes that made us a family." },
  graduation: { name: "Graduation", tagline: "The last first day." },
  certificates: { name: "Certificates", tagline: "Proof we were there." },
  farewell: { name: "Farewell", tagline: "We arrived as strangers." },
};

export const MOOD_META: Record<Mood, string> = {
  joyful: "joyful",
  nostalgic: "nostalgic",
  proud: "proud",
  humbled: "humbled",
  grateful: "grateful",
  bittersweet: "bittersweet",
  electric: "electric",
  calm: "calm",
};
