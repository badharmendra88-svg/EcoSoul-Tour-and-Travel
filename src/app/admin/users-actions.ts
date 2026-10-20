"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { generateTempPassword, hashPassword } from "@/lib/password";
import { isRole } from "@/lib/permissions";

// User management — Super Admin only (permission "users.manage").

export type UserFormState = { ok?: boolean; error?: string; tempPassword?: string; email?: string } | null;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function activeSuperAdmins(excludeId?: string) {
  return db.adminUser.count({ where: { role: "SUPER_ADMIN", active: true, ...(excludeId ? { NOT: { id: excludeId } } : {}) } });
}

export async function createUserAction(_prev: UserFormState, formData: FormData): Promise<UserFormState> {
  const me = await requireUser("users.manage");
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 120);
  const role = String(formData.get("role") ?? "");

  if (name.length < 2) return { error: "Enter the user's name." };
  if (!emailRe.test(email)) return { error: "Enter a valid email address." };
  if (!isRole(role)) return { error: "Choose a role." };
  if (await db.adminUser.findUnique({ where: { email } })) return { error: "A user with this email already exists." };

  const tempPassword = generateTempPassword();
  await db.adminUser.create({
    data: { name, email, role, passwordHash: await hashPassword(tempPassword), mustChangePassword: true, createdById: me.id },
  });
  revalidatePath("/admin/users/");
  return { ok: true, tempPassword, email };
}

export async function updateUserAction(_prev: UserFormState, formData: FormData): Promise<UserFormState> {
  const me = await requireUser("users.manage");
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  const active = formData.get("active") === "on";
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);

  const user = await db.adminUser.findUnique({ where: { id } });
  if (!user) return { error: "User not found." };
  if (!isRole(role)) return { error: "Choose a role." };
  if (name.length < 2) return { error: "Enter a name." };
  if (user.id === me.id && (role !== user.role || !active)) return { error: "You can't change your own role or deactivate yourself." };
  const losesSuper = user.role === "SUPER_ADMIN" && user.active && (role !== "SUPER_ADMIN" || !active);
  if (losesSuper && (await activeSuperAdmins(user.id)) === 0) return { error: "At least one active Super Admin is required." };

  await db.adminUser.update({
    where: { id },
    data: {
      name,
      role,
      active,
      // Deactivation signs the user out everywhere immediately
      ...(user.active && !active ? { tokenVersion: { increment: 1 } } : {}),
    },
  });
  revalidatePath("/admin/users/");
  return { ok: true };
}

export async function resetPasswordAction(_prev: UserFormState, formData: FormData): Promise<UserFormState> {
  const me = await requireUser("users.manage");
  const id = String(formData.get("id") ?? "");
  const user = await db.adminUser.findUnique({ where: { id } });
  if (!user) return { error: "User not found." };
  if (user.id === me.id) return { error: "Use “My account” to change your own password." };

  const tempPassword = generateTempPassword();
  await db.adminUser.update({
    where: { id },
    data: { passwordHash: await hashPassword(tempPassword), mustChangePassword: true, tokenVersion: { increment: 1 } },
  });
  revalidatePath("/admin/users/");
  return { ok: true, tempPassword, email: user.email };
}
