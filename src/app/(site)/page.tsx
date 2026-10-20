import Link from "next/link";
import { DestinationCard, PackageCard } from "@/components/Cards";
import { PhoneButton, WhatsAppButton } from "@/components/ContactButtons";
import { FaqList } from "@/components/FaqList";
import { SceneArt } from "@/components/SceneArt";
import { tripTypes, serviceTypes } from "@/config/options";
import { site } from "@/config/site";
import { getPublishedDestinations, getPublishedPackages } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";

export const revalidate = 300;

export const metadata = pageMeta({
  title: `${site.name} — Uttarakhand Tour Packages, Taxi & Driver Booking`,
  description:
    "Plan Uttarakhand your way: curated tour packages, custom itineraries, Char Dham planning help and car + driver bookings. Transparent quotes, real local support.",
  path: "/",
});

const experiences = [
  { label: "Hill escapes", href: "/destinations/?cluster=Hill+stations", scene: "mountain", text: "Mussoorie, Ranikhet, Mukteshwar" },
  { label: "Lakes", href: "/destinations/?cluster=Lake+%26+hill+escapes", scene: "lake", text: "Nainital, Bhimtal, Sattal" },
  { label: "Pilgrimage", href: "/char-dham-yatra/", scene: "temple", text: "Char Dham, Haridwar, Rishikesh" },
  { label: "Nature & wildlife", href: "/destinations/?cluster=Wildlife+%26+nature", scene: "forest", text: "Jim Corbett, Binsar, Valley of Flowers" },
  { label: "Wellness", href: "/destinations/rishikesh/", scene: "river", text: "Yoga and riverside stays" },
  { label: "Offbeat Kumaon", href: "/destinations/?cluster=Kumaon+offbeat", scene: "snow", text: "Almora, Munsiyari, Binsar" },
];

const steps = [
  { title: "Tell us your plan", text: "Share dates, travellers and interests — online, on WhatsApp or by phone." },
  { title: "Get a tailored quote", text: "Receive a written day-wise itinerary with an itemised price and validity date." },
  { title: "Confirm details", text: "Accept the quote, review the booking terms and pay the agreed advance." },
  { title: "Travel with support", text: "Final itinerary, driver details and a support contact before you leave." },
];

const reasons = [
  { title: "Uttarakhand only", text: "We focus on one state, so our routes, timings and seasonal advice stay specific." },
  { title: "Clear inclusions", text: "Every quote lists what is included, what is not, and how the price is calculated." },
  { title: "Custom itineraries", text: "Change the pace, stays or route — trips are built around your family, not a template." },
  { title: "Honest advice", text: "We tell you about road, weather and crowd conditions, even when that means changing plans." },
];

const homeFaqs = (hours: string) => [
  { q: "Is submitting an enquiry a confirmed booking?", a: "No. An enquiry lets us check availability and prepare a written quote. Your booking is confirmed only after you accept the quote, agree to the booking terms and pay any agreed advance, and we confirm the hotel and vehicle." },
  { q: "Can I book only a car with a driver?", a: "Yes. You can request a car + driver for outstation trips, local sightseeing, one-way or round trips, airport and railway transfers, or a driver for your own vehicle." },
  { q: "Do you handle Char Dham yatra registration?", a: "Yatra registration is completed by travellers on the official government portal. We help with route planning, stays and transport, and remind you about current requirements." },
  { q: "How quickly will you reply?", a: `We aim to respond during working hours (${hours}). For urgent travel, WhatsApp or call us.` },
];

