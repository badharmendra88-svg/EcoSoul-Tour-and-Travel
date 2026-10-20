"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/admin-auth";
import { notifyNewEnquiry } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/password";
import { SESSION_COOKIE, SESSION_TTL_MS, createSessionToken, setupKeyMatches } from "@/lib/session";
import { statusesFor, tripTypes } from "@/config/options";
import { linesToFaqs, linesToItinerary, linesToJson } from "@/lib/json";

// ---------- Auth ----------

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function startSession(user: { id: string; tokenVersion: number }) {
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(user.id, user.tokenVersion), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

// Same work whether or not the email exists, so response time doesn't reveal accounts
const DUMMY_HASH = "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$" + "A".repeat(86);

export async function loginAction(formData: FormData) {
  const ip = clientIp(await headers());
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 120);
  const password = String(formData.get("password") ?? "").slice(0, 200);
  if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000).ok || !rateLimit(`login-user:${email}`, 6, 15 * 60 * 1000).ok) {
    redirect("/admin/login/?error=rate");
  }

  const user = await db.adminUser.findUnique({ where: { email } });
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH).catch(() => false);
  if (!user || !ok) redirect(`/admin/login/?error=1&email=${encodeURIComponent(email)}`);
  if (!user.active) redirect("/admin/login/?error=inactive");

  await db.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await startSession(user);
  redirect("/admin/");
}

/** One-time setup: create the first Super Admin. Requires the ADMIN_PASSWORD env value as a setup key. */
export async function setupSuperAdminAction(formData: FormData) {
  const ip = clientIp(await headers());
  if (!rateLimit(`setup:${ip}`, 5, 15 * 60 * 1000).ok) redirect("/admin/login/?error=rate");
  if ((await db.adminUser.count()) > 0) redirect("/admin/login/");

  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 120);
  const password = String(formData.get("password") ?? "");
  const fail = (m: string): never => redirect(`/admin/login/?setupError=${encodeURIComponent(m)}`);

  if (!(await setupKeyMatches(String(formData.get("setupKey") ?? "")))) fail("Setup key is incorrect.");
  if (name.length < 2) fail("Enter your name.");
  if (!emailRe.test(email)) fail("Enter a valid email.");
  const problem = passwordProblem(password, email);
  if (problem) fail(problem);
  if (password !== String(formData.get("confirm") ?? "")) fail("Passwords do not match.");

  const user = await db.adminUser.create({
    data: { name, email, passwordHash: await hashPassword(password), role: "SUPER_ADMIN", lastLoginAt: new Date() },
  });
  await startSession(user);
  redirect("/admin/");
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login/");
}

/** Returns an error message, or null after the password was changed. */
async function changeOwnPassword(formData: FormData): Promise<string | null> {
  const me = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("password") ?? "");

  const user = await db.adminUser.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await verifyPassword(current, user.passwordHash))) return "Current password is incorrect.";
  const problem = passwordProblem(next, user.email);
  if (problem) return problem;
  if (next !== String(formData.get("confirm") ?? "")) return "New passwords do not match.";
  if (current === next) return "Choose a password different from the current one.";

  // New tokenVersion signs out every other device; this device gets a fresh session
  const updated = await db.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next), tokenVersion: { increment: 1 }, mustChangePassword: false },
  });
  await startSession(updated);
  return null;
}

export async function changeOwnPasswordAction(formData: FormData) {
  const error = await changeOwnPassword(formData);
  redirect(error ? `/admin/account/?error=${encodeURIComponent(error)}` : "/admin/account/?saved=1");
}

/** Variant for the first-login screen, which shows errors inline. */
export async function setFirstPasswordAction(_prev: string | null, formData: FormData): Promise<string | null> {
  const error = await changeOwnPassword(formData);
  if (!error) redirect("/admin/");
  return error;
}

// ---------- Leads ----------

export async function updateEnquiryAction(formData: FormData) {
  const actor = await requireAdmin("leads.edit");
  const id = String(formData.get("id"));
  const enquiry = await db.enquiry.findUnique({ where: { id } });
  if (!enquiry) redirect("/admin/");

  const status = String(formData.get("status") ?? enquiry.status);
  const assignedTo = String(formData.get("assignedTo") ?? "").trim().slice(0, 80) || null;
  const internalNotes = String(formData.get("internalNotes") ?? "").slice(0, 5000) || null;
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);

  if (!(status in statusesFor(enquiry.kind))) redirect(`/admin/leads/${id}/`);

  const events: { actor: string; action: string; detail?: string }[] = [];
  if (status !== enquiry.status) events.push({ actor, action: "status", detail: `${enquiry.status} → ${status}` });
  if (assignedTo !== enquiry.assignedTo) events.push({ actor, action: "assigned", detail: assignedTo ?? "unassigned" });
  if (internalNotes !== enquiry.internalNotes) events.push({ actor, action: "notes_updated" });
  if (note) events.push({ actor, action: "note", detail: note });

  await db.enquiry.update({
    where: { id },
    data: { status, assignedTo, internalNotes, events: { create: events } },
  });
  revalidatePath(`/admin/leads/${id}/`);
  revalidatePath("/admin/");
}

