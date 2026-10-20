import Link from "next/link";
import { BookingSteps } from "@/components/BookingSteps";
import { DestinationCard, PackageCard } from "@/components/Cards";
import { PhoneButton, WhatsAppButton } from "@/components/ContactButtons";
import { FaqList } from "@/components/FaqList";
import { SceneArt } from "@/components/SceneArt";
import { SitePhoto } from "@/components/SitePhoto";
import { tripTypes } from "@/config/options";
import { site } from "@/config/site";
import { db } from "@/lib/db";
import { getPublishedDestinations, getPublishedPackages } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";

export const revalidate = 300;

export const metadata = pageMeta({
  title: `${site.name} — Uttarakhand Tour Packages, Taxi & Driver Booking`,
  description:
    "Explore Uttarakhand your way: tour packages, custom itineraries, Char Dham planning, and taxi or driver booking with local partners. Written quotes before you confirm.",
  path: "/",
});

// Review §6 — homepage order:
// 1 Hero + quick enquiry · 2 Choose your service · 3 Popular packages ·
// 4 Taxi routes & driver booking · 5 Why EcoSoul · 6 Destinations & guides ·
// 7 Reviews, FAQs & final CTA

const services = [
  { title: "Tour Packages", text: "Curated Uttarakhand trips with day-wise itineraries and clear inclusions.", href: "/uttarakhand/tour-packages/", cta: "Explore packages", scene: "lake" },
  { title: "Book a Taxi", text: "Pickup/drop, local sightseeing, outstation travel and multi-day trips.", href: "/uttarakhand/taxi-booking/", cta: "Get Taxi Quote", scene: "mountain" },
  { title: "Book a Driver", text: "An experienced hill driver for your own car — by route and trip duration.", href: "/uttarakhand/driver-booking/", cta: "Request a Driver", scene: "forest" },
  { title: "Custom Trip", text: "Tell us your dates, pace and budget — we plan hotels, transport and sightseeing.", href: "/customise-my-trip/", cta: "Plan a Custom Trip", scene: "meadow" },
];

const routes = [
  { from: "Kathgodam Station", to: "Nainital", href: "/uttarakhand/airport-transfers/" },
  { from: "Haldwani", to: "Almora", href: "/uttarakhand/haldwani-taxi-service/" },
  { from: "Dehradun Airport", to: "Mussoorie", href: "/uttarakhand/airport-transfers/" },
  { from: "Haridwar", to: "Rishikesh", href: "/uttarakhand/taxi-booking/" },
  { from: "Pantnagar Airport", to: "Jim Corbett", href: "/uttarakhand/airport-transfers/" },
  { from: "Dehradun", to: "Kedarnath route (Sonprayag)", href: "/uttarakhand/taxi-booking/" },
];

const fareFacts = [
  ["Included in every taxi quote", "Vehicle, fuel, driver and the km/hours stated"],
  ["Driver allowance & night halts", "Listed as separate lines when they apply"],
  ["Tolls, parking & state taxes", "Shown as an estimate or “at actuals” — never hidden"],
  ["Waiting, extra km & late night", "Rates written in the quote before you confirm"],
];

const bookingStages = [
  { title: "Enquiry", text: "Share your plan online, on WhatsApp or by phone." },
  { title: "Availability check", text: "We confirm hotels, vehicles and drivers with partners." },
  { title: "Written quote", text: "Itemised price, inclusions, exclusions and validity." },
  { title: "Confirm & advance", text: "Accept the terms and pay the agreed advance." },
  { title: "Travel with support", text: "Final itinerary, driver details and a support number." },
];

const reasons = [
  { title: "Uttarakhand only", text: "We focus on one state, so routes, timings and seasonal advice stay specific." },
  { title: "Written, itemised quotes", text: "Every quote lists what is included, what is not, and how the price is calculated." },
  { title: "Local partners", text: "Hotels, homestays and taxi owners we work with directly — confirmed before you pay." },
  { title: "Honest advice", text: "We tell you about road, weather and crowd conditions, even when that means changing plans." },
];

const homeFaqs = (hours: string) => [
  { q: "Is submitting an enquiry a confirmed booking?", a: "No. An enquiry lets us check availability and prepare a written quote. Your booking is confirmed only after you accept the quote, agree to the booking terms and pay any agreed advance, and we confirm the hotel and vehicle." },
  { q: "Why don't packages show a fixed price?", a: "Prices depend on your travel dates, hotel category, vehicle and group size. Instead of showing a misleading number, we send an itemised written quote for your exact trip." },
  { q: "Can I book only a taxi or only a driver?", a: "Yes. You can request a car with driver for outstation trips, local sightseeing, one-way or round trips, airport and railway transfers, or a driver for your own vehicle." },
  { q: "Do you handle Char Dham yatra registration?", a: "Yatra registration is completed by travellers on the official government portal. We help with route planning, stays and transport, and remind you about current requirements." },
  { q: "How quickly will you reply?", a: `We aim to respond during working hours (${hours}). For urgent travel, WhatsApp or call us.` },
];

