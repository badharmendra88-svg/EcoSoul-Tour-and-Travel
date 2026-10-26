import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { guidePath, guides } from "@/config/guides";
import { getPublishedDestinations } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Uttarakhand Travel Guide — Best Time, Char Dham, Costs & Tips",
  description: "Practical Uttarakhand travel guides: the best time to visit, Char Dham and Kedarnath planning, trip costs, Nainital vs Mussoorie, packing lists and destination guides.",
  path: "/travel-guides/",
});

export default async function TravelGuidesPage() {
  const destinations = await getPublishedDestinations();
  return (
    <>
      <PageHero
        title="Uttarakhand Travel Guide"
        intro="Straight answers for planning your trip — when to go, how long you need, what it costs and what to carry — plus a guide to every destination we cover."
        crumbs={[{ label: "Travel Guide", href: "/travel-guides/" }]}
        scene="river"
      />
      <div className="container-page space-y-12 py-12">
        <section aria-labelledby="planning">
          <h2 id="planning" className="h2">Planning guides</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link href={guidePath(g)} className="card flex h-full flex-col p-5 transition-colors hover:border-forest-300">
                  <span className="text-xs font-semibold tracking-wide text-leaf-600 uppercase">{g.readMinutes} min read</span>
                  <span className="mt-1 font-semibold text-forest-900">{g.title}</span>
                  <span className="mt-2 line-clamp-3 text-sm text-slate-600">{g.description}</span>
                  <span className="mt-auto pt-3 text-sm font-semibold text-forest-700">Read guide →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="destinations">
          <h2 id="destinations" className="h2">Destination guides</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((d) => (
              <li key={d.slug}>
                <Link href={`/destinations/${d.slug}/`} className="card block p-4 hover:border-forest-300">
                  <span className="font-semibold text-forest-900">{d.name} travel guide</span>
                  <span className="mt-1 block text-sm text-slate-600">Best time, how to reach, things to do</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
