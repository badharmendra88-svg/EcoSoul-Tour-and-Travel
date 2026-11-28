import { TransportLanding, commonTransportFaqs } from "@/components/TransportLanding";
import { RouteTable } from "@/components/RouteTable";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Uttarakhand Airport & Railway Station Transfers",
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
      estimator={{ from: "jollygrant", to: "rishikesh" }}
      crumbLabel="Airport / Railway Transfers"
      service="AIRPORT_RAIL"
      highlights={["Pantnagar · Dehradun airports", "Kathgodam · Haridwar · Dehradun stations", "Delay-aware pickups"]}
      faqs={[
        { q: "What if my flight or train is delayed?", a: "Share your flight or train number when you book. Your quote states the free waiting time and any charges after that; we coordinate with the driver if you're running late." },
        { q: "Where will the driver meet me?", a: "Meet-up instructions and the driver's contact are sent before your arrival." },
        ...commonTransportFaqs,
      ]}
    >
      <section aria-labelledby="transfer-routes">
        <h2 id="transfer-routes" className="h2">Transfers from each airport and station</h2>
        <p className="mt-2 text-slate-600">Typical road distances and drive times; traffic, weather and the season change them.</p>
        <div className="mt-6">
          <RouteTable
            groups={[
              { title: "Dehradun Airport (Jolly Grant)", note: "Between Dehradun and Rishikesh; the driver waits at arrivals with your name.", pairs: [["jollygrant", "rishikesh"], ["jollygrant", "haridwar"], ["jollygrant", "dehradun"], ["jollygrant", "mussoorie"], ["jollygrant", "dhanaulti"]] },
              { title: "Pantnagar Airport", note: "The nearest airport for Nainital, the lakes and Jim Corbett.", pairs: [["pantnagar", "nainital"], ["pantnagar", "bhimtal"], ["pantnagar", "naukuchiatal"], ["pantnagar", "corbett"], ["pantnagar", "mukteshwar"], ["pantnagar", "almora"]] },
              { title: "Kathgodam railway station", note: "The railhead for Kumaon; pickups also anywhere in Haldwani, about 6 km away.", pairs: [["kathgodam", "nainital"], ["kathgodam", "bhimtal"], ["kathgodam", "mukteshwar"], ["kathgodam", "almora"], ["kathgodam", "ranikhet"], ["kathgodam", "corbett"]] },
              { title: "Haridwar and Dehradun stations", pairs: [["haridwar", "rishikesh"], ["haridwar", "mussoorie"], ["dehradun", "mussoorie"], ["dehradun", "rishikesh"]] },
            ]}
          />
        </div>
      </section>

      <section aria-labelledby="meeting">
        <h2 id="meeting" className="h2">Meeting your driver</h2>
        <ul className="mt-4 space-y-2 text-slate-700">
          <li><strong>Airports:</strong> the driver waits outside arrivals with a name card. Share your flight number so a delay doesn&apos;t cost you waiting charges.</li>
          <li><strong>Railway stations:</strong> the driver meets you at the main exit or the car park; share your train number and coach.</li>
          <li><strong>Before the trip:</strong> you receive the driver&apos;s name, phone number and car number, so you can call directly on arrival.</li>
          <li><strong>Drops for a flight or train:</strong> we plan to reach the airport about 90 minutes and the station about 30 minutes before departure, with extra time on hill roads.</li>
        </ul>
      </section>
    </TransportLanding>
  );
}
