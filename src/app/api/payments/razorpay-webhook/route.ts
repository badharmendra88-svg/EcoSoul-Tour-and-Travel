import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recordPaid } from "@/lib/payments";
import { verifyWebhookSignature } from "@/lib/razorpay";

// Razorpay webhook (payment.captured / order.paid). Makes sure payments are
// recorded even if the customer closes the tab before the checkout handler runs.
// Set the URL to https://<your-domain>/api/payments/razorpay-webhook/ in the Razorpay dashboard.
export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyWebhookSignature(raw, request.headers.get("x-razorpay-signature") ?? "")) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const entity = event.payload?.payment?.entity;
  if ((event.event === "payment.captured" || event.event === "order.paid") && entity?.order_id) {
    const payment = await db.payment.findUnique({ where: { orderId: entity.order_id } });
    if (payment) await recordPaid(payment.id, { razorpayPaymentId: entity.id, actor: "razorpay" });
  } else if (event.event === "payment.failed" && entity?.order_id) {
    await db.payment.updateMany({ where: { orderId: entity.order_id, status: "CREATED" }, data: { status: "FAILED" } });
  }
  return NextResponse.json({ ok: true });
}
