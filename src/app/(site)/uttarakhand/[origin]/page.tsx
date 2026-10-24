import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DestinationCard, PackageCard } from "@/components/Cards";
import { WhatsAppButton } from "@/components/ContactButtons";
import { FareEstimator } from "@/components/FareEstimator";
import { FaqList } from "@/components/FaqList";
import { TransportForm } from "@/components/forms/TransportForm";
import { PageHero } from "@/components/PageHero";
import { destinationsFrom, originBySlug, originPath, origins, placeById, routeBetween, seasons } from "@/config/journeys";
import { getPublishedDestinations, getPublishedPackages } from "@/lib/queries";
import { getEstimatorRates } from "@/lib/rates";
import { pageMeta } from "@/lib/seo";

// "Uttarakhand from <city>" landing pages for travellers across India.
// URL: /uttarakhand/from-delhi/ — the static /uttarakhand/* pages take precedence.

export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  return origins.map((o) => ({ origin: `from-${o.slug}` }));
}

function originFromParam(param: string) {
  return param.startsWith("from-") ? originBySlug(param.slice(5)) : undefined;
}

// Route-table ids that differ from destination slugs
const destinationSlug: Record<string, string> = { corbett: "jim-corbett" };

export async function generateMetadata({ params }: { params: Promise<{ origin: string }> }): Promise<Metadata> {
  const o = originFromParam((await params).origin);
  if (!o) return {};
  return pageMeta({
    title: `Uttarakhand Tour & Taxi from ${o.city} — How to Reach, Fares & Packages`,
    description: `${o.blurb} Instant taxi fare estimates, trains and flights from ${o.city}, and itemised quotes for Nainital, Mussoorie, Rishikesh and Char Dham.`,
    path: originPath(o),
  });
}

