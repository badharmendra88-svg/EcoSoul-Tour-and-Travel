import "server-only";
import nodemailer from "nodemailer";
import { db } from "./db";
import { getSettings } from "./settings";
import { site, whatsappLink } from "@/config/site";
import { enquiryKinds, serviceTypes, vehicleCategories } from "@/config/options";
import type { Enquiry } from "@/generated/prisma/client";

// Lead emails over SMTP (works with a Gmail App Password; no own domain needed).
//   SMTP_USER / SMTP_PASS  required (Gmail address + 16-character App Password)
//   SMTP_HOST / SMTP_PORT  default smtp.gmail.com:465
//   LEAD_NOTIFY_EMAIL      team inbox for new leads (comma separated); default: site email
// Without SMTP_USER/SMTP_PASS nothing is sent. Results are logged on the lead's timeline.

function transport() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, ""); // Gmail shows app passwords in groups of 4
  if (!user || !pass) return null;
  const port = Number(process.env.SMTP_PORT) || 465;
  return {
    user,
    mailer: nodemailer.createTransport({
      host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10_000,
      socketTimeout: 15_000,
    }),
  };
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function details(e: Enquiry): [string, string][] {
  const travellers =
    e.adults != null ? `${e.adults} adult${e.adults === 1 ? "" : "s"}${e.children ? ` + ${e.children} child${e.children > 1 ? "ren" : ""}` : ""}` : null;
  const rows: [string, string | null | undefined][] = [
    ["Enquiry type", enquiryKinds[e.kind as keyof typeof enquiryKinds] ?? e.kind],
    ["Service", e.serviceType ? serviceTypes[e.serviceType as keyof typeof serviceTypes] ?? e.serviceType : null],
    ["Package", e.packageSlug?.replace(/-/g, " ")],
    ["Destination", e.destination],
    ["Route", e.pickup ? `${e.pickup}${e.drop ? ` → ${e.drop}` : ""}` : null],
    ["Travel date", e.travelDate ? `${e.travelDate}${e.pickupTime ? `, ${e.pickupTime}` : ""}${e.dateFlexible ? " (flexible)" : ""}` : e.dateFlexible ? "Flexible" : null],
    ["Return date", e.returnDate],
    ["Days", e.tripDays != null ? String(e.tripDays) : null],
    ["Travellers", travellers],
    ["Vehicle", e.vehicleCategory ? vehicleCategories.find((v) => v.id === e.vehicleCategory)?.name ?? e.vehicleCategory : null],
    ["Budget", e.budgetBand],
    ["Interests", e.interests],
    ["Message", e.message],
  ];
  return rows.filter((r): r is [string, string] => !!r[1]);
}

