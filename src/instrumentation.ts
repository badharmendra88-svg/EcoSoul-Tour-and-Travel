// Runs once when the server starts. In production, refuse to boot with the
// placeholder secrets from .env.example: a public SESSION_SECRET would let anyone
// forge admin sessions and decrypt stored secrets.
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NODE_ENV !== "production") return;
  // `next build` also loads this file; only check when serving
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const problems: string[] = [];
  const session = process.env.SESSION_SECRET ?? "";
  const setupKey = process.env.ADMIN_PASSWORD ?? "";
  if (/change-me/i.test(session) || !/^[0-9a-f]{64,}$/i.test(session)) {
    problems.push("SESSION_SECRET must be a random 64+ character hex string (openssl rand -hex 32)");
  }
  if (/change-me/i.test(setupKey)) problems.push("ADMIN_PASSWORD is still the example value");
  const enc = process.env.ENCRYPTION_KEY;
  if (enc && !/^[0-9a-f]{64,}$/i.test(enc)) problems.push("ENCRYPTION_KEY must be a random 64+ character hex string");
  if (problems.length) throw new Error(`Unsafe configuration — fix .env before starting:\n- ${problems.join("\n- ")}`);

  if (setupKey.length < 20) console.warn("[security] ADMIN_PASSWORD (first-run setup key) is short; use 20+ random characters.");
  if (!enc) console.warn("[security] ENCRYPTION_KEY is not set; stored secrets are encrypted with a key derived from SESSION_SECRET.");
  if (process.env.TRUST_PROXY !== "1" && !process.env.VERCEL) {
    console.warn("[security] TRUST_PROXY is not set: rate limits cannot tell visitors apart. Set TRUST_PROXY=1 behind nginx / a load balancer.");
  }
}
