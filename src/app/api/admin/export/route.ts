import type { Prisma } from "@/generated/prisma/client";
import { enquiryKinds } from "@/config/options";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/admin-auth";
import { can } from "@/lib/permissions";

// CSV export of leads for reporting / backup (blueprint §11 data export).

const columns = [
  "ref", "createdAt", "kind", "status", "name", "phone", "email", "packageSlug", "destination", "serviceType",
  "pickup", "drop", "travelDate", "dateFlexible", "pickupTime", "returnDate", "adults", "children", "luggage",
  "vehicleCategory", "transmission", "tripDays", "fareType", "interests", "budgetBand", "heardFrom", "travellingFrom", "utm", "sourcePage", "assignedTo", "message", "internalNotes",
] as const;

function cell(value: unknown) {
  if (value == null) return "";
  let s = value instanceof Date ? value.toISOString() : String(value);
  // Neutralise spreadsheet formula injection
  // (also after leading spaces, and "|" which some spreadsheets treat as DDE)
  if (/^\s*[=+\-@|]/.test(s) || /^[\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (user.mustChangePassword) return new Response("Set your own password first", { status: 403 });
  if (!can(user.role, "leads.export")) return new Response("Forbidden", { status: 403 });
  const sp = new URL(request.url).searchParams;
  const kind = sp.get("kind");
  const status = sp.get("status");
  const where: Prisma.EnquiryWhereInput = {
    ...(kind && kind in enquiryKinds ? { kind } : {}),
    ...(status ? { status } : {}),
  };

  const rows = await db.enquiry.findMany({ where, orderBy: { createdAt: "desc" } });
  const csv = [columns.join(","), ...rows.map((r) => columns.map((c) => cell(r[c])).join(","))].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ecosoul-leads-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
