import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readJson } from "@/lib/http";
import { amountFor, paymentState, type PaymentPart } from "@/lib/payments";
import { clientIp, ipRateLimit } from "@/lib/rate-limit";
import { createOrder, razorpayConfigured, razorpayKeyId } from "@/lib/razorpay";
import { serialize } from "@/lib/serialize";

// Starts an online payment for a quote: creates a Razorpay order for the
// amount the server calculates (never trusts an amount from the browser).
// A recent unpaid order for the same part is reused, so two open tabs or a
// double click can't produce two payable orders for the same advance.
const REUSE_ORDER_MS = 30 * 60 * 1000;

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (!razorpayConfigured()) return NextResponse.json({ ok: false, error: "Online payment is not available yet. Please pay by UPI or contact us." }, { status: 503 });

  const limit = ipRateLimit("pay", clientIp(request.headers), 10, 10 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ ok: false, error: "Too many attempts. Please wait a few minutes." }, { status: 429 });

  const read = await readJson(request, 1_000);
  if (!read.ok) return read.response;
  const part: PaymentPart = read.body.part === "balance" ? "balance" : "advance";

  const quote = await db.quote.findUnique({ where: { token }, include: { payments: true } });
  if (!quote) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  return serialize(`pay:${quote.id}`, async () => {
    const payments = await db.payment.findMany({ where: { quoteId: quote.id } });
    const state = paymentState(quote, payments);
    if (!state.payable) return NextResponse.json({ ok: false, error: state.expired ? "This quotation has expired — ask us for an updated quote." : "This quotation can't be paid online." }, { status: 409 });
    const amount = amountFor(part, state);
    if (amount < 1) return NextResponse.json({ ok: false, error: "Nothing is due for this part." }, { status: 409 });

    const respond = (orderId: string) =>
      NextResponse.json({
        ok: true,
        keyId: razorpayKeyId(),
        orderId,
        amount: amount * 100,
        name: quote.customerName,
        email: quote.customerEmail ?? "",
        phone: quote.customerPhone ?? "",
        description: `${part === "advance" ? "Advance" : "Balance"} for ${quote.number}`,
      });

    const open = payments.find(
      (p) => p.method === "RAZORPAY" && (p.status === "CREATED" || p.status === "AUTHORIZED") && p.note === part && p.amount === amount && p.orderId && Date.now() - p.createdAt.getTime() < REUSE_ORDER_MS,
    );
    if (open?.status === "AUTHORIZED") return NextResponse.json({ ok: false, error: "Your payment is being confirmed — please refresh in a minute." }, { status: 409 });
    if (open?.orderId) return respond(open.orderId);

    try {
      const orderId = await createOrder(amount, quote.number, { quote: quote.number, part });
      await db.payment.create({ data: { quoteId: quote.id, method: "RAZORPAY", amount, orderId, note: part, recordedBy: "razorpay" } });
      return respond(orderId);
    } catch (e) {
      console.error("[pay] order failed", e instanceof Error ? e.message : e);
      return NextResponse.json({ ok: false, error: "Couldn't start the payment. Please try again or pay by UPI." }, { status: 502 });
    }
  });
}
