import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Admin photo uploads. Files are re-encoded to WebP (max 2000 px wide, EXIF
// orientation applied, metadata stripped) and stored outside /public so they
// can be added at runtime. Served by /media/[file]. For multi-server or
// serverless hosting, swap this for object storage (S3/R2/Vercel Blob).

export const MEDIA_DIR = path.resolve(process.env.MEDIA_DIR || "uploads");
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MEDIA_NAME_RE = /^[a-z0-9-]{1,60}-[a-f0-9]{10}\.webp$/;

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "photo";
}

/** Returns "/media/<name>.webp", or throws an Error with a user-facing message. */
export async function saveUpload(file: File, nameHint: string) {
  if (!ACCEPTED.includes(file.type)) throw new Error("Upload a JPG, PNG, WebP or AVIF image.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Image is larger than 8 MB.");

  const input = Buffer.from(await file.arrayBuffer());
  let output: Buffer;
  try {
    // Pixel cap: a small file can still decode to a huge image ("decompression bomb")
    const img = sharp(input, { failOn: "error", limitInputPixels: 50_000_000 }).rotate();
    const meta = await img.metadata();
    if ((meta.width ?? 0) < 600) throw new Error("Image is too small — use at least 600 px wide.");
    output = await img.resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  } catch (e) {
    throw new Error(e instanceof Error && e.message.startsWith("Image is") ? e.message : "This file couldn't be read as an image.");
  }

  await mkdir(MEDIA_DIR, { recursive: true });
  const name = `${slug(nameHint)}-${randomBytes(5).toString("hex")}.webp`;
  await writeFile(path.join(MEDIA_DIR, name), output);
  return `/media/${name}`;
}

/** Deletes a previously uploaded file (ignores anything that isn't ours). */
export async function deleteUpload(url: string | null | undefined) {
  const name = url?.startsWith("/media/") ? url.slice(7) : null;
  if (!name || !MEDIA_NAME_RE.test(name)) return;
  await unlink(path.join(MEDIA_DIR, name)).catch(() => undefined);
}

/**
 * Handles the standard image fields of an admin form:
 * image (File), imageAlt, imageCredit, imageRights (checkbox), removeImage (checkbox).
 * Returns the new values to store, or an error message.
 */
export async function handleImageFields(
  fd: FormData,
  current: { imageUrl: string | null; imageAlt?: string | null; imageCredit?: string | null },
  nameHint: string,
): Promise<{ error: string } | { imageUrl: string | null; imageAlt: string | null; imageCredit: string | null; replaced: string | null }> {
  const file = fd.get("image");
  const alt = String(fd.get("imageAlt") ?? "").trim().slice(0, 200) || null;
  const credit = String(fd.get("imageCredit") ?? "").trim().slice(0, 200) || null;
  const hasFile = file instanceof File && file.size > 0;

  if (fd.get("removeImage") === "on" && !hasFile) {
    return { imageUrl: null, imageAlt: null, imageCredit: null, replaced: current.imageUrl };
  }
  if (hasFile) {
    if (fd.get("imageRights") !== "on") return { error: "Confirm that you own or are licensed to use this photo." };
    if (!alt) return { error: "Add a short description (alt text) for the photo." };
    try {
      const url = await saveUpload(file, nameHint);
      return { imageUrl: url, imageAlt: alt, imageCredit: credit, replaced: current.imageUrl };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Upload failed." };
    }
  }
  if (current.imageUrl && !alt) return { error: "Photo description (alt text) can't be empty." };
  return { imageUrl: current.imageUrl, imageAlt: current.imageUrl ? alt : null, imageCredit: current.imageUrl ? credit : null, replaced: null };
}
