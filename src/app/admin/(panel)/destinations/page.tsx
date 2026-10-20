import Link from "next/link";
import { SceneArt } from "@/components/SceneArt";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { Badge, Icon, PageHeader, StatusBadge } from "../ui";

export default async function AdminDestinationsPage() {
  await requireAdmin();
  const destinations = await db.destination.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { packages: true } } },
  });
  const staleBefore = Date.now() - 180 * 24 * 3600 * 1000;
  const stale = destinations.filter((d) => d.reviewedAt.getTime() < staleBefore).length;

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Destinations"
        subtitle="Re-check season, road and access notes regularly. Items not reviewed in 6 months are flagged."
        actions={<Link href="/admin/destinations/new/" className="btn-admin-primary"><Icon name="plus" /> New destination</Link>}
      />
      {stale > 0 && (
        <p className="-mt-2 mb-6 flex items-center gap-2 rounded-2xl bg-amber-50 px-5 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
          <Icon name="clock" /> {stale} destination{stale > 1 ? "s need" : " needs"} a content review.
        </p>
      )}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="admin-th">Destination</th>
                <th className="admin-th">Region</th>
                <th className="admin-th">Category</th>
                <th className="admin-th">Packages</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Last reviewed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {destinations.map((d) => {
                const isStale = d.reviewedAt.getTime() < staleBefore;
                return (
                  <tr key={d.id} className="admin-row group relative">
                    <td className="admin-td">
                      <Link href={`/admin/destinations/${d.id}/`} className="flex items-center gap-3 after:absolute after:inset-0">
                        <span className="h-10 w-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-slate-900/5">
                          <SceneArt scene={d.scene} className="h-full w-full" />
                        </span>
                        <span>
                          <span className="block font-medium text-slate-900 group-hover:text-forest-700">{d.name}</span>
                          <span className="block max-w-xs truncate text-xs text-slate-500">{d.summary}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="admin-td"><Badge tone={d.region === "Kumaon" ? "sky" : "violet"} dot={false}>{d.region}</Badge></td>
                    <td className="admin-td text-slate-600">{d.cluster}</td>
                    <td className="admin-td text-slate-600 tabular-nums">{d._count.packages}</td>
                    <td className="admin-td"><StatusBadge status={d.status} /></td>
                    <td className="admin-td whitespace-nowrap">
                      <span className={isStale ? "font-medium text-amber-700" : "text-slate-500"}>{formatDate(d.reviewedAt)}</span>
                      {isStale && <span className="block text-xs text-amber-600">Review due</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
