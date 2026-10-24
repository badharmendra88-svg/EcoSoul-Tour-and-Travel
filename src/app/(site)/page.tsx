import Link from "next/link";
import { BookingSteps } from "@/components/BookingSteps";
import { DestinationCard, PackageCard } from "@/components/Cards";
import { PhoneButton, WhatsAppButton } from "@/components/ContactButtons";
import { FaqList } from "@/components/FaqList";
import { HeroBooking } from "@/components/HeroBooking";
import { SceneArt } from "@/components/SceneArt";
import { SitePhoto } from "@/components/SitePhoto";
import { originPath, origins, placeById, seasons } from "@/config/journeys";
import { tripTypes } from "@/config/options";
import { site } from "@/config/site";
import { db } from "@/lib/db";
import { getPublishedDestinations, getPublishedPackages } from "@/lib/queries";
import { getEstimatorRates } from "@/lib/rates";
import { getSettings, type ServiceKey } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";

export const revalidate = 300;

export const metadata = pageMeta({
  title: `${site.name} — Uttarakhand Tour Packages, Taxi & Driver Booking`,
  description:
    "Explore Uttarakhand your way: tour packages, custom itineraries, Char Dham planning, and taxi or driver booking from Delhi NCR, airports and stations. Instant fare estimates and written quotes.",
  path: "/",
});

// Homepage order:
// 1 Hero + booking widget (taxi fare / trip) · trust strip · 2 Choose your service ·
// 3 Travelling from your city · 4 Popular packages · 5 Taxi routes & driver booking ·
// 6 Season planner · 7 Why EcoSoul · 8 Destinations · 9 Reviews, FAQs & final CTA

const services: { title: string; photo: ServiceKey; text: string; href: string; cta: string; scene: string }[] = [
  { title: "Tour Packages", photo: "tours", text: "Curated Uttarakhand trips with day-wise itineraries and clear inclusions.", href: "/uttarakhand/tour-packages/", cta: "Explore packages", scene: "lake" },
  { title: "Book a Taxi", photo: "taxi", text: "Pickup/drop, local sightseeing, outstation travel and multi-day trips.", href: "/uttarakhand/taxi-booking/", cta: "Get Taxi Quote", scene: "mountain" },
  { title: "Book a Driver", photo: "driver", text: "An experienced hill driver for your own car — by route and trip duration.", href: "/uttarakhand/driver-booking/", cta: "Request a Driver", scene: "forest" },
  { title: "Custom Trip", photo: "custom", text: "Tell us your dates, pace and budget — we plan hotels, transport and sightseeing.", href: "/customise-my-trip/", cta: "Plan a Custom Trip", scene: "meadow" },
];

const routes = [
  { from: "Delhi / NCR", to: "Nainital", href: "/uttarakhand/taxi-booking/" },
  { from: "Delhi / NCR", to: "Rishikesh", href: "/uttarakhand/taxi-booking/" },
  { from: "Kathgodam Station", to: "Nainital", href: "/uttarakhand/airport-transfers/" },
  { from: "Dehradun Airport", to: "Mussoorie", href: "/uttarakhand/airport-transfers/" },
  { from: "Haridwar", to: "Kedarnath route (Sonprayag)", href: "/uttarakhand/taxi-booking/" },
  { from: "Pantnagar Airport", to: "Jim Corbett", href: "/uttarakhand/airport-transfers/" },
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
  { title: "Confirm & pay advance", text: "Accept the quote and pay the advance online by UPI or card." },
  { title: "Travel with support", text: "Final itinerary, driver details and a support number." },
];

const reasons = [
  { title: "Uttarakhand specialists", text: "We plan only Uttarakhand, so routes, timings and seasonal advice stay specific — wherever in India you start." },
  { title: "Written, itemised quotes", text: "Every quote lists what is included, what is not, and how the price is calculated." },
  { title: "Local partners", text: "Hotels, homestays and taxi owners we work with directly — confirmed before you pay." },
  { title: "Honest advice", text: "We tell you about road, weather and crowd conditions, even when that means changing plans." },
];

