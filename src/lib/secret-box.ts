import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

// Encrypts integration secrets (e.g. WhatsApp access token) before they are
// stored in the database. Key is derived from SESSION_SECRET, so rotating that
// secret means re-entering stored tokens.

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be set (32+ chars)");
  return createHash("sha256").update(`${secret}:integration-secrets`).digest();
}

export function encryptSecret(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}

export function decryptSecret(box: string | null | undefined): string | null {
  if (!box) return null;
  try {
    const [v, iv, tag, data] = box.split(".");
    if (v !== "v1") return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/** "••••••••a1b2" — safe to show in the admin UI. */
export function maskSecret(plain: string | null) {
  return plain ? `••••••••${plain.slice(-4)}` : "";
}
