import Link from "next/link";
import { TransportLanding, commonTransportFaqs } from "@/components/TransportLanding";
import { pageMeta } from "@/lib/seo";

// Location page (SEO plan §27.5). Publish/keep only while partner coverage in
// Haldwani is confirmed. Distances are approximate road distances.
export const metadata = pageMeta({
  title: "Haldwani Taxi Service — Kathgodam Station & Pantnagar Airport Cabs",
  description:
    "Taxi service from Haldwani and Kathgodam railway station to Nainital, Bhimtal, Mukteshwar, Ranikhet, Almora and Jim Corbett. Outstation, local and airport transfers with itemised quotes.",
  path: "/uttarakhand/haldwani-taxi-service/",
});

const routes = [
  { to: "Nainital", km: "≈ 40 km", time: "about 1.5 hrs" },
  { to: "Bhimtal", km: "≈ 25 km", time: "about 1 hr" },
  { to: "Mukteshwar", km: "≈ 65 km", time: "about 2.5 hrs" },
  { to: "Ranikhet", km: "≈ 80 km", time: "about 3 hrs" },
  { to: "Almora", km: "≈ 90 km", time: "about 3 hrs" },
  { to: "Jim Corbett (Ramnagar)", km: "≈ 70 km", time: "about 2 hrs" },
  { to: "Pantnagar Airport", km: "≈ 30 km", time: "about 1 hr" },
];

export default function HaldwaniTaxiPage() {
  return (
    <TransportLanding
      title="Haldwani Taxi Service"
      intro="Pickups from Haldwani city, Kathgodam railway station and Pantnagar airport to Nainital, the lake district, Kumaon hill towns and Jim Corbett — with local hill drivers and an itemised quote before you confirm."
      path="/uttarakhand/haldwani-taxi-service/"
      crumbLabel="Haldwani Taxi Service"
      service="ONE_WAY"
      highlights={["Kathgodam station pickups", "Pantnagar airport", "Kumaon hill routes"]}
      faqs={[
        { q: "Can you pick us up from Kathgodam railway station?", a: "Yes. Share your train number and arrival time when you request a quote so the driver can track delays. Free waiting time and charges after it are listed in your quote." },
        { q: "How long does Haldwani to Nainital take?", a: "Usually about 1.5 hours for roughly 40 km, but weekend and holiday traffic on the hill road can add significant time. We plan pickups with a buffer." },
        { q: "Do you offer one-way drops from Haldwani?", a: "Yes. One-way fares include the vehicle's return run; your quote shows the per-km rate, minimum distance and any late-night charge." },
        ...commonTransportFaqs,
      ]}
    >
      <section>
        <h2 className="h2">Popular routes from Haldwani</h2>
        <p className="mt-2 text-slate-600">
          Approximate road distances and typical driving times — they vary with traffic, weather and season. Tap a route to request a quote.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {routes.map((r) => (
            <li key={r.to}>
              {/* Full page load so the form re-reads ?pickup / ?drop (same-page links keep form state) */}
              <a
                href={`/uttarakhand/haldwani-taxi-service/?pickup=${encodeURIComponent("Haldwani / Kathgodam")}&drop=${encodeURIComponent(r.to)}#book`}
                className="card flex items-center justify-between gap-3 px-4 py-3 hover:border-forest-300"
              >
                <span>
                  <span className="block font-semibold text-forest-900">Haldwani → {r.to}</span>
                  <span className="block text-xs text-slate-500">{r.km} · {r.time}</span>
                </span>
                <span className="text-sm font-semibold text-forest-700">Get quote →</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="prose-body">
        <h2>Travelling from Haldwani</h2>
        <p>
          Haldwani is the main gateway to Kumaon. Kathgodam railway station sits at the northern edge of the city, and Pantnagar
          airport is roughly an hour away by road. Most hill journeys start here, so it is worth booking your onward taxi before you
          arrive — especially on weekends and during school holidays.
        </p>
        <ul>
          <li>Hill roads beyond Kathgodam are narrow and winding; travellers prone to motion sickness should plan breaks.</li>
          <li>Monsoon (July–August) can bring landslides and delays — keep buffer time for onward trains or flights.</li>
          <li>
            Planning several days in the hills? A <Link href="/uttarakhand/taxi-booking/">car with driver for the whole trip</Link> is often
            simpler than separate transfers. See also our <Link href="/destinations/nainital/">Nainital</Link> and{" "}
            <Link href="/destinations/jim-corbett/">Jim Corbett</Link> guides.
          </li>
        </ul>
      </section>
    </TransportLanding>
  );
}