export default async function HomePage() {
  const [featured, destinations, s] = await Promise.all([getPublishedPackages({ featured: true }), getPublishedDestinations(), getSettings()]);
  const faqs = homeFaqs(s.hours);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-forest-900">
        <SceneArt scene="snow" className="absolute inset-0 h-full w-full opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-900/95 via-forest-900/75 to-forest-900/30" />
        <div className="container-page relative grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold tracking-widest text-accent uppercase">Devbhoomi · Uttarakhand</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">Discover Uttarakhand, Your Way.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-forest-100">
              Thoughtfully planned mountain escapes, family holidays and pilgrimage journeys across Devbhoomi — plus reliable
              car and driver bookings.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/uttarakhand/tour-packages/" className="btn-primary px-6 py-3 text-base">
                Explore Packages
              </Link>
              <Link href="/customise-my-trip/" className="btn-ghost-light px-6 py-3 text-base">
                Customise My Trip
              </Link>
            </div>
          </div>

          {/* Quick enquiry — plain GET form, works without JavaScript */}
          <form action="/customise-my-trip/" method="get" className="rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-forest-900">Quick trip enquiry</h2>
            <p className="mt-1 text-sm text-slate-600">Tell us the basics — we&apos;ll ask the rest.</p>
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
              <button type="submit" className="btn-primary w-full py-3">
                Continue
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Browse by experience */}
      <section className="container-page py-16">
        <p className="eyebrow">Browse by experience</p>
        <h2 className="h2 mt-2">What kind of Uttarakhand trip?</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {experiences.map((e) => (
            <Link key={e.label} href={e.href} className="card group relative overflow-hidden">
              <SceneArt scene={e.scene} className="h-28 w-full transition-transform duration-500 group-hover:scale-105 sm:h-36" />
              <div className="p-4">
                <h3 className="font-semibold text-forest-900 group-hover:underline">{e.label}</h3>
                <p className="mt-1 text-sm text-slate-600">{e.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured packages */}
      {featured.length > 0 && (
        <section className="bg-sand py-16">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Featured packages</p>
                <h2 className="h2 mt-2">Popular Uttarakhand trips</h2>
              </div>
              <Link href="/uttarakhand/tour-packages/" className="font-semibold text-forest-700 hover:underline">
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

      {/* Transport */}
      <section className="container-page py-16">
        <div className="grid gap-8 overflow-hidden rounded-3xl bg-forest-800 text-white lg:grid-cols-2">
          <div className="p-8 sm:p-12">
            <p className="text-sm font-semibold tracking-widest text-accent uppercase">Car, taxi & driver</p>
            <h2 className="mt-2 text-3xl font-bold">Need just a car and a driver?</h2>
            <p className="mt-4 text-forest-100">
              Book a car with a driver for outstation trips and sightseeing, an airport or railway transfer, or a driver for your own
              vehicle. Every request is checked with verified local partners before we confirm.
            </p>
            <ul className="mt-6 grid gap-2 text-sm text-forest-100 sm:grid-cols-2">
              {Object.values(serviceTypes).map((s) => (
                <li key={s} className="flex gap-2">
                  <span aria-hidden="true" className="text-accent">✓</span>
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/uttarakhand/taxi-booking/" className="btn-primary">Book a Car</Link>
              <Link href="/uttarakhand/driver-booking/" className="btn-ghost-light">Book a Driver</Link>
            </div>
          </div>
          <SceneArt scene="mountain" className="hidden h-full w-full lg:block" />
        </div>
      </section>

      {/* Why us */}
      <section className="container-page py-8">
        <p className="eyebrow">Why travel with us</p>
        <h2 className="h2 mt-2">Planned locally, explained clearly</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <div key={r.title} className="card p-6">
              <h3 className="font-semibold text-forest-900">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16">
        <p className="eyebrow">How it works</p>
        <h2 className="h2 mt-2">From enquiry to mountains in four steps</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl border border-forest-100 bg-forest-50 p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-700 font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 font-semibold text-forest-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Destination inspiration */}
      <section className="bg-sand py-16">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Destination inspiration</p>
              <h2 className="h2 mt-2">Where to go in Uttarakhand</h2>
            </div>
            <Link href="/destinations/" className="font-semibold text-forest-700 hover:underline">
              All destinations →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {destinations.slice(0, 8).map((d) => (
              <DestinationCard key={d.id} d={d} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + contact */}
      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 className="h2 mt-2">Before you enquire</h2>
          <div className="mt-6">
            <FaqList faqs={faqs} />
          </div>
          <Link href="/faqs/" className="mt-4 inline-block font-semibold text-forest-700 hover:underline">
            More FAQs →
          </Link>
        </div>
        <aside className="card h-fit p-6">
          <h2 className="text-lg font-semibold text-forest-900">Talk to a trip planner</h2>
          <p className="mt-2 text-sm text-slate-600">
            Prefer to chat? Reach us on WhatsApp or phone. {s.hours}.
          </p>
          <div className="mt-5 grid gap-3">
            <WhatsAppButton className="btn-secondary w-full" />
            <PhoneButton className="btn-outline w-full" />
          </div>
        </aside>
      </section>
    </>
  );
}
