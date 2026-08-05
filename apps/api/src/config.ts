import "dotenv/config";

function str(key: string, fallback = ""): string {
  const v = process.env[key];
  return v === undefined || v === "" ? fallback : v;
}

function int(key: string, fallback: number): number {
  const v = Number(process.env[key]);
  return Number.isFinite(v) ? v : fallback;
}

const mongoUri = str("MONGODB_URI");
const cloudName = str("CLOUDINARY_CLOUD_NAME");
const cloudKey = str("CLOUDINARY_API_KEY");
const cloudSecret = str("CLOUDINARY_API_SECRET");
const googleClientId = str("GOOGLE_CLIENT_ID");

/**
 * Every optional integration resolves to a boolean here, once, so route and
 * driver code never re-checks env vars and can't disagree about what's on.
 */
export const config = {
  port: int("PORT", 4000),
  corsOrigins: str("CORS_ORIGINS", "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  mongoUri,
  useMongo: mongoUri !== "",

  storageDriver:
    str("STORAGE_DRIVER", "local") === "cloudinary" && cloudName && cloudKey && cloudSecret
      ? ("cloudinary" as const)
      : ("local" as const),
  uploadDir: str("UPLOAD_DIR", "uploads"),
  publicBaseUrl: str("PUBLIC_BASE_URL", `http://localhost:${int("PORT", 4000)}`),
  cloudinary: { cloudName, apiKey: cloudKey, apiSecret: cloudSecret },

  jwtSecret: str("JWT_SECRET", "dev-only-insecure-secret"),
  jwtExpiresIn: str("JWT_EXPIRES_IN", "7d"),
  seedAdminEmail: str("SEED_ADMIN_EMAIL", "admin@training.local"),
  seedAdminPassword: str("SEED_ADMIN_PASSWORD", "admin12345"),

  googleClientId,
  googleEnabled: googleClientId !== "",

  isProduction: str("NODE_ENV") === "production",
} as const;

export function describeConfig(): string {
  return [
    `repo=${config.useMongo ? "mongodb" : "in-memory"}`,
    `storage=${config.storageDriver}`,
    `google=${config.googleEnabled ? "on" : "off"}`,
  ].join("  ");
}
