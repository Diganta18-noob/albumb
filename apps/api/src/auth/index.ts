import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { User } from "@chronicles/types";
import { config } from "../config";
import { getRepository } from "../repo";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: User["role"];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, config.jwtSecret) as AuthUser;
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

function bearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

/** Attaches req.user when a valid token is present; never rejects. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = bearer(req);
  if (token) {
    const user = verifyToken(token);
    if (user) req.user = user;
  }
  next();
}

/** Gate for every mutating admin route. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = bearer(req);
  const user = token ? verifyToken(token) : null;
  if (!user) {
    res.status(401).json({ error: { code: "unauthorized", message: "Sign in to continue." } });
    return;
  }
  req.user = user;
  next();
}

export function requireRole(...roles: User["role"][]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        error: { code: "forbidden", message: "You don't have access to this." },
      });
      return;
    }
    next();
  };
}

/**
 * Creates the first admin from env so a fresh install has a way in. Logs the
 * credentials only in development — never in production.
 */
export async function ensureSeedAdmin(): Promise<void> {
  const repo = await getRepository();
  const existing = await repo.findByEmail(config.seedAdminEmail);
  if (existing) return;

  const now = new Date().toISOString();
  await repo.createUser({
    id: `u-admin`,
    email: config.seedAdminEmail,
    name: "Archivist",
    passwordHash: await hashPassword(config.seedAdminPassword),
    role: "admin",
    provider: "email",
    createdAt: now,
    updatedAt: now,
  });

  if (!config.isProduction) {
    console.log(
      `[auth] seeded admin  ${config.seedAdminEmail} / ${config.seedAdminPassword}`,
    );
  }
}

/**
 * Verifies a Google ID token against Google's tokeninfo endpoint. Avoids the
 * google-auth-library dependency for what is one HTTPS call.
 */
export async function verifyGoogleCredential(
  credential: string,
): Promise<{ email: string; name: string; sub: string; picture?: string } | null> {
  if (!config.googleEnabled) return null;
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, string>;
    if (data.aud !== config.googleClientId) return null;
    if (!data.email || !data.sub) return null;
    return {
      email: data.email,
      name: data.name ?? data.email.split("@")[0] ?? "Guest",
      sub: data.sub,
      picture: data.picture,
    };
  } catch {
    return null;
  }
}
