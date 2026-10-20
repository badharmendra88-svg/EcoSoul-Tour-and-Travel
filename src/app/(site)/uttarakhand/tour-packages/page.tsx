import Link from "next/link";
import { PackageCard } from "@/components/Cards";
import { PageHero } from "@/components/PageHero";
import { tripTypes } from "@/config/options";
import { getPublishedDestinations, getPublishedPackages } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Uttarakhand Tour Packages — Family, Weekend & Pilgrimage Trips",
  description:
    "Compare Uttarakhand tour packages with day-wise itineraries, clear inclusions and exclusions. Nainital, Mussoorie, Rishikesh, Kumaon, Jim Corbett and Char Dham.",
  path: "/uttarakhand/tour-packages/",
});

const durations = {
  short: { label: "1–3 days", min: 1, max: 3 },
  medium: { label: "4–6 days", min: 4, max: 6 },
  long: { label: "7+ days", min: 7, max: undefined },
} as const;

type Search = { destination?: string; type?: string; duration?: string };

export default async function PackagesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const dur = durations[sp.duration as keyof typeof durations];
  const [packages, destinations] = await Promise.all([
    getPublishedPackages({
      destination: sp.destination || undefined,
      tripType: sp.type && sp.type in tripTypes ? sp.type : undefined,
      minDays: dur?.min,
      maxDays: dur?.max,
    }),
    getPublishedDestinations(),
  ]);
  const hasFilters = Boolean(sp.destination || sp.type || sp.duration);

  return (
    <>
      <PageHero
        title="Uttarakhand Tour Packages"
        intro="Curated trips with day-wise plans and transparent inclusions. Every package can be adjusted — dates, hotels, pace and route."
        crumbs={[{ label: "Tour Packages", href: "/uttarakhand/tour-packages/" }]}
        scene="lake"
      />

      <section className="container-page py-10">
        {/* GET form: filters work without JavaScript and keep shareable URLs */}
        <form method="get" className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end" aria-label="Filter packages">
          <div>
            <label htmlFor="f-destination" className="label">Destination</label>
            <select id="f-destination" name="destination" defaultValue={sp.destination ?? ""} className="input">
              <option value="">All destinations</option>
              {destinations.map((d) => (
                <option key={d.slug} value={d.slug}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-type" className="label">Trip type</label>
            <select id="f-type" name="type" defaultValue={sp.type ?? ""} className="input">
              <option value="">All types</option>
              {Object.entries(tripTypes).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-duration" className="label">Duration</label>
            <select id="f-duration" name="duration" defaultValue={sp.duration ?? ""} className="input">
              <option value="">Any duration</option>
              {Object.entries(durations).map(([id, d]) => (
                <option key={id} value={id}>{d.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-secondary">Apply</button>
            {hasFilters && (
              <Link href="/uttarakhand/tour-packages/" className="btn-outline">Clear</Link>
            )}
          </div>
        </form>

        <p className="mt-6 text-sm text-slate-500" aria-live="polite">
          {packages.length} package{packages.length === 1 ? "" : "s"} found
        </p>

        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </div>

        {packages.length === 0 && (
          <div className="card mt-6 p-8 text-center">
            <p className="text-slate-700">No packages match these filters yet — but we can plan one for you.</p>
            <Link href="/customise-my-trip/" className="btn-primary mt-4">Customise My Trip</Link>
          </div>
        )}

        <p className="mt-10 max-w-3xl text-sm text-slate-500">
          Prices are quoted after we confirm dates, hotel category and vehicle. Each quote states the price basis (per person, per
          couple or per vehicle), inclusions, exclusions and validity.
        </p>
      </section>
    </>
  );
}
