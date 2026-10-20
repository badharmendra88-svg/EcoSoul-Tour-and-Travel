import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "../AdminFields";

export default async function AdminDestinationsPage() {
  await requireAdmin();
  const destinations = await db.destination.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  const staleBefore = Date.now() - 180 * 24 * 3600 * 1000;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Destinations</h1>
          <p className="text-sm text-slate-600">Re-check season, road and access notes regularly. Items not reviewed in 6 months are flagged.</p>
        </div>
        <Link href="/admin/destinations/new/" className="btn-secondary">New destination</Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last reviewed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {destinations.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/destinations/${d.id}/`} className="font-medium text-forest-700 hover:underline">{d.name}</Link>
                </td>
                <td className="px-4 py-3">{d.region}</td>
                <td className="px-4 py-3">{d.cluster}</td>
                <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                <td className={`px-4 py-3 ${d.reviewedAt.getTime() < staleBefore ? "font-medium text-red-700" : "text-slate-500"}`}>
                  {formatDate(d.reviewedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
