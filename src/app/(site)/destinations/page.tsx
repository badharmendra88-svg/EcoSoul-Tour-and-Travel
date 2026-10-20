import Link from "next/link";
import { DestinationCard } from "@/components/Cards";
import { PageHero } from "@/components/PageHero";
import { getPublishedDestinations } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Uttarakhand Destinations — Kumaon & Garhwal Travel Guide",
  description:
    "Explore Uttarakhand destinations by region and travel style: lake towns, hill stations, pilgrimage centres, wildlife parks and offbeat Kumaon.",
  path: "/destinations/",
});

export default async function DestinationsPage({ searchParams }: { searchParams: Promise<{ region?: string; cluster?: string }> }) {
  const { region, cluster } = await searchParams;
  const all = await getPublishedDestinations();
  const regions = [...new Set(all.map((d) => d.region))];
  const clusters = [...new Set(all.map((d) => d.cluster))];
  const list = all.filter((d) => (!region || d.region === region) && (!cluster || d.cluster === cluster));

  const filterHref = (next: { region?: string; cluster?: string }) => {
    const p = new URLSearchParams();
    if (next.region) p.set("region", next.region);
    if (next.cluster) p.set("cluster", next.cluster);
    const q = p.toString();
    return `/destinations/${q ? `?${q}` : ""}`;
  };

  const pill = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
      active ? "border-forest-700 bg-forest-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-forest-500"
    }`;

  return (
    <>
      <PageHero
        title="Uttarakhand Destinations"
        intro="From Kumaon's lake towns to Garhwal's river valleys and high meadows — choose a place, see when to go and how to get there, then ask us to plan it."
        crumbs={[{ label: "Destinations", href: "/destinations/" }]}
        scene="mountain"
      />
      <section className="container-page py-10">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by region">
            <span className="mr-1 text-sm font-medium text-slate-600">Region:</span>
            <Link href={filterHref({ cluster })} className={pill(!region)}>All</Link>
            {regions.map((r) => (
              <Link key={r} href={filterHref({ region: r, cluster })} className={pill(region === r)}>{r}</Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
            <span className="mr-1 text-sm font-medium text-slate-600">Category:</span>
            <Link href={filterHref({ region })} className={pill(!cluster)}>All</Link>
            {clusters.map((c) => (
              <Link key={c} href={filterHref({ region, cluster: c })} className={pill(cluster === c)}>{c}</Link>
            ))}
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-500" aria-live="polite">
          Showing {list.length} destination{list.length === 1 ? "" : "s"}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {list.map((d) => (
            <DestinationCard key={d.id} d={d} />
          ))}
        </div>
        {list.length === 0 && (
          <p className="mt-8 text-slate-600">
            No destinations match this filter. <Link href="/destinations/" className="font-medium text-forest-700 underline">Show all</Link>
          </p>
        )}
      </section>
    </>
  );
}
