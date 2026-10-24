import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Razorpay Orders API (no SDK needed). Keys come from .env:
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET — Dashboard → Account & Settings → API keys
//   RAZORPAY_WEBHOOK_SECRET               — Dashboard → Webhooks (event: payment.captured, order.paid)
// Use test keys (rzp_test_…) until the account is activated for live payments.

export function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function razorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID ?? "";
}

export function razorpayMode() {
  return razorpayKeyId().startsWith("rzp_live_") ? "live" : "test";
}

export async function createOrder(amountRupees: number, receipt: string, notes: Record<string, string>) {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: Math.round(amountRupees * 100), currency: "INR", receipt: receipt.slice(0, 40), notes }),
    signal: AbortSignal.timeout(15_000),
  });
  const data = (await res.json().catch(() => ({}))) as { id?: string; error?: { description?: string } };
  if (!res.ok || !data.id) throw new Error(data.error?.description || `Razorpay order failed (${res.status})`);
  return data.id;
}

function safeEqualHex(a: string, b: string) {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Checkout success handler: signature = HMAC_SHA256(order_id|payment_id, key_secret). */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Webhook: X-Razorpay-Signature = HMAC_SHA256(raw body, webhook secret). */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}
