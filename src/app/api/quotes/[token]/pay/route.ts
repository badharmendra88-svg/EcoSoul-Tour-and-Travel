import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { amountFor, paymentState, type PaymentPart } from "@/lib/payments";
import { clientIp, ipRateLimit } from "@/lib/rate-limit";
import { createOrder, razorpayConfigured, razorpayKeyId } from "@/lib/razorpay";

// Starts an online payment for a quote: creates a Razorpay order for the
// amount the server calculates (never trusts an amount from the browser).
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (!razorpayConfigured()) return NextResponse.json({ ok: false, error: "Online payment is not available yet. Please pay by UPI or contact us." }, { status: 503 });

  const limit = ipRateLimit("pay", clientIp(request.headers), 10, 10 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ ok: false, error: "Too many attempts. Please wait a few minutes." }, { status: 429 });

  const body = (await request.json().catch(() => ({}))) as { part?: string };
  const part: PaymentPart = body.part === "balance" ? "balance" : "advance";

  const quote = await db.quote.findUnique({ where: { token }, include: { payments: true } });
  if (!quote) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const state = paymentState(quote, quote.payments);
  if (!state.payable) return NextResponse.json({ ok: false, error: state.expired ? "This quotation has expired — ask us for an updated quote." : "This quotation can't be paid online." }, { status: 409 });
  const amount = amountFor(part, state);
  if (amount < 1) return NextResponse.json({ ok: false, error: "Nothing is due for this part." }, { status: 409 });

  try {
    const orderId = await createOrder(amount, quote.number, { quote: quote.number, part });
    await db.payment.create({ data: { quoteId: quote.id, method: "RAZORPAY", amount, orderId, note: part, recordedBy: "razorpay" } });
    return NextResponse.json({
      ok: true,
      keyId: razorpayKeyId(),
      orderId,
      amount: amount * 100,
      name: quote.customerName,
      email: quote.customerEmail ?? "",
      phone: quote.customerPhone ?? "",
      description: `${part === "advance" ? "Advance" : "Balance"} for ${quote.number}`,
    });
  } catch (e) {
    console.error("[pay] order failed", e);
    return NextResponse.json({ ok: false, error: "Couldn't start the payment. Please try again or pay by UPI." }, { status: 502 });
  }
}
