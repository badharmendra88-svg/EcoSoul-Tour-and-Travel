import "server-only";
import { db } from "./db";
import { getNotifyWebhookUrl } from "./settings";
import { site } from "@/config/site";
import { enquiryKinds, serviceTypes } from "@/config/options";
import type { Enquiry } from "@prisma/client";

// FR-08 / TR-07: internal notification for new leads. Sends only what the
// team needs to pick the lead up — full contact details stay in the admin.
// Failures are recorded on the enquiry and can be retried from the admin.

function summary(e: Enquiry) {
  const kind = enquiryKinds[e.kind as keyof typeof enquiryKinds] ?? e.kind;
  const parts = [`New ${kind} enquiry ${e.ref}`];
  if (e.serviceType) parts.push(serviceTypes[e.serviceType as keyof typeof serviceTypes] ?? e.serviceType);
  if (e.packageSlug) parts.push(`Package: ${e.packageSlug}`);
  if (e.destination) parts.push(`Destination: ${e.destination}`);
  if (e.pickup) parts.push(`Route: ${e.pickup}${e.drop ? ` → ${e.drop}` : ""}`);
  if (e.travelDate) parts.push(`Date: ${e.travelDate}`);
  parts.push(`Open: ${site.url}/admin/leads/${e.id}/`);
  return parts.join("\n");
}

export async function notifyNewEnquiry(enquiry: Enquiry) {
  const url = await getNotifyWebhookUrl();
  if (!url) {
    await db.enquiry.update({ where: { id: enquiry.id }, data: { notifyStatus: "SKIPPED" } });
    return;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: summary(enquiry) }),
      signal: AbortSignal.timeout(8000),
      redirect: "manual", // a 3xx counts as a failure; never follow redirects to other hosts
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    await db.enquiry.update({
      where: { id: enquiry.id },
      data: { notifyStatus: "SENT", notifyError: null },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[notify] ${enquiry.ref} failed: ${message}`);
    await db.enquiry.update({
      where: { id: enquiry.id },
      data: { notifyStatus: "FAILED", notifyError: message.slice(0, 500) },
    });
  }
}
