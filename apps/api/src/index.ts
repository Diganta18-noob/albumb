import express from "express";
import cors from "cors";
import path from "node:path";
import { config, describeConfig } from "./config";
import { getRepository, closeRepository } from "./repo";
import { ensureSeedAdmin, optionalAuth } from "./auth";
import { errorHandler, ok } from "./routes/util";
import { memoriesRouter } from "./routes/memories";
import {
  peopleRouter, chaptersRouter, categoriesRouter, albumsRouter,
  tagsRouter, certificatesRouter, projectsRouter,
} from "./routes/collections";
import { authRouter, uploadRouter } from "./routes/auth-upload";
import {
  searchRouter, guestbookRouter, statsRouter, locationsRouter, analyticsRouter,
} from "./routes/discovery";

export function createApp(): express.Express {
  const app = express();

  app.use(
    cors({
      origin(origin, cb) {
        // Same-origin and server-to-server calls arrive with no Origin header.
        if (!origin) return cb(null, true);
        cb(null, config.corsOrigins.includes(origin));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(optionalAuth);

  // Local storage driver serves its own uploads; Cloudinary serves its own.
  if (config.storageDriver === "local") {
    app.use(
      "/uploads",
      express.static(path.resolve(process.cwd(), config.uploadDir), {
        maxAge: "30d",
        immutable: true,
      }),
    );
  }

  app.get("/health", async (_req, res) => {
    const repo = await getRepository();
    ok(res, { status: "ok", repo: repo.kind, storage: config.storageDriver });
  });

  const v1 = express.Router();
  v1.use("/memories", memoriesRouter);
  v1.use("/people", peopleRouter);
  v1.use("/chapters", chaptersRouter);
  v1.use("/categories", categoriesRouter);
  v1.use("/albums", albumsRouter);
  v1.use("/tags", tagsRouter);
  v1.use("/certificates", certificatesRouter);
  v1.use("/projects", projectsRouter);
  v1.use("/auth", authRouter);
  v1.use("/upload", uploadRouter);
  v1.use("/search", searchRouter);
  v1.use("/guestbook", guestbookRouter);
  v1.use("/stats", statsRouter);
  v1.use("/locations", locationsRouter);
  v1.use("/analytics", analyticsRouter);
  app.use("/api/v1", v1);

  app.use((_req, res) => {
    res.status(404).json({ error: { code: "not_found", message: "No such endpoint." } });
  });
  app.use(errorHandler);

  return app;
}

async function main(): Promise<void> {
  await getRepository();
  await ensureSeedAdmin();

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`[api] http://localhost:${config.port}  ${describeConfig()}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n[api] ${signal} — shutting down`);
    server.close();
    await closeRepository();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

// Only auto-start when run directly, so tests can import createApp().
const isDirectRun =
  process.argv[1]?.includes("index.ts") || process.argv[1]?.includes("index.js");
if (isDirectRun) {
  main().catch((err) => {
    console.error("[api] failed to start:", err);
    process.exit(1);
  });
}
