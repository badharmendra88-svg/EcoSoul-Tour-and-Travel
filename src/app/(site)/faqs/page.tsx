import { FaqList } from "@/components/FaqList";
import { PageHero } from "@/components/PageHero";
import { jsonLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "FAQs — Bookings, Payments, Weather & Permits",
  description:
    "Answers to common questions about booking Uttarakhand trips and taxis: confirmation, payments, cancellations, weather, permits and accessibility.",
  path: "/faqs/",
});

const groups = [
  {
    title: "Booking & payments",
    faqs: [
      { q: "How do I book a trip?", a: "Send an enquiry or message us. We reply with a written itinerary and itemised quote. The booking is confirmed after you accept the quote and terms, pay the agreed advance, and we confirm with our partners." },
      { q: "Do I need to pay to send an enquiry?", a: "No. Enquiries and quotes are free." },
      { q: "How do I pay?", a: "Payment instructions are shared with your quote. We never ask for card details over phone, WhatsApp or email." },
      { q: "Will I get an invoice?", a: "Yes, a receipt or invoice is issued for payments received." },
    ],
  },
  {
    title: "Cancellations & changes",
    faqs: [
      { q: "Can I change my dates after booking?", a: "Usually yes, subject to partner availability. Any cost difference is explained before changes are made." },
      { q: "What is your cancellation policy?", a: "Cancellation terms depend on the hotels and transport in your trip and are stated in your quote. See our Cancellation & Refund Policy for general rules." },
    ],
  },
  {
    title: "Weather, roads & permits",
    faqs: [
      { q: "What happens if roads close due to weather?", a: "Mountain roads can close because of landslides or snow. We monitor advisories, inform you early and help with alternatives or rescheduling." },
      { q: "Do I need permits?", a: "Some trips need registrations or permits — for example the Char Dham Yatra registration or national park safari permits. We tell you what applies to your plan; official registrations must be completed through official portals." },
      { q: "When is the best time to visit Uttarakhand?", a: "It depends on the destination. Most hill towns are pleasant from March to June and September to November. Each destination page lists its best time to visit." },
    ],
  },
  {
    title: "Accessibility & special needs",
    faqs: [
      { q: "Can you plan for elderly travellers or people with limited mobility?", a: "Yes. Tell us about mobility needs and we'll suggest a slower pace, accessible stays where available and suitable vehicles. Some sites involve steps or treks that may not be accessible." },
      { q: "Can I request a child seat?", a: "You can request one; we confirm availability with the partner rather than promising it in advance." },
    ],
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: groups.flatMap((g) => g.faqs).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function FaqsPage() {
  return (
    <>
      <PageHero
        title="Frequently Asked Questions"
        intro="Straight answers about how booking with us works."
        crumbs={[{ label: "FAQs", href: "/faqs/" }]}
        scene="meadow"
      />
      <div className="container-page max-w-3xl space-y-10 py-12">
        {groups.map((g) => (
          <section key={g.title}>
            <h2 className="mb-4 text-xl font-semibold text-forest-900">{g.title}</h2>
            <FaqList faqs={g.faqs} withSchema={false} />
          </section>
        ))}
        {/* One FAQPage schema for the whole page */}
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema)} />
      </div>
    </>
  );
}
