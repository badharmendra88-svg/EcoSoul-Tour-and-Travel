import Link from "next/link";
import { BookingSteps } from "@/components/BookingSteps";
import { DestinationCard, PackageCard } from "@/components/Cards";
import { PhoneButton, WhatsAppButton } from "@/components/ContactButtons";
import { FaqList } from "@/components/FaqList";
import { HeroBooking } from "@/components/HeroBooking";
import { SceneArt } from "@/components/SceneArt";
import { IconTile, MountainLayers, RidgeTop } from "@/components/Depth";
import { SitePhoto } from "@/components/SitePhoto";
import { originPath, origins, placeById, routeBySlug, routePath, seasons } from "@/config/journeys";
import { tripTypes } from "@/config/options";
import { site } from "@/config/site";
import { TravellerReviews } from "@/components/TravellerReviews";
import { getPublishedDestinations, getPublishedPackages } from "@/lib/queries";
import { getPublicEstimatorRates } from "@/lib/rates";
import { getSettings, type ServiceKey } from "@/lib/settings";
import { jsonLd, pageMeta } from "@/lib/seo";

// Google takes the site name shown above search results from WebSite markup on the homepage.
// Without it, a *.vercel.app site is labelled "Vercel".
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  alternateName: [site.shortName, "EcoSoul Travel"],
  url: `${site.url}/`,
};

export const revalidate = 300;

const homeTitle = `${site.name} — Tour Packages & Taxi Booking`;

export const metadata = {
  ...pageMeta({
    title: homeTitle,
    description:
      "Explore Uttarakhand your way: tour packages, custom itineraries, Char Dham planning, and taxi or driver booking from Delhi NCR, airports and stations. Written, itemised quotes before you pay.",
    path: "/",
  }),
  // Absolute: the brand is already in this title, so skip the "| EcoSoul" suffix
  title: { absolute: homeTitle },
};

// Homepage order:
// 1 Hero + booking widget (taxi fare / trip) · trust strip · 2 Choose your service ·
// 3 Travelling from your city · 4 Popular packages · 5 Taxi routes & driver booking ·
// 6 Season planner · 7 Why EcoSoul · 8 Destinations · 9 Reviews, FAQs & final CTA

const services: { title: string; photo: ServiceKey; text: string; href: string; cta: string; scene: string }[] = [
  { title: "Tour Packages", photo: "tours", text: "Curated Uttarakhand trips with day-wise itineraries and clear inclusions.", href: "/uttarakhand/tour-packages/", cta: "Explore packages", scene: "lake" },
  { title: "Hotels & Homestays", photo: "custom", text: "Request stays with local hotel, resort and homestay partners.", href: "/hotel-booking/", cta: "Find a Stay", scene: "meadow" },
  { title: "Book a Taxi", photo: "taxi", text: "Pickup/drop, local sightseeing, outstation travel and multi-day trips.", href: "/uttarakhand/taxi-booking/", cta: "Get Taxi Quote", scene: "mountain" },
  { title: "Book a Driver", photo: "driver", text: "An experienced hill driver for your own car — by route and trip duration.", href: "/uttarakhand/driver-booking/", cta: "Request a Driver", scene: "forest" },
  { title: "Custom Trip", photo: "custom", text: "Tell us your dates, pace and budget — we plan hotels, transport and sightseeing.", href: "/customise-my-trip/", cta: "Plan a Custom Trip", scene: "meadow" },
];

// Popular routes, each with its own fare page (/taxi/<from>-to-<to>/)
const routes = ["delhi-to-nainital", "delhi-to-rishikesh", "kathgodam-to-nainital", "dehradun-airport-to-mussoorie", "haridwar-to-sonprayag", "pantnagar-airport-to-jim-corbett"]
  .map((slug) => routeBySlug(slug)!)
  .map((r) => ({ from: r.from.name, to: r.to.name, href: routePath(r), km: r.km }));

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
  { title: "Uttarakhand specialists", icon: "m3 20 6-10 4 6 3-4 5 8H3Z", text: "We plan only Uttarakhand, so routes, timings and seasonal advice stay specific — wherever in India you start." },
  { title: "Written, itemised quotes", icon: "M9 12h6M9 16h6M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z", text: "Every quote lists what is included, what is not, and how the price is calculated." },
  { title: "Local partners", icon: "M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 19v-1a3 3 0 0 0-3-3M4 19v-1a3 3 0 0 1 3-3", text: "Hotels, homestays and taxi owners we work with directly — confirmed before you pay." },
  { title: "Honest advice", icon: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Zm-3 9 2 2 4-4", text: "We tell you about road, weather and crowd conditions, even when that means changing plans." },
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
  { q: "How quickly will you reply?", a: `Usually within ${site.replyTime} on WhatsApp or phone during working hours (${hours}). Enquiries sent at night are answered first thing the next morning.` },
];

