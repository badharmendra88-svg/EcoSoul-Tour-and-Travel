import Link from "next/link";
import { routePages, routePath, shortName } from "@/config/journeys";

/** A table of taxi routes (from the route table), grouped under headings; unknown pairs are skipped. */
export function RouteTable({ groups, linkLabel = "Book →" }: { groups: { title: string; note?: string; pairs: [string, string][] }[]; linkLabel?: string }) {
  return (
    <div className="space-y-6">
      {groups.map((g) => {
        const rows = g.pairs.map(([a, b]) => routePages.find((r) => r.from.id === a && r.to.id === b)).filter((r) => r != null);
        if (rows.length === 0) return null;
        return (
          <div key={g.title}>
            <h3 className="font-semibold text-forest-900">{g.title}</h3>
            {g.note && <p className="mt-1 text-sm text-slate-600">{g.note}</p>}
            <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[440px] text-sm">
                <thead className="bg-slate-50 text-left text-xs tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Route</th>
                    <th className="px-4 py-2.5">Distance</th>
                    <th className="px-4 py-2.5">Drive time</th>
                    <th className="px-4 py-2.5"><span className="sr-only">Details</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => (
                    <tr key={r.slug}>
                      <td className="px-4 py-2.5 font-medium text-forest-900">{shortName(r.from)} → {shortName(r.to)}</td>
                      <td className="px-4 py-2.5 text-slate-600">{r.km} km</td>
                      <td className="px-4 py-2.5 text-slate-600">{r.time}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Link href={routePath(r)} className="font-semibold whitespace-nowrap text-forest-700 hover:underline">{linkLabel}</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
