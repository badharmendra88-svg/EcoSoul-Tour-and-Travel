import Link from "next/link";
import { tripTypes } from "@/config/options";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatDateTime, formatPrice } from "@/lib/format";
import { StatusBadge } from "../AdminFields";

export default async function AdminPackagesPage() {
  await requireAdmin();
  const packages = await db.package.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Packages</h1>
          <p className="text-sm text-slate-600">Pause a package to hide it immediately if it becomes unavailable or unsafe.</p>
        </div>
        <Link href="/admin/packages/new/" className="btn-secondary">New package</Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {packages.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/packages/${p.id}/`} className="font-medium text-forest-700 hover:underline">{p.title}</Link>
                  {p.featured && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900">Featured</span>}
                </td>
                <td className="px-4 py-3">{tripTypes[p.tripType as keyof typeof tripTypes] ?? p.tripType}</td>
                <td className="px-4 py-3">{p.durationLabel}</td>
                <td className="px-4 py-3">{formatPrice(p.startingPrice, p.currency) ?? "On request"}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3 text-slate-500">{formatDateTime(p.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