const trust = [
  { title: "Instant fare estimate", text: "See the price range before you enquire", icon: "M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
  { title: "Written, itemised quote", text: "No hidden tolls, taxes or extras", icon: "M9 12h6M9 16h6M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" },
  { title: "Pay advance after you accept", text: "Secure UPI / card payment", icon: "M4 11h16v10H4zM8 11V7a4 4 0 1 1 8 0v4" },
  { title: "Verified hill drivers", text: "Licence & experience checked", icon: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Zm-3 9 2 2 4-4" },
];

const homeFaqs = (hours: string) => [
  { q: "Is submitting an enquiry a confirmed booking?", a: "No. An enquiry lets us check availability and prepare a written quote. Your booking is confirmed only after you accept the quote, agree to the booking terms and pay any agreed advance, and we confirm the hotel and vehicle." },
  { q: "Can you pick us up from Delhi, an airport or a railway station?", a: "Yes. We pick up from anywhere in Delhi NCR, from Dehradun (Jolly Grant) and Pantnagar airports, and from Kathgodam, Haridwar and Dehradun stations. Share your arrival details and we'll plan around them." },
  { q: "How accurate is the instant fare estimate?", a: "It is calculated from our current rate card for a typical route distance, including driver allowance, service charges and GST. Tolls, parking and state entry tax are extra. Your written quote confirms the exact fare." },
  { q: "How do I pay the advance?", a: "Once you accept the quote, open the quote link and pay the advance online by UPI, card or net banking (or by UPI transfer). We confirm hotels and the vehicle after the advance is received." },
  { q: "Do you handle Char Dham yatra registration?", a: "Yatra registration is completed by travellers on the official government portal. We guide you through it and help with route planning, stays and transport." },
  { q: "How quickly will you reply?", a: `We aim to respond during working hours (${hours}). For urgent travel, WhatsApp or call us.` },
];

export default async function HomePage() {
  const [featured, destinations, s, reviews, rates] = await Promise.all([
    getPublishedPackages({ featured: true }),
    getPublishedDestinations(),
    getSettings(),
    db.review.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 6 }),
    getEstimatorRates(),
  ]);
  const faqs = homeFaqs(s.hours);

  return (
    <>
      {/* 1 — Hero + booking widget */}
      <section className="relative overflow-hidden bg-forest-900">
        {s.heroImageUrl ? (
          <SitePhoto url={s.heroImageUrl} alt={s.heroImageAlt} sizes="100vw" priority className="absolute inset-0" />
        ) : (
          <SceneArt scene="snow" className="absolute inset-0 h-full w-full opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-900/90 via-forest-900/75 to-forest-900/60 lg:bg-gradient-to-r lg:from-forest-900/95 lg:via-forest-900/75 lg:to-forest-900/30" />
        <div className="container-page relative grid gap-8 py-10 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12 lg:py-20">
          <div>
            <p className="tagline text-xl sm:text-2xl">Devbhoomi · Uttarakhand</p>
            <h1 className="mt-2 font-serif text-[2rem] leading-tight font-bold text-white sm:text-5xl">Explore Uttarakhand. Your Trip, Your Way.</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-forest-100 sm:mt-5 sm:text-lg">
              Tour packages, taxis and hill drivers from Delhi NCR, airports and railway stations — with instant fare estimates and itemised
              written quotes before you pay.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-forest-100 sm:mt-6" aria-label="Why book with us">
              {["Pickup from Delhi NCR & airports", "Local partners in Kumaon & Garhwal", "Pay advance online"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-accent">✓</span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 hidden flex-wrap gap-3 lg:flex">
              <Link href="/uttarakhand/tour-packages/" className="btn-primary px-6 py-3 text-base">Explore Tour Packages</Link>
              <Link href="/how-to-reach-uttarakhand/" className="btn-ghost-light px-6 py-3 text-base">How to reach</Link>
            </div>
          </div>
          <HeroBooking rates={rates} destinations={destinations.map((d) => d.name)} tripTypes={Object.values(tripTypes)} />
        </div>
      </section>

      {/* Trust strip */}
      <section aria-label="Why travellers book with us" className="border-b border-slate-200 bg-white">
        <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-5 py-6 lg:grid-cols-4">
          {trust.map((t) => (
            <li key={t.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={t.icon} />
                </svg>
              </span>
              <span>
                <span className="block text-sm font-semibold text-forest-900">{t.title}</span>
                <span className="block text-xs text-slate-500">{t.text}</span>
              </span>
            </li>
          ))}
        </ul>
        {(s.gstin || s.tourismRegNo || s.legalName) && (
          <p className="container-page border-t border-slate-100 py-3 text-center text-xs text-slate-500">
            {s.legalName || site.name}
            {s.gstin && <> · GSTIN {s.gstin}</>}
            {s.tourismRegNo && <> · Uttarakhand Tourism Reg. {s.tourismRegNo}</>}
          </p>
        )}
      </section>

      {/* 2 — Choose your travel service */}
      <section className="container-page py-12 sm:py-16">
        <p className="eyebrow">Choose your travel service</p>
        <h2 className="h2 mt-2">How can we help you travel?</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 lg:grid-cols-4">
          {services.map((sv) => (
            <article key={sv.title} className="card group relative flex flex-col overflow-hidden">
              <SitePhoto
                url={s.serviceImages[sv.photo].url}
                alt={s.serviceImages[sv.photo].alt}
                scene={sv.scene}
                sizes="(min-width: 1024px) 280px, 50vw"
                className="h-24 w-full sm:h-32"
                imgClassName="transition-transform duration-500 group-hover:scale-105"
              />
              <div className="flex flex-1 flex-col p-3.5 sm:p-5">
                <h3 className="font-semibold text-forest-900 sm:text-lg">
                  <Link href={sv.href} className="after:absolute after:inset-0">{sv.title}</Link>
                </h3>
                <p className="mt-1 line-clamp-3 flex-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">{sv.text}</p>
                <span className="mt-3 text-sm font-semibold text-forest-700 group-hover:underline sm:mt-4" aria-hidden="true">{sv.cta} →</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3 — Travelling from your city */}
      <section className="bg-forest-800 py-12 text-white sm:py-14">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest text-accent uppercase">Travelling from your city?</p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">Trains, flights, drive times & fares from across India</h2>
            </div>
            <Link href="/how-to-reach-uttarakhand/" className="py-2 font-semibold text-accent hover:underline">How to reach Uttarakhand →</Link>
          </div>
          <ul className="snap-row mt-6 md:grid md:grid-cols-5 md:gap-3">
            {origins.map((o) => (
              <li key={o.slug} className="!w-[44%] sm:!w-[30%] md:!w-auto">
                <Link href={originPath(o)} className="flex h-full flex-col rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 transition-colors hover:bg-white/15">
                  <span className="font-semibold">{o.city}</span>
                  <span className="mt-0.5 line-clamp-1 text-xs text-forest-100">{o.state}</span>
                  <span className="mt-3 text-sm font-semibold text-accent">Plan trip →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4 — Popular tour packages */}
      {featured.length > 0 && (
        <section className="bg-sand py-12 sm:py-16">
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
            <div className="snap-row mt-8 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {featured.slice(0, 6).map((p) => (
                <PackageCard key={p.id} pkg={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5 — Popular taxi routes & driver booking */}
      <section className="container-page py-12 sm:py-16">
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
              <Link href="/uttarakhand/taxi-booking/#fare" className="btn-primary mt-6 w-full">Check Taxi Fare</Link>
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

      {/* 6 — Season planner */}
      <section className="bg-sand py-12 sm:py-16">
        <div className="container-page">
          <p className="eyebrow">When to go</p>
          <h2 className="h2 mt-2">Uttarakhand through the year</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Every season has its places. Peak weeks — summer holidays, Puja, Diwali and New Year — book out early.</p>
          <ol className="snap-row mt-8 md:grid md:grid-cols-5 md:gap-4">
            {seasons.map((se) => (
              <li key={se.months} className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <p className="text-xs font-bold tracking-wide text-leaf-600 uppercase">{se.months}</p>
                <h3 className="mt-1 font-semibold text-forest-900">{se.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{se.text}</p>
                <ul className="mt-3 flex flex-wrap gap-1">
                  {se.places.map((id) => (
                    <li key={id} className="rounded-full bg-forest-50 px-2 py-0.5 text-[11px] font-medium text-forest-700">{placeById(id)?.name.replace(/ \(.*\)/, "")}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7 — Why EcoSoul + how booking works */}
      <section className="container-page py-12 sm:py-16">
        <p className="eyebrow">Why travel with EcoSoul</p>
        <h2 className="h2 mt-2">Planned locally, explained clearly</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {reasons.map((r) => (
            <div key={r.title} className="card p-5 sm:p-6">
              <h3 className="font-semibold text-forest-900">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.text}</p>
            </div>
          ))}
        </div>
        <h3 className="mt-12 text-xl font-semibold text-forest-900">How booking works</h3>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
          {bookingStages.map((st, i) => (
            <li key={st.title} className="flex gap-4 rounded-2xl border border-forest-100 bg-white p-4 sm:block sm:p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-700 text-sm font-bold text-white">{i + 1}</span>
              <div>
                <h4 className="font-semibold text-forest-900 sm:mt-3">{st.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{st.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-slate-600">
          Read our <Link href="/booking-policy/" className="font-medium text-forest-700 underline">Booking</Link>,{" "}
          <Link href="/cancellation-policy/" className="font-medium text-forest-700 underline">Cancellation & rescheduling</Link> and{" "}
          <Link href="/privacy-policy/" className="font-medium text-forest-700 underline">Privacy</Link> policies before you book.
        </p>
      </section>

      {/* 8 — Destinations & travel guides */}
      <section className="bg-sand py-12 sm:py-16">
        <div className="container-page">
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
          <div className="snap-row mt-8 md:grid md:grid-cols-4 md:gap-4">
            {destinations.slice(0, 8).map((d) => (
              <DestinationCard key={d.id} d={d} />
            ))}
          </div>
        </div>
      </section>

      {/* 9 — Real reviews (only when published with permission), FAQs & final CTA */}
      {reviews.length > 0 && (
        <section className="container-page py-12 sm:py-16">
          <p className="eyebrow">Traveller reviews</p>
          <h2 className="h2 mt-2">What our travellers say</h2>
          <div className="snap-row mt-8 md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-3">
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
        </section>
      )}

      <section className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.4fr_1fr]">
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
