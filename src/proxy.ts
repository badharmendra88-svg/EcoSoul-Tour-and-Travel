import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// First line of defence for the admin area (Next.js 16 "proxy", formerly middleware); every admin page and action also
// calls requireAdmin() server-side.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  // Signature/expiry only here (edge); user status is checked server-side
  const ok = (await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) !== null;
  if (ok) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Server actions (form saves) re-check the session themselves via requireUser() and answer
  // with a redirect the client understands; a plain 307 here would crash the page instead
  // when a session expires while a form is open.
  if (request.method === "POST" && request.headers.has("next-action")) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login/";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
