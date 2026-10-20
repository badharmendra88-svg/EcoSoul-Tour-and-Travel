import Link from "next/link";
import { PolicyPage } from "@/components/PolicyPage";
import { site } from "@/config/site";
import { getSettings } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Terms & Conditions",
  description: "Terms of use for the EcoSoul Uttarakhand Travel website and services.",
  path: "/terms-and-conditions/",
});

export default async function TermsPage() {
  const s = await getSettings();
  return (
    <PolicyPage title="Terms & Conditions" path="/terms-and-conditions/">
      <h2>1. About this website</h2>
      <p>
        This website is operated by {site.name}. It is a private travel business website and is not an official government
        portal. Official information should be verified on the relevant government websites.
      </p>
      <h2>2. Information on this site</h2>
      <p>
        Destination information, seasons, driving times and access notes are provided as general guidance and can change. We review
        content periodically and confirm current details when preparing your itinerary.
      </p>
      <h2>3. Bookings</h2>
      <p>
        All trips and transport services are subject to our <Link href="/booking-policy/">Booking Policy</Link> and{" "}
        <Link href="/cancellation-policy/">Cancellation & Refund Policy</Link>, and to the specific terms in your written quote.
      </p>
      <h2>4. Reviews and content</h2>
      <p>
        We publish customer reviews and photos only with permission. Images and content on this website may not be reused without
        our consent.
      </p>
      <h2>5. Liability</h2>
      <p>
        Services such as hotels, transport and activities are provided by partners under their own terms. We select partners
        carefully and help resolve issues, but cannot control weather, road conditions or official decisions that affect travel.
      </p>
      <h2>6. Contact</h2>
      <p>
        Questions about these terms: <a href={`mailto:${s.email}`}>{s.email}</a>.
      </p>
    </PolicyPage>
  );
}
