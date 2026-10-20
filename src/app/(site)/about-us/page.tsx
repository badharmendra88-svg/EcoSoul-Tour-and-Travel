import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { site } from "@/config/site";
import { getSettings } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "About Us — Uttarakhand Travel Planners",
  description:
    "EcoSoul Uttarakhand Travel plans tours, custom trips and car + driver bookings across Uttarakhand with verified local partners and transparent quotes.",
  path: "/about-us/",
});

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero
        title="About EcoSoul Uttarakhand Travel"
        intro="We plan journeys in one state only — Uttarakhand — so every route, season note and recommendation comes from close, local knowledge."
        crumbs={[{ label: "About Us", href: "/about-us/" }]}
        scene="forest"
      />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <article className="prose-body max-w-3xl">
          {/* TODO(owner): replace with the real company story, team and verified credentials (blueprint §21 "Trust") */}
          <h2>What we do</h2>
          <p>
            {site.name} helps families, couples, pilgrims and groups explore Uttarakhand through curated tour packages, fully
            customised itineraries and dependable car + driver services. We work with local hotels, homestays, taxi owners and
            drivers, and coordinate everything into one clear plan.
          </p>
          <h2>How we work</h2>
          <ul>
            <li><strong>Enquiry first.</strong> We never claim live availability. We check with partners, then send a written quote.</li>
            <li><strong>Transparent pricing.</strong> Every quote shows the price basis, inclusions, exclusions and validity.</li>
            <li><strong>Verified partners.</strong> Drivers, vehicles and operators are checked before they are activated.</li>
            <li><strong>Responsible travel.</strong> We encourage low-waste travel, respect for local communities and following official advisories.</li>
          </ul>
          <h2>Our promise</h2>
          <p>
            Honest advice about seasons, roads and crowds — even when it means suggesting a different plan. If something changes on
            the ground, we tell you early and help you adjust.
          </p>
        </article>
        <aside className="card h-fit p-6">
          <h2 className="font-semibold text-forest-900">Business details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-slate-500">Phone</dt><dd className="font-medium">{s.phone}</dd></div>
            <div><dt className="text-slate-500">Email</dt><dd className="font-medium">{s.email}</dd></div>
            <div><dt className="text-slate-500">Service area</dt><dd className="font-medium">{s.address}</dd></div>
            <div><dt className="text-slate-500">Hours</dt><dd className="font-medium">{s.hours}</dd></div>
          </dl>
          <Link href="/contact/" className="btn-primary mt-5 w-full">Contact us</Link>
        </aside>
      </div>
    </>
  );
}
