"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { markQuoteSentAction, sendQuoteViaWhatsAppApiAction } from "../../quote-actions";
import { Icon } from "../ui";

type Props = {
  quoteId: string;
  pdfUrl: string;
  publicUrl: string;
  isLocalUrl: boolean;
  customerPhone: string | null;
  customerEmail: string | null;
  message: string;
  emailSubject: string;
  waApiReady: boolean;
};

// Indian 10-digit numbers get the 91 country code for wa.me links
function waNumber(phone: string) {
  return phone.replace(/\D/g, "").replace(/^0(\d{10})$/, "$1").replace(/^(\d{10})$/, "91$1");
}

export function SendPanel({ quoteId, pdfUrl, publicUrl, isLocalUrl, customerPhone, customerEmail, message, emailSubject, waApiReady }: Props) {
  const [, startTransition] = useTransition();
  const [apiPending, startApi] = useTransition();
  const [apiResult, setApiResult] = useState<{ ok: boolean; text: string } | null>(null);

  function sendViaApi() {
    setApiResult(null);
    startApi(async () => {
      const res = await sendQuoteViaWhatsAppApiAction(quoteId);
      setApiResult(res.ok ? { ok: true, text: "PDF sent to the customer on WhatsApp." } : { ok: false, text: res.error });
    });
  }
  const [copied, setCopied] = useState(false);
  const mark = (via: "WHATSAPP" | "EMAIL" | "LINK") => startTransition(() => markQuoteSentAction(quoteId, via));

  const waUrl = customerPhone
    ? `https://wa.me/${waNumber(customerPhone)}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
  const mailUrl = customerEmail
    ? `mailto:${customerEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(message)}`
    : null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      mark("LINK");
    } catch {
      /* clipboard blocked — the link is visible to copy manually */
    }
  }

  return (
    <section className="panel overflow-hidden">
      <header className="bg-gradient-to-br from-forest-800 to-forest-700 px-6 py-5 text-white">
        <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">Send to customer</p>
        <p className="mt-1 text-sm text-forest-100">{customerPhone ?? customerEmail ?? "No contact on file"}</p>
      </header>
      <div className="space-y-5 p-6">
        {waApiReady ? (
          <div className="space-y-2">
            <button type="button" onClick={sendViaApi} disabled={apiPending || !customerPhone} className="btn-admin-primary w-full py-3">
              <Icon name="sparkles" /> {apiPending ? "Sending PDF…" : "Send PDF via WhatsApp API"}
            </button>
            {apiResult && (
              <p role="status" className={`rounded-xl px-4 py-2.5 text-xs ring-1 ${apiResult.ok ? "bg-emerald-50 text-emerald-800 ring-emerald-100" : "bg-rose-50 text-rose-800 ring-rose-100"}`}>{apiResult.text}</p>
            )}
          </div>
        ) : (
          <Link href="/admin/settings/#whatsapp" className="block rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600 ring-1 ring-slate-900/5 hover:bg-slate-100">
            <strong className="text-slate-800">Send the PDF automatically?</strong> Connect the WhatsApp Cloud API in Settings →
          </Link>
        )}
        <div className="grid gap-2.5">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => mark("WHATSAPP")} className="btn-admin-whatsapp w-full py-3">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm5.8 14.12c-.24.68-1.43 1.32-1.97 1.37-.5.05-1.13.07-1.83-.11a16.7 16.7 0 0 1-1.66-.61c-2.92-1.26-4.82-4.2-4.97-4.39-.14-.2-1.18-1.58-1.18-3.01 0-1.43.75-2.13 1.02-2.42.26-.29.58-.36.77-.36h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.2-.14.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.3-.12.59.17.29.75 1.24 1.61 2 1.1.98 2.04 1.29 2.33 1.43.29.14.46.12.63-.07.17-.2.72-.84.92-1.13.19-.29.38-.24.65-.14.26.1 1.68.79 1.97.94.29.14.48.21.55.33.07.12.07.68-.17 1.36Z" />
            </svg>
            {waApiReady ? "Open WhatsApp chat" : "Send on WhatsApp"}
          </a>
          <div className="grid grid-cols-2 gap-2.5">
            <a href={pdfUrl} target="_blank" rel="noopener" className="btn-admin-ghost"><Icon name="download" /> PDF</a>
            {mailUrl ? (
              <a href={mailUrl} onClick={() => mark("EMAIL")} className="btn-admin-ghost"><Icon name="mail" /> Email</a>
            ) : (
              <span className="btn-admin-ghost cursor-not-allowed opacity-50" title="No email on file"><Icon name="mail" /> Email</span>
            )}
          </div>
        </div>

        <div>
          <p className="admin-label">Private customer link</p>
          <div className="flex gap-2">
            <input readOnly value={publicUrl} className="admin-input font-mono text-xs" onFocus={(e) => e.target.select()} aria-label="Customer quote link" />
            <button type="button" onClick={copy} className={`shrink-0 ${copied ? "btn-admin-primary" : "btn-admin-ghost"} px-3`}>
              {copied ? <Icon name="check" /> : "Copy"}
            </button>
          </div>
        </div>

        <details className="group rounded-xl bg-slate-50 ring-1 ring-slate-900/5">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-slate-700">
            Message preview
            <Icon name="chevron" className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90" />
          </summary>
          <pre className="border-t border-slate-200/70 px-4 py-3 font-sans text-xs leading-relaxed whitespace-pre-wrap text-slate-600">{message}</pre>
        </details>

        <p className="text-xs leading-relaxed text-slate-500">
          WhatsApp opens with the summary and link pre-filled. To send the PDF file itself, download it and attach it in the chat
          (automatic attachments need the WhatsApp Business API).
        </p>
        {isLocalUrl && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-100">
            <strong>Site is on localhost.</strong> Customers can&apos;t open the link until the website is deployed with a public
            NEXT_PUBLIC_SITE_URL — send the PDF file for now.
          </p>
        )}
      </div>
    </section>
  );
}
