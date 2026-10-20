import { TransportLanding, commonTransportFaqs } from "@/components/TransportLanding";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Airport & Railway Transfers in Uttarakhand — Pantnagar, Dehradun, Kathgodam",
  description:
    "Pre-booked pickup and drop from Pantnagar and Dehradun airports and Kathgodam, Haridwar and Dehradun stations to Nainital, Mussoorie, Rishikesh and more.",
  path: "/uttarakhand/airport-transfers/",
});

export default function AirportTransfersPage() {
  return (
    <TransportLanding
      title="Airport & Railway Station Transfers"
      intro="Pre-booked pickups and drops between Uttarakhand's airports and railway stations and your hotel — with meet-up instructions and a clear waiting policy."
      path="/uttarakhand/airport-transfers/"
      crumbLabel="Airport / Railway Transfers"
      service="AIRPORT_RAIL"
      highlights={["Pantnagar · Dehradun airports", "Kathgodam · Haridwar · Dehradun stations", "Delay-aware pickups"]}
      faqs={[
        { q: "What if my flight or train is delayed?", a: "Share your flight or train number when you book. Your quote states the free waiting time and any charges after that; we coordinate with the driver if you're running late." },
        { q: "Where will the driver meet me?", a: "Meet-up instructions and the driver's contact are sent before your arrival." },
        ...commonTransportFaqs,
      ]}
    >
      <section>
        <h2 className="h2">Common transfer routes</h2>
        <p className="mt-2 text-slate-600">Driving times are estimates and vary with traffic, weather and season.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Kathgodam station → Nainital / Bhimtal",
            "Pantnagar airport → Nainital / Jim Corbett",
            "Dehradun airport → Mussoorie / Rishikesh",
            "Haridwar station → Rishikesh",
            "Dehradun station → Mussoorie",
            "Ramnagar station → Jim Corbett resorts",
          ].map((r) => (
            <li key={r} className="card px-4 py-3 text-sm font-medium text-slate-700">{r}</li>
          ))}
        </ul>
      </section>
    </TransportLanding>
  );
}
