import { Router } from "express";
import multer from "multer";
import { loginSchema, googleTokenSchema } from "@chronicles/types";
import { config } from "../config";
import { getRepository } from "../repo";
import { getStorage } from "../storage";
import {
  requireAuth, signToken, comparePassword, hashPassword, verifyGoogleCredential,
} from "../auth";
import { ok, wrap, zodParse, badRequest, ApiError } from "./util";

/* ------------------------------------------------------------------ */
/* Auth                                                                 */
/* ------------------------------------------------------------------ */

export const authRouter = Router();

/**
 * Lets the web app decide whether to render the Google button without
 * shipping the client id into the bundle at build time.
 */
authRouter.get("/config", (_req, res) => {
  ok(res, {
    googleEnabled: config.googleEnabled,
    googleClientId: config.googleClientId || null,
    storageDriver: config.storageDriver,
  });
});

authRouter.post(
  "/login",
  wrap(async (req, res) => {
    const { email, password } = zodParse(loginSchema, req.body);
    const repo = await getRepository();
    const user = await repo.findByEmail(email);
    // Same message for unknown email and wrong password — don't confirm which
    // addresses exist.
    const invalid = new ApiError(401, "invalid_credentials", "Email or password is incorrect.");
    if (!user?.passwordHash) throw invalid;
    if (!(await comparePassword(password, user.passwordHash))) throw invalid;

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    ok(res, { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  }),
);

authRouter.post(
  "/google",
  wrap(async (req, res) => {
    if (!config.googleEnabled) {
      throw new ApiError(400, "google_disabled", "Google sign-in isn't configured on this server.");
    }
    const { credential } = zodParse(googleTokenSchema, req.body);
    const profile = await verifyGoogleCredential(credential);
    if (!profile) throw new ApiError(401, "invalid_credential", "Google sign-in failed.");

    const repo = await getRepository();
    let user = await repo.findByEmail(profile.email);
    if (!user) {
      const now = new Date().toISOString();
      user = await repo.createUser({
        id: `u-${profile.sub}`,
        email: profile.email,
        name: profile.name,
        role: "editor",
        provider: "google",
        googleId: profile.sub,
        createdAt: now,
        updatedAt: now,
      });
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    ok(res, { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  wrap(async (req, res) => {
    ok(res, req.user);
  }),
);

/* ------------------------------------------------------------------ */
/* Upload                                                              */
/* ------------------------------------------------------------------ */

export const uploadRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 40 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new ApiError(400, "unsupported_type", `${file.originalname} isn't an image.`));
      return;
    }
    cb(null, true);
  },
});

/**
 * POST /upload — bulk drag-and-drop. Returns fully-formed Image records
 * (palette + blur placeholder included) ready to attach to a memory.
 */
uploadRouter.post(
  "/",
  requireAuth,
  upload.array("files", 40),
  wrap(async (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) throw badRequest("Add at least one image.");

    const folder = typeof req.body?.folder === "string" ? req.body.folder : "misc";
    const storage = getStorage();

    // Sequential: sharp is CPU-bound, and 40 parallel resizes would starve the
    // event loop on a small Render instance.
    const images = [];
    for (const file of files) {
      images.push(await storage.put(file.buffer, { folder, filename: file.originalname }));
    }

    ok(res, images, { count: images.length, driver: storage.kind });
  }),
);

uploadRouter.delete(
  "/",
  requireAuth,
  wrap(async (req, res) => {
    const key = typeof req.body?.storageKey === "string" ? req.body.storageKey : "";
    if (!key) throw badRequest("storageKey is required.");
    ok(res, { deleted: await getStorage().delete(key) });
  }),
);
