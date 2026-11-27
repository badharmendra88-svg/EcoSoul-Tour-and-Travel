import Link from "next/link";
import { PackageCard } from "@/components/Cards";
import { WhatsAppButton } from "@/components/ContactButtons";
import { FaqList } from "@/components/FaqList";
import { PageHero } from "@/components/PageHero";
import { QuickAnswer } from "@/components/QuickAnswer";
import { routeBetween } from "@/config/journeys";
import { KUMAON_HUB_PATH, KUMAON_REVIEWED, kumaonPath, kumaonPlaces } from "@/config/kumaon";
import { getPublishedPackages } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Kumaon Tour Packages — Nainital, Almora & More",
  description:
    "Kumaon tour packages for Nainital, Bhimtal, Naukuchiatal, Mukteshwar, Ranikhet and Almora: hotels, car with hill driver, day-wise plans and a 7-day Kumaon circuit.",
  path: KUMAON_HUB_PATH,
});

// Destinations (database slugs) that count as Kumaon when picking packages to show
const KUMAON_SLUGS = new Set([...kumaonPlaces.map((p) => p.id), "kausani", "binsar", "munsiyari", "jim-corbett"]);

const circuit: [string, string][] = [
  ["Day 1", "Kathgodam / Pantnagar (or Delhi by road) → Nainital, evening on the Mall Road"],
  ["Day 2", "Nainital: Naini Lake, Naina Devi, Snow View; afternoon lake tour of Bhimtal and Naukuchiatal"],
  ["Day 3", "Nainital → Mukteshwar: Mukteshwar Dham, Chauli ki Jali, Himalayan sunset"],
  ["Day 4", "Mukteshwar → Almora: Kasar Devi, Lala Bazaar, Bright End Corner"],
  ["Day 5", "Day trip to Jageshwar Dham or Binsar sanctuary"],
  ["Day 6", "Almora → Ranikhet: Jhula Devi temple, Chaubatia gardens"],
  ["Day 7", "Ranikhet → Kathgodam / Pantnagar for your onward journey (or extend to Jim Corbett)"],
];

const faqs = [
  { q: "Which places are covered in a Kumaon tour package?", a: "Most Kumaon trips combine Nainital and its lakes (Bhimtal, Naukuchiatal, Sattal) with Mukteshwar, Almora, Ranikhet and sometimes Kausani, Binsar or Jim Corbett. We build the route around your days and interests." },
  { q: "How many days are needed for a Kumaon trip?", a: "3–4 days for Nainital and the lakes, 5–6 days to add Mukteshwar and Almora, and 7–8 days for a full circuit with Ranikhet, Kausani or Jim Corbett." },
  { q: "What is the best time to visit Kumaon?", a: "March to June and September to November for pleasant weather, and October to February for the clearest Himalayan views. July and August are the monsoon months, when hill roads can be affected by landslides." },
  { q: "How do I reach Kumaon?", a: "Kathgodam railway station and Pantnagar Airport are the gateways; Delhi is about a 7-hour drive to Nainital. We arrange pickups from all three." },
];

