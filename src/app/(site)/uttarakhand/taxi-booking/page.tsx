import { TransportLanding, commonTransportFaqs } from "@/components/TransportLanding";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Uttarakhand Taxi Booking — Car with Driver, Outstation & Round Trips",
  description:
    "Book a car with driver in Uttarakhand for outstation, round-trip, one-way and group travel. Sedans, SUVs and tempo travellers with itemised quotes.",
  path: "/uttarakhand/taxi-booking/",
});

export default function TaxiBookingPage() {
  return (
    <TransportLanding
      title="Book a Taxi in Uttarakhand"
      intro="Outstation trips, round trips, one-way drops and group vehicles across Kumaon and Garhwal — with experienced hill drivers from local partners we work with directly."
      path="/uttarakhand/taxi-booking/"
      crumbLabel="Book a Taxi"
      service="CAR_DRIVER"
      highlights={["Hill-route drivers", "Itemised quotes", "Sedan · SUV · Tempo traveller"]}
      faqs={[
        { q: "Which vehicle is best for mountain routes?", a: "For families with luggage, an SUV/MUV is usually the most comfortable on hill roads. The operator confirms route suitability for each trip." },
        ...commonTransportFaqs,
      ]}
    />
  );
}