export default async function HomePage() {
  const [featured, destinations, s, reviews] = await Promise.all([
    getPublishedPackages({ featured: true }),
    getPublishedDestinations(),
    getSettings(),
    db.review.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 6 }),
  ]);
  const faqs = homeFaqs(s.hours);

  return (
    <>
      {/* 1 — Hero + quick enquiry */}
      <section className="relative overflow-hidden bg-forest-900">
        {s.heroImageUrl ? (
          <SitePhoto url={s.heroImageUrl} alt={s.heroImageAlt} sizes="100vw" priority className="absolute inset-0" />
        ) : (
          <SceneArt scene="snow" className="absolute inset-0 h-full w-full opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-forest-900/95 via-forest-900/75 to-forest-900/30" />
        <div className="container-page relative grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="tagline text-2xl">Devbhoomi · Uttarakhand</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight font-bold text-white sm:text-5xl">Explore Uttarakhand. Your Trip, Your Way.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-forest-100">
              Tour packages, taxi and driver booking with local partners, and itineraries customised around your dates, pace and
              budget — across Kumaon and Garhwal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/uttarakhand/tour-packages/" className="btn-primary px-6 py-3 text-base">Explore Tour Packages</Link>
              <Link href="/uttarakhand/taxi-booking/" className="btn-ghost-light px-6 py-3 text-base">Book a Taxi</Link>
              <Link href="/customise-my-trip/" className="inline-flex items-center px-2 py-3 font-semibold text-white underline underline-offset-4 hover:text-accent">
                Plan a Custom Trip →
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-forest-100" aria-label="Why book with us">
              {["Local travel partners", "Custom itineraries", "Booking confirmation before travel"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-accent">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick enquiry — 4 fields, plain GET so it works without JavaScript */}
          <form action="/customise-my-trip/" method="get" className="rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-forest-900">Quick trip enquiry</h2>
            <p className="mt-1 text-sm text-slate-600">Four details to start — we&apos;ll ask the rest.</p>
            <div className="mt-5 grid gap-4">
              <div>
                <label htmlFor="q-destination" className="label">Destination</label>
                <select id="q-destination" name="destination" className="input" defaultValue="">
                  <option value="">Not sure yet — suggest one</option>
                  {destinations.map((d) => (
                    <option key={d.slug}>{d.name}</option>
                  ))}
                  <option>Char Dham Yatra</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="q-date" className="label">Travel date</label>
                  <input id="q-date" name="date" type="date" className="input" />
                </div>
                <div>
                  <label htmlFor="q-adults" className="label">Travellers</label>
                  <input id="q-adults" name="adults" type="number" min={1} max={60} defaultValue={2} className="input" />
                </div>
              </div>
              <div>
                <label htmlFor="q-type" className="label">Trip type</label>
                <select id="q-type" name="interest" className="input" defaultValue="">
                  <option value="">Any</option>
                  {Object.values(tripTypes).map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full py-3">Continue</button>
              <p className="text-center text-xs text-slate-500">
                Need only a car? <Link href="/uttarakhand/taxi-booking/" className="font-semibold text-forest-700 underline">Get a taxi quote</Link>
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* 2 — Choose your travel service */}
      <section className="container-page py-16">
        <p className="eyebrow">Choose your travel service</p>
        <h2 className="h2 mt-2">How can we help you travel?</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((sv) => (
            <article key={sv.title} className="card group relative flex flex-col overflow-hidden">
              <SceneArt scene={sv.scene} className="h-32 w-full transition-transform duration-500 group-hover:scale-105" />
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold text-forest-900">
                  <Link href={sv.href} className="after:absolute after:inset-0">{sv.title}</Link>
                </h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">{sv.text}</p>
                <span className="mt-4 font-semibold text-forest-700 group-hover:underline" aria-hidden="true">{sv.cta} →</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3 — Popular tour packages */}
      {featured.length > 0 && (
        <section className="bg-sand py-16">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Popular tour packages</p>
                <h2 className="h2 mt-2">Uttarakhand trips travellers ask about</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Final prices depend on dates, hotel category, vehicle and group size — every quote is itemised and written.
                </p>
              </div>
              <Link href="/uttarakhand/tour-packages/" className="inline-block py-2 font-semibold text-forest-700 hover:underline">
                View all packages →
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 6).map((p) => (
                <PackageCard key={p.id} pkg={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4 — Popular taxi routes & driver booking */}
      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="eyebrow">Taxi & driver</p>
            <h2 className="h2 mt-2">Popular taxi routes</h2>
            <p className="mt-2 text-slate-600">Pick a route to request a quote — pickup and drop are filled in for you.</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {routes.map((r) => (
                <li key={r.from + r.to}>
                  <Link
                    href={`${r.href}?pickup=${encodeURIComponent(r.from)}&drop=${encodeURIComponent(r.to)}#book`}
                    className="card flex items-center justify-between gap-3 px-4 py-3 hover:border-forest-300"
                  >
                    <span className="font-medium text-forest-900">{r.from} → {r.to}</span>
                    <span className="shrink-0 text-sm font-semibold text-forest-700">Quote →</span>
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-10 text-lg font-semibold text-forest-900">How taxi and driver bookings are confirmed</h3>
            <BookingSteps className="mt-4" />
          </div>
          <aside className="space-y-5">
            <div className="rounded-2xl bg-forest-800 p-6 text-white">
              <h3 className="text-lg font-semibold">Clear fares, no surprises</h3>
              <dl className="mt-4 space-y-3 text-sm">
                {fareFacts.map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-medium text-white">{k}</dt>
                    <dd className="text-forest-100">{v}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/uttarakhand/taxi-booking/" className="btn-primary mt-6 w-full">Get Taxi Quote</Link>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold text-forest-900">Driving your own car?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Book an experienced hill driver for your vehicle — tell us the route, number of days and whether it&apos;s manual or automatic.
              </p>
              <Link href="/uttarakhand/driver-booking/" className="btn-outline mt-4 w-full">Request a Driver</Link>
            </div>
          </aside>
        </div>
      </section>

      {/* 5 — Why EcoSoul + how booking works */}
      <section className="bg-sand py-16">
        <div className="container-page">
          <p className="eyebrow">Why travel with EcoSoul</p>
          <h2 className="h2 mt-2">Planned locally, explained clearly</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((r) => (
              <div key={r.title} className="card p-6">
                <h3 className="font-semibold text-forest-900">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.text}</p>
              </div>
            ))}
          </div>
          <h3 className="mt-12 text-xl font-semibold text-forest-900">How booking works</h3>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {bookingStages.map((st, i) => (
              <li key={st.title} className="rounded-2xl border border-forest-100 bg-white p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-700 text-sm font-bold text-white">{i + 1}</span>
                <h4 className="mt-3 font-semibold text-forest-900">{st.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{st.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-slate-600">
            Read our <Link href="/booking-policy/" className="font-medium text-forest-700 underline">Booking</Link>,{" "}
            <Link href="/cancellation-policy/" className="font-medium text-forest-700 underline">Cancellation & rescheduling</Link> and{" "}
            <Link href="/privacy-policy/" className="font-medium text-forest-700 underline">Privacy</Link> policies before you book.
          </p>
        </div>
      </section>

      {/* 6 — Destinations & travel guides */}
      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Destinations & travel guides</p>
            <h2 className="h2 mt-2">Where to go in Uttarakhand</h2>
          </div>
          <div className="flex gap-4">
            <Link href="/travel-guides/" className="inline-block py-2 font-semibold text-forest-700 hover:underline">Travel guides →</Link>
            <Link href="/destinations/" className="inline-block py-2 font-semibold text-forest-700 hover:underline">All destinations →</Link>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {destinations.slice(0, 8).map((d) => (
            <DestinationCard key={d.id} d={d} />
          ))}
        </div>
      </section>

      {/* 7 — Real reviews (only when published with permission), FAQs & final CTA */}
      {reviews.length > 0 && (
        <section className="bg-sand py-16">
          <div className="container-page">
            <p className="eyebrow">Traveller reviews</p>
            <h2 className="h2 mt-2">What our travellers say</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <figure key={r.id} className="card flex flex-col p-6">
                  {r.rating && (
                    <p className="text-amber-500" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}<span className="text-slate-300">{"★".repeat(5 - r.rating)}</span></p>
                  )}
                  <blockquote className="mt-3 flex-1 leading-relaxed text-slate-700">“{r.text}”</blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="font-semibold text-forest-900">{r.name}</span>
                    {r.place && <span className="text-slate-500">, {r.place}</span>}
                    {r.tripLabel && <span className="block text-xs text-slate-500">{r.tripLabel}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 className="h2 mt-2">Before you enquire</h2>
          <div className="mt-6">
            <FaqList faqs={faqs} />
          </div>
          <Link href="/faqs/" className="mt-2 inline-block py-2 font-semibold text-forest-700 hover:underline">More FAQs →</Link>
        </div>
        <aside className="h-fit rounded-2xl bg-forest-800 p-6 text-white">
          <h2 className="text-xl font-semibold">Ready to plan your trip?</h2>
          <p className="mt-2 text-sm text-forest-100">Tell us your dates and group — we reply with a written quote. {s.hours}.</p>
          <div className="mt-5 grid gap-3">
            <Link href="/customise-my-trip/" className="btn-primary w-full">Plan a Custom Trip</Link>
            <WhatsAppButton className="btn-ghost-light w-full" />
            <PhoneButton className="btn-ghost-light w-full" />
          </div>
        </aside>
      </section>
    </>
  );
}
