// Simple fixed-window, in-memory rate limiter. Good enough for a single
// server instance; swap for Redis/Upstash if the site runs on many instances.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Counts one hit against `key` and says whether it is still within `limit`. */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) prune(now);
    return { ok: true, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/** True when `key` has already used up `limit` hits (does not count a hit). */
export function isLimited(key: string, limit: number) {
  const bucket = buckets.get(key);
  return !!bucket && bucket.resetAt > Date.now() && bucket.count >= limit;
}

export function clearLimit(key: string) {
  buckets.delete(key);
}

/**
 * Per-client limit. When no client IP is available (no reverse proxy in front),
 * all visitors share one bucket, so it gets a much larger allowance instead of
 * locking the whole site after a handful of requests.
 */
export function ipRateLimit(scope: string, ip: string | null, limit: number, windowMs: number) {
  return ip ? rateLimit(`${scope}:${ip}`, limit, windowMs) : rateLimit(`${scope}:shared`, limit * 20, windowMs);
}

const MAX_BUCKETS = 10_000;

/** Drops expired buckets, then the oldest ones if a flood of distinct keys keeps the map too large. */
function prune(now: number) {
  for (const [key, b] of buckets) if (b.resetAt <= now) buckets.delete(key);
  if (buckets.size <= MAX_BUCKETS) return;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    if (buckets.size <= MAX_BUCKETS * 0.9) break;
  }
}

/**
 * Client IP as reported by the reverse proxy, or null when there is none.
 * Only trusted when TRUST_PROXY=1 (or on Vercel): without a proxy that overwrites
 * these headers, a client could send a new fake IP on every request and dodge
 * every limit. X-Real-IP is set by the proxy itself; otherwise the right-most
 * X-Forwarded-For entry is the one the nearest proxy appended.
 */
export function clientIp(headers: Headers): string | null {
  if (process.env.TRUST_PROXY !== "1" && !process.env.VERCEL) return null;
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = headers.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean);
  return forwarded?.length ? forwarded[forwarded.length - 1] : null;
}
