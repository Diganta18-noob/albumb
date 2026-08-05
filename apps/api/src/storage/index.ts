import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import type { Image } from "@chronicles/types";
import { config } from "../config";

export interface PutOptions {
  /** logical folder, e.g. "2026/March" or "people" */
  folder?: string;
  filename?: string;
}

export interface StorageDriver {
  readonly kind: "local" | "cloudinary";
  put(buffer: Buffer, opts?: PutOptions): Promise<Image>;
  delete(storageKey: string): Promise<boolean>;
}

/** Sorted-by-frequency dominant colors, quantised so near-duplicates merge. */
async function extractPalette(buffer: Buffer): Promise<string[]> {
  const { data, info } = await sharp(buffer)
    .resize(48, 48, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const counts = new Map<string, number>();
  const step = info.channels;
  for (let i = 0; i < data.length; i += step) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    // 4 bits per channel is enough to group visually identical pixels.
    const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key]) => {
      const [r = 0, g = 0, b = 0] = key.split("-").map((n) => (Number(n) << 4) + 8);
      return [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
    });
}

/** A 16px-wide WebP inlined as a data URL — small enough for the HTML payload. */
async function makeBlurDataURL(buffer: Buffer): Promise<string> {
  const tiny = await sharp(buffer).resize(16).webp({ quality: 30 }).toBuffer();
  return `data:image/webp;base64,${tiny.toString("base64")}`;
}

export class LocalDiskDriver implements StorageDriver {
  readonly kind = "local" as const;

  constructor(
    private root = path.resolve(process.cwd(), config.uploadDir),
    private publicBase = config.publicBaseUrl,
  ) {}

  private async ensureDir(dir: string): Promise<void> {
    await fs.mkdir(dir, { recursive: true });
  }

  async put(buffer: Buffer, opts: PutOptions = {}): Promise<Image> {
    const folder = opts.folder ?? "misc";
    const base = (opts.filename ?? `img-${Date.now()}`).replace(/\.[^.]+$/, "");
    const safe = base.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
    const dir = path.join(this.root, folder);
    await this.ensureDir(dir);

    const meta = await sharp(buffer).metadata();
    // Cap the long edge: originals off a phone are 4-6MB and never needed at
    // full size on the web.
    const optimised = await sharp(buffer)
      .rotate()
      .resize(2400, 2400, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const filename = `${safe}.webp`;
    const squareName = `${safe}-sq.webp`;
    await fs.writeFile(path.join(dir, filename), optimised);

    const square = await sharp(buffer)
      .rotate()
      .resize(800, 800, { fit: "cover", position: "attention" })
      .webp({ quality: 80 })
      .toBuffer();
    await fs.writeFile(path.join(dir, squareName), square);

    const [blurDataURL, palette] = await Promise.all([
      makeBlurDataURL(buffer),
      extractPalette(buffer),
    ]);

    const storageKey = `${folder}/${filename}`;
    return {
      url: `${this.publicBase}/uploads/${folder}/${filename}`,
      squareUrl: `${this.publicBase}/uploads/${folder}/${squareName}`,
      width: meta.width,
      height: meta.height,
      blurDataURL,
      palette,
      storageKey,
    };
  }

  async delete(storageKey: string): Promise<boolean> {
    try {
      const target = path.resolve(this.root, storageKey);
      // Refuse anything that escapes the upload root — storageKey reaches us
      // from request bodies.
      if (!target.startsWith(path.resolve(this.root))) return false;
      await fs.unlink(target);
      const sq = target.replace(/\.webp$/, "-sq.webp");
      await fs.unlink(sq).catch(() => {});
      return true;
    } catch {
      return false;
    }
  }
}

export class CloudinaryDriver implements StorageDriver {
  readonly kind = "cloudinary" as const;

  constructor() {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
      secure: true,
    });
  }

  async put(buffer: Buffer, opts: PutOptions = {}): Promise<Image> {
    const folder = `training-chronicles/${opts.folder ?? "misc"}`;

    const uploaded = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ width: 2400, height: 2400, crop: "limit", quality: "auto:good" }],
          // colors:true powers the lightbox backdrop without a second round-trip.
          colors: true,
        },
        (error, result) => (error ? reject(error) : resolve(result as unknown as Record<string, unknown>)),
      );
      stream.end(buffer);
    });

    const publicId = String(uploaded.public_id ?? "");
    const [blurDataURL, palette] = await Promise.all([
      makeBlurDataURL(buffer),
      extractPalette(buffer),
    ]);

    return {
      url: String(uploaded.secure_url ?? ""),
      squareUrl: cloudinary.url(publicId, {
        secure: true,
        transformation: [{ width: 800, height: 800, crop: "fill", gravity: "auto" }],
      }),
      width: Number(uploaded.width ?? 0) || undefined,
      height: Number(uploaded.height ?? 0) || undefined,
      blurDataURL,
      palette,
      storageKey: publicId,
    };
  }

  async delete(storageKey: string): Promise<boolean> {
    try {
      const r = await cloudinary.uploader.destroy(storageKey);
      return r.result === "ok";
    } catch {
      return false;
    }
  }
}

let driver: StorageDriver | null = null;

export function getStorage(): StorageDriver {
  if (driver) return driver;
  driver = config.storageDriver === "cloudinary" ? new CloudinaryDriver() : new LocalDiskDriver();
  return driver;
}
