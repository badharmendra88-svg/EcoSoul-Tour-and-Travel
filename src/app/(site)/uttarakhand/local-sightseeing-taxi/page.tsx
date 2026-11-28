import { TransportLanding, commonTransportFaqs } from "@/components/TransportLanding";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Local Sightseeing Taxi in Uttarakhand",
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
        { q: "Is a half-day enough?", a: "For one area — for example the Nainital lake circuit or Rishikesh's ghats and bridges — yes. For viewpoints outside town, or two towns such as Haridwar and Rishikesh, book a full day." },
        ...commonTransportFaqs,
      ]}
    >
      <section aria-labelledby="day-ideas">
        <h2 id="day-ideas" className="h2">Sightseeing day ideas by town</h2>
        <p className="mt-2 text-slate-600">Examples to start from — tell us what you want to see and we size the hours and kilometres to match.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["Nainital", "Full day", "Naina Devi temple, Snow View, Tiffin Top viewpoint, then the lake tour of Bhimtal, Naukuchiatal and Sattal."],
            ["Mussoorie", "Full day", "Kempty Falls, Company Garden, Landour and Lal Tibba, with Dhanaulti as an add-on if roads are clear."],
            ["Rishikesh & Haridwar", "Full day", "Laxman Jhula and Ram Jhula side, Triveni Ghat, then Haridwar for Mansa Devi and the evening aarti at Har Ki Pauri."],
            ["Dehradun", "Half day", "Robber's Cave, Sahastradhara and the Forest Research Institute (check FRI visiting hours)."],
            ["Almora", "Half day", "Kasar Devi, Bright End Corner and the old Lala Bazaar; add Jageshwar temples as a full day."],
            ["Jim Corbett", "Half day", "Garjia Devi temple and Corbett Falls between safaris; jeep safaris themselves need official permits."],
          ].map(([town, len, text]) => (
            <div key={town} className="card p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold text-forest-900">{town}</h3>
                <span className="chip">{len}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">Hill-town traffic and parking rules can change in peak season; your driver plans the order of stops around them.</p>
      </section>
    </TransportLanding>
  );
}
