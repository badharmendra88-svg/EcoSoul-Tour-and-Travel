"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { computeTotals, rupees } from "@/lib/quote";
import { renderQuotePdf } from "@/lib/quote-pdf";
import { getSettings, getWhatsAppApiConfig } from "@/lib/settings";
import { sendPdfDocument } from "@/lib/whatsapp-api";
import { getRateCard } from "@/lib/rates";
import { recordPaid } from "@/lib/payments";

// ---------- Rate card ----------

const int = (fd: FormData, key: string) => Math.max(0, Math.round(Number(fd.get(key)) || 0));
const num = (fd: FormData, key: string) => Math.max(0, Number(fd.get(key)) || 0);
const text = (fd: FormData, key: string, max = 200) => String(fd.get(key) ?? "").trim().slice(0, max);

export async function saveRatesAction(formData: FormData) {
  await requireAdmin("rates.edit");
  const { vehicles, hotels } = await getRateCard();

  await db.$transaction([
    ...vehicles.map((v) =>
      db.vehicleRate.update({
        where: { id: v.id },
        data: {
          example: text(formData, `v_${v.id}_example`) || v.example,
          seats: int(formData, `v_${v.id}_seats`) || v.seats,
          perKm: int(formData, `v_${v.id}_perKm`),
          minKmPerDay: int(formData, `v_${v.id}_minKmPerDay`),
          driverAllowance: int(formData, `v_${v.id}_driverAllowance`),
          nightHalt: int(formData, `v_${v.id}_nightHalt`),
          localPackage: int(formData, `v_${v.id}_localPackage`),
          localHours: int(formData, `v_${v.id}_localHours`) || 8,
          localKm: int(formData, `v_${v.id}_localKm`) || 80,
          extraHour: int(formData, `v_${v.id}_extraHour`),
          extraKm: int(formData, `v_${v.id}_extraKm`),
          oneWayPerKm: int(formData, `v_${v.id}_oneWayPerKm`),
          transferBase: int(formData, `v_${v.id}_transferBase`),
          transferKm: int(formData, `v_${v.id}_transferKm`),
          active: formData.get(`v_${v.id}_active`) === "on",
        },
      }),
    ),
    ...hotels.map((h) =>
      db.hotelRate.update({
        where: { id: h.id },
        data: {
          description: text(formData, `h_${h.id}_description`) || h.description,
          perRoomNight: int(formData, `h_${h.id}_perRoomNight`),
          mealsPerPerson: int(formData, `h_${h.id}_mealsPerPerson`),
        },
      }),
    ),
    db.quoteSettings.update({
      where: { id: "default" },
      data: {
        gstPct: Math.min(28, num(formData, "gstPct")),
        gstLabel: text(formData, "gstLabel", 60) || "GST",
        markupPct: Math.min(100, num(formData, "markupPct")),
        markupLabel: text(formData, "markupLabel", 80) || "Service & planning charges",
        validityDays: Math.min(90, int(formData, "validityDays")) || 7,
        advancePct: Math.min(100, int(formData, "advancePct")),
        peakSurchargePct: Math.min(200, int(formData, "peakSurchargePct")),
        oneWayMinKm: int(formData, "oneWayMinKm"),
        lateNightCharge: int(formData, "lateNightCharge"),
        freeWaitMinutes: int(formData, "freeWaitMinutes"),
        driverDayRate: int(formData, "driverDayRate"),
        driverOutstationDayRate: int(formData, "driverOutstationDayRate"),
        driverDayHours: Math.min(24, int(formData, "driverDayHours")) || 10,
        driverOvertimeHour: int(formData, "driverOvertimeHour"),
        driverNightAllowance: int(formData, "driverNightAllowance"),
        terms: String(formData.get("terms") ?? "").slice(0, 5000),
      },
    }),
  ]);

  revalidatePath("/admin/rates/");
  // Public fare estimates (homepage, taxi and city pages) are built from the rate card
  revalidatePath("/", "layout");
  redirect("/admin/rates/?saved=1");
}

