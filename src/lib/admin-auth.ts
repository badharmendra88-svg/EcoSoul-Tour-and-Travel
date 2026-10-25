import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminUser } from "@/generated/prisma/client";
import { db } from "./db";
import { can, type Permission } from "./permissions";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export type CurrentUser = Pick<AdminUser, "id" | "name" | "email" | "role" | "mustChangePassword">;

/** The signed-in, active admin user for this request (or null). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const store = await cookies();
  const claims = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!claims) return null;
  const user = await db.adminUser.findUnique({
    where: { id: claims.userId },
    select: { id: true, name: true, email: true, role: true, active: true, tokenVersion: true, mustChangePassword: true },
  });
  if (!user || !user.active || user.tokenVersion !== claims.tokenVersion) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword };
});

/**
 * Call at the top of every admin page and server action. Redirects to login
 * when signed out, and back to the dashboard when the role lacks `permission`.
 */
export async function requireUser(permission?: Permission): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login/");
  // Temporary passwords must be replaced before any protected page or action works
  // (/admin/account/ asks for no permission, so this cannot loop)
  if (permission && user.mustChangePassword) redirect("/admin/account/");
  if (permission && !can(user.role, permission)) redirect("/admin/?denied=1");
  return user;
}

/** Same as requireUser, returning the display name used in activity logs. */
export async function requireAdmin(permission?: Permission): Promise<string> {
  const user = await requireUser(permission);
  return user.name;
}
