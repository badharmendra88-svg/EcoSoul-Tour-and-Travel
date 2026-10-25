import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { driverStatuses, partnerTypes } from "@/config/drivers";
import { vehicleCategories } from "@/config/options";
import { requireUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { expiringDocs } from "@/lib/driver-docs";
import { Avatar, Badge, EmptyState, Icon, PageHeader, StatCard, timeAgo } from "../ui";

type Search = { status?: string; q?: string };

const statusTone: Record<string, Parameters<typeof Badge>[0]["tone"]> = {
  APPLIED: "amber",
  UNDER_REVIEW: "sky",
  VERIFIED: "violet",
  ACTIVE: "emerald",
  INACTIVE: "slate",
  REJECTED: "rose",
};

export default async function DriversPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireUser("drivers.view");
  const sp = await searchParams;
  const q = sp.q?.trim();
  const status = sp.status && sp.status in driverStatuses ? sp.status : undefined;

  const where: Prisma.DriverPartnerWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? { OR: [{ name: { contains: q } }, { phone: { contains: q } }, { ref: { contains: q } }, { baseLocation: { contains: q } }, { vehicleRegNo: { contains: q.toUpperCase() } }] }
      : {}),
  };

  const [drivers, groups, operational] = await Promise.all([
    db.driverPartner.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 }),
    db.driverPartner.groupBy({ by: ["status"], _count: true }),
    db.driverPartner.findMany({
      where: { status: { in: ["VERIFIED", "ACTIVE"] } },
      select: { partnerType: true, licenceExpiry: true, insuranceExpiry: true, permitExpiry: true, fitnessExpiry: true, pucExpiry: true },
    }),
  ]);
  const count = Object.fromEntries(groups.map((g) => [g.status, g._count]));
  const total = groups.reduce((s, g) => s + g._count, 0);
  const expiring = operational.filter((d) => expiringDocs(d).length > 0).length;

  return (
    <>
      <PageHeader
        eyebrow="Partners"
        title="Driver partners"
        subtitle="Registrations from the website. Verify documents in person before activating a driver."
        actions={
          <a href="/join-as-driver/" target="_blank" rel="noopener" className="btn-admin-ghost">
            <Icon name="external" /> Registration page
          </a>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="New applications" value={count.APPLIED ?? 0} hint="Waiting for a first call" icon="inbox" tone="amber" href="/admin/drivers/?status=APPLIED" />
        <StatCard label="Under review" value={(count.UNDER_REVIEW ?? 0) + (count.VERIFIED ?? 0)} hint="Verification in progress" icon="clock" tone="sky" href="/admin/drivers/?status=UNDER_REVIEW" />
        <StatCard label="Active partners" value={count.ACTIVE ?? 0} hint="Can be offered trips" icon="check" tone="emerald" href="/admin/drivers/?status=ACTIVE" />
        <StatCard label="Documents expiring" value={expiring} hint="Within 30 days or expired" icon="bell" tone={expiring ? "rose" : "slate"} />
      </div>

      <div className="panel mt-8 overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5">
          <nav aria-label="Driver status" className="flex flex-wrap gap-1 rounded-xl bg-slate-100/80 p-1">
            <Link href="/admin/drivers/" className={`admin-tab ${!status ? "admin-tab-active" : ""}`}>
              All <span className="text-xs text-slate-400 tabular-nums">{total}</span>
            </Link>
            {Object.entries(driverStatuses).map(([k, l]) => (
              <Link key={k} href={`/admin/drivers/?status=${k}`} className={`admin-tab ${status === k ? "admin-tab-active" : ""}`}>
                {l} <span className="text-xs text-slate-400 tabular-nums">{count[k] ?? 0}</span>
              </Link>
            ))}
          </nav>
          <form method="get" className="flex flex-wrap items-center gap-2">
            {status && <input type="hidden" name="status" value={status} />}
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input name="q" defaultValue={q} placeholder="Name, phone, ID, town, vehicle no." className="admin-input w-72 pl-9" aria-label="Search drivers" />
            </div>
            <button className="btn-admin-primary">Search</button>
            {q && <Link href={status ? `/admin/drivers/?status=${status}` : "/admin/drivers/"} className="btn-admin-ghost">Clear</Link>}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="admin-th">Driver</th>
                <th className="admin-th">Partner type</th>
                <th className="admin-th">Areas</th>
                <th className="admin-th">Experience</th>
                <th className="admin-th">Documents</th>
                <th className="admin-th">Status</th>
                <th className="admin-th text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.map((d) => {
                const exp = expiringDocs(d);
                const vehicle = vehicleCategories.find((c) => c.id === d.vehicleCategory)?.name;
                return (
                  <tr key={d.id} className="admin-row group relative">
                    <td className="admin-td">
                      <Link href={`/admin/drivers/${d.id}/`} className="flex items-center gap-3 after:absolute after:inset-0">
                        <Avatar name={d.name} size="sm" />
                        <span className="min-w-0">
                          <span className="block font-medium text-slate-900 group-hover:text-forest-700">{d.name}</span>
                          <span className="block text-xs text-slate-500">{d.phone} · {d.baseLocation}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="admin-td">
                      <span className="block text-slate-700">{partnerTypes[d.partnerType as keyof typeof partnerTypes] ?? d.partnerType}</span>
                      {vehicle && <span className="block text-xs text-slate-500">{vehicle}{d.vehicleRegNo ? ` · ${d.vehicleRegNo}` : ""}</span>}
                    </td>
                    <td className="admin-td max-w-56"><span className="line-clamp-2 text-xs text-slate-600">{d.serviceAreas}</span></td>
                    <td className="admin-td whitespace-nowrap text-slate-700">
                      {d.experienceYears} yrs
                      {d.hillExperienceYears != null && <span className="block text-xs text-slate-500">{d.hillExperienceYears} yrs hills</span>}
                    </td>
                    <td className="admin-td">
                      {exp.length ? (
                        <Badge tone="rose">{exp.some((e) => (e.days ?? 0) < 0) ? "Expired" : "Expiring"}: {exp.map((e) => e.label).join(", ")}</Badge>
                      ) : (
                        <span className="text-xs text-slate-500">OK</span>
                      )}
                    </td>
                    <td className="admin-td">
                      <Badge tone={statusTone[d.status] ?? "slate"}>{driverStatuses[d.status as keyof typeof driverStatuses] ?? d.status}</Badge>
                    </td>
                    <td className="admin-td text-right whitespace-nowrap text-slate-500">{timeAgo(d.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {drivers.length === 0 && (
            <EmptyState
              icon="car"
              title={q || status ? "No drivers match" : "No driver registrations yet"}
              text={q || status ? "Try a different search or tab." : "Share the registration page with drivers and taxi owners you work with."}
            />
          )}
        </div>
      </div>
    </>
  );
}