// ---------- Quotes ----------

const itemSchema = z.object({
  label: z.string().trim().min(1).max(300),
  qty: z.number().min(0).max(100000),
  unit: z.string().trim().max(30),
  rate: z.number().min(0).max(10000000),
});

const quoteSchema = z.object({
  id: z.string().optional(),
  enquiryId: z.string().optional().nullable(),
  customerName: z.string().trim().min(1, "Customer name is required").max(120),
  customerPhone: z.string().trim().max(30).optional(),
  customerEmail: z.string().trim().max(120).optional(),
  title: z.string().trim().min(1, "Quote title is required").max(200),
  tripSummary: z.string().trim().max(2000).optional(),
  travelDate: z.string().max(10).optional(),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid-until date"),
  items: z.array(itemSchema).min(1, "Add at least one line item").max(60),
  markupPct: z.number().min(0).max(100),
  markupLabel: z.string().trim().max(80),
  taxPct: z.number().min(0).max(28),
  taxLabel: z.string().trim().max(60),
  advancePct: z.number().int().min(0).max(100),
  inclusions: z.array(z.string().max(300)).max(40),
  exclusions: z.array(z.string().max(300)).max(40),
  terms: z.array(z.string().max(500)).max(40),
  notes: z.string().max(3000).optional(),
  calcInput: z.unknown().optional(),
});

export type QuotePayload = z.input<typeof quoteSchema>;

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function randomId(len: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

function token() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Buffer.from(bytes).toString("base64url");
}

export async function saveQuoteAction(payload: QuotePayload): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const actor = await requireAdmin("quotes.manage");
  const parsed = quoteSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid quote" };
  const q = parsed.data;

  // Totals are always recomputed on the server
  const totals = computeTotals(q.items, q.markupPct, q.taxPct);
  const data = {
    enquiryId: q.enquiryId || null,
    customerName: q.customerName,
    customerPhone: q.customerPhone || null,
    customerEmail: q.customerEmail || null,
    title: q.title,
    tripSummary: q.tripSummary || null,
    travelDate: q.travelDate || null,
    validUntil: q.validUntil,
    items: JSON.stringify(q.items),
    ...totals,
    markupPct: q.markupPct,
    markupLabel: q.markupLabel || "Service & planning charges",
    taxPct: q.taxPct,
    taxLabel: q.taxLabel || "GST",
    advancePct: q.advancePct,
    inclusions: JSON.stringify(q.inclusions.filter(Boolean)),
    exclusions: JSON.stringify(q.exclusions.filter(Boolean)),
    terms: JSON.stringify(q.terms.filter(Boolean)),
    notes: q.notes || null,
    calcInput: q.calcInput ? JSON.stringify(q.calcInput) : null,
  };

  let id = q.id;
  if (id) {
    const existing = await db.quote.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "Quote not found" };
    await db.quote.update({ where: { id }, data });
  } else {
    const yymmdd = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(2, 10).replace(/-/g, "");
    const created = await db.quote.create({ data: { ...data, token: token(), number: `Q-${yymmdd}-${randomId(4)}` } });
    id = created.id;
    if (data.enquiryId) {
      await db.enquiryEvent.create({
        data: { enquiryId: data.enquiryId, actor, action: "quote_created", detail: `${created.number} — total ${totals.total}` },
      });
    }
  }

  revalidatePath("/admin/quotes/");
  return { ok: true, id };
}

