import "server-only";
import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes } from "node:crypto";

// Encrypts stored secrets (WhatsApp access token, driver licence numbers) with
// AES-256-GCM before they reach the database.
//
//   v2 — key from ENCRYPTION_KEY (its own secret, so a leaked SESSION_SECRET or
//        database backup alone can't decrypt). Used for new data when set.
//   v1 — legacy key derived from SESSION_SECRET. Still read; also written when
//        ENCRYPTION_KEY isn't configured.

function legacyKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be set (32+ chars)");
  return createHash("sha256").update(`${secret}:integration-secrets`).digest();
}

function v2Key() {
  const k = process.env.ENCRYPTION_KEY;
  if (!k) return null;
  return Buffer.from(hkdfSync("sha256", Buffer.from(k, "utf8"), Buffer.alloc(0), "ecosoul-integration-secrets", 32));
}

export function encryptSecret(plain: string) {
  const k2 = v2Key();
  const [version, key] = k2 ? ["v2", k2] : ["v1", legacyKey()];
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [version, iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}

export function decryptSecret(box: string | null | undefined): string | null {
  if (!box) return null;
  try {
    const [v, iv, tag, data] = box.split(".");
    const key = v === "v2" ? v2Key() : v === "v1" ? legacyKey() : null;
    if (!key) return null;
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
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
