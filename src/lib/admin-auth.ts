import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./session";

/** Call at the top of every admin page and server action (defence in depth beyond middleware). */
export async function requireAdmin() {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) {
    redirect("/admin/login/");
  }
  return "admin";
}
