import { PolicyPage } from "@/components/PolicyPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Booking Policy",
  description: "How EcoSoul Uttarakhand Travel handles enquiries, quotes, confirmations and payments for tours and transport.",
  path: "/booking-policy/",
});

export default function BookingPolicyPage() {
  return (
    <PolicyPage title="Booking Policy" path="/booking-policy/">
      <h2>1. Enquiries are not bookings</h2>
      <p>
        Submitting a form, WhatsApp message or call is an enquiry. It does not reserve hotels, vehicles, drivers or activities, and
        no price is final until we send a written quote.
      </p>
      <h2>2. Written quote</h2>
      <p>Every quote states:</p>
      <ul>
        <li>The itinerary or route, travel dates and number of travellers;</li>
        <li>The price, the price basis (per person, per couple, per room or per vehicle) and applicable taxes;</li>
        <li>Inclusions and exclusions, including tolls, parking, permits, driver allowance and meals where relevant;</li>
        <li>Hotel category and vehicle category (or an equivalent), and</li>
        <li>The quote validity period and payment milestones.</li>
      </ul>
      <h2>3. What confirms a booking</h2>
      <p>
        A booking is confirmed only when (a) you accept the quote, (b) you accept these terms, (c) the agreed advance is received
        through an approved payment method, and (d) we confirm availability with our hotel and transport partners. We then send a
        written confirmation.
      </p>
      <h2>4. Payments</h2>
      <p>
        Payment milestones are listed in your quote. We never ask for card details by phone, WhatsApp or email, and our website does
        not store card data. Receipts/invoices are issued for payments received.
      </p>
      <h2>5. Changes by suppliers or conditions</h2>
      <p>
        Mountain travel depends on weather, road access and official advisories. If a hotel, vehicle or route becomes unavailable,
        we will offer a comparable alternative or adjust the plan, and explain any cost difference before proceeding.
      </p>
      <h2>6. Traveller responsibilities</h2>
      <ul>
        <li>Provide accurate traveller details, carry valid ID, and complete any official registration (e.g. yatra registration).</li>
        <li>Share relevant health or accessibility needs so the plan can be adapted.</li>
        <li>Follow driver, guide, operator and official safety instructions.</li>
      </ul>
      <h2>7. Adventure activities</h2>
      <p>
        Activities such as rafting, trekking or skiing are arranged only through appropriately authorised operators and are subject
        to their rules, age/fitness requirements, weather and your informed consent.
      </p>
    </PolicyPage>
  );
}
