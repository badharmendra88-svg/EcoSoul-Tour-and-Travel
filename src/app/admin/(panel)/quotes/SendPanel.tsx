"use client";

import { useState, useTransition } from "react";
import { markQuoteSentAction } from "../../quote-actions";

type Props = {
  quoteId: string;
  pdfUrl: string;
  publicUrl: string;
  isLocalUrl: boolean;
  customerPhone: string | null;
  customerEmail: string | null;
  message: string;
  emailSubject: string;
};

// Indian 10-digit numbers get the 91 country code for wa.me links
function waNumber(phone: string) {
  return phone.replace(/\D/g, "").replace(/^0(\d{10})$/, "$1").replace(/^(\d{10})$/, "91$1");
}

export function SendPanel({ quoteId, pdfUrl, publicUrl, isLocalUrl, customerPhone, customerEmail, message, emailSubject }: Props) {
  const [, startTransition] = useTransition();
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
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="font-semibold text-slate-900">Send to customer</h2>
      <div className="grid gap-3">
        <a href={pdfUrl} target="_blank" rel="noopener" className="btn-outline w-full">Download / view PDF</a>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => mark("WHATSAPP")} className="btn-secondary w-full">
          Send on WhatsApp{customerPhone ? "" : " (choose contact)"}
        </a>
        {mailUrl && (
          <a href={mailUrl} onClick={() => mark("EMAIL")} className="btn-outline w-full">Send by email</a>
        )}
      </div>

      <div>
        <p className="label">Customer link</p>
        <div className="flex gap-2">
          <input readOnly value={publicUrl} className="input text-xs" onFocus={(e) => e.target.select()} aria-label="Customer quote link" />
          <button type="button" onClick={copy} className="btn-outline shrink-0 px-3">{copied ? "Copied" : "Copy"}</button>
        </div>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-slate-600">Message preview</summary>
        <pre className="mt-2 rounded-lg bg-slate-50 p-3 font-sans text-xs whitespace-pre-wrap text-slate-700">{message}</pre>
      </details>

      <p className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
        WhatsApp opens with the quote summary and link pre-filled. To attach the PDF file itself, download it and attach it in the
        WhatsApp chat (automatic file sending needs the WhatsApp Business API).
        {isLocalUrl && (
          <strong className="mt-2 block text-amber-800">
            The site URL is still localhost — customers can&apos;t open the link until the website is deployed and
            NEXT_PUBLIC_SITE_URL is set. Send the PDF file for now.
          </strong>
        )}
      </p>
    </div>
  );
}
