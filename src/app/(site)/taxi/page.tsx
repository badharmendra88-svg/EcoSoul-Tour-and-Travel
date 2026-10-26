import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { places, routePages, routePath, shortName } from "@/config/journeys";
import { estimateFares } from "@/lib/fare-estimate";
import { rupees } from "@/lib/quote";
import { getEstimatorRates } from "@/lib/rates";
import { pageMeta } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMeta({
  title: "Uttarakhand Taxi Routes & Fares — Delhi, Dehradun, Kathgodam, Haridwar",
  description:
    "Distances, drive times and taxi fares for popular Uttarakhand routes: Delhi to Nainital, Dehradun to Mussoorie, Kathgodam to Nainital, Haridwar to Kedarnath route and more.",
  path: "/taxi/",
});

export default async function TaxiRoutesPage() {
  const rates = await getEstimatorRates();
  const from = (km: number) => Math.min(...estimateFares(km, "ONE_WAY", 1, rates).map((f) => f.low));
  // Group by starting point, in the order places are listed (cities, then hubs, then destinations)
  const groups = places
    .map((p) => ({ place: p, routes: routePages.filter((r) => r.from.id === p.id) }))
    .filter((g) => g.routes.length > 0);

  return (
    <>
      <PageHero
        title="Taxi routes & fares"
        intro="Distance, drive time and an approximate one-way fare for every route we run — open a route for round-trip fares and booking."
        crumbs={[{ label: "Taxi routes", href: "/taxi/" }]}
        eyebrow="Car, taxi & driver"
        scene="mountain"
      />
      <div className="container-page space-y-10 py-12">
        <nav aria-label="Starting points" className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <a key={g.place.id} href={`#from-${g.place.id}`} className="chip hover:bg-forest-100">From {shortName(g.place)}</a>
          ))}
        </nav>
        {groups.map((g) => (
          <section key={g.place.id} id={`from-${g.place.id}`} aria-labelledby={`h-${g.place.id}`} className="scroll-mt-24">
            <h2 id={`h-${g.place.id}`} className="h2">Taxi from {g.place.name}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.routes.map((r) => (
                <li key={r.slug}>
                  <Link href={routePath(r)} className="card flex h-full items-center justify-between gap-3 p-4 hover:border-forest-300">
                    <span className="min-w-0">
                      <span className="block font-semibold text-forest-900">{shortName(r.from)} to {shortName(r.to)}</span>
                      <span className="block text-xs text-slate-500">{r.km} km · {r.time}</span>
                    </span>
                    <span className="shrink-0 text-right text-sm">
                      <span className="block text-xs text-slate-500">from</span>
                      <span className="font-semibold text-forest-800">{rupees(from(r.km))}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="text-xs text-slate-500">
          One-way fares include fuel, driver allowance, service charges and GST; tolls, parking and state entry tax are extra. Distances and drive
          times are typical and depend on traffic and weather.
        </p>
      </div>
    </>
  );
}
