import Link from "next/link";
import { FareEstimator } from "@/components/FareEstimator";
import { FaqList } from "@/components/FaqList";
import { PageHero } from "@/components/PageHero";
import { originPath, origins } from "@/config/journeys";
import { getEstimatorRates } from "@/lib/rates";
import { pageMeta } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMeta({
  title: "How to Reach Uttarakhand — Airports, Railway Stations & Road Routes",
  description:
    "Which airport or railway station to choose for Nainital, Mussoorie, Rishikesh, Jim Corbett and Char Dham — with taxi fares from Delhi, Dehradun, Kathgodam and Haridwar.",
  path: "/how-to-reach-uttarakhand/",
});

const gateways = [
  {
    region: "Garhwal",
    for: "Rishikesh, Haridwar, Mussoorie, Dhanaulti, Auli, Char Dham",
    air: "Dehradun Airport (Jolly Grant) — 35 min to Rishikesh, ~2 hrs to Mussoorie",
    rail: "Haridwar, Dehradun and Rishikesh stations",
    road: "From Delhi NCR (5–7 hrs) or Chandigarh (4–5 hrs)",
  },
  {
    region: "Kumaon",
    for: "Nainital, Bhimtal, Mukteshwar, Almora, Kausani, Binsar, Munsiyari, Jim Corbett",
    air: "Pantnagar Airport — ~2 hrs to Nainital; or fly to Delhi and drive",
    rail: "Kathgodam station — about an hour to Nainital; Ramnagar for Jim Corbett",
    road: "From Delhi NCR (6–8 hrs) or Lucknow (overnight train is easier)",
  },
];

const faqs = [
  { q: "Which is the nearest airport to Nainital?", a: "Pantnagar Airport is about 65 km (around 2 hours) from Nainital. Many travellers fly to Delhi instead for more flight options and drive about 7–8 hours, or take a train to Kathgodam." },
  { q: "Which railway station is best for Mussoorie?", a: "Dehradun is the closest station — Mussoorie is about 35 km (1–1.5 hours) uphill. Haridwar is another option, about 3 hours away." },
  { q: "How do I reach Rishikesh from Delhi?", a: "By road it is about 240 km (around 6 hours). You can also take a train to Haridwar or Rishikesh, or fly to Dehradun Airport, which is about 35 minutes from Rishikesh." },
  { q: "Where does the Char Dham Yatra start?", a: "Most road itineraries start from Haridwar or Rishikesh. Travellers from far-off cities usually fly to Dehradun (Jolly Grant) or take a train to Haridwar." },
];

export default async function HowToReachPage() {
  const rates = await getEstimatorRates();
  return (
    <>
      <PageHero
        title="How to reach Uttarakhand"
        intro="Pick the right airport or railway station for where you're going — then let us meet you there with a car and an experienced hill driver."
        crumbs={[{ label: "How to reach", href: "/how-to-reach-uttarakhand/" }]}
        eyebrow="Plan your journey"
        scene="mountain"
      />
      <div className="container-page space-y-16 py-12">
        <section aria-labelledby="cities-title">
          <h2 id="cities-title" className="h2">Choose your city</h2>
          <p className="mt-2 text-slate-600">Trains, flights, drive times and fares for travellers from across India.</p>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {origins.map((o) => (
              <li key={o.slug}>
                <Link href={originPath(o)} className="card flex h-full flex-col p-4 transition-colors hover:border-forest-300 hover:bg-forest-50/40">
                  <span className="font-semibold text-forest-900">{o.city}</span>
                  <span className="mt-0.5 text-xs text-slate-500">{o.state}</span>
                  <span className="mt-auto pt-3 text-sm font-semibold text-forest-700">Plan from {o.city.split(" ")[0]} →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="gateways-title">
          <h2 id="gateways-title" className="h2">Two regions, two gateways</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {gateways.map((g) => (
              <div key={g.region} className="card p-6">
                <p className="eyebrow">{g.region}</p>
                <p className="mt-1 text-sm text-slate-600">{g.for}</p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div><dt className="font-semibold text-forest-900">By air</dt><dd className="text-slate-600">{g.air}</dd></div>
                  <div><dt className="font-semibold text-forest-900">By train</dt><dd className="text-slate-600">{g.rail}</dd></div>
                  <div><dt className="font-semibold text-forest-900">By road</dt><dd className="text-slate-600">{g.road}</dd></div>
                </dl>
              </div>
            ))}
          </div>
        </section>

        <section id="fare" aria-labelledby="fare-title" className="scroll-mt-24">
          <h2 id="fare-title" className="h2">Taxi fare from where you arrive</h2>
          <p className="mt-2 text-slate-600">Choose your airport, station or city to see approximate fares for every car.</p>
          <div className="card mt-6 max-w-3xl p-5 sm:p-6">
            <FareEstimator rates={rates} defaultFrom="kathgodam" defaultTo="nainital" idPrefix="reach" />
          </div>
        </section>

        <section aria-labelledby="faq-title">
          <h2 id="faq-title" className="h2">Common questions</h2>
          <div className="mt-6 max-w-3xl">
            <FaqList faqs={faqs} />
          </div>
        </section>
      </div>
    </>
  );
}
