import Link from "next/link";
import { WhatsAppButton } from "@/components/ContactButtons";
import { FaqList } from "@/components/FaqList";
import { PageHero } from "@/components/PageHero";
import { originBySlug, originPath } from "@/config/journeys";
import { officialLinks, site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

const meta = pageMeta({
  title: "Char Dham Yatra Planning — Route, Registration & Travel Help",
  description:
    "Plan your Char Dham Yatra to Yamunotri, Gangotri, Kedarnath and Badrinath: a 10-day route, official registration and helicopter guidance, stays, transport and yatra help from your city.",
  path: "/uttarakhand/char-dham-yatra/",
});
export const metadata = {
  ...meta,
  alternates: { ...meta.alternates, languages: { "en-IN": `${site.url}/uttarakhand/char-dham-yatra/`, "hi-IN": `${site.url}/hi/char-dham-yatra/` } },
};

// Content review date — update whenever this page is re-checked against official sources
const LAST_REVIEWED = "20 October 2026";

const dhams = [
  { name: "Yamunotri", text: "Usually the first stop. The final approach is a trek from Janki Chatti; ponies and palkis are available locally." },
  { name: "Gangotri", text: "Reachable by road. The temple stands on the Bhagirathi river and is often combined with a halt at Uttarkashi or Harsil." },
  { name: "Kedarnath", text: "A long trek from Gaurikund (helicopter services operate seasonally through official channels). The most physically demanding stage." },
  { name: "Badrinath", text: "Reachable by road via Joshimath. Mana village nearby is a popular addition." },
];

const helpdesk = [
  { title: "Registration guidance", text: "We walk you through the official Registration & Tourist Care portal, check your details and remind you to carry the confirmation. Registration stays in the pilgrim's own name." },
  { title: "Helicopter advice", text: "Kedarnath helicopter seats are sold only on the official IRCTC HeliYatra portal. We tell you when booking opens, plan your road route around the heli slot and warn you about fake booking sites." },
  { title: "Route, stays & vehicle", text: "A day-wise plan with realistic drive times and buffer days, hotels at every halt in your chosen category, and an SUV or tempo traveller with an experienced hill driver." },
  { title: "Elderly & group support", text: "Slower plans with rest days, pony / palki guidance for the treks, and a support number throughout the trip for weather or road closures." },
];

const sampleRoute: [string, string][] = [
  ["Day 1", "Haridwar → Barkot (Yamunotri route), about 6–7 hrs"],
  ["Day 2", "Janki Chatti → Yamunotri trek and darshan → back to Barkot"],
  ["Day 3", "Barkot → Uttarkashi, Vishwanath temple"],
  ["Day 4", "Uttarkashi → Gangotri darshan → back to Uttarkashi"],
  ["Day 5", "Uttarkashi → Guptkashi / Sitapur"],
  ["Day 6", "Sonprayag → Gaurikund → Kedarnath trek (or helicopter)"],
  ["Day 7", "Kedarnath morning darshan → trek down → Guptkashi"],
  ["Day 8", "Guptkashi → Badrinath via Joshimath"],
  ["Day 9", "Badrinath darshan, Mana village → Joshimath / Pipalkoti"],
  ["Day 10", "Drive back to Rishikesh / Haridwar"],
];

const yatraOrigins = ["delhi", "ahmedabad", "mumbai", "kolkata", "pune", "hyderabad"];

const faqs = [
  { q: "Is registration required for the Char Dham Yatra?", a: "Yes. Pilgrims are required to register through the official Uttarakhand Tourist Care portal. Rules can change each season, so check the official portal before you travel." },
  { q: "When does the yatra season open?", a: "Temples typically open around late April or May and close around October or November. Exact dates are announced each year by the temple committees and authorities." },
  { q: "How many days does the full Char Dham take?", a: "Most road-based itineraries take around 9–12 days from Haridwar or Rishikesh, depending on pace, weather and halts." },
  { q: "Do you book helicopter tickets?", a: "Kedarnath helicopter tickets are booked only through the official IRCTC HeliYatra portal, in the pilgrim's name. We advise on timing and plan your route around the slot, but we do not sell or promise heli tickets." },
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
      >
        <Link href="/hi/char-dham-yatra/" lang="hi" hrefLang="hi" className="chip bg-white/90">
          हिंदी में पढ़ें →
        </Link>
      </PageHero>

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

          <h2>Yatra helpdesk — how we help</h2>
          <div className="not-prose grid gap-4 sm:grid-cols-2">
            {helpdesk.map((h) => (
              <div key={h.title} className="rounded-2xl border border-forest-100 bg-forest-50/50 p-5">
                <h3 className="font-semibold text-forest-900">{h.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{h.text}</p>
              </div>
            ))}
          </div>

          <h2>A typical 10-day road plan from Haridwar</h2>
          <ol className="not-prose relative space-y-3 border-l-2 border-forest-100 pl-5">
            {sampleRoute.map(([day, text]) => (
              <li key={day} className="relative">
                <span className="absolute top-1 -left-[1.6rem] h-3 w-3 rounded-full bg-forest-600 ring-4 ring-cream" aria-hidden="true" />
                <p className="text-sm"><strong className="text-forest-900">{day}:</strong> <span className="text-slate-700">{text}</span></p>
              </li>
            ))}
          </ol>
          <p className="text-sm text-slate-500">Add 1–2 buffer days for weather. Do Dham (Kedarnath + Badrinath) takes about 6–7 days.</p>

          <h2>Starting from your city</h2>
          <p>
            Most pilgrims fly to Dehradun (Jolly Grant) or take a train to Haridwar, and start the road journey from Haridwar or Rishikesh.
            Travelling from{" "}
            {yatraOrigins.map((slug, i) => {
              const o = originBySlug(slug)!;
              return (
                <span key={slug}>
                  <Link href={originPath(o)}>{o.city}</Link>
                  {i < yatraOrigins.length - 2 ? ", " : i === yatraOrigins.length - 2 ? " or " : "? "}
                </span>
              );
            })}
            See trains, flights and fares for your city.
          </p>

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
            <a href={officialLinks.heliYatra} target="_blank" rel="noopener noreferrer">IRCTC HeliYatra</a>,{" "}
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
