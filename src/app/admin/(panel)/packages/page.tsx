import Link from "next/link";
import { SceneArt } from "@/components/SceneArt";
import { tripTypes } from "@/config/options";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { Badge, EmptyState, Icon, PageHeader, StatusBadge, timeAgo } from "../ui";

export default async function AdminPackagesPage() {
  await requireAdmin("content.edit");
  const packages = await db.package.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: { destinations: { select: { scene: true, name: true } } },
  });
  const published = packages.filter((p) => p.status === "PUBLISHED").length;

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Packages"
        subtitle={`${published} published of ${packages.length}. Pause a package to hide it instantly if it becomes unavailable or unsafe.`}
        actions={<Link href="/admin/packages/new/" className="btn-admin-primary"><Icon name="plus" /> New package</Link>}
      />
      {packages.length === 0 ? (
        <div className="panel"><EmptyState icon="package" title="No packages yet" action={<Link href="/admin/packages/new/" className="btn-admin-primary">Create package</Link>} /></div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {packages.map((p) => (
            <Link key={p.id} href={`/admin/packages/${p.id}/`} className="panel group flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative aspect-[16/7] overflow-hidden">
                <SceneArt scene={p.destinations[0]?.scene ?? (p.tripType === "PILGRIMAGE" ? "temple" : "mountain")} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <StatusBadge status={p.status} />
                  {p.featured && <Badge tone="amber" dot={false}>★ Featured</Badge>}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-medium text-forest-600">{tripTypes[p.tripType as keyof typeof tripTypes] ?? p.tripType} · {p.durationLabel}</p>
                <h2 className="mt-1 font-semibold text-slate-900 group-hover:text-forest-700">{p.title}</h2>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">{p.destinations.map((d) => d.name).join(", ") || "No destinations linked"}</p>
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="font-semibold text-slate-900">{formatPrice(p.startingPrice, p.currency) ?? <span className="font-normal text-slate-500">Price on request</span>}</span>
                  <span className="text-xs text-slate-400">Edited {timeAgo(p.updatedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
