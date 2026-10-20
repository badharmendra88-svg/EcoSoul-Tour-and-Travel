import "server-only";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// Password hashing with scrypt (built into Node — no native dependencies).
// Format: scrypt$N$r$p$salt$hash (base64url)

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number, opts: { N: number; r: number; p: number; maxmem: number }) => Promise<Buffer>;
const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;

export const MIN_PASSWORD_LENGTH = 10;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEYLEN, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 });
  return ["scrypt", N, R, P, salt.toString("base64url"), hash.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string) {
  const [algo, n, r, p, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = await scrypt(password, Buffer.from(salt, "base64url"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 64 * 1024 * 1024,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Checks a new password; returns an error message or null. */
export function passwordProblem(password: string, email?: string) {
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (password.length > 200) return "Password is too long.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return "Use both letters and numbers.";
  if (email && password.toLowerCase().includes(email.split("@")[0].toLowerCase())) return "Password must not contain your email name.";
  return null;
}

/** Readable temporary password, e.g. "Kumaon-7Q4M-9XPA" (no 0/O/1/I). */
export function generateTempPassword() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const pick = (len: number) => Array.from(randomBytes(len), (b) => alphabet[b % alphabet.length]).join("");
  const words = ["Kumaon", "Garhwal", "Nainital", "Auli", "Ganga", "Binsar", "Ranikhet", "Almora"];
  return `${words[randomBytes(1)[0] % words.length]}-${pick(4)}-${pick(4)}`;
}
