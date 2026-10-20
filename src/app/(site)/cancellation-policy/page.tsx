import { PolicyPage } from "@/components/PolicyPage";
import { getSettings } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Cancellation & Refund Policy",
  description: "Cancellation, refund, no-show and disruption terms for EcoSoul Uttarakhand Travel tours and transport bookings.",
  path: "/cancellation-policy/",
});

export default async function CancellationPolicyPage() {
  const s = await getSettings();
  return (
    <PolicyPage title="Cancellation & Refund Policy" path="/cancellation-policy/">
      <h2>1. Where your cancellation terms are stated</h2>
      <p>
        Cancellation charges depend on the hotels, transport partners and activities in your trip, and on how close to departure
        you cancel. The applicable deadlines and charges are listed in your written quote and confirmation before you pay.
      </p>
      <h2>2. How to cancel</h2>
      <p>
        Send a cancellation request by email or WhatsApp quoting your enquiry/booking ID. The cancellation time is the time we
        receive your written request.
      </p>
      <h2>3. Refunds</h2>
      <ul>
        <li>Eligible refunds are calculated according to the deadlines in your confirmation, after non-refundable supplier charges.</li>
        <li>Refunds are made to the original payment method; processing times depend on banks and payment providers.</li>
        <li>We share a written breakdown of any deductions.</li>
      </ul>
      <h2>4. Taxi and driver bookings</h2>
      <ul>
        <li>No-show: if the traveller is not at the pickup point within the free waiting time stated in the quote, the booking may be treated as a no-show.</li>
        <li>Waiting, overtime and extra-kilometre charges apply as stated in the quote.</li>
        <li>For airport/railway pickups, share flight/train details so delays can be tracked.</li>
      </ul>
      <h2>5. Weather, road closures and official advisories</h2>
      <p>
        If travel is disrupted by weather, landslides, road closures or official orders, we will work with you on rescheduling or
        alternative plans. Refunds in such cases depend on what our partners are able to refund, and we will be transparent about it.
      </p>
      <h2>6. Rescheduling</h2>
      <p>
        To change dates, message us as early as possible with your booking ID. We check availability with our partners and share any
        difference in price before making the change. Rescheduling is subject to partner terms and may count as a cancellation if
        requested very close to travel.
      </p>
      <h2>7. Emergencies during your trip</h2>
      <p>
        For breakdowns, delays or urgent help during a confirmed trip, call {s.emergencyPhone || s.phone}. In a medical or safety
        emergency, contact local emergency services first (dial 112).
      </p>
      <h2>8. Changes initiated by us</h2>
      <p>
        If we must cancel a confirmed service and cannot offer an acceptable alternative, you will receive a refund of the amount
        paid for that service.
      </p>
    </PolicyPage>
  );
}