function table(rows: [string, string][]) {
  return `<table cellpadding="6" style="border-collapse:collapse;font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="color:#64748b;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="color:#0f172a">${esc(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;
}

const wrap = (body: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#0f172a;line-height:1.5">${body}<p style="margin-top:24px;font-size:12px;color:#94a3b8">${esc(site.name)} · ${esc(site.url)}</p></div>`;

function sourceOf(e: Enquiry) {
  try {
    const u = e.utm ? (JSON.parse(e.utm) as Record<string, string>) : null;
    if (u?.source) return [u.source, u.medium, u.campaign].filter(Boolean).join(" / ");
  } catch {}
  return e.heardFrom || null;
}

async function log(enquiryId: string, action: string, detail: string) {
  await db.enquiryEvent.create({ data: { enquiryId, actor: "system", action, detail: detail.slice(0, 500) } }).catch(() => {});
}

/** Emails the team about a new lead and sends the customer a confirmation (if they gave an email). */
export async function emailNewEnquiry(e: Enquiry) {
  const t = transport();
  if (!t) return;
  const s = await getSettings();
  const from = `"${site.name}" <${t.user}>`;
  const team = (process.env.LEAD_NOTIFY_EMAIL || s.email || t.user).split(",").map((x) => x.trim()).filter(Boolean);
  const rows = details(e);
  const source = sourceOf(e);

  const jobs: Promise<void>[] = [];

  // 1) Team alert with full contact details
  const contact: [string, string][] = [
    ["Name", e.name],
    ...(e.phone ? [["Phone", e.phone] as [string, string]] : []),
    ...(e.email ? [["Email", e.email] as [string, string]] : []),
    ...(e.travellingFrom ? [["Travelling from", e.travellingFrom] as [string, string]] : []),
    ...(source ? [["Source", source] as [string, string]] : []),
    ...(e.sourcePage ? [["Page", e.sourcePage] as [string, string]] : []),
  ];
  const adminUrl = `${site.url}/admin/leads/${e.id}/`;
  const waUrl = e.phone ? whatsappLink(e.phone, `Hi ${e.name}, thank you for your enquiry ${e.ref} with ${site.shortName}.`) : null;
  jobs.push(
    t.mailer
      .sendMail({
        from,
        to: team,
        replyTo: e.email || undefined,
        subject: `New lead ${e.ref}: ${e.name}${e.destination || e.pickup ? ` (${e.destination || e.pickup})` : ""}`,
        text: [...contact, ...rows].map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nOpen in admin: ${adminUrl}`,
        html: wrap(
          `<h2 style="margin:0 0 4px">New enquiry ${esc(e.ref)}</h2><p style="margin:0 0 16px;color:#64748b">Reply quickly: leads answered within 5 minutes convert best.</p>` +
            table([...contact, ...rows]) +
            `<p style="margin-top:20px"><a href="${esc(adminUrl)}" style="background:#166534;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Open lead</a>` +
            (waUrl ? ` &nbsp; <a href="${esc(waUrl)}" style="background:#25d366;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">WhatsApp customer</a>` : "") +
            (e.phone ? ` &nbsp; <a href="tel:${esc(e.phone.replace(/[^\d+]/g, ""))}">Call ${esc(e.phone)}</a>` : "") +
            `</p>`,
        ),
      })
      .then(() => log(e.id, "email_team", `Lead email sent to ${team.join(", ")}`))
      .catch((err) => log(e.id, "email_team", `Lead email FAILED: ${err instanceof Error ? err.message : err}`)),
  );

  // 2) Customer confirmation
  if (e.email) {
    const wa = whatsappLink(s.whatsapp, `Hi ${site.shortName}, my enquiry ID is ${e.ref}.`);
    jobs.push(
      t.mailer
        .sendMail({
          from,
          to: e.email,
          replyTo: s.email || t.user,
          subject: `We've received your enquiry ${e.ref} | ${site.name}`,
          text:
            `Hi ${e.name},\n\nThank you for contacting ${site.name}. Your enquiry ID is ${e.ref}.\n\n` +
            rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
            `\n\nWhat happens next: our team will contact you shortly (${s.hours}) with a written, itemised quote. Nothing is booked or charged until you confirm.\n\n` +
            `Need a faster reply? WhatsApp us: ${wa}\nCall: ${s.phone}\n\nWe never ask for card details by phone, WhatsApp or email.\n\nTeam ${site.shortName}`,
          html: wrap(
            `<h2 style="margin:0 0 8px;color:#166534">Thank you, ${esc(e.name)}!</h2>` +
              `<p>We've received your enquiry. Your enquiry ID is <strong>${esc(e.ref)}</strong>. Please quote it when you contact us.</p>` +
              table(rows) +
              `<h3 style="margin:20px 0 4px">What happens next</h3><p style="margin:0">Our team will contact you shortly (${esc(s.hours)}) with a written, itemised quote. Nothing is booked or charged until you confirm.</p>` +
              `<p style="margin-top:20px"><a href="${esc(wa)}" style="background:#25d366;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Chat on WhatsApp</a> &nbsp; <a href="tel:${esc(s.phone.replace(/[^\d+]/g, ""))}">Call ${esc(s.phone)}</a></p>` +
              `<p style="font-size:12px;color:#64748b">We never ask for card details by phone, WhatsApp or email.</p>` +
              `<p>Warm regards,<br>Team ${esc(site.shortName)}</p>`,
          ),
        })
        .then(() => log(e.id, "email_customer", `Confirmation sent to ${e.email}`))
        .catch((err) => log(e.id, "email_customer", `Confirmation FAILED: ${err instanceof Error ? err.message : err}`)),
    );
  }

  await Promise.all(jobs);
}
