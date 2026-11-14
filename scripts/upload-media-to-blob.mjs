// One-time copy of the admin photos in ./uploads (MEDIA_DIR) to the Vercel Blob store,
// where the site reads them when BLOB_READ_WRITE_TOKEN is set. Safe to re-run: photos
// already in the store are skipped. Run: node scripts/upload-media-to-blob.mjs
// (with BLOB_READ_WRITE_TOKEN in .env, or set in the shell for this one command).
import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { head, put } from "@vercel/blob";

if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("Set BLOB_READ_WRITE_TOKEN (Vercel → Storage → your Blob store → .env.local).");
const dir = path.resolve(process.env.MEDIA_DIR || "uploads");
const files = (await readdir(dir)).filter((f) => f.endsWith(".webp"));

let sent = 0;
for (const f of files) {
  if (await head(`media/${f}`).catch(() => null)) continue;
  await put(`media/${f}`, await readFile(path.join(dir, f)), { access: "public", contentType: "image/webp", cacheControlMaxAge: 31536000 });
  sent++;
}
console.log(`${sent} uploaded, ${files.length - sent} already there (${files.length} photos in ${dir}).`);
