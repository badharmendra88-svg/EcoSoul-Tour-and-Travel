import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WhatsAppButton } from "@/components/ContactButtons";
import { FareEstimator } from "@/components/FareEstimator";
import { FaqList } from "@/components/FaqList";
import { TransportForm } from "@/components/forms/TransportForm";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { destinationSlugFor, routeBySlug, routePages, routePath, shortName, type RoutePage } from "@/config/journeys";
import { site } from "@/config/site";
import { estimateFares, suggestedDays, type EstimatorRates } from "@/lib/fare-estimate";
import { parseList } from "@/lib/json";
import { rupees } from "@/lib/quote";
import { getPublishedDestinations } from "@/lib/queries";
import { getEstimatorRates } from "@/lib/rates";
import { pageMeta } from "@/lib/seo";

// "<From> to <To> taxi" landing pages — one per route in config/journeys.ts.
// Each page is built from that route's own data (distance, drive time, fares
// from the live rate card, destination guide), not a shared template text.

export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  return routePages.map((r) => ({ route: r.slug }));
}

function fareSummary(r: RoutePage, rates: EstimatorRates) {
  const days = suggestedDays(r.km);
  const oneWay = estimateFares(r.km, "ONE_WAY", 1, rates);
  const round = estimateFares(r.km, "ROUND_TRIP", days, rates);
  const rows = rates.vehicles.map((v) => ({
    vehicle: v,
    oneWay: oneWay.find((f) => f.vehicleId === v.id)!,
    round: round.find((f) => f.vehicleId === v.id)!,
  }));
  const cheapest = rows.reduce((a, b) => (b.oneWay.low < a.oneWay.low ? b : a), rows[0]);
  return { days, rows, cheapest };
}

export async function generateMetadata({ params }: { params: Promise<{ route: string }> }): Promise<Metadata> {
  const r = routeBySlug((await params).route);
  if (!r) return {};
  const [rates, destinations] = await Promise.all([getEstimatorRates(), getPublishedDestinations()]);
  const { cheapest } = fareSummary(r, rates);
  const dest = destinations.find((d) => d.slug === destinationSlugFor(r.to.id));
  const from = shortName(r.from);
  const to = shortName(r.to);
  return pageMeta({
    title: `${from} to ${to} Taxi — Fare from ${rupees(cheapest.oneWay.low)}, ${r.km} km (${r.time})`,
    description: `Book a ${from} to ${to} taxi with an experienced hill driver. About ${r.km} km, ${r.time} drive. One-way and round-trip fares for sedan, SUV and tempo traveller, with an itemised written quote.`,
    path: routePath(r),
    image: dest?.imageUrl,
    imageAlt: dest?.imageAlt,
  });
}

