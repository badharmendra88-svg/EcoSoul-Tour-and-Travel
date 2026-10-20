import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { enquiryKinds, serviceTypes, statusLabel, transportStatuses, tripStatuses } from "@/config/options";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

type Search = { kind?: string; status?: string; q?: string; page?: string };

const PAGE_SIZE = 50;

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim();

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

  const [leads, total, newCount, failedNotify] = await Promise.all([
    db.enquiry.findMany({ where, orderBy: { createdAt: "desc" }, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    db.enquiry.count({ where }),
    db.enquiry.count({ where: { status: "NEW" } }),
    db.enquiry.count({ where: { notifyStatus: "FAILED" } }),
  ]);

  const allStatuses = { ...tripStatuses, ...transportStatuses };
  const exportQuery = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "page") as [string, string][]).toString();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-600">
            {newCount} new · {total} matching
            {failedNotify > 0 && <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-red-800">{failedNotify} notification failures</span>}
          </p>
        </div>
        <a href={`/api/admin/export/?${exportQuery}`} className="btn-outline">Export CSV</a>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <label htmlFor="kind" className="label">Type</label>
          <select id="kind" name="kind" defaultValue={sp.kind ?? ""} className="input">
            <option value="">All types</option>
            {Object.entries(enquiryKinds).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="label">Status</label>
          <select id="status" name="status" defaultValue={sp.status ?? ""} className="input">
            <option value="">All except spam</option>
            {Object.entries(allStatuses).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
        </div>
        <div className="min-w-56 flex-1">
          <label htmlFor="q" className="label">Search</label>
          <input id="q" name="q" defaultValue={q} placeholder="ID, name, phone, email, place" className="input" />
        </div>
        <button className="btn-secondary">Filter</button>
        <Link href="/admin/" className="btn-outline">Reset</Link>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Trip</th>
              <th className="px-4 py-3">Travel date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDateTime(l.createdAt)}</td>
                <td className="px-4 py-3 font-mono">
                  <Link href={`/admin/leads/${l.id}/`} className="text-forest-700 hover:underline">{l.ref}</Link>
                </td>
                <td className="px-4 py-3">{enquiryKinds[l.kind as keyof typeof enquiryKinds] ?? l.kind}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{l.name}</div>
                  <div className="text-xs text-slate-500">{l.phone ?? l.email}</div>
                </td>
                <td className="max-w-64 truncate px-4 py-3 text-slate-700">
                  {l.kind === "TRANSPORT"
                    ? `${serviceTypes[l.serviceType as keyof typeof serviceTypes] ?? ""}: ${l.pickup ?? ""}${l.drop ? ` → ${l.drop}` : ""}`
                    : l.packageSlug ?? l.destination ?? (l.kind === "CONTACT" ? l.message?.slice(0, 60) : "—")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{l.travelDate ?? (l.dateFlexible ? "Flexible" : "—")}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${l.status === "NEW" ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-700"}`}>
                    {statusLabel(l.kind, l.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{l.assignedTo ?? "—"}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">No leads match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > PAGE_SIZE && (
        <div className="flex gap-2">
          {page > 1 && <Link className="btn-outline" href={`/admin/?${new URLSearchParams({ ...sp, page: String(page - 1) })}`}>← Newer</Link>}
          {page * PAGE_SIZE < total && <Link className="btn-outline" href={`/admin/?${new URLSearchParams({ ...sp, page: String(page + 1) })}`}>Older →</Link>}
        </div>
      )}
    </div>
  );
}
