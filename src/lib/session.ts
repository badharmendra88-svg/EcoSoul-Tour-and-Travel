// Admin session token: "<userId>.<tokenVersion>.<expiresAtMs>.<hmac>" signed
// with SESSION_SECRET. Web Crypto only, so it works in middleware (edge) and
// on the server. Middleware checks the signature; requireAdmin() then loads the
// user and also checks `active` and `tokenVersion` (instant revocation).

export const SESSION_COOKIE = "ecosoul_admin";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const encoder = new TextEncoder();

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ chars)");
  return s;
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(userId: string, tokenVersion: number) {
  const expires = String(Date.now() + SESSION_TTL_MS);
  const payload = `${userId}.${tokenVersion}.${expires}`;
  return `${payload}.${await hmac(`admin:${payload}`)}`;
}

export type SessionClaims = { userId: string; tokenVersion: number; expires: number };

export async function verifySessionToken(token: string | undefined | null): Promise<SessionClaims | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [userId, version, expires, sig] = parts;
  if (!/^[a-z0-9]{10,40}$/.test(userId) || !/^\d+$/.test(version) || !/^\d+$/.test(expires)) return null;
  if (Number(expires) < Date.now()) return null;
  try {
    const ok = safeEqual(sig, await hmac(`admin:${userId}.${version}.${expires}`));
    return ok ? { userId, tokenVersion: Number(version), expires: Number(expires) } : null;
  } catch {
    return null;
  }
}

/** Constant-time check of the one-time setup key (the ADMIN_PASSWORD env value). */
export async function setupKeyMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 8) return false;
  return safeEqual(await hmac(`setup:${input}`), await hmac(`setup:${expected}`));
}