export async function markQuoteSentAction(id: string, via: "WHATSAPP" | "WHATSAPP_API" | "EMAIL" | "LINK") {
  const actor = await requireAdmin("quotes.manage");
  const quote = await db.quote.findUnique({ where: { id } });
  if (!quote) return;
  await db.quote.update({ where: { id }, data: { status: quote.status === "DRAFT" ? "SENT" : quote.status, sentAt: new Date(), sentVia: via } });

  if (quote.enquiryId) {
    const enquiry = await db.enquiry.findUnique({ where: { id: quote.enquiryId } });
    if (enquiry) {
      const moveStatus = ["NEW", "CONTACTED", "QUALIFIED", "CHECKING"].includes(enquiry.status);
      await db.enquiry.update({
        where: { id: enquiry.id },
        data: {
          ...(moveStatus ? { status: "QUOTE_SENT" } : {}),
          events: {
            create: [
              { actor, action: "quote_sent", detail: `${quote.number} via ${via.toLowerCase().replace("_", " ")}` },
              ...(moveStatus ? [{ actor, action: "status", detail: `${enquiry.status} → QUOTE_SENT` }] : []),
            ],
          },
        },
      });
      revalidatePath(`/admin/leads/${enquiry.id}/`);
    }
  }
  revalidatePath(`/admin/quotes/${id}/`);
  revalidatePath("/admin/quotes/");
}

/** Uploads the quote PDF and sends it to the customer through the WhatsApp Cloud API. */
export async function sendQuoteViaWhatsAppApiAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin("quotes.manage");
  const quote = await db.quote.findUnique({ where: { id } });
  if (!quote) return { ok: false, error: "Quote not found" };
  if (!quote.customerPhone) return { ok: false, error: "Add the customer's WhatsApp number to the quote first." };
  const cfg = await getWhatsAppApiConfig();
  if (!cfg) return { ok: false, error: "WhatsApp Cloud API is not set up. Configure it in Settings → WhatsApp." };

  try {
    const pdf = await renderQuotePdf(quote);
    const settings = await getSettings();
    await sendPdfDocument(cfg, {
      to: quote.customerPhone,
      pdf,
      filename: `EcoSoul-${quote.number}.pdf`,
      caption: `Your quotation ${quote.number} — ${quote.title}. Total ${rupees(quote.total)}, valid until ${quote.validUntil}. Reply here to confirm. ${settings.phone}`,
      templateParams: [quote.customerName, quote.number, rupees(quote.total, "Rs.")],
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Sending failed" };
  }
  await markQuoteSentAction(id, "WHATSAPP_API");
  return { ok: true };
}

export async function setQuoteStatusAction(formData: FormData) {
  const actor = await requireAdmin("quotes.manage");
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["DRAFT", "SENT", "ACCEPTED", "DECLINED"].includes(status)) return;
  const quote = await db.quote.update({ where: { id }, data: { status } });
  if (quote.enquiryId) {
    await db.enquiryEvent.create({ data: { enquiryId: quote.enquiryId, actor, action: "quote_status", detail: `${quote.number} → ${status}` } });
  }
  revalidatePath(`/admin/quotes/${id}/`);
  revalidatePath("/admin/quotes/");
}

// ---------- Payments ----------

/** Records a UPI / bank / cash receipt after the team has checked the bank statement. */
export async function recordManualPaymentAction(formData: FormData) {
  const actor = await requireAdmin("payments.record");
  const id = text(formData, "quoteId", 40);
  const back = `/admin/quotes/${id}/`;
  const amount = int(formData, "amount");
  const method = text(formData, "method", 10);
  const reference = text(formData, "reference", 80);
  if (!["UPI", "BANK", "CASH"].includes(method)) redirect(`${back}?payError=${encodeURIComponent("Choose how the money was received.")}#payments`);
  if (amount < 1) redirect(`${back}?payError=${encodeURIComponent("Enter the amount received.")}#payments`);
  if (method !== "CASH" && !reference) redirect(`${back}?payError=${encodeURIComponent("Enter the UPI / bank reference (UTR) so the payment can be traced.")}#payments`);

  const quote = await db.quote.findUnique({ where: { id }, select: { id: true } });
  if (!quote) redirect("/admin/quotes/");
  const payment = await db.payment.create({
    data: { quoteId: id, method, amount, reference: reference || null, note: text(formData, "note", 200) || null, recordedBy: actor },
  });
  await recordPaid(payment.id, { actor });
  revalidatePath(back);
  revalidatePath("/admin/quotes/");
  redirect(`${back}?paid=1#payments`);
}
