import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { enquiryKinds, serviceTypes, statusLabel, transportStatuses, tripStatuses } from "@/config/options";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { Avatar, EmptyState, Icon, PageHeader, StatCard, StatusBadge, compactRupees, timeAgo, type IconName } from "./ui";

type Search = { kind?: string; status?: string; q?: string; page?: string };

const PAGE_SIZE = 50;

const kindIcon: Record<string, IconName> = { TRIP: "sparkles", PACKAGE: "package", TRANSPORT: "car", CONTACT: "message" };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim();
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const where: Prisma.EnquiryWhereInput = {
    ...(sp.kind && sp.kind in enquiryKinds ? { kind: sp.kind } : {}),
    ...(sp.status ? { status: sp.status } : { status: { not: "SPAM" } }),
    ...(q
      ? {
          OR: [
            { ref: { contains: q } },
            { name: { contains: q } },
            { phone: { contains: q } },
            { email: { contains: q } },
            { destination: { contains: q } },
            { pickup: { contains: q } },
          ],
        }
      : {}),
  };

  const [leads, total, newCount, weekCount, byKind, openQuotes, accepted, sentCount, acceptedCount, failedNotify] = await Promise.all([
    db.enquiry.findMany({ where, orderBy: { createdAt: "desc" }, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    db.enquiry.count({ where }),
    db.enquiry.count({ where: { status: "NEW" } }),
    db.enquiry.count({ where: { createdAt: { gte: weekAgo }, status: { not: "SPAM" } } }),
    db.enquiry.groupBy({ by: ["kind"], where: { status: { not: "SPAM" } }, _count: true }),
    db.quote.aggregate({ where: { status: "SENT" }, _sum: { total: true }, _count: true }),
    db.quote.aggregate({ where: { status: "ACCEPTED", updatedAt: { gte: monthStart } }, _sum: { total: true }, _count: true }),
    db.quote.count({ where: { status: { in: ["SENT", "ACCEPTED", "DECLINED"] } } }),
    db.quote.count({ where: { status: "ACCEPTED" } }),
    db.enquiry.count({ where: { notifyStatus: "FAILED" } }),
  ]);

  const kindCounts = Object.fromEntries(byKind.map((k) => [k.kind, k._count]));
  const allCount = byKind.reduce((s, k) => s + k._count, 0);
  const conversion = sentCount ? Math.round((acceptedCount / sentCount) * 100) : 0;
  const allStatuses = { ...tripStatuses, ...transportStatuses };

  const link = (patch: Partial<Search>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, page: undefined, ...patch }).filter(([, v]) => v) as [string, string][]);
    const s = p.toString();
    return `/admin/${s ? `?${s}` : ""}`;
  };
  const exportQuery = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "page") as [string, string][]).toString();
  const hour = Number(new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        eyebrow={greeting}
        title="Leads dashboard"
        subtitle="Every enquiry from the website — trips, packages, taxis and contact messages — in one queue."
        actions={
          <>
            <a href={`/api/admin/export/?${exportQuery}`} className="btn-admin-ghost">
              <Icon name="download" /> Export CSV
            </a>
            <Link href="/admin/quotes/new/" className="btn-admin-primary">
              <Icon name="plus" /> New quote
            </Link>
          </>
        }
      />

      {failedNotify > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 px-5 py-3 text-sm text-rose-800 ring-1 ring-rose-100">
          <Icon name="bell" className="h-4 w-4" />
          {failedNotify} lead notification{failedNotify > 1 ? "s" : ""} failed — open the lead to retry.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="New leads" value={newCount} hint="Waiting for first response" icon="inbox" tone="amber" href={link({ status: "NEW", kind: undefined, q: undefined })} />
        <StatCard label="Last 7 days" value={weekCount} hint={`${allCount} total enquiries`} icon="trend" tone="forest" />
        <StatCard label="Open quotes" value={compactRupees(openQuotes._sum.total ?? 0)} hint={`${openQuotes._count} sent, awaiting reply`} icon="quote" tone="indigo" href="/admin/quotes/" />
        <StatCard label="Won this month" value={compactRupees(accepted._sum.total ?? 0)} hint={`${accepted._count} accepted · ${conversion}% quote win rate`} icon="check" tone="emerald" />
      </div>

      <div className="panel mt-8 overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5">
          <nav aria-label="Lead type" className="flex flex-wrap gap-1 rounded-xl bg-slate-100/80 p-1">
            <Link href={link({ kind: undefined })} className={`admin-tab ${!sp.kind ? "admin-tab-active" : ""}`}>
              All <span className="text-xs text-slate-400 tabular-nums">{allCount}</span>
            </Link>
            {Object.entries(enquiryKinds).map(([k, label]) => (
              <Link key={k} href={link({ kind: k })} className={`admin-tab ${sp.kind === k ? "admin-tab-active" : ""}`}>
                <Icon name={kindIcon[k]} className="h-3.5 w-3.5" /> {label} <span className="text-xs text-slate-400 tabular-nums">{kindCounts[k] ?? 0}</span>
              </Link>
            ))}
          </nav>
          <form method="get" className="flex flex-wrap items-center gap-2">
            <span className="sr-only">Filter leads</span>
            {sp.kind && <input type="hidden" name="kind" value={sp.kind} />}
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input name="q" defaultValue={q} placeholder="Search name, phone, ID, place…" className="admin-input w-72 pl-9" aria-label="Search leads" />
            </div>
            <select name="status" defaultValue={sp.status ?? ""} className="admin-input w-auto" aria-label="Status">
              <option value="">All statuses</option>
              {Object.entries(allStatuses).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
            <button className="btn-admin-primary">Apply</button>
            {(q || sp.status) && <Link href={link({ q: undefined, status: undefined })} className="btn-admin-ghost">Clear</Link>}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="admin-th">Customer</th>
                <th className="admin-th">Enquiry</th>
                <th className="admin-th">Trip details</th>
                <th className="admin-th">Travel date</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Owner</th>
                <th className="admin-th text-right">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((l) => (
                <tr key={l.id} className="admin-row group relative">
                  <td className="admin-td">
                    <Link href={`/admin/leads/${l.id}/`} className="flex items-center gap-3 after:absolute after:inset-0">
                      <Avatar name={l.name} size="sm" />
                      <span className="min-w-0">
                        <span className="block font-medium text-slate-900 group-hover:text-forest-700">{l.name}</span>
                        <span className="block truncate text-xs text-slate-500">{l.phone ?? l.email}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="admin-td">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Icon name={kindIcon[l.kind] ?? "inbox"} className="h-3.5 w-3.5" />
                      </span>
                      <span>
                        <span className="block font-mono text-xs whitespace-nowrap text-slate-500">{l.ref}</span>
                        <span className="block text-xs font-medium">{enquiryKinds[l.kind as keyof typeof enquiryKinds] ?? l.kind}</span>
                      </span>
                    </span>
                  </td>
                  <td className="admin-td max-w-72">
                    <span className="block truncate text-slate-700 first-letter:uppercase">
                      {l.kind === "TRANSPORT"
                        ? `${l.pickup ?? ""}${l.drop ? ` → ${l.drop}` : ""}`
                        : l.packageSlug?.replace(/-/g, " ") ?? l.destination ?? (l.kind === "CONTACT" ? l.message?.slice(0, 70) : "—")}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {l.kind === "TRANSPORT" ? serviceTypes[l.serviceType as keyof typeof serviceTypes] : l.adults ? `${l.adults + (l.children ?? 0)} travellers` : ""}
                    </span>
                  </td>
                  <td className="admin-td whitespace-nowrap text-slate-700">{l.travelDate ?? (l.dateFlexible ? "Flexible" : "—")}</td>
                  <td className="admin-td"><StatusBadge status={l.status} label={statusLabel(l.kind, l.status)} /></td>
                  <td className="admin-td text-slate-600">{l.assignedTo ?? <span className="text-slate-400">Unassigned</span>}</td>
                  <td className="admin-td text-right whitespace-nowrap text-slate-500">{timeAgo(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && (
            <EmptyState
              icon="inbox"
              title={q || sp.status || sp.kind ? "No leads match these filters" : "No enquiries yet"}
              text={q || sp.status || sp.kind ? "Try a different search or clear the filters." : "New enquiries from the website will appear here."}
            />
          )}
        </div>

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
            <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</span>
            <div className="flex gap-2">
              {page > 1 && <Link className="btn-admin-ghost py-1.5" href={link({ page: String(page - 1) })}>Newer</Link>}
              {page * PAGE_SIZE < total && <Link className="btn-admin-ghost py-1.5" href={link({ page: String(page + 1) })}>Older</Link>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
