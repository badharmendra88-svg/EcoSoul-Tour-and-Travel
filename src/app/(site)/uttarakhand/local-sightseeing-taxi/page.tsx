import { TransportLanding, commonTransportFaqs } from "@/components/TransportLanding";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Local Sightseeing Taxi in Uttarakhand — Half-Day & Full-Day Cabs",
  description:
    "Book a local sightseeing taxi in Nainital, Mussoorie, Rishikesh and other Uttarakhand towns. Half-day and full-day options with clear km/hour inclusions.",
  path: "/uttarakhand/local-sightseeing-taxi/",
});

export default function LocalSightseeingPage() {
  return (
    <TransportLanding
      title="Local Sightseeing Taxi"
      intro="A car and driver for a half or full day of local sightseeing — the places you want, at your pace, with clear hour and kilometre inclusions."
      path="/uttarakhand/local-sightseeing-taxi/"
      crumbLabel="Local Sightseeing Taxi"
      service="LOCAL"
      highlights={["Half-day / full-day", "Your choice of stops", "Clear overtime rates"]}
      faqs={[
        { q: "How many places can we cover in a day?", a: "It depends on the town, traffic and season. Tell us your wish list and we'll suggest a realistic plan and the hours/kilometres needed." },
        ...commonTransportFaqs,
      ]}
    />
  );
}
