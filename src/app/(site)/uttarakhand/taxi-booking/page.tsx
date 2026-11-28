import { TransportLanding, commonTransportFaqs } from "@/components/TransportLanding";
import { RouteTable } from "@/components/RouteTable";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Uttarakhand Taxi Service & Cab Rental with Driver",
  description:
    "Uttarakhand taxi service and cab rental with driver for outstation, round-trip, one-way and group travel. Sedans, SUVs and tempo travellers with itemised quotes.",
  path: "/uttarakhand/taxi-booking/",
});

export default function TaxiBookingPage() {
  return (
    <TransportLanding
      title="Uttarakhand Taxi Service & Cab Rental"
      intro="Outstation trips, round trips, one-way drops and group vehicles across Kumaon and Garhwal — with experienced hill drivers from local partners we work with directly."
      path="/uttarakhand/taxi-booking/"
      estimator={{ from: "delhi", to: "nainital" }}
      crumbLabel="Book a Taxi"
      service="CAR_DRIVER"
      showFareRules
      highlights={["Hill-route drivers", "Itemised quotes", "Sedan · SUV · Tempo traveller"]}
      faqs={[
        { q: "Which vehicle is best for mountain routes?", a: "For families with luggage, an SUV/MUV is usually the most comfortable on hill roads. The operator confirms route suitability for each trip." },
        { q: "Do you do multi-day trips with the same car?", a: "Yes. On a round trip or a multi-day tour the same car and driver stay with you, including sightseeing on the way and at your destination. The driver's night halts are listed in the quote." },
        { q: "Can I book a one-way drop to the hills?", a: "Yes — one-way drops are available on all main routes, for example Delhi to Nainital or Haridwar to Rishikesh. Some remote one-way routes include a return charge, which is written in the quote." },
        ...commonTransportFaqs,
      ]}
    >
      <section aria-labelledby="trip-types">
        <h2 id="trip-types" className="h2">Ways to book a taxi</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["One-way drop", "Delhi, a station or an airport to your hotel in the hills — you pay for one way, plus any return charge on remote routes."],
            ["Round trip", "The same car and driver for the whole trip, with sightseeing included; best for 2 days or more."],
            ["Multi-city tour", "Several towns in one trip — for example Nainital, Mukteshwar and Almora — with the driver's halts planned in advance."],
            ["Group travel", "Tempo travellers for 7–12 people, or two cars together for larger families and yatra groups."],
          ].map(([t, d]) => (
            <div key={t} className="card p-5">
              <h3 className="font-semibold text-forest-900">{t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="popular-routes">
        <h2 id="popular-routes" className="h2">Popular taxi routes in Uttarakhand</h2>
        <div className="mt-6">
          <RouteTable
            groups={[
              { title: "Delhi to Kumaon", pairs: [["delhi", "nainital"], ["delhi", "bhimtal"], ["delhi", "mukteshwar"], ["delhi", "almora"], ["delhi", "ranikhet"], ["delhi", "corbett"]] },
              { title: "Delhi to Garhwal", pairs: [["delhi", "haridwar"], ["delhi", "rishikesh"], ["delhi", "dehradun"], ["delhi", "mussoorie"], ["delhi", "auli"]] },
              { title: "Char Dham and Kedarnath routes", pairs: [["haridwar", "sonprayag"], ["rishikesh", "sonprayag"], ["haridwar", "badrinath"], ["haridwar", "barkot"], ["haridwar", "uttarkashi"]] },
            ]}
          />
        </div>
      </section>
    </TransportLanding>
  );
}