export default async function OriginPage({ params }: { params: Promise<{ origin: string }> }) {
  const o = originFromParam((await params).origin);
  if (!o) notFound();

  const [rates, destinations, packages] = await Promise.all([getEstimatorRates(), getPublishedDestinations(), getPublishedPackages({ featured: true })]);
  const start = placeById(o.startPlace)!;
  const startsAtHome = start.kind === "city";
  const picks = o.picks
    .map((id) => destinations.find((d) => d.slug === (destinationSlug[id] ?? id)))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
  const heroPhoto = picks.find((d) => d.imageUrl);
  const routes = destinationsFrom(o.startPlace).filter((r) => r.place.kind === "destination").slice(0, 8);
  const firstTo = o.picks.find((id) => routeBetween(o.startPlace, id)) ?? routes[0]?.to ?? "nainital";
  const modes = [
    { key: "road", title: startsAtHome ? "By road — door pickup" : "By road", text: o.road, icon: <RoadIcon /> },
    { key: "rail", title: "By train", text: o.rail, icon: <TrainIcon /> },
    { key: "air", title: "By air", text: o.air, icon: <PlaneIcon /> },
  ];
  if (!startsAtHome) modes.reverse();

  const faqs = [
    ...o.faqs,
    { q: "Is my booking confirmed when I send an enquiry?", a: "No. We check hotels and vehicles with local partners and send an itemised written quote. Your booking is confirmed once you accept it and pay the agreed advance." },
  ];

  return (
    <>
      <PageHero
        title={`Uttarakhand trips from ${o.city}`}
        intro={o.blurb}
        crumbs={[{ label: "How to reach", href: "/how-to-reach-uttarakhand/" }, { label: `From ${o.city}`, href: originPath(o) }]}
        eyebrow={`Travelling from ${o.city}`}
        imageUrl={heroPhoto?.imageUrl}
        imageAlt={heroPhoto?.imageAlt}
        scene="mountain"
      >
        <div className="flex flex-wrap gap-3">
          <a href="#fare" className="btn-primary px-6 py-3 text-base">Check taxi fare</a>
          <Link href={`/customise-my-trip/?from=${encodeURIComponent(o.city)}`} className={heroPhoto?.imageUrl ? "btn-ghost-light px-6 py-3 text-base" : "btn-outline px-6 py-3 text-base"}>
            Plan my trip
          </Link>
        </div>
      </PageHero>

      <div className="container-page space-y-16 py-12">
        {/* How to reach */}
        <section aria-labelledby="reach-title">
          <p className="eyebrow">Getting there</p>
          <h2 id="reach-title" className="h2 mt-2">How to reach Uttarakhand from {o.city}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {modes.map((m) => (
              <div key={m.key} className="card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700">{m.icon}</span>
                <h3 className="mt-3 font-semibold text-forest-900">{m.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{m.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">Train and flight options change by season — check IRCTC and airline sites for current schedules. Drive times are typical and depend on traffic and weather.</p>
        </section>

        {/* Fare estimator + routes */}
        <section id="fare" className="grid scroll-mt-24 gap-8 lg:grid-cols-[1.25fr_1fr]" aria-labelledby="fare-title">
          <div className="min-w-0">
            <p className="eyebrow">Instant estimate</p>
            <h2 id="fare-title" className="h2 mt-2">{startsAtHome ? `Taxi fare from ${o.city}` : `Taxi fare from ${start.name}`}</h2>
            <p className="mt-2 text-slate-600">
              {startsAtHome ? "Door-to-door with one driver for the whole trip." : `Most travellers from ${o.city} arrive at ${start.name}. We meet you there.`}
            </p>
            <div className="card mt-6 p-5 sm:p-6">
              <FareEstimator rates={rates} defaultFrom={o.startPlace} defaultTo={firstTo} idPrefix={`fare-${o.slug}`} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-forest-900">Popular routes from {start.name}</h3>
            <ul className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {routes.map((r) => (
                <li key={r.to}>
                  <Link
                    href={`/uttarakhand/taxi-booking/?pickup=${encodeURIComponent(start.name)}&drop=${encodeURIComponent(r.place.name)}#book`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-forest-50/50"
                  >
                    <span>
                      <span className="block font-medium text-forest-900">{r.place.name}</span>
                      <span className="block text-xs text-slate-500">≈ {r.km} km · {r.time}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-forest-700">Quote →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Destinations that suit this city */}
        {picks.length > 0 && (
          <section aria-labelledby="picks-title">
            <p className="eyebrow">Where to go</p>
            <h2 id="picks-title" className="h2 mt-2">Favourites with travellers from {o.city}</h2>
            <div className="snap-row mt-6 md:grid md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {picks.slice(0, 4).map((d) => (
                <DestinationCard key={d.id} d={d} />
              ))}
            </div>
          </section>
        )}

        {packages.length > 0 && (
          <section aria-labelledby="pkg-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Ready-made plans</p>
                <h2 id="pkg-title" className="h2 mt-2">Packages we customise for {o.city} travellers</h2>
              </div>
              <Link href="/uttarakhand/tour-packages/" className="py-2 font-semibold text-forest-700 hover:underline">All packages →</Link>
            </div>
            <div className="snap-row mt-6 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {packages.slice(0, 3).map((p) => (
                <PackageCard key={p.id} pkg={p} />
              ))}
            </div>
          </section>
        )}

        {/* When to travel */}
        <section aria-labelledby="when-title" className="rounded-3xl bg-sand p-6 sm:p-8">
          <p className="eyebrow">When to travel</p>
          <h2 id="when-title" className="h2 mt-2">Plan around your holidays</h2>
          <p className="mt-3 max-w-3xl text-slate-700">{o.holidays}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {seasons.map((s) => (
              <li key={s.months} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs font-semibold tracking-wide text-leaf-600 uppercase">{s.months}</p>
                <p className="mt-1 font-semibold text-forest-900">{s.title}</p>
                <p className="mt-1 text-xs text-slate-600">{s.places.map((id) => placeById(id)?.name.replace(/ \(.*\)/, "")).join(" · ")}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Book */}
        <section id="book" className="grid scroll-mt-24 gap-8 lg:grid-cols-[1fr_320px]" aria-labelledby="book-title">
          <div className="min-w-0">
            <h2 id="book-title" className="h2">Get a quote for your trip from {o.city}</h2>
            <p className="mt-2 text-slate-600">Takes about a minute. We reply with an itemised quote — nothing is booked until you accept it.</p>
            <div className="card mt-6 p-6 sm:p-8">
              <TransportForm initialPickup={startsAtHome ? start.name : ""} travellingFrom={o.city} />
            </div>
          </div>
          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <div className="card p-6">
              <h3 className="font-semibold text-forest-900">Need hotels too?</h3>
              <p className="mt-2 text-sm text-slate-600">Tell us your dates and budget — we plan hotels, transport and sightseeing in one quote.</p>
              <Link href={`/customise-my-trip/?from=${encodeURIComponent(o.city)}`} className="btn-primary mt-4 w-full">Plan a full trip</Link>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold text-forest-900">Prefer WhatsApp?</h3>
              <WhatsAppButton className="btn-secondary mt-3 w-full" message={`Hi EcoSoul, we're travelling from ${o.city} to Uttarakhand. Dates: ___ Travellers: ___`} />
            </div>
          </aside>
        </section>

        <section aria-labelledby="faq-title">
          <h2 id="faq-title" className="h2">Questions from {o.city} travellers</h2>
          <div className="mt-6">
            <FaqList faqs={faqs} />
          </div>
        </section>

        <nav aria-label="Other cities" className="border-t border-slate-200 pt-8">
          <h2 className="text-sm font-semibold text-forest-900">Travelling from somewhere else?</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {origins
              .filter((x) => x.slug !== o.slug)
              .map((x) => (
                <li key={x.slug}>
                  <Link href={originPath(x)} className="chip hover:bg-forest-100">From {x.city}</Link>
                </li>
              ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

function RoadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 17H3v-5l2-5h11l3 5h2v5h-2M9 17h6M5 12h15" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function TrainIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 11h14M9 21l1.5-4M15 21l-1.5-4" />
      <circle cx="9" cy="14" r="0.8" fill="currentColor" />
      <circle cx="15" cy="14" r="0.8" fill="currentColor" />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M10.5 13.5 3 11l1.5-1.5 7.5 1L16.5 6a2 2 0 0 1 3 3L15 13.5l1 7.5-1.5 1.5-2.5-7.5-3.5 3.5V21l-1.5 1-1-3-3-1 1-1.5h2.5l3.5-3.5Z" />
    </svg>
  );
}
