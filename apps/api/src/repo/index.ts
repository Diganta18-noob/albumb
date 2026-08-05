import { config } from "../config";
import { MemoryRepo } from "./memory";
import { MongoRepo } from "./mongo";
import type { Repository } from "./types";

let instance: Repository | null = null;

/**
 * Resolves the repository once per process. Falling back to the in-memory
 * driver when Mongo is unreachable keeps a demo alive instead of failing the
 * boot — the log line makes the downgrade explicit.
 */
export async function getRepository(): Promise<Repository> {
  if (instance) return instance;

  if (config.useMongo) {
    const repo = new MongoRepo(config.mongoUri);
    try {
      await repo.connect();
      await repo.seedIfEmpty();
      instance = repo;
      return instance;
    } catch (err) {
      console.error(
        `[repo] MongoDB connection failed, falling back to in-memory: ${(err as Error).message}`,
      );
    }
  }

  const repo = new MemoryRepo();
  await repo.connect();
  await repo.seedIfEmpty();
  instance = repo;
  return instance;
}

export async function closeRepository(): Promise<void> {
  await instance?.close();
  instance = null;
}

export type { Repository, MemoryFilter, MemoryCursor, CursorPage, RepositoryStats } from "./types";