export async function retryNotificationAction(formData: FormData) {
  const actor = await requireAdmin("leads.edit");
  const id = String(formData.get("id"));
  const enquiry = await db.enquiry.findUnique({ where: { id } });
  if (!enquiry) return;
  await notifyNewEnquiry(enquiry);
  await db.enquiryEvent.create({ data: { enquiryId: id, actor, action: "notify_retry" } });
  revalidatePath(`/admin/leads/${id}/`);
}

// ---------- Content ----------

const contentStatuses = ["DRAFT", "PUBLISHED", "PAUSED"];

function str(fd: FormData, key: string, max = 5000) {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function savePackageAction(formData: FormData) {
  await requireAdmin("content.edit");
  const id = str(formData, "id");
  const title = str(formData, "title", 160);
  const slug = slugify(str(formData, "slug") || title);
  const durationDays = Math.max(1, Math.min(60, Number(formData.get("durationDays")) || 1));
  const priceRaw = str(formData, "startingPrice");
  const startingPrice = priceRaw ? Math.max(0, Math.round(Number(priceRaw))) : null;
  const priceBasis = str(formData, "priceBasis", 160) || null;
  const tripType = str(formData, "tripType");
  const status = str(formData, "status");

  const back = `/admin/packages/${id || "new"}/`;
  if (!title || !slug) fail(back, "Title and slug are required");
  if (!(tripType in tripTypes)) fail(back, "Invalid trip type");
  if (!contentStatuses.includes(status)) fail(back, "Invalid status");
  if (startingPrice != null && !Number.isFinite(startingPrice)) fail(back, "Starting price must be a number");
  // §20: a public price must always state its basis
  if (startingPrice != null && !priceBasis) fail(back, "Price basis is required when a price is shown");
  const clash = await db.package.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) fail(back, "Another package already uses this slug");

  const destinationSlugs = formData.getAll("destinations").map(String);
  const data = {
    title,
    slug,
    summary: str(formData, "summary", 500),
    durationDays,
    durationLabel: str(formData, "durationLabel", 60) || `${durationDays} days`,
    tripType,
    audience: str(formData, "audience", 160),
    startingPrice,
    priceBasis,
    season: str(formData, "season", 200),
    itinerary: linesToItinerary(str(formData, "itinerary", 20000)),
    inclusions: linesToJson(str(formData, "inclusions")),
    exclusions: linesToJson(str(formData, "exclusions")),
    notes: linesToJson(str(formData, "notes")),
    internalNotes: str(formData, "internalNotes") || null,
    featured: formData.get("featured") === "on",
    status,
    seoTitle: str(formData, "seoTitle", 70) || null,
    seoDescription: str(formData, "seoDescription", 170) || null,
    sortOrder: Number(formData.get("sortOrder")) || 100,
  };

  const destinations = { set: destinationSlugs.map((s) => ({ slug: s })) };
  const saved = id
    ? await db.package.update({ where: { id }, data: { ...data, destinations } })
    : await db.package.create({ data: { ...data, destinations: { connect: destinationSlugs.map((s) => ({ slug: s })) } } });

  revalidatePublic();
  redirect(`/admin/packages/${saved.id}/?saved=1`);
}

export async function saveDestinationAction(formData: FormData) {
  await requireAdmin("content.edit");
  const id = str(formData, "id");
  const name = str(formData, "name", 120);
  const slug = slugify(str(formData, "slug") || name);
  const status = str(formData, "status");
  const back = `/admin/destinations/${id || "new"}/`;
  if (!name || !slug) fail(back, "Name and slug are required");
  if (!["DRAFT", "PUBLISHED"].includes(status)) fail(back, "Invalid status");
  const clash = await db.destination.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) fail(back, "Another destination already uses this slug");

  const data = {
    name,
    slug,
    region: str(formData, "region", 40),
    cluster: str(formData, "cluster", 80),
    scene: str(formData, "scene", 20) || "mountain",
    summary: str(formData, "summary", 300),
    intro: str(formData, "intro"),
    bestTime: str(formData, "bestTime", 1000),
    howToReach: str(formData, "howToReach", 1000),
    suggestedDuration: str(formData, "suggestedDuration", 300),
    experiences: linesToJson(str(formData, "experiences")),
    practical: linesToJson(str(formData, "practical")),
    faqs: linesToFaqs(str(formData, "faqs", 20000)),
    seoTitle: str(formData, "seoTitle", 70) || null,
    seoDescription: str(formData, "seoDescription", 170) || null,
    status,
    sortOrder: Number(formData.get("sortOrder")) || 100,
    ...(formData.get("markReviewed") === "on" ? { reviewedAt: new Date() } : {}),
  };

  const saved = id ? await db.destination.update({ where: { id }, data }) : await db.destination.create({ data });
  revalidatePublic();
  redirect(`/admin/destinations/${saved.id}/?saved=1`);
}

function revalidatePublic() {
  revalidatePath("/", "layout");
}
