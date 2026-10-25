import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readJson } from "@/lib/http";
import { recordPaid } from "@/lib/payments";
import { clientIp, ipRateLimit } from "@/lib/rate-limit";
import { fetchPayment, isOrderId, isPaymentId, matchesOrder, verifyCheckoutSignature } from "@/lib/razorpay";

// Called by the checkout success handler. The signature proves Razorpay issued
// this payment for our order, but it is issued at authorisation — so we also ask
// Razorpay for the payment and record it as PAID only once it is captured for
// exactly our amount. Otherwise it stays AUTHORIZED until the webhook confirms it.
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!ipRateLimit("pay-verify", clientIp(request.headers), 20, 10 * 60 * 1000).ok) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }
  const read = await readJson(request, 2_000);
  if (!read.ok) return read.response;
  const { orderId, paymentId, signature } = read.body;
  if (!isOrderId(orderId) || !isPaymentId(paymentId) || typeof signature !== "string" || !/^[a-f0-9]{64}$/.test(signature)) {
    return NextResponse.json({ ok: false, error: "Missing payment details" }, { status: 400 });
  }

  const payment = await db.payment.findUnique({ where: { orderId }, include: { quote: { select: { token: true } } } });
  if (!payment || payment.quote.token !== token) return NextResponse.json({ ok: false, error: "Payment not found" }, { status: 404 });
  if (payment.status === "PAID") return NextResponse.json({ ok: true });
  if (!verifyCheckoutSignature(orderId, paymentId, signature)) {
    console.warn(`[pay-verify] signature mismatch for order ${orderId}`);
    return NextResponse.json({ ok: false, error: "We couldn't verify this payment. If money was deducted, contact us with your payment ID." }, { status: 400 });
  }

  const remote = await fetchPayment(paymentId);
  if (remote && matchesOrder(remote, payment)) {
    await recordPaid(payment.id, { razorpayPaymentId: paymentId, actor: "razorpay" });
    return NextResponse.json({ ok: true });
  }
  if (remote && remote.order_id !== orderId) {
    console.warn(`[pay-verify] payment ${paymentId} belongs to another order`);
    return NextResponse.json({ ok: false, error: "We couldn't verify this payment. Please contact us with your payment ID." }, { status: 400 });
  }
  // Authorised but not yet captured (or Razorpay unreachable): the webhook will confirm it
  await db.payment.updateMany({ where: { id: payment.id, status: "CREATED" }, data: { status: "AUTHORIZED", paymentId } });
  return NextResponse.json({ ok: true, pending: true });
}
