import { config, describeConfig } from "../config";
import { getRepository, closeRepository } from "../repo";
import { ensureSeedAdmin } from "../auth";

/**
 * Populates whichever repository driver is active. Against the in-memory
 * driver this is a no-op that proves the content parses; against Mongo it
 * writes the collections.
 */
async function main(): Promise<void> {
  console.log(`[seed] ${describeConfig()}`);

  const repo = await getRepository();
  await repo.seedIfEmpty();
  await ensureSeedAdmin();

  const stats = await repo.getStats();
  const chapters = await repo.listChapters();
  const people = await repo.listPeople();

  console.log(`[seed] repo=${repo.kind}`);
  console.log(`[seed] ${stats.memories} memories · ${stats.photos} photos`);
  console.log(`[seed] ${people.length} people · ${chapters.length} chapters`);
  console.log(`[seed] ${stats.cities} cities · ${stats.daysTogether} days together`);

  if (repo.kind === "memory") {
    console.log(
      "[seed] in-memory driver: data lives for this process only. Set MONGODB_URI to persist.",
    );
  }

  await closeRepository();
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
