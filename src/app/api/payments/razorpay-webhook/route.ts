import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recordPaid } from "@/lib/payments";
import { matchesOrder, verifyWebhookSignature } from "@/lib/razorpay";

// Razorpay webhook (payment.captured / order.paid / payment.failed). Records
// payments even if the customer closes the tab before the checkout handler runs.
// A payment is marked PAID only when it is captured, in INR, for exactly the
// amount of our order. Replays are harmless (recordPaid is idempotent).
// Set the URL to https://<your-domain>/api/payments/razorpay-webhook/ in the Razorpay dashboard.
type Entity = { id?: string; order_id?: string; status?: string; amount?: number; currency?: string };

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 200_000) return NextResponse.json({ ok: false }, { status: 413 });
  const raw = await request.text();
  if (raw.length > 200_000 || !verifyWebhookSignature(raw, request.headers.get("x-razorpay-signature") ?? "")) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  let event: { event?: string; payload?: { payment?: { entity?: Entity } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const entity = event.payload?.payment?.entity;
  if (!entity?.order_id) return NextResponse.json({ ok: true });
  const payment = await db.payment.findUnique({ where: { orderId: entity.order_id } });
  if (!payment) return NextResponse.json({ ok: true });

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const remote = { order_id: entity.order_id, amount: Number(entity.amount), currency: String(entity.currency), status: String(entity.status) };
    if (matchesOrder(remote, payment)) {
      await recordPaid(payment.id, { razorpayPaymentId: entity.id, actor: "razorpay" });
    } else {
      console.warn(`[razorpay-webhook] ${event.event} for ${entity.order_id} did not match (status ${remote.status}, ${remote.amount} ${remote.currency}, expected ${payment.amount * 100} INR)`);
    }
  } else if (event.event === "payment.failed") {
    await db.payment.updateMany({ where: { id: payment.id, status: { in: ["CREATED", "AUTHORIZED"] } }, data: { status: "FAILED" } });
  }
  return NextResponse.json({ ok: true });
}
