import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recordPaid } from "@/lib/payments";
import { verifyCheckoutSignature } from "@/lib/razorpay";

// Called by the checkout success handler. The signature proves the payment
// came from Razorpay for this order; the webhook covers closed browser tabs.
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = (await request.json().catch(() => ({}))) as { orderId?: string; paymentId?: string; signature?: string };
  const { orderId = "", paymentId = "", signature = "" } = body;
  if (!orderId || !paymentId || !signature) return NextResponse.json({ ok: false, error: "Missing payment details" }, { status: 400 });

  const payment = await db.payment.findUnique({ where: { orderId }, include: { quote: { select: { token: true } } } });
  if (!payment || payment.quote.token !== token) return NextResponse.json({ ok: false, error: "Payment not found" }, { status: 404 });
  if (!verifyCheckoutSignature(orderId, paymentId, signature)) {
    await db.payment.update({ where: { id: payment.id }, data: { status: payment.status === "PAID" ? "PAID" : "FAILED", note: "signature mismatch" } });
    return NextResponse.json({ ok: false, error: "We couldn't verify this payment. If money was deducted, contact us with your payment ID." }, { status: 400 });
  }

  await recordPaid(payment.id, { razorpayPaymentId: paymentId, actor: "razorpay" });
  return NextResponse.json({ ok: true });
}
