import "server-only";
import { NextResponse } from "next/server";

// Guards for the public JSON APIs (enquiries, driver sign-up, payments):
//  - size cap, so one huge body can't exhaust memory or CPU (also bounds zod's work on arrays);
//  - JSON content type, so other websites can't post "simple" cross-site requests
//    (text/plain forms) through visitors' browsers without a CORS preflight;
//  - when the browser sends an Origin, it must be this site.

export type JsonResult = { ok: true; body: Record<string, unknown> } | { ok: false; response: NextResponse };

const fail = (status: number, error: string): JsonResult => ({ ok: false, response: NextResponse.json({ ok: false, error }, { status }) });

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin GET/POST from older browsers, server-to-server
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function readJson(request: Request, maxBytes = 32_000): Promise<JsonResult> {
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return fail(415, "Invalid request");
  if (!sameOrigin(request)) return fail(403, "Invalid request");
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes) return fail(413, "Request too large");
  const text = await request.text();
  if (text.length > maxBytes) return fail(413, "Request too large");
  try {
    const body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) return fail(400, "Invalid request");
    return { ok: true, body };
  } catch {
    return fail(400, "Invalid request");
  }
}
