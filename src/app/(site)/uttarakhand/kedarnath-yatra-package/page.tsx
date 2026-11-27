import Link from "next/link";
import { TripLanding } from "@/components/TripLanding";
import { routeBetween } from "@/config/journeys";
import { officialLinks, site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

const PATH = "/uttarakhand/kedarnath-yatra-package/";

const meta = pageMeta({
  title: "Kedarnath Yatra Package from Haridwar & Delhi",
  description:
    "Kedarnath yatra package with hotels at Guptkashi or Sitapur, an SUV with hill driver, trek or helicopter guidance and registration help. 4–5 days from Haridwar.",
  path: PATH,
});
export const metadata = {
  ...meta,
  alternates: { ...meta.alternates, languages: { "en-IN": `${site.url}${PATH}`, "hi-IN": `${site.url}/hi/kedarnath-yatra/` } },
};

// Content review date — update whenever this page is re-checked against official sources
const LAST_REVIEWED = "22 November 2026";

export default function KedarnathYatraPackagePage() {
  const drive = routeBetween("haridwar", "sonprayag");
  return (
    <TripLanding
      title="Kedarnath Yatra Package"
      eyebrow="Pilgrimage"
      intro="A complete Kedarnath yatra from Haridwar, Rishikesh, Dehradun or Delhi — hotels near the trek start, a vehicle with an experienced hill driver, and honest guidance on the trek, helicopter and official registration."
      answer={
        <p>
          A Kedarnath yatra package from Haridwar usually takes <strong>4–5 days</strong>. You drive
          {drive ? <> about <strong>{drive.km} km ({drive.time})</strong></> : ""} to Sonprayag, then trek <strong>about 16–18 km</strong> from
          Gaurikund to the temple at about 3,580 m, or fly by helicopter (seats sold only on IRCTC HeliYatra). The temple is usually open
          from <strong>May to October or early November</strong>, and every pilgrim must register on the official Uttarakhand portal.
        </p>
      }
      updated={LAST_REVIEWED}
      crumbLabel="Kedarnath Yatra Package"
      path={PATH}
      scene="temple"
      notice={{
        title: "Registration and helicopter tickets are official-only",
        body: (
          <p>
            Every pilgrim must register on the{" "}
            <a href={officialLinks.yatraRegistration} target="_blank" rel="noopener noreferrer" className="font-semibold underline">official Registration & Tourist Care portal</a>.
            Kedarnath helicopter seats are sold only on{" "}
            <a href={officialLinks.heliYatra} target="_blank" rel="noopener noreferrer" className="font-semibold underline">IRCTC HeliYatra</a> — we help you plan around a
            slot but never sell heli tickets. Beware of fake helicopter booking websites.
          </p>
        ),
      }}
      facts={[
        { label: "Temple altitude", value: "About 3,580 m" },
        { label: "Trek (one way)", value: "About 16–18 km from Gaurikund" },
        { label: "Usual season", value: "May – Oct / early Nov" },
        { label: "Package length", value: "4–5 days from Haridwar" },
      ]}
      intro2={
        <p>
          Kedarnath is one of the twelve Jyotirlingas and the most demanding of the Char Dham. Our Kedarnath yatra package covers the road
          journey to Guptkashi, Phata or Sitapur, stays in your chosen hotel category, and the trek or helicopter plan from Sonprayag and
          Gaurikund. Want all four dhams instead? See our <Link href="/uttarakhand/char-dham-yatra/">Char Dham Yatra packages</Link>.
        </p>
      }
      cardsTitle="What the Kedarnath package includes"
      cards={[
        { title: "Vehicle with hill driver", text: "Sedan, SUV or tempo traveller from Haridwar, Rishikesh, Dehradun or Delhi to Sonprayag and back, with an experienced mountain driver." },
        { title: "Hotels near the trek start", text: "Stays at Guptkashi, Phata or Sitapur in budget, standard or premium category, so you start the trek early and rested." },
        { title: "Trek or helicopter plan", text: "Pony, palki and pithoo guidance for the trek, or a road plan built around your official helicopter slot from Phata, Sirsi or Guptkashi." },
        { title: "Registration & advisories", text: "Help with the official yatra registration, weather and road updates, and buffer days so landslides or rain don't spoil darshan." },
      ]}
      plan={{
        title: "Sample 5-day Kedarnath yatra from Haridwar",
        days: [
          ["Day 1", "Haridwar / Rishikesh → Guptkashi or Sitapur via Devprayag and Rudraprayag, about 8–9 hrs"],
          ["Day 2", "Early drive to Sonprayag, shuttle to Gaurikund, trek to Kedarnath (or helicopter), evening aarti, overnight at Kedarnath"],
          ["Day 3", "Morning darshan, trek down to Gaurikund, drive back to Guptkashi or Sitapur"],
          ["Day 4", "Guptkashi → Rishikesh / Haridwar, optional stop at Dhari Devi"],
          ["Day 5", "Buffer day for weather, or onward travel to Delhi / Dehradun Airport"],
        ],
        note: "From Delhi, add a day each way. Do Dham (Kedarnath + Badrinath) takes about 6–7 days.",
      }}
      checklistTitle="Before your Kedarnath yatra"
      checklist={[
        "Register on the official portal and carry the registration plus a government photo ID.",
        "Get a medical check-up — the trek climbs to about 3,580 m and the air is thin.",
        "Carry warm layers, a rain jacket and good walking shoes even in May and June.",
        "Start the trek early in the morning and keep a buffer day for weather.",
        "Follow official advisories; the route can close at short notice during heavy rain.",
      ]}
      faqTitle="Kedarnath yatra FAQs"
      faqs={[
        { q: "How many days is a Kedarnath yatra package?", a: "Most Kedarnath packages take 4–5 days from Haridwar or Rishikesh and 6–7 days from Delhi, including one night at Kedarnath or a same-day return and a buffer day for weather." },
        { q: "How long is the Kedarnath trek?", a: "The trek from Gaurikund to Kedarnath is about 16–18 km one way and usually takes 6–8 hours uphill. Ponies, palkis and pithoos are available locally at official rates." },
        { q: "Can you book the Kedarnath helicopter?", a: "Helicopter tickets are sold only on the official IRCTC HeliYatra portal in the pilgrim's own name. We tell you when booking opens and plan the road trip around your slot, but we do not sell heli tickets." },
        { q: "When is the Kedarnath temple open?", a: "The temple usually opens in late April or May and closes around October or early November. Exact dates are announced each year by the temple committee." },
        { q: "Is the Kedarnath yatra suitable for elderly travellers?", a: "Many elderly pilgrims complete it with a pony, palki or helicopter, an extra rest day and medical clearance. Discuss any health conditions with a doctor before booking." },
      ]}
      packages={{ title: "Ready-made yatra packages", slugs: ["kedarnath-yatra-5-days", "do-dham-kedarnath-badrinath-6-days", "char-dham-yatra-10-days"] }}
      sources={
        <>
          Last reviewed: {LAST_REVIEWED}. Official sources:{" "}
          <a href={officialLinks.yatraRegistration} target="_blank" rel="noopener noreferrer">Registration & Tourist Care</a>,{" "}
          <a href={officialLinks.heliYatra} target="_blank" rel="noopener noreferrer">IRCTC HeliYatra</a>,{" "}
          <a href={officialLinks.tourism} target="_blank" rel="noopener noreferrer">Uttarakhand Tourism</a>.
        </>
      }
      cta={{
        title: "Get your Kedarnath package quote",
        text: "Share your dates, group size, starting city and hotel category. We reply with a day-wise plan and an itemised quote.",
        href: "/customise-my-trip/?destination=Kedarnath&interest=Pilgrimage",
        label: "Request a Kedarnath quote",
        whatsapp: "Hi EcoSoul, I'd like a Kedarnath yatra package quote.",
      }}
      related={{
        title: "Plan your yatra",
        links: [
          { href: "/travel-guides/kedarnath-trip-guide/", label: "Kedarnath trek & helicopter guide" },
          { href: "/uttarakhand/char-dham-yatra/", label: "Char Dham Yatra packages" },
          { href: "/taxi/haridwar-to-sonprayag/", label: "Haridwar to Sonprayag taxi" },
          { href: "/taxi/delhi-to-sonprayag/", label: "Delhi to Sonprayag taxi" },
          { href: "/hotel-booking/", label: "Hotels at Guptkashi & Sitapur" },
        ],
      }}
    />
  );
}
