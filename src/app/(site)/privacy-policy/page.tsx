import { PolicyPage } from "@/components/PolicyPage";
import { getSettings } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Privacy Policy",
  description: "What personal information EcoSoul Uttarakhand Travel collects, why, who it is shared with, and how to contact us about your data.",
  path: "/privacy-policy/",
});

export default async function PrivacyPolicyPage() {
  const s = await getSettings();
  return (
    <PolicyPage title="Privacy Policy" path="/privacy-policy/">
      <h2>1. What we collect</h2>
      <ul>
        <li>Contact details you provide: name, phone number and/or email.</li>
        <li>Trip details: destinations, dates, number of travellers, pickup/drop points, preferences and messages.</li>
        <li>Basic technical data such as pages visited and the page an enquiry was sent from.</li>
      </ul>
      <p>
        We do not ask for government ID or health details through the website. If such details become necessary for a confirmed
        booking (for example, a park permit), we request them separately and handle them securely.
      </p>
      <h2>2. Why we use it</h2>
      <ul>
        <li>To respond to your enquiry, prepare quotes and manage your booking;</li>
        <li>To share necessary trip details with hotels, transport partners and drivers who fulfil your trip;</li>
        <li>To improve our website and services using aggregated analytics that do not include your name, phone or email.</li>
      </ul>
      <h2>3. Sharing</h2>
      <p>
        We share only what a partner needs to deliver your service (for example, pickup point, time and a contact number for the
        assigned driver). We do not sell your data.
      </p>
      <h2>4. Retention</h2>
      <p>
        Enquiries that do not become bookings are deleted or anonymised after a defined retention period. Booking records are kept
        as required for accounting and legal purposes.
      </p>
      <h2>5. Security</h2>
      <p>
        Data is stored on secured systems with restricted, role-based access. Card payments, if offered, are processed by a
        reputable payment provider; we do not store card details.
      </p>
      <h2>6. Your choices</h2>
      <p>
        To access, correct or delete your information, or to stop follow-up messages, contact us at{" "}
        <a href={`mailto:${s.email}`}>{s.email}</a>.
      </p>
      <h2>7. Cookies and analytics</h2>
      <p>
        We may use analytics cookies to understand how the website is used. Analytics events never include your name, phone
        number, email or message text.
      </p>
    </PolicyPage>
  );
}
