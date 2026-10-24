import "server-only";
import type { Payment, Quote } from "@prisma/client";
import { site } from "@/config/site";
import { db } from "./db";
import { rupees } from "./quote";
import { getNotifyWebhookUrl } from "./settings";

// Payment state for a quote and the single place that marks a payment as paid
// (used by the checkout handler, the Razorpay webhook and manual admin entries).

export type PaymentPart = "advance" | "balance";

export function istToday() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

export function paymentState(q: Pick<Quote, "total" | "advancePct" | "status" | "validUntil">, payments: Pick<Payment, "status" | "amount">[]) {
  const paid = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const advance = Math.round((q.total * q.advancePct) / 100);
  const advanceDue = Math.max(0, advance - paid);
  const balanceDue = Math.max(0, q.total - paid);
  const expired = q.validUntil < istToday() && q.status !== "ACCEPTED";
  const payable = q.status !== "DECLINED" && q.status !== "DRAFT" && !expired && balanceDue > 0;
  return { paid, advance, advanceDue, balanceDue, expired, payable };
}

/** Amount the customer pays now for the chosen part (advance first, then balance). */
export function amountFor(part: PaymentPart, s: ReturnType<typeof paymentState>) {
  if (part === "advance") return s.advanceDue > 0 ? s.advanceDue : 0;
  return s.balanceDue;
}

/**
 * Marks a payment as paid (idempotent), accepts the quote and records the
 * payment on the lead's activity log. Returns false if it was already paid.
 */
export async function recordPaid(paymentId: string, data: { razorpayPaymentId?: string; actor: string }) {
  const payment = await db.payment.findUnique({ where: { id: paymentId }, include: { quote: true } });
  if (!payment || payment.status === "PAID") return false;
  await db.payment.update({
    where: { id: payment.id },
    data: { status: "PAID", paidAt: new Date(), ...(data.razorpayPaymentId ? { paymentId: data.razorpayPaymentId } : {}) },
  });
  const q = payment.quote;
  if (q.status === "SENT" || q.status === "DRAFT") await db.quote.update({ where: { id: q.id }, data: { status: "ACCEPTED" } });
  if (q.enquiryId) {
    await db.enquiryEvent.create({
      data: {
        enquiryId: q.enquiryId,
        actor: data.actor,
        action: "payment",
        detail: `${rupees(payment.amount)} received for ${q.number} via ${payment.method.toLowerCase()}${payment.reference ? ` (ref ${payment.reference})` : ""}`,
      },
    });
  }
  notifyPayment(q, payment.amount, payment.method).catch(() => undefined);
  return true;
}

async function notifyPayment(q: Quote, amount: number, method: string) {
  const url = await getNotifyWebhookUrl();
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `Payment received: ${rupees(amount)} for ${q.number} (${q.title}) via ${method.toLowerCase()}.\nOpen: ${site.url}/admin/quotes/${q.id}/`,
    }),
    signal: AbortSignal.timeout(8000),
  });
}
