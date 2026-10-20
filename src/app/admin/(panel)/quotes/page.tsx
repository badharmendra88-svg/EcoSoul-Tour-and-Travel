import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/format";
import { rupees } from "@/lib/quote";

const statusStyle: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SENT: "bg-blue-100 text-blue-800",
  ACCEPTED: "bg-green-100 text-green-800",
  DECLINED: "bg-red-100 text-red-800",
};

export default async function QuotesPage() {
  await requireAdmin();
  const quotes = await db.quote.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { enquiry: { select: { ref: true } } } });
  const today = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quotes</h1>
          <p className="text-sm text-slate-600">Create estimates from the calculator, then send them as PDF / WhatsApp.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/rates/" className="btn-outline">Rate card</Link>
          <Link href="/admin/quotes/new/" className="btn-secondary">New quote</Link>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Quote</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Trip</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Valid until</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quotes.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono">
                  <Link href={`/admin/quotes/${q.id}/`} className="text-forest-700 hover:underline">{q.number}</Link>
                  {q.enquiry && <div className="text-xs text-slate-500">Lead {q.enquiry.ref}</div>}
                </td>
                <td className="px-4 py-3">{q.customerName}</td>
                <td className="max-w-64 truncate px-4 py-3 text-slate-700">{q.title}</td>
                <td className="px-4 py-3 text-right font-medium">{rupees(q.total)}</td>
                <td className={`px-4 py-3 ${q.validUntil < today && q.status !== "ACCEPTED" ? "text-red-700" : ""}`}>{formatDate(q.validUntil)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[q.status] ?? ""}`}>{q.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDateTime(q.createdAt)}</td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No quotes yet. Open a lead and click “Create quote”, or start a new one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
