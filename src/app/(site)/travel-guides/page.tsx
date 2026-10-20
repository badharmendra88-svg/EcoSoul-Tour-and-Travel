import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { getPublishedDestinations } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

// P1 section. Kept noindex until original, reviewed guides are published —
// the blueprint warns against thin placeholder pages.
export const metadata = pageMeta({
  title: "Uttarakhand Travel Guide",
  description: "Destination guides, route tips and seasonal advice for travelling in Uttarakhand.",
  path: "/travel-guides/",
  noindex: true,
});

const upcoming = [
  "Uttarakhand trip packing checklist by season",
  "Nainital or Mussoorie for a family trip?",
  "Kumaon road trip itinerary with realistic driving times",
  "How to reach Kedarnath and what to prepare",
  "Responsible travel in the Himalaya: waste, water and local etiquette",
];

export default async function TravelGuidesPage() {
  const destinations = await getPublishedDestinations();
  return (
    <>
      <PageHero
        title="Uttarakhand Travel Guide"
        intro="Practical guides written from local experience. Start with our destination guides below — more route and seasonal guides are on the way."
        crumbs={[{ label: "Travel Guide", href: "/travel-guides/" }]}
        scene="river"
      />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="h2">Destination guides</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
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
        <aside className="card h-fit p-6">
          <h2 className="font-semibold text-forest-900">Coming soon</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            {upcoming.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
