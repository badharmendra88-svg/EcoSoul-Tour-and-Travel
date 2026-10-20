import Link from "next/link";
import type { ServiceType } from "@/config/options";
import { vehicleCategories } from "@/config/options";
import type { Faq } from "@/lib/json";
import { WhatsAppButton } from "./ContactButtons";
import { FaqList } from "./FaqList";
import { TransportForm } from "./forms/TransportForm";
import { PageHero } from "./PageHero";

// Shared layout for transport landing pages (blueprint §24, §27.5).

const fareRules = [
  ["Base fare", "Stated per trip, per day, per km or per shift, with any minimum duration or distance."],
  ["Included km / hours", "Exact inclusion and the rate for extra distance or time."],
  ["Driver allowance / night halt", "Whether included or payable separately, and when it applies."],
  ["Tolls, parking & permits", "Included, estimated, or paid at actuals — spelled out in the quote."],
  ["Taxes", "Applicable taxes and whether they are included in the total."],
  ["Waiting & delays", "Free waiting time and charges after it, including airport/railway delays."],
  ["One-way / empty return", "Any route-specific return charge explained before you confirm."],
];

const workflow = [
  "You submit a request with route, date and travellers.",
  "We check partner, driver and vehicle availability and route suitability.",
  "You receive an itemised quote with fare rules, cancellation terms and expiry.",
  "You accept the quote and complete the agreed advance.",
  "We confirm the booking and share pickup details; driver contact follows closer to the trip.",
];

export function TransportLanding({
  title,
  intro,
  path,
  crumbLabel,
  service,
  lockService = false,
  highlights,
  faqs,
  showVehicles = true,
  children,
}: {
  title: string;
  intro: string;
  path: string;
  crumbLabel: string;
  service: ServiceType;
  lockService?: boolean;
  highlights: string[];
  faqs: Faq[];
  showVehicles?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <>
      <PageHero title={title} intro={intro} crumbs={[{ label: crumbLabel, href: path }]} scene="mountain" eyebrow="Car, taxi & driver">
        <ul className="flex flex-wrap gap-2">
          {highlights.map((h) => (
            <li key={h} className="chip bg-white/90">
              {h}
            </li>
          ))}
        </ul>
      </PageHero>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-12">
          <section id="book" className="scroll-mt-24">
            <h2 className="h2">Request a quote</h2>
            <p className="mt-2 text-slate-600">Takes about a minute. We confirm availability and the final fare before anything is booked.</p>
            <div className="card mt-6 p-6 sm:p-8">
              <TransportForm defaultService={service} lockService={lockService} />
            </div>
          </section>

          {children}

          {showVehicles && (
            <section>
              <h2 className="h2">Vehicle categories</h2>
              <p className="mt-2 text-slate-600">
                Capacity is a guide. We confirm the actual vehicle (or an equivalent in the same category) before you pay — we
                never promise a specific make or model until it is reserved.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {vehicleCategories.map((v) => (
                  <div key={v.id} className="card p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-semibold text-forest-900">{v.name}</h3>
                      <span className="chip">Up to {v.seats} passengers</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{v.use}</p>
                    <p className="mt-1 text-xs text-slate-500">{v.note}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="h2">How fares are quoted</h2>
            <p className="mt-2 text-slate-600">
              We don&apos;t publish fixed fares before checking your route with local partners. Every quote is itemised:
            </p>
            <dl className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
              {fareRules.map(([term, desc]) => (
                <div key={term} className="grid gap-1 p-4 sm:grid-cols-[220px_1fr]">
                  <dt className="font-medium text-forest-900">{term}</dt>
                  <dd className="text-sm text-slate-600">{desc}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="h2">How booking works</h2>
            <ol className="mt-6 space-y-3">
              {workflow.map((w, i) => (
                <li key={w} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest-700 text-sm font-bold text-white">{i + 1}</span>
                  <span className="pt-0.5 text-slate-700">{w}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="h2">Frequently asked questions</h2>
            <div className="mt-6">
              <FaqList faqs={faqs} />
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="font-semibold text-forest-900">Quick question?</h2>
            <p className="mt-2 text-sm text-slate-600">Message us your route and date on WhatsApp.</p>
            <WhatsAppButton className="btn-secondary mt-4 w-full" message="Hi EcoSoul, I need a taxi in Uttarakhand. Route: ___ Date: ___" />
          </div>
          <div className="card p-6 text-sm text-slate-600">
            <h2 className="font-semibold text-forest-900">Other transport services</h2>
            <ul className="mt-3 space-y-2">
              <li><Link className="text-forest-700 hover:underline" href="/uttarakhand/taxi-booking/">Car + driver / taxi booking</Link></li>
              <li><Link className="text-forest-700 hover:underline" href="/uttarakhand/driver-booking/">Driver only (your vehicle)</Link></li>
              <li><Link className="text-forest-700 hover:underline" href="/uttarakhand/airport-transfers/">Airport / railway transfers</Link></li>
              <li><Link className="text-forest-700 hover:underline" href="/uttarakhand/local-sightseeing-taxi/">Local sightseeing taxi</Link></li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

export const commonTransportFaqs: Faq[] = [
  { q: "Is my booking confirmed when I submit the form?", a: "No. Your request is an enquiry. We confirm only after checking partner availability, sharing an itemised quote, and receiving your acceptance and any agreed advance." },
  { q: "Are tolls, parking and driver allowance included?", a: "It depends on the route and fare type. Your written quote clearly states whether each is included, estimated or payable at actuals." },
  { q: "When will I get the driver's details?", a: "Driver name and contact are shared closer to the trip, once a verified driver is assigned." },
  { q: "What if my plans change?", a: "Tell us as early as possible. Cancellation and change terms are listed in your quote and in our Cancellation Policy." },
];
