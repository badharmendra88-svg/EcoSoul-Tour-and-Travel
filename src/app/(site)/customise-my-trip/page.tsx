import { PhoneButton, WhatsAppButton } from "@/components/ContactButtons";
import { TripEnquiryForm } from "@/components/forms/TripEnquiryForm";
import { PageHero } from "@/components/PageHero";
import { interests, tripTypes } from "@/config/options";
import { getPublishedDestinations } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Customise My Uttarakhand Trip — Tailor-Made Itinerary",
  description:
    "Tell us your dates, group, interests and budget. We'll send a day-wise Uttarakhand itinerary with hotels, transport and an itemised quote.",
  path: "/customise-my-trip/",
});

type Search = { destination?: string; date?: string; adults?: string; interest?: string };

// Map the home page's quick-enquiry trip type onto a form interest chip
const typeToInterest: Record<string, string> = {
  [tripTypes.PILGRIMAGE]: "Pilgrimage",
  [tripTypes.NATURE]: "Nature & wildlife",
  [tripTypes.WELLNESS]: "Yoga & wellness",
};

export default async function CustomiseTripPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const destinations = await getPublishedDestinations();
  const interest = sp.interest && (typeToInterest[sp.interest] ?? (interests.includes(sp.interest) ? sp.interest : undefined));

  return (
    <>
      <PageHero
        title="Customise My Trip"
        intro="Share a few details and we'll design an Uttarakhand itinerary around your dates, pace and budget — hotels, transport and sightseeing in one plan."
        crumbs={[{ label: "Customise My Trip", href: "/customise-my-trip/" }]}
        scene="meadow"
      />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <div className="card p-6 sm:p-8">
          <TripEnquiryForm
            mode="custom"
            destinations={[
              ...destinations.map((d) => ({ value: d.name, hint: d.region })),
              { value: "Char Dham Yatra", hint: "Pilgrimage" },
              { value: "Kumaon circuit", hint: "Multi-stop" },
              { value: "Garhwal circuit", hint: "Multi-stop" },
            ]}
            initial={{
              destination: sp.destination?.slice(0, 120),
              travelDate: sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : undefined,
              adults: sp.adults && /^\d{1,2}$/.test(sp.adults) ? sp.adults : undefined,
              interest,
            }}
          />
        </div>
        <aside className="space-y-4">
          <div className="card p-6">
            <h2 className="font-semibold text-forest-900">What happens next?</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
              <li>We review your request and may call or message to clarify.</li>
              <li>You receive a written itinerary and itemised quote with a validity date.</li>
              <li>Once you accept and pay the agreed advance, we confirm hotels and transport.</li>
            </ol>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-forest-900">Rather talk?</h2>
            <div className="mt-3 grid gap-3">
              <WhatsAppButton className="btn-secondary w-full" />
              <PhoneButton className="btn-outline w-full" />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
