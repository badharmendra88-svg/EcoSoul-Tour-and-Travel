import { notFound } from "next/navigation";
import { WhatsAppButton } from "@/components/ContactButtons";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { parseList } from "@/lib/json";
import { lineAmount, rupees, type QuoteItem } from "@/lib/quote";

// Customer-facing quote page. Private: reachable only via the token link.
export const dynamic = "force-dynamic";
export const metadata = { title: "Your quotation", robots: { index: false, follow: false } };

export default async function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) notFound();
  const q = await db.quote.findUnique({ where: { token } });
  if (!q) notFound();

  const items = JSON.parse(q.items) as QuoteItem[];
  const today = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
  const expired = q.validUntil < today && q.status !== "ACCEPTED";
  const advance = Math.round((q.total * q.advancePct) / 100);

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 bg-forest-800 p-6 text-white sm:p-8">
          <div>
            <p className="text-sm font-semibold tracking-widest text-accent uppercase">Quotation</p>
            <h1 className="mt-1 text-2xl font-bold">{q.title}</h1>
            <p className="mt-1 text-forest-100">Prepared for {q.customerName}</p>
          </div>
          <div className="text-right text-sm text-forest-100">
            <p className="font-mono text-white">{q.number}</p>
            <p>Date: {formatDate(q.createdAt)}</p>
            <p>Valid until: {formatDate(q.validUntil)}</p>
            {q.travelDate && <p>Travel: {formatDate(q.travelDate)}</p>}
          </div>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          {expired && (
            <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              This quotation has expired. Prices and availability may have changed — message us for an updated quote.
            </p>
          )}
          {q.tripSummary && <p className="text-slate-700">{q.tripSummary}</p>}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-b border-slate-200 text-left text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Rate</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it, i) => (
                  <tr key={i}>
                    <td className="py-3 pr-4">{it.label}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{it.qty} {it.unit}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{rupees(it.rate)}</td>
                    <td className="py-3 text-right font-medium whitespace-nowrap">{rupees(lineAmount(it))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="ml-auto max-w-sm space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-600">Subtotal</dt><dd>{rupees(q.subtotal)}</dd></div>
            {q.markupAmount > 0 && <div className="flex justify-between"><dt className="text-slate-600">{q.markupLabel}</dt><dd>{rupees(q.markupAmount)}</dd></div>}
            {q.taxAmount > 0 && <div className="flex justify-between"><dt className="text-slate-600">{q.taxLabel} ({q.taxPct}%)</dt><dd>{rupees(q.taxAmount)}</dd></div>}
            <div className="flex justify-between border-t border-slate-200 pt-2 text-xl font-bold text-forest-900"><dt>Total</dt><dd>{rupees(q.total)}</dd></div>
            {q.advancePct > 0 && <div className="flex justify-between"><dt className="text-slate-600">Advance to confirm ({q.advancePct}%)</dt><dd className="font-medium">{rupees(advance)}</dd></div>}
          </dl>

          <div className="grid gap-6 sm:grid-cols-2">
            <ListBlock title="Inclusions" items={parseList(q.inclusions)} mark="✓" markClass="text-forest-600" />
            <ListBlock title="Exclusions" items={parseList(q.exclusions)} mark="✕" markClass="text-red-700" />
          </div>
          {q.notes && (
            <div>
              <h2 className="font-semibold text-forest-900">Notes</h2>
              <p className="mt-2 text-sm whitespace-pre-wrap text-slate-700">{q.notes}</p>
            </div>
          )}
          <div>
            <h2 className="font-semibold text-forest-900">Terms</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
              {parseList(q.terms).map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            <a href={`/api/quotes/${q.token}/pdf/`} target="_blank" rel="noopener" className="btn-outline">Download PDF</a>
            <WhatsAppButton
              label={expired ? "Ask for an updated quote" : "Confirm or ask on WhatsApp"}
              message={`Hi EcoSoul, about quotation ${q.number} (${q.title}): `}
            />
          </div>
          <p className="text-xs text-slate-500">This is a quotation, not a booking confirmation.</p>
        </div>
      </div>
    </div>
  );
}

function ListBlock({ title, items, mark, markClass }: { title: string; items: string[]; mark: string; markClass: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="font-semibold text-forest-900">{title}</h2>
      <ul className="mt-2 space-y-1 text-sm text-slate-700">
        {items.map((i) => (
          <li key={i} className="flex gap-2"><span aria-hidden="true" className={markClass}>{mark}</span>{i}</li>
        ))}
      </ul>
    </div>
  );
}
