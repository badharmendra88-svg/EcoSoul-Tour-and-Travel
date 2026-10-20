"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { driverStatuses, verificationChecks, type VerificationKey } from "@/config/drivers";

const dateRe = /^\d{4}-\d{2}-\d{2}$/;
const today = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

export async function updateDriverAction(formData: FormData) {
  const me = await requireUser("drivers.manage");
  const id = String(formData.get("id") ?? "");
  const back = `/admin/drivers/${id}/`;
  const fail = (m: string): never => redirect(`${back}?error=${encodeURIComponent(m)}`);

  const d = await db.driverPartner.findUnique({ where: { id } });
  if (!d) redirect("/admin/drivers/");

  const status = String(formData.get("status") ?? d.status);
  if (!(status in driverStatuses)) fail("Invalid status");

  const checks = Object.fromEntries(verificationChecks.map((c) => [c.key, formData.get(c.key) === "on"])) as Record<VerificationKey, boolean>;
  const required = verificationChecks.filter((c) => !c.vehicleOnly || d.partnerType === "WITH_VEHICLE");
  const allChecked = required.every((c) => checks[c.key]);

  const dates: Record<string, string | null> = {};
  for (const key of ["licenceExpiry", "insuranceExpiry", "permitExpiry", "fitnessExpiry", "pucExpiry"] as const) {
    const v = String(formData.get(key) ?? "").trim();
    if (v && !dateRe.test(v)) fail("Use valid dates for document expiry");
    dates[key] = v || null;
  }
  if (!dates.licenceExpiry) fail("Licence expiry date is required");

  // Blueprint §24.10: only fully checked partners can be activated
  if (status === "ACTIVE" || status === "VERIFIED") {
    if (!allChecked) fail("Tick every verification check before marking the driver Verified or Active.");
    if (dates.licenceExpiry! < today()) fail("The driving licence has expired — it must be renewed before activation.");
    if (status === "ACTIVE" && d.partnerType === "WITH_VEHICLE") {
      const expired = (["insuranceExpiry", "permitExpiry", "fitnessExpiry", "pucExpiry"] as const).filter((k) => !dates[k] || dates[k]! < today());
      if (expired.length) fail("Add valid (future) insurance, permit, fitness and PUC expiry dates before activating a driver with a vehicle.");
    }
  }

  const events: { actor: string; action: string; detail?: string }[] = [];
  if (status !== d.status) events.push({ actor: me.name, action: "status", detail: `${driverStatuses[d.status as keyof typeof driverStatuses] ?? d.status} → ${driverStatuses[status as keyof typeof driverStatuses]}` });
  const changedChecks = verificationChecks.filter((c) => checks[c.key] !== d[c.key]);
  if (changedChecks.length)
    events.push({ actor: me.name, action: "verification", detail: changedChecks.map((c) => `${checks[c.key] ? "✓" : "✗"} ${c.label}`).join("; ") });
  const dateChanges = Object.entries(dates).filter(([k, v]) => v !== (d as Record<string, unknown>)[k]);
  if (dateChanges.length) events.push({ actor: me.name, action: "documents", detail: dateChanges.map(([k, v]) => `${k.replace("Expiry", "")} ${v ?? "cleared"}`).join("; ") });
  const internalNotes = String(formData.get("internalNotes") ?? "").slice(0, 5000) || null;
  if (internalNotes !== d.internalNotes) events.push({ actor: me.name, action: "notes_updated" });
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);
  if (note) events.push({ actor: me.name, action: "note", detail: note });

  const nowVerified = allChecked && !d.verifiedAt;
  await db.driverPartner.update({
    where: { id },
    data: {
      status,
      ...checks,
      licenceExpiry: dates.licenceExpiry!,
      insuranceExpiry: dates.insuranceExpiry,
      permitExpiry: dates.permitExpiry,
      fitnessExpiry: dates.fitnessExpiry,
      pucExpiry: dates.pucExpiry,
      internalNotes,
      ...(nowVerified ? { verifiedAt: new Date(), verifiedBy: me.name } : {}),
      ...(!allChecked && d.verifiedAt ? { verifiedAt: null, verifiedBy: null } : {}),
      events: { create: events },
    },
  });
  revalidatePath("/admin/drivers/");
  revalidatePath(back);
  redirect(`${back}?saved=1`);
}
