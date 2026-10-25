import Link from "next/link";
import { requireUser } from "@/lib/admin-auth";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { rupees } from "@/lib/quote";
import { Avatar, EmptyState, Icon, PageHeader, StatCard, StatusBadge, compactRupees, timeAgo } from "../ui";
import { istTodayISO } from "@/lib/time";

const filters = [
  { id: "", label: "All" },
  { id: "DRAFT", label: "Draft" },
  { id: "SENT", label: "Sent" },
  { id: "ACCEPTED", label: "Accepted" },
  { id: "DECLINED", label: "Declined" },
];

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const me = await requireUser("quotes.manage");
  const { status } = await searchParams;
  const valid = filters.some((f) => f.id === status) ? status : undefined;
  const today = istTodayISO();

  const [quotes, groups] = await Promise.all([
    db.quote.findMany({
      where: valid ? { status: valid } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { enquiry: { select: { ref: true } } },
    }),
    db.quote.groupBy({ by: ["status"], _count: true, _sum: { total: true } }),
  ]);
  const g = Object.fromEntries(groups.map((x) => [x.status, { count: x._count, sum: x._sum.total ?? 0 }]));
  const decided = (g.ACCEPTED?.count ?? 0) + (g.DECLINED?.count ?? 0);
  const winRate = decided ? Math.round(((g.ACCEPTED?.count ?? 0) / decided) * 100) : 0;
  const allCount = groups.reduce((s, x) => s + x._count, 0);

  return (
    <>
      <PageHeader
        eyebrow="Sales"
        title="Quotes"
        subtitle="Estimates built with the calculator — send them as PDF, link or WhatsApp."
        actions={
          <>
            {can(me.role, "rates.edit") && <Link href="/admin/rates/" className="btn-admin-ghost"><Icon name="calculator" /> Rate card</Link>}
            <Link href="/admin/quotes/new/" className="btn-admin-primary"><Icon name="plus" /> New quote</Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Drafts" value={g.DRAFT?.count ?? 0} hint={`${compactRupees(g.DRAFT?.sum ?? 0)} not yet sent`} icon="edit" tone="slate" />
        <StatCard label="Awaiting reply" value={compactRupees(g.SENT?.sum ?? 0)} hint={`${g.SENT?.count ?? 0} quotes sent`} icon="clock" tone="indigo" />
        <StatCard label="Accepted" value={compactRupees(g.ACCEPTED?.sum ?? 0)} hint={`${g.ACCEPTED?.count ?? 0} quotes won`} icon="check" tone="emerald" />
        <StatCard label="Win rate" value={`${winRate}%`} hint={decided ? `of ${decided} decided quotes` : "No decisions yet"} icon="trend" tone="amber" />
      </div>

      <div className="panel mt-8 overflow-hidden">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <nav aria-label="Quote status" className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100/80 p-1">
            {filters.map((f) => (
              <Link key={f.id} href={f.id ? `/admin/quotes/?status=${f.id}` : "/admin/quotes/"} className={`admin-tab ${(valid ?? "") === f.id ? "admin-tab-active" : ""}`}>
                {f.label}
                <span className="text-xs text-slate-400 tabular-nums">{f.id ? g[f.id]?.count ?? 0 : allCount}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="admin-th">Customer</th>
                <th className="admin-th">Quote</th>
                <th className="admin-th">Trip</th>
                <th className="admin-th text-right">Total</th>
                <th className="admin-th">Valid until</th>
                <th className="admin-th">Status</th>
                <th className="admin-th text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.map((q) => {
                const expired = q.validUntil < today && (q.status === "SENT" || q.status === "DRAFT");
                return (
                  <tr key={q.id} className="admin-row group relative">
                    <td className="admin-td">
                      <Link href={`/admin/quotes/${q.id}/`} className="flex items-center gap-3 after:absolute after:inset-0">
                        <Avatar name={q.customerName} size="sm" />
                        <span className="font-medium text-slate-900 group-hover:text-forest-700">{q.customerName}</span>
                      </Link>
                    </td>
                    <td className="admin-td">
                      <span className="block font-mono text-xs text-slate-700">{q.number}</span>
                      {q.enquiry && <span className="block text-xs text-slate-500">Lead {q.enquiry.ref}</span>}
                    </td>
                    <td className="admin-td max-w-72"><span className="block truncate text-slate-700">{q.title}</span></td>
                    <td className="admin-td text-right font-semibold text-slate-900 tabular-nums">{rupees(q.total)}</td>
                    <td className="admin-td whitespace-nowrap">
                      <span className={expired ? "font-medium text-rose-600" : "text-slate-600"}>{formatDate(q.validUntil)}</span>
                      {expired && <span className="block text-xs text-rose-500">Expired</span>}
                    </td>
                    <td className="admin-td"><StatusBadge status={q.status} /></td>
                    <td className="admin-td text-right whitespace-nowrap text-slate-500">{timeAgo(q.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {quotes.length === 0 && (
            <EmptyState
              icon="quote"
              title="No quotes here yet"
              text="Open a lead and click “Create quote”, or start a blank quote."
              action={<Link href="/admin/quotes/new/" className="btn-admin-primary"><Icon name="plus" /> New quote</Link>}
            />
          )}
        </div>
      </div>
    </>
  );
}