export default async function RoutePage({ params }: { params: Promise<{ route: string }> }) {
  const r = routeBySlug((await params).route);
  if (!r) notFound();

  const [rates, destinations] = await Promise.all([getEstimatorRates(), getPublishedDestinations()]);
  const { days, rows, cheapest } = fareSummary(r, rates);
  const from = shortName(r.from);
  const to = shortName(r.to);
  const dest = destinations.find((d) => d.slug === destinationSlugFor(r.to.id));
  const startsAtHome = r.from.kind === "city";
  const isArrival = r.from.kind === "hub" && /Airport|Station/.test(r.from.name);
  const sedan = rows.find((x) => x.vehicle.id === "SEDAN") ?? cheapest;
  const suv = rows.find((x) => x.vehicle.id === "SUV");
  const tempo = rows.find((x) => x.vehicle.id === "TEMPO");
  const range = (f: { low: number; high: number }) => `${rupees(f.low)}–${rupees(f.high).slice(1)}`;

  const fromSame = routePages.filter((x) => x.from.id === r.from.id && x.slug !== r.slug).slice(0, 8);
  const toSame = routePages.filter((x) => x.to.id === r.to.id && x.slug !== r.slug).slice(0, 6);

  const faqs = [
    { q: `How far is ${to} from ${from}?`, a: `${to} is about ${r.km} km from ${from} by road — usually a ${r.time} drive, depending on traffic, weather and stops.` },
    {
      q: `What is the taxi fare from ${from} to ${to}?`,
      a: `A one-way sedan costs about ${range(sedan.oneWay)}${suv ? `, an SUV about ${range(suv.oneWay)}` : ""}${tempo ? ` and a 12-seat tempo traveller about ${range(tempo.oneWay)}` : ""}. This includes fuel, driver allowance, service charges and GST; tolls, parking and state entry tax are extra. Your written quote confirms the exact fare.`,
    },
    // Answer from the actual numbers: with a daily minimum distance, short-stay round trips can cost more than two drops
    sedan.round.low < sedan.oneWay.low * 2
      ? {
          q: `Is a round trip cheaper than two one-way taxis?`,
          a: `On this route, yes. A ${days}-day round trip in a sedan costs about ${range(sedan.round)} with the same car and driver for sightseeing, against roughly ${rupees(sedan.oneWay.low * 2)} for two separate one-way drops.`,
        }
      : {
          q: `Should I book a round trip or two one-way taxis?`,
          a: `If you only need to get there and back, two one-way drops (about ${rupees(sedan.oneWay.low * 2)} in a sedan) usually cost less. A ${days}-day round trip (about ${range(sedan.round)}) keeps the same car and driver with you for sightseeing and day trips during your stay.`,
        },
    {
      q: `Which car is best for ${from} to ${to}?`,
      a:
        r.to.region === "Plains"
          ? "A sedan suits up to 4 people with medium luggage; choose an SUV for 5–6 people or extra bags."
          : "For hill roads, families with luggage are most comfortable in an SUV such as an Ertiga or Innova (or similar). A sedan is fine for up to 4 people travelling light; groups of 7–12 should book a tempo traveller.",
    },
    ...(dest ? [{ q: `When is the best time to visit ${to}?`, a: dest.bestTime }] : []),
    ...(isArrival
      ? [{ q: `Will the driver wait if my ${/Airport/.test(r.from.name) ? "flight" : "train"} is late?`, a: `Yes. Share your ${/Airport/.test(r.from.name) ? "flight" : "train"} number when you book and we track the arrival. Free waiting time and any charges after it are written in your quote.` }]
      : []),
  ];

  const experiences = dest ? parseList(dest.experiences).slice(0, 4) : [];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TaxiService",
          name: `${from} to ${to} taxi`,
          description: `Car with driver from ${r.from.name} to ${r.to.name}, about ${r.km} km.`,
          url: `${site.url}${routePath(r)}`,
          areaServed: [{ "@type": "Place", name: r.from.name }, { "@type": "Place", name: r.to.name }],
          provider: { "@type": "TravelAgency", name: site.name, url: site.url },
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            lowPrice: cheapest.oneWay.low,
            highPrice: Math.max(...rows.map((x) => x.oneWay.high)),
            offerCount: rows.length,
          },
        }}
      />
      <PageHero
        title={`${from} to ${to} Taxi`}
        intro={`${r.km} km · ${r.time} drive · one-way or round trip with an experienced ${r.to.region === "Plains" ? "" : "hill "}driver.`}
        crumbs={[{ label: "Taxi routes", href: "/taxi/" }, { label: `${from} to ${to}`, href: routePath(r) }]}
        eyebrow="Taxi route"
        imageUrl={dest?.imageUrl}
        imageAlt={dest?.imageAlt}
        scene={dest?.scene ?? "mountain"}
      >
        <div className="flex flex-wrap gap-3">
          <a href="#book" className="btn-primary px-6 py-3 text-base">Book this taxi</a>
          <a href="#fares" className={dest?.imageUrl ? "btn-ghost-light px-6 py-3 text-base" : "btn-outline px-6 py-3 text-base"}>See all fares</a>
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-12">
          {/* Quick answer — the facts search and AI assistants quote */}
          <section aria-labelledby="answer" className="rounded-2xl border border-forest-100 bg-forest-50/60 p-5 sm:p-6">
            <h2 id="answer" className="text-sm font-semibold tracking-wide text-forest-700 uppercase">Quick answer</h2>
            <p className="mt-2 leading-relaxed text-slate-800">
              <strong>{from} to {to}</strong> is about <strong>{r.km} km</strong> by road, a <strong>{r.time}</strong> drive. A one-way{" "}
              {sedan.vehicle.name.toLowerCase()} taxi costs about <strong>{range(sedan.oneWay)}</strong>
              {suv && <> and an SUV about <strong>{range(suv.oneWay)}</strong></>}, including fuel, driver allowance, service charges and GST.
              Tolls, parking and state entry tax are extra.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                ["Distance", `${r.km} km`],
                ["Drive time", r.time],
                ["Fare from", rupees(cheapest.oneWay.low)],
                ["Round trip", `${days} day${days > 1 ? "s" : ""} suggested`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white p-3 ring-1 ring-forest-100">
                  <dt className="text-xs text-slate-500">{k}</dt>
                  <dd className="font-semibold text-forest-900">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="fares" aria-labelledby="fares-title" className="scroll-mt-24">
            <h2 id="fares-title" className="h2">{from} to {to} taxi fare</h2>
            <p className="mt-2 text-slate-600">Approximate totals from our current rate card. Your written quote confirms the exact fare before you pay.</p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="bg-slate-50 text-left text-xs tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">Car</th>
                    <th className="px-4 py-3">Seats</th>
                    <th className="px-4 py-3">One way</th>
                    <th className="px-4 py-3">Round trip ({days} day{days > 1 ? "s" : ""})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((x) => (
                    <tr key={x.vehicle.id}>
                      <td className="px-4 py-3">
                        <span className="block font-semibold text-forest-900">{x.vehicle.name}</span>
                        <span className="block text-xs text-slate-500">{x.vehicle.example}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">Up to {x.vehicle.seats}</td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap text-forest-900">{range(x.oneWay)}</td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap text-forest-900">{range(x.round)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-500">Includes fuel, driver allowance{days > 1 ? ", night halts on round trips" : ""}, service charges and GST. Excludes tolls, parking and state entry tax.</p>
            <div className="card mt-6 p-5 sm:p-6">
              <h3 className="font-semibold text-forest-900">Change the route or trip type</h3>
              <div className="mt-4">
                <FareEstimator rates={rates} defaultFrom={r.from.id} defaultTo={r.to.id} idPrefix={`route-${r.slug}`} />
              </div>
            </div>
          </section>

          <section aria-labelledby="pickup-title">
            <h2 id="pickup-title" className="h2">Pickup and the drive</h2>
            <ul className="mt-4 space-y-3 text-slate-700">
              <li className="flex gap-3">
                <span aria-hidden="true" className="text-forest-600">✓</span>
                {startsAtHome
                  ? `Pickup from your home, hotel, office, airport or railway station anywhere in ${from}.`
                  : isArrival
                    ? `Your driver meets you at ${r.from.name}; you get the driver's name and number before the trip.`
                    : `Pickup from your hotel or any address in ${from}.`}
              </li>
              <li className="flex gap-3"><span aria-hidden="true" className="text-forest-600">✓</span>Typical drive: {r.time} for about {r.km} km, plus time for meal and photo stops.</li>
              {r.to.region !== "Plains" && (
                <li className="flex gap-3"><span aria-hidden="true" className="text-forest-600">✓</span>Hill roads are slower after dark and in the monsoon (July–August) — we plan daytime driving and keep buffer time.</li>
              )}
              <li className="flex gap-3"><span aria-hidden="true" className="text-forest-600">✓</span>The same driver stays with you on round trips, so sightseeing at {to} is included in the plan.</li>
            </ul>
          </section>

          {dest && (
            <section aria-labelledby="dest-title">
              <h2 id="dest-title" className="h2">About {dest.name}</h2>
              <p className="mt-3 leading-relaxed text-slate-700">{dest.summary}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="card p-5">
                  <h3 className="text-sm font-semibold tracking-wide text-forest-700 uppercase">Best time to visit</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{dest.bestTime}</p>
                </div>
                <div className="card p-5">
                  <h3 className="text-sm font-semibold tracking-wide text-forest-700 uppercase">Suggested stay</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{dest.suggestedDuration}</p>
                </div>
              </div>
              {experiences.length > 0 && (
                <ul className="mt-4 list-disc space-y-1 pl-5 text-slate-700">
                  {experiences.map((e) => <li key={e}>{e}</li>)}
                </ul>
              )}
              <Link href={`/destinations/${dest.slug}/`} className="mt-3 inline-block py-2 font-semibold text-forest-700 hover:underline">
                Full {dest.name} travel guide →
              </Link>
            </section>
          )}

          <section id="book" aria-labelledby="book-title" className="scroll-mt-24">
            <h2 id="book-title" className="h2">Book a {from} to {to} taxi</h2>
            <p className="mt-2 text-slate-600">Takes about a minute. We confirm the car and the exact fare in writing before anything is booked.</p>
            <div className="card mt-6 p-6 sm:p-8">
              <TransportForm defaultService="ONE_WAY" initialPickup={r.from.name} initialDrop={r.to.name} />
            </div>
          </section>

          <section aria-labelledby="faq-title">
            <h2 id="faq-title" className="h2">{from} to {to} taxi — FAQs</h2>
            <div className="mt-6">
              <FaqList faqs={faqs} />
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="font-semibold text-forest-900">Quick question?</h2>
            <p className="mt-2 text-sm text-slate-600">Send your date and number of travellers on WhatsApp.</p>
            <WhatsAppButton className="btn-secondary mt-4 w-full" message={`Hi EcoSoul, I need a taxi from ${from} to ${to}. Date: ___ Travellers: ___`} />
          </div>
          {fromSame.length > 0 && (
            <nav aria-label={`More routes from ${from}`} className="card p-6 text-sm">
              <h2 className="font-semibold text-forest-900">More taxis from {from}</h2>
              <ul className="mt-3 space-y-1">
                {fromSame.map((x) => (
                  <li key={x.slug}>
                    <Link href={routePath(x)} className="flex justify-between gap-3 py-1.5 text-forest-700 hover:underline">
                      <span>{from} to {shortName(x.to)}</span>
                      <span className="text-slate-400">{x.km} km</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {toSame.length > 0 && (
            <nav aria-label={`Other routes to ${to}`} className="card p-6 text-sm">
              <h2 className="font-semibold text-forest-900">Other ways to reach {to}</h2>
              <ul className="mt-3 space-y-1">
                {toSame.map((x) => (
                  <li key={x.slug}>
                    <Link href={routePath(x)} className="flex justify-between gap-3 py-1.5 text-forest-700 hover:underline">
                      <span>From {shortName(x.from)}</span>
                      <span className="text-slate-400">{x.km} km</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </div>
    </>
  );
}
