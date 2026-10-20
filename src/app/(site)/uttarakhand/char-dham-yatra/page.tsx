import Link from "next/link";
import { WhatsAppButton } from "@/components/ContactButtons";
import { FaqList } from "@/components/FaqList";
import { PageHero } from "@/components/PageHero";
import { officialLinks } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Char Dham Yatra Planning — Route, Registration & Travel Help",
  description:
    "Plan your Char Dham Yatra to Yamunotri, Gangotri, Kedarnath and Badrinath: route stages, official registration reminders, packing tips and travel assistance.",
  path: "/uttarakhand/char-dham-yatra/",
});

// Content review date — update whenever this page is re-checked against official sources
const LAST_REVIEWED = "20 October 2026";

const dhams = [
  { name: "Yamunotri", text: "Usually the first stop. The final approach is a trek from Janki Chatti; ponies and palkis are available locally." },
  { name: "Gangotri", text: "Reachable by road. The temple stands on the Bhagirathi river and is often combined with a halt at Uttarkashi or Harsil." },
  { name: "Kedarnath", text: "A long trek from Gaurikund (helicopter services operate seasonally through official channels). The most physically demanding stage." },
  { name: "Badrinath", text: "Reachable by road via Joshimath. Mana village nearby is a popular addition." },
];

const faqs = [
  { q: "Is registration required for the Char Dham Yatra?", a: "Yes. Pilgrims are required to register through the official Uttarakhand Tourist Care portal. Rules can change each season, so check the official portal before you travel." },
  { q: "When does the yatra season open?", a: "Temples typically open around late April or May and close around October or November. Exact dates are announced each year by the temple committees and authorities." },
  { q: "How many days does the full Char Dham take?", a: "Most road-based itineraries take around 9–12 days from Haridwar or Rishikesh, depending on pace, weather and halts." },
  { q: "Do you book helicopter tickets?", a: "Helicopter services are booked through official channels only. We do not include or promise heli tickets unless separately confirmed in writing." },
  { q: "Is the yatra suitable for elderly travellers?", a: "Many elderly pilgrims complete the yatra with a slower itinerary, extra rest days and medical clearance. Discuss health conditions with a doctor and follow official health advisories." },
];

export default function CharDhamPage() {
  return (
    <>
      <PageHero
        title="Char Dham Yatra Planning"
        intro="Practical planning help for Yamunotri, Gangotri, Kedarnath and Badrinath — realistic routes, stays and transport, with clear reminders about official registration and advisories."
        crumbs={[{ label: "Char Dham & Yatra", href: "/uttarakhand/char-dham-yatra/" }]}
        scene="temple"
        eyebrow="Pilgrimage"
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <article className="prose-body min-w-0">
          <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
            <p className="font-semibold">Important — this is not a government website</p>
            <p className="mt-1 text-sm">
              Yatra registration, route permissions, health requirements and weather advisories are issued by the authorities. Please
              register and verify current requirements on the{" "}
              <a href={officialLinks.yatraRegistration} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                official Registration & Tourist Care portal
              </a>{" "}
              before travel. Registration is not included in our services unless confirmed in writing.
            </p>
          </div>

          <h2>The four dhams</h2>
          <div className="not-prose grid gap-4 sm:grid-cols-2">
            {dhams.map((d) => (
              <div key={d.name} className="card p-5">
                <h3 className="font-semibold text-forest-900">{d.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{d.text}</p>
              </div>
            ))}
          </div>

          <h2>How we help</h2>
          <ul>
            <li>A day-wise route built around your dates, fitness and pace, with realistic driving times and buffer days.</li>
            <li>Hotel and guesthouse arrangements at each halt, by category you choose.</li>
            <li>Vehicle with an experienced hill driver for the full route.</li>
            <li>Reminders for official registration, documents and current advisories before departure.</li>
            <li>A support contact during the trip for changes caused by weather or road closures.</li>
          </ul>

          <h2>Before you travel — checklist</h2>
          <ul>
            <li>Complete official yatra registration and carry proof plus a government photo ID.</li>
            <li>Get a medical check-up, especially for Kedarnath and Yamunotri treks; carry personal medicines.</li>
            <li>Pack warm layers, rain gear and good walking shoes, even in summer.</li>
            <li>Keep buffer days — landslides and weather can close roads at short notice.</li>
            <li>Follow official advisories and local instructions at all times.</li>
          </ul>

          <h2>Char Dham FAQs</h2>
          <FaqList faqs={faqs} />

          <p className="text-sm text-slate-500">
            Last reviewed: {LAST_REVIEWED}. Official sources:{" "}
            <a href={officialLinks.yatraRegistration} target="_blank" rel="noopener noreferrer">Registration & Tourist Care</a>,{" "}
            <a href={officialLinks.tourism} target="_blank" rel="noopener noreferrer">Uttarakhand Tourism</a>.
          </p>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-forest-900">Plan your yatra</h2>
            <p className="mt-2 text-sm text-slate-600">Tell us your dates, group size and which dhams you wish to visit.</p>
            <div className="mt-4 grid gap-3">
              <Link href="/customise-my-trip/?destination=Char+Dham+Yatra&interest=Pilgrimage" className="btn-primary w-full">
                Request a yatra plan
              </Link>
              <Link href="/packages/char-dham-planning-assistance/" className="btn-outline w-full">
                View planning package
              </Link>
              <WhatsAppButton className="btn-secondary w-full" message="Hi EcoSoul, I'd like help planning the Char Dham Yatra." />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
