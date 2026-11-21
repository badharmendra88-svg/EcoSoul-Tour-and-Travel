import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { HotelEnquiryForm } from "@/components/forms/HotelEnquiryForm";
import { kumaonPath } from "@/config/kumaon";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Uttarakhand Hotel & Homestay Booking",
  description:
    "Hotel, resort and homestay booking in Nainital, Bhimtal, Mukteshwar, Rishikesh, Mussoorie and across Uttarakhand. Share your dates and room needs for a written quote.",
  path: "/hotel-booking/",
});

const areas = [
  { name: "Nainital", text: "Lake-view hotels near the Mall Road, and quieter stays above the town.", href: kumaonPath("nainital") },
  { name: "Bhimtal & Naukuchiatal", text: "Lakeside resorts and cottages, calmer than Nainital and good for families.", href: kumaonPath("bhimtal") },
  { name: "Mukteshwar", text: "Orchard cottages and homestays with Himalayan sunrise views.", href: kumaonPath("mukteshwar") },
  { name: "Almora & Ranikhet", text: "Heritage homes, forest lodges and quiet hotels on the ridges.", href: kumaonPath("almora") },
  { name: "Rishikesh & Haridwar", text: "Riverside hotels, ashram-style stays and guesthouses near the ghats.", href: "/destinations/rishikesh/" },
  { name: "Mussoorie & Auli", text: "Hill resorts with valley views, and ski-season stays in Auli or Joshimath.", href: "/uttarakhand/auli-tour-package/" },
];

const steps = [
  { title: "Share your stay", text: "Destination, check-in and check-out dates, rooms, guests and the kind of stay you like." },
  { title: "We check partners", text: "We confirm availability with hotels and homestays we work with directly in that area." },
  { title: "You get options", text: "Two or three suitable stays with room type, meal plan and an itemised price." },
  { title: "Confirm and travel", text: "Pick one and confirm; add a car with driver if you need transfers or sightseeing." },
];

const faqs = [
  { q: "Do you book hotels and homestays across Uttarakhand?", a: "Yes. We work with hotel, resort and homestay partners in Nainital, Bhimtal, Naukuchiatal, Mukteshwar, Almora, Ranikhet, Rishikesh, Mussoorie, Auli and on the Char Dham routes." },
  { q: "Is this an instant booking?", a: "No — it is an enquiry. We check live availability with our partners and send you options with prices. Your room is confirmed only after you accept the quote." },
  { q: "Can you add a taxi or tour to my hotel booking?", a: "Yes. We can add station or airport pickups, a car with an experienced hill driver for sightseeing, or turn your stay into a complete tour package." },
  { q: "Homestay or hotel — which is better?", a: "Homestays are quieter, more personal and often serve home-cooked Kumaoni or Garhwali food. Hotels and resorts suit larger groups and travellers who want more facilities. Tell us your preference and we suggest both." },
];

export default function HotelBookingPage() {
  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="tagline text-lg">Stay in Devbhoomi</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-forest-900 sm:text-4xl">Hotel & Homestay Booking in Uttarakhand</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
          Tell us where and when you plan to stay. We check availability with our local hotel, resort and homestay partners and share
          suitable options with clear, itemised pricing.
        </p>
        <div className="panel mt-8 p-5 sm:p-8"><HotelEnquiryForm /></div>

        <section aria-labelledby="areas" className="mt-14">
          <h2 id="areas" className="h2">Where we arrange stays</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {areas.map((a) => (
              <li key={a.name}>
                <Link href={a.href} className="card block h-full p-5 hover:border-forest-300">
                  <span className="block font-semibold text-forest-900">{a.name}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-600">{a.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how" className="mt-14">
          <h2 id="how" className="h2">How hotel booking works</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-forest-100 bg-forest-50/50 p-5">
                <span className="text-xs font-bold text-leaf-700">Step {i + 1}</span>
                <span className="mt-1 block font-semibold text-forest-900">{s.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-600">{s.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="hotel-faqs" className="mt-14">
          <h2 id="hotel-faqs" className="h2">Hotel booking FAQs</h2>
          <div className="mt-6"><FaqList faqs={faqs} /></div>
        </section>
      </div>
    </div>
  );
}