export default async function HomePage() {
  const [featured, destinations, s, rates] = await Promise.all([
    getPublishedPackages({ featured: true }),
    getPublishedDestinations(),
    getSettings(),
    getPublicEstimatorRates(),
  ]);
  // The fare-estimate FAQ only makes sense while estimates are shown (Admin → Settings → Website prices)
  const faqs = homeFaqs(s.hours).filter((f) => s.showFares || !/fare estimate/i.test(f.q));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(websiteSchema)} />
      {/* 1 — Hero + booking widget */}
      <section className="relative overflow-hidden bg-forest-900">
        {s.heroImageUrl ? (
          <SitePhoto url={s.heroImageUrl} alt={s.heroImageAlt} sizes="100vw" priority className="hero-zoom absolute inset-0" />
        ) : (
          <SceneArt scene="snow" className="absolute inset-0 h-full w-full opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-900/90 via-forest-900/75 to-forest-900/60 lg:bg-gradient-to-r lg:from-forest-900/95 lg:via-forest-900/75 lg:to-forest-900/30" />
        {/* Decorative depth: soft sun glow behind the booking card */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 right-[8%] h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="container-page relative grid gap-8 pt-10 pb-24 sm:pt-16 sm:pb-36 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12 lg:pt-20 lg:pb-44">
          <div>
            <p className="tagline text-xl sm:text-2xl">Devbhoomi · Uttarakhand</p>
            <h1 className="mt-2 font-serif text-[2rem] leading-tight font-bold text-white sm:text-5xl">Explore Uttarakhand. Your Trip, Your Way.</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-forest-100 sm:mt-5 sm:text-lg">
              Lake towns, snow peaks and the Char Dham — with hotels, a car and an experienced hill driver from Delhi NCR, airports and stations.
              Tell us your dates and get a {s.showFares ? "fare estimate now and a " : ""}day-wise plan with an itemised quote on WhatsApp.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-forest-100 sm:mt-6" aria-label="Why book with us">
              {["Pickup from Delhi NCR & airports", "Local team in Nainital", `Reply within ${site.replyTime}`].map((t) => (
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
          {/* Booking card with stacked "cards" behind it for a 3D layered look */}
          <div className="relative lg:[perspective:1400px]">
            <div aria-hidden="true" className="absolute inset-x-6 top-3 -bottom-3 rounded-2xl bg-white/15 lg:inset-x-8 lg:-bottom-5" />
            <div aria-hidden="true" className="absolute inset-x-12 top-6 -bottom-6 rounded-2xl bg-white/10 lg:inset-x-16 lg:-bottom-10" />
            <div className="relative transition-transform duration-700 lg:[transform:rotateY(-5deg)_rotateX(2deg)] lg:hover:[transform:none]">
              <HeroBooking rates={rates} destinations={destinations.map((d) => d.name)} tripTypes={Object.values(tripTypes)} />
            </div>
          </div>
        </div>
        <MountainLayers fill="#ffffff" />
      </section>

      {/* Trust strip */}
      <section aria-label="Why travellers book with us" className="border-b border-slate-200 bg-white">
        <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-5 py-6 lg:grid-cols-4">
          {/* Without public fares (Admin → Settings → Website prices) the third promise is about quotes instead */}
          {(s.showFares ? trust : trust.map((t) => (t.title === "Instant fare estimate" ? { ...t, title: "Quick written quote", text: "Itemised fare for your car and dates" } : t))).map((t) => (
            <li key={t.title} className="flex items-start gap-3">
              <IconTile d={t.icon} />
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
        <div className="reveal mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 lg:grid-cols-3 xl:grid-cols-5">
          {services.map((sv) => (
            <article key={sv.title} data-tilt="7" className="card tilt group relative flex flex-col overflow-hidden">
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
      <section className="bg-topo relative bg-forest-800 py-12 text-white sm:py-14">
        <RidgeTop fill="var(--color-forest-800)" />
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest text-accent uppercase">Travelling from your city?</p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">Trains, flights and drive times from across India</h2>
            </div>
            <Link href="/how-to-reach-uttarakhand/" className="py-2 font-semibold text-accent hover:underline">How to reach Uttarakhand →</Link>
          </div>
          <ul className="reveal snap-row mt-6 md:grid md:grid-cols-5 md:gap-3">
            {origins.map((o) => (
              <li key={o.slug} className="!w-[44%] sm:!w-[30%] md:!w-auto">
                <Link href={originPath(o)} data-tilt="10" className="glass tilt relative flex h-full flex-col rounded-2xl p-4 ring-1 ring-white/15 transition-colors hover:bg-white/15">
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
        <section className="relative bg-sand py-12 sm:py-16">
          <RidgeTop fill="var(--color-sand)" />
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Popular tour packages</p>
                <h2 className="h2 mt-2">Popular Uttarakhand tour packages</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Ready-made plans you can change — choose your hotel category and car, and we send the final price for your dates.
                </p>
              </div>
              <Link href="/uttarakhand/tour-packages/" className="inline-block py-2 font-semibold text-forest-700 hover:underline">
                View all packages →
              </Link>
            </div>
            <div className="reveal snap-row mt-8 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3">
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
            <p className="mt-2 text-slate-600">{s.showFares ? "Distance, drive time and fares for every car — then book in a minute." : "Distance, drive time and the right car for your group — then book in a minute."}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {routes.map((r) => (
                <li key={r.from + r.to}>
                  <Link
                    href={r.href}
                    className="card flex items-center justify-between gap-3 px-4 py-3 hover:border-forest-300"
                  >
                    <span>
                      <span className="block font-medium text-forest-900">{r.from} → {r.to}</span>
                      <span className="block text-xs text-slate-500">{r.km} km</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-forest-700">{s.showFares ? "Fares" : "Book"} →</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/taxi/" className="mt-3 inline-block py-2 font-semibold text-forest-700 hover:underline">{s.showFares ? "All taxi routes & fares" : "All taxi routes"} →</Link>
            <h3 className="mt-8 text-lg font-semibold text-forest-900">How taxi and driver bookings are confirmed</h3>
            <BookingSteps className="mt-4" />
          </div>
          <aside className="space-y-5">
            <div className="bg-topo rounded-2xl bg-forest-800 p-6 text-white shadow-[0_24px_48px_-24px_rgb(3_41_26/0.6)]">
              <h3 className="text-lg font-semibold">{s.showFares ? "Clear fares, no surprises" : "Clear quotes, no surprises"}</h3>
              <dl className="mt-4 space-y-3 text-sm">
                {fareFacts.map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-medium text-white">{k}</dt>
                    <dd className="text-forest-100">{v}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/uttarakhand/taxi-booking/#fare" className="btn-primary mt-6 w-full">{s.showFares ? "Check Taxi Fare" : "Get a Taxi Quote"}</Link>
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
      <section className="relative bg-sand py-12 sm:py-16">
        <RidgeTop fill="var(--color-sand)" />
        <div className="container-page">
          <p className="eyebrow">When to go</p>
          <h2 className="h2 mt-2">Uttarakhand through the year</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Every season has its places. Peak weeks — summer holidays, Puja, Diwali and New Year — book out early.</p>
          <ol className="reveal snap-row mt-8 md:grid md:grid-cols-5 md:gap-4">
            {seasons.map((se) => (
              <li key={se.months} data-tilt="6" className="card tilt relative flex flex-col p-5">
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
        <div className="reveal mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {reasons.map((r, i) => (
            <div key={r.title} data-tilt="6" className="card tilt relative p-5 sm:p-6">
              <IconTile d={r.icon} className={i % 2 ? "icon-3d-accent" : ""} />
              <h3 className="mt-4 font-semibold text-forest-900">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.text}</p>
            </div>
          ))}
        </div>
        <h3 className="mt-12 text-xl font-semibold text-forest-900">How booking works</h3>
        <ol className="reveal relative mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
          {bookingStages.map((st, i) => (
            <li key={st.title} className="card relative flex gap-4 p-4 sm:block sm:p-5">
              <span className="coin-3d">{i + 1}</span>
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
      <section className="relative bg-sand py-12 sm:py-16">
        <RidgeTop fill="var(--color-sand)" />
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
          <div className="reveal snap-row mt-8 md:grid md:grid-cols-4 md:gap-4">
            {destinations.slice(0, 8).map((d) => (
              <DestinationCard key={d.id} d={d} />
            ))}
          </div>
        </div>
      </section>

      {/* 9 — Real reviews (only when published with permission), FAQs & final CTA */}
      <TravellerReviews className="container-page py-12 sm:py-16" />

      <section className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 className="h2 mt-2">Before you enquire</h2>
          <div className="mt-6">
            <FaqList faqs={faqs} />
          </div>
          <Link href="/faqs/" className="mt-2 inline-block py-2 font-semibold text-forest-700 hover:underline">More FAQs →</Link>
        </div>
        <aside className="bg-topo h-fit rounded-2xl bg-forest-800 p-6 text-white shadow-[0_24px_48px_-24px_rgb(3_41_26/0.6)]">
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
