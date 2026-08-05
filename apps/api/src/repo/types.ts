import type { Memory } from "@chronicles/types";

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}

export interface MemoryFilter {
  chapter?: string;
  category?: string;
  tag?: string;
  personId?: string;
  q?: string;
  favoriteOnly?: boolean;
  /** default true — archived memories are hidden from the public site */
  includeArchived?: boolean;
}

export interface MemoryCursor {
  /** base-64 JSON cursor */
  cursor?: string;
  limit?: number;
}

export interface RepositoryStats {
  memories: number;
  photos: number;
  people: number;
  projects: number;
  certificates: number;
  cities: number;
  daysTogether: number;
}

/**
 * The single persistence contract. MongoRepo and MemoryRepo both implement
 * it; the router layer never touches a driver directly.
 */
export interface Repository {
  readonly kind: "mongo" | "memory";

  /* lifecycle */
  connect(): Promise<void>;
  close(): Promise<void>;
  /** populate from seed content if this repo starts empty */
  seedIfEmpty(): Promise<void>;

  /* memories */
  listMemories(filter?: MemoryFilter, cursor?: MemoryCursor): Promise<CursorPage<Memory>>;
  getMemory(idOrSlug: string): Promise<Memory | null>;
  getMemoryById(id: string): Promise<Memory | null>;
  createMemory(input: Memory): Promise<Memory>;
  updateMemory(id: string, patch: Partial<Memory>): Promise<Memory | null>;
  deleteMemory(id: string): Promise<boolean>;
  listMemoriesByChapter(chapter: string): Promise<Memory[]>;
  listMemoriesByCategory(category: string): Promise<Memory[]>;
  listMemoriesByPerson(personId: string): Promise<Memory[]>;
  listFavorites(): Promise<Memory[]>;
  randomMemory(): Promise<Memory | null>;
  incrementViews(id: string): Promise<Memory | null>;
  addReaction(id: string, type: string): Promise<Memory | null>;
  addComment(id: string, comment: { authorName: string; body: string; emoji?: string }): Promise<Memory | null>;
  /** memory of the day: deterministically stable within a day */
  memoryOfTheDay(): Promise<Memory | null>;
  /** this day years ago */
  thisDayYearsAgo(): Promise<Memory | null>;
  recentMemories(): Promise<Memory[]>;

  /* people */
  listPeople(): Promise<Person[]>;
  getPerson(idOrSlug: string): Promise<Person | null>;
  createPerson(input: Person): Promise<Person>;
  updatePerson(id: string, patch: Partial<Person>): Promise<Person | null>;
  deletePerson(id: string): Promise<boolean>;

  /* chapters */
  listChapters(): Promise<Chapter[]>;
  getChapter(yearMonth: string): Promise<Chapter | null>;
  createChapter(input: Chapter): Promise<Chapter>;
  updateChapter(id: string, patch: Partial<Chapter>): Promise<Chapter | null>;
  deleteChapter(id: string): Promise<boolean>;

  /* categories */
  listCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | null>;
  createCategory(input: Category): Promise<Category>;
  updateCategory(id: string, patch: Partial<Category>): Promise<Category | null>;
  deleteCategory(id: string): Promise<boolean>;

  /* albums */
  listAlbums(): Promise<Album[]>;
  getAlbum(id: string): Promise<Album | null>;
  createAlbum(input: Album): Promise<Album>;
  updateAlbum(id: string, patch: Partial<Album>): Promise<Album | null>;
  deleteAlbum(id: string): Promise<boolean>;

  /* tags */
  listTags(): Promise<Tag[]>;
  getTag(slug: string): Promise<Tag | null>;
  createTag(input: Tag): Promise<Tag>;
  updateTag(id: string, patch: Partial<Tag>): Promise<Tag | null>;
  deleteTag(id: string): Promise<boolean>;

  /* certificates */
  listCertificates(): Promise<Certificate[]>;
  getCertificate(id: string): Promise<Certificate | null>;
  createCertificate(input: Certificate): Promise<Certificate>;
  updateCertificate(id: string, patch: Partial<Certificate>): Promise<Certificate | null>;
  deleteCertificate(id: string): Promise<boolean>;

  /* projects */
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(input: Project): Promise<Project>;
  updateProject(id: string, patch: Partial<Project>): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;

  /* locations */
  listLocations(): Promise<LocationPoint[]>;

  /* guestbook */
  listGuestbook(): Promise<GuestbookEntry[]>;
  createGuestbookEntry(input: GuestbookEntry): Promise<GuestbookEntry>;
  deleteGuestbookEntry(id: string): Promise<boolean>;

  /* users */
  findByEmail(email: string): Promise<User | null>;
  createUser(input: User): Promise<User>;
  listUsers(): Promise<User[]>;

  /* stats */
  getStats(): Promise<RepositoryStats>;
}

import type {
  Album,
  Category,
  Certificate,
  Chapter,
  GuestbookEntry,
  LocationPoint,
  Person,
  Project,
  Tag,
  User,
} from "@chronicles/types";
