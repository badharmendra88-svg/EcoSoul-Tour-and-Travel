"use client";

import { useState } from "react";
import { site } from "@/config/site";
import { track } from "@/lib/analytics";
import { rupees } from "@/lib/quote";
import { WhatsAppButton } from "./ContactButtons";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (event: string, cb: (r: { error?: { description?: string } }) => void) => void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadCheckout(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/** Advance / balance payment on the customer's quote page: Razorpay (UPI, cards, net banking) and/or direct UPI. */
export function PayPanel({
  token,
  quoteNumber,
  total,
  paid,
  advance,
  advanceDue,
  balanceDue,
  online,
  upi,
}: {
  token: string;
  quoteNumber: string;
  total: number;
  paid: number;
  advance: number;
  advanceDue: number;
  balanceDue: number;
  online: boolean;
  upi: { id: string; name: string } | null;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [notice, setNotice] = useState("");
  const part = advanceDue > 0 ? "advance" : "balance";
  const due = part === "advance" ? advanceDue : balanceDue;
  const pct = Math.min(100, Math.round((paid / Math.max(1, total)) * 100));

  async function payOnline() {
    setBusy(true);
    setError("");
    track("begin_payment", { part, value: due });
    try {
      if (!(await loadCheckout()) || !window.Razorpay) throw new Error("Couldn't load the payment window. Check your connection and try again.");
      const res = await fetch(`/api/quotes/${token}/pay/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ part }) });
      const order = await res.json();
      if (!res.ok || !order.ok) throw new Error(order.error || "Couldn't start the payment.");
      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: "INR",
        name: site.name,
        description: order.description,
        prefill: { name: order.name, email: order.email, contact: order.phone },
        notes: { quote: quoteNumber },
        theme: { color: "#0b4a30" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (r: RazorpayResponse) => {
          const v = await fetch(`/api/quotes/${token}/pay/verify/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature }),
          }).then((x) => x.json()).catch(() => ({ ok: false }));
          if (v.ok && v.pending) {
            setDone(true);
            setNotice("Payment received by Razorpay — we're confirming it with the bank. This page will update in a minute; no need to pay again.");
            setTimeout(() => window.location.reload(), 20_000);
          } else if (v.ok) {
            track("payment_success", { part, value: due });
            setDone(true);
            window.location.reload();
          } else {
            setError(v.error || "We couldn't confirm the payment yet. If money was deducted, message us your payment ID — it will be matched automatically.");
            setBusy(false);
          }
        },
      });
      rzp.on("payment.failed", (r) => {
        setError(r.error?.description || "Payment failed. No money was taken — please try again.");
        setBusy(false);
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  const upiLink = upi
    ? `upi://pay?${new URLSearchParams({ pa: upi.id, pn: upi.name || site.name, am: String(due), cu: "INR", tn: `${quoteNumber} ${part}` })}`
    : "";

  return (
    <section aria-labelledby="pay-title" className="rounded-2xl border border-forest-200 bg-forest-50/60 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="pay-title" className="text-lg font-semibold text-forest-900">
          {paid > 0 ? (balanceDue > 0 ? "Payment received — thank you" : "Fully paid — thank you") : "Confirm your booking"}
        </h2>
        {paid > 0 && <p className="text-sm text-slate-600">{rupees(paid)} of {rupees(total)} paid</p>}
      </div>
      {paid > 0 && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white ring-1 ring-forest-100" aria-hidden="true">
          <div className="h-full rounded-full bg-forest-600" style={{ width: `${pct}%` }} />
        </div>
      )}

      {notice && <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}
      {balanceDue > 0 && !done && (
        <>
          <p className="mt-3 text-sm text-slate-700">
            {part === "advance"
              ? `Pay the ${rupees(advance)} advance to confirm. We then lock your hotels and vehicle and send the booking confirmation.`
              : `Balance due: ${rupees(balanceDue)}. You can pay it now or as agreed in your quote.`}
          </p>
          <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
            {online && (
              <button type="button" onClick={payOnline} disabled={busy} className="btn-primary px-6 py-3 text-base">
                <LockIcon /> {busy ? "Opening secure payment…" : `Pay ${rupees(due)} securely`}
              </button>
            )}
            {upi && (
              <a href={upiLink} className={`${online ? "btn-outline" : "btn-primary"} px-6 py-3 text-base sm:hidden`} onClick={() => track("begin_payment", { part, value: due, method: "upi" })}>
                Pay with any UPI app
              </a>
            )}
          </div>
          {online && <p className="mt-2 text-xs text-slate-500">UPI, cards, net banking and wallets via Razorpay. We never see your card details.</p>}
          {upi && (
            <div className="mt-4 rounded-xl bg-white p-4 text-sm ring-1 ring-forest-100">
              <p className="font-medium text-forest-900">{online ? "Or pay by UPI directly" : "Pay by UPI"}</p>
              <p className="mt-1 text-slate-600">
                UPI ID: <CopyText text={upi.id} /> {upi.name && <span className="text-slate-500">({upi.name})</span>} · Amount {rupees(due)} · Note: {quoteNumber}
              </p>
              <p className="mt-2 text-xs text-slate-500">After paying, send the UPI reference (UTR) on WhatsApp. We confirm receipt during working hours.</p>
              <WhatsAppButton className="btn-secondary mt-3" label="Send payment details" message={`Hi EcoSoul, I've paid ${rupees(due)} by UPI for quotation ${quoteNumber}. UTR: ___`} />
            </div>
          )}
          {!online && !upi && (
            <p className="mt-3 text-sm text-slate-600">Message us on WhatsApp to confirm and we&apos;ll share payment details.</p>
          )}
          {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        </>
      )}
    </section>
  );
}

function CopyText({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="font-mono font-semibold text-forest-800 underline decoration-dotted underline-offset-4"
      onClick={() => navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }, () => undefined)}
      aria-label={`Copy UPI ID ${text}`}
    >
      {text}
      <span className="ml-1 font-sans text-xs font-normal text-forest-600 no-underline" aria-live="polite">{copied ? "copied" : "copy"}</span>
    </button>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
  );
}
