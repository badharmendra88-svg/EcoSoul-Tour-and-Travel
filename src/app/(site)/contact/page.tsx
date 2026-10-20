import { PhoneButton, WhatsAppButton } from "@/components/ContactButtons";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHero } from "@/components/PageHero";
import { site } from "@/config/site";
import { getSettings } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Contact Us — Phone, WhatsApp & Enquiry Form",
  description: `Contact ${site.name} by phone, WhatsApp or email for tour packages, custom trips and taxi bookings in Uttarakhand.`,
  path: "/contact/",
});

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero
        title="Contact Us"
        intro="Questions about a trip, a taxi or a quote? Reach us the way that suits you."
        crumbs={[{ label: "Contact", href: "/contact/" }]}
        scene="lake"
      />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="card p-6">
            <h2 className="font-semibold text-forest-900">Talk to us</h2>
            <div className="mt-4 grid gap-3">
              <WhatsAppButton className="btn-secondary w-full" />
              <PhoneButton className="btn-outline w-full" />
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd><a href={`mailto:${s.email}`} className="font-medium text-forest-700 hover:underline">{s.email}</a></dd>
              </div>
              <div>
                <dt className="text-slate-500">Service area</dt>
                <dd className="font-medium">{s.address}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Hours</dt>
                <dd className="font-medium">{s.hours}</dd>
              </div>
            </dl>
          </div>
        </aside>
        <section className="card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-forest-900">Send us a message</h2>
          <p className="mt-1 text-sm text-slate-600">For trip or taxi quotes, the dedicated forms help us reply faster.</p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </section>
      </div>
    </>
  );
}