export default async function KumaonToursPage() {
  const packages = (await getPublishedPackages()).filter((p) => p.destinations?.some((d) => KUMAON_SLUGS.has(d.slug)));
  return (
    <>
      <PageHero
        title="Kumaon Tour Packages"
        intro="Lakes, orchards, temples and Himalayan views — Kumaon trips covering Nainital, Bhimtal, Naukuchiatal, Mukteshwar, Ranikhet and Almora, with hotels and a car with an experienced hill driver."
        crumbs={[{ label: "Kumaon Tour Packages", href: KUMAON_HUB_PATH }]}
        eyebrow="Kumaon"
        scene="lake"
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <article className="prose-body min-w-0">
          <QuickAnswer updated={KUMAON_REVIEWED}>
            <p>
              Kumaon&apos;s main hill destinations are <strong>{kumaonPlaces.map((p) => p.name).join(", ").replace(/, ([^,]*)$/, " and $1")}</strong>.
              The gateways are Kathgodam railway station and Pantnagar Airport; Nainital is about {routeBetween("kathgodam", "nainital")?.km} km
              from Kathgodam and {routeBetween("delhi", "nainital")?.time} by road from Delhi. Plan <strong>3–4 days</strong> for Nainital and
              the lakes, or <strong>7 days</strong> for a full Kumaon circuit. The best months are March–June and September–November.
            </p>
          </QuickAnswer>

          <p>
            Kumaon is the eastern half of Uttarakhand: gentle hill stations, lakes and old temple towns facing the snow peaks of the
            Nanda Devi range. Pick a single destination below, or combine several on a Kumaon circuit. Every package includes your stay, a
            car with an experienced hill driver and a day-wise plan you can change.
          </p>

          <h2>Kumaon destinations</h2>
          <ul className="not-prose grid gap-4 sm:grid-cols-2">
            {kumaonPlaces.map((p) => {
              const km = routeBetween("kathgodam", p.id);
              return (
                <li key={p.id}>
                  <Link href={kumaonPath(p.id)} className="card block h-full p-5 hover:border-forest-300">
                    <span className="block font-semibold text-forest-900">{p.name} tour package</span>
                    <span className="mt-1 block text-xs font-medium text-leaf-700">
                      {p.altitude} · {p.idealStay}{km ? ` · ${km.km} km from Kathgodam` : ""}
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-slate-600">{p.intro.split(" — ")[0]}.</span>
                    <span className="mt-3 block text-sm font-semibold text-forest-700">View {p.name} package →</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <h2>7-day Kumaon circuit</h2>
          <ol className="not-prose relative space-y-3 border-l-2 border-forest-100 pl-5">
            {circuit.map(([day, text]) => (
              <li key={day} className="relative">
                <span className="absolute top-1 -left-[1.6rem] h-3 w-3 rounded-full bg-forest-600 ring-4 ring-cream" aria-hidden="true" />
                <p className="text-sm"><strong className="text-forest-900">{day}:</strong> <span className="text-slate-700">{text}</span></p>
              </li>
            ))}
          </ol>
          <p className="text-sm text-slate-500">Shorter on time? Nainital with the lakes and Mukteshwar fits in 4 days.</p>

          {packages.length > 0 && (
            <>
              <h2>Ready-made Kumaon packages</h2>
              <div className="not-prose grid gap-6 md:grid-cols-2">
                {packages.map((p) => <PackageCard key={p.id} pkg={p} layout="grid" />)}
              </div>
            </>
          )}

          <h2>Kumaon tour FAQs</h2>
          <FaqList faqs={faqs} />
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-forest-900">Plan your Kumaon trip</h2>
            <p className="mt-2 text-sm text-slate-600">Tell us your dates, group size and the places you like. We reply with a day-wise plan and an itemised quote.</p>
            <div className="mt-4 grid gap-3">
              <Link href="/customise-my-trip/?destination=Kumaon" className="btn-primary w-full">Request a Kumaon quote</Link>
              <WhatsAppButton className="btn-secondary w-full" message="Hi EcoSoul, I'd like a Kumaon tour package quote." />
            </div>
          </div>
          <nav aria-label="Kumaon travel" className="card p-6 text-sm">
            <h2 className="font-semibold text-forest-900">Getting to Kumaon</h2>
            <ul className="mt-3 space-y-1">
              <li><Link href="/taxi/kathgodam-to-nainital/" className="inline-block py-1.5 text-forest-700 hover:underline">Kathgodam to Nainital taxi →</Link></li>
              <li><Link href="/taxi/delhi-to-nainital/" className="inline-block py-1.5 text-forest-700 hover:underline">Delhi to Nainital taxi →</Link></li>
              <li><Link href="/uttarakhand/haldwani-taxi-service/" className="inline-block py-1.5 text-forest-700 hover:underline">Haldwani &amp; Kathgodam taxi →</Link></li>
              <li><Link href="/destinations/jim-corbett/" className="inline-block py-1.5 text-forest-700 hover:underline">Jim Corbett guide →</Link></li>
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}
