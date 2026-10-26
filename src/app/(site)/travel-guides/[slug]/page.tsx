import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WhatsAppButton } from "@/components/ContactButtons";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { guideBySlug, guidePath, guides, type Guide } from "@/config/guides";
import { placeById, routeBetween, seasons } from "@/config/journeys";
import { site } from "@/config/site";
import { formatDate } from "@/lib/format";
import { computeTotals, emptyCalc, estimateHotel, estimateTransport, rupees, type CalcInput } from "@/lib/quote";
import { getPublishedDestinations } from "@/lib/queries";
import { getRateCard } from "@/lib/rates";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  const meta = pageMeta({ title: g.metaTitle, description: g.description, path: guidePath(g) });
  return { ...meta, openGraph: { ...meta.openGraph, type: "article", modifiedTime: g.reviewed } };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const widget = g.widget ? await Widget({ kind: g.widget }) : null;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: g.title,
          description: g.description,
          url: `${site.url}${guidePath(g)}`,
          dateModified: g.reviewed,
          author: { "@type": "Organization", name: site.name, url: site.url },
          publisher: { "@type": "Organization", name: site.name, url: site.url },
          mainEntityOfPage: `${site.url}${guidePath(g)}`,
        }}
      />
      <PageHero
        title={g.title}
        intro={g.description}
        crumbs={[{ label: "Travel Guide", href: "/travel-guides/" }, { label: g.title, href: guidePath(g) }]}
        eyebrow={`Travel guide · ${g.readMinutes} min read`}
        scene="river"
      />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_300px]">
        <article className="prose-body min-w-0">
          <section aria-labelledby="quick-answer" className="not-prose rounded-2xl border border-forest-100 bg-forest-50/60 p-5 sm:p-6">
            <h2 id="quick-answer" className="text-sm font-semibold tracking-wide text-forest-700 uppercase">Quick answer</h2>
            <p className="mt-2 text-lg leading-relaxed text-slate-800">{g.quickAnswer}</p>
          </section>

          {g.sections.map((s, i) => (
            <div key={s.heading}>
              <h2>{s.heading}</h2>
              {s.paras?.map((p) => <p key={p}>{p}</p>)}
              {s.bullets && (
                <ul>
                  {s.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
              )}
              {widget && g.widgetAfter === i && <div className="not-prose my-6">{widget}</div>}
            </div>
          ))}

          <h2>Frequently asked questions</h2>
          <FaqList faqs={g.faqs} />

          <p className="text-sm text-slate-500">
            Last updated {formatDate(g.reviewed)}. Conditions, permits and dates change every season — check official advisories before you
            travel.
          </p>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="font-semibold text-forest-900">Plan this trip with us</h2>
            <p className="mt-2 text-sm text-slate-600">Tell us your dates and group — we send a day-wise plan with an itemised quote.</p>
            <div className="mt-4 grid gap-3">
              <Link href="/customise-my-trip/" className="btn-primary w-full">Customise my trip</Link>
              <WhatsAppButton className="btn-outline w-full" message={`Hi EcoSoul, I read your guide "${g.title}" and want help planning.`} />
            </div>
          </div>
          <nav aria-label="Related" className="card p-6 text-sm">
            <h2 className="font-semibold text-forest-900">Related</h2>
            <ul className="mt-3 space-y-1">
              {g.related.map((r) => (
                <li key={r.href}><Link href={r.href} className="inline-block py-1.5 text-forest-700 hover:underline">{r.label} →</Link></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="More guides" className="card p-6 text-sm">
            <h2 className="font-semibold text-forest-900">More guides</h2>
            <ul className="mt-3 space-y-1">
              {guides.filter((x) => x.slug !== g.slug).map((x) => (
                <li key={x.slug}><Link href={guidePath(x)} className="inline-block py-1.5 text-forest-700 hover:underline">{x.title.split(" — ")[0]}</Link></li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}

// ---------- Live blocks built from site data ----------

async function Widget({ kind }: { kind: NonNullable<Guide["widget"]> }) {
  if (kind === "seasons") return <SeasonsTable />;
  if (kind === "compare-nainital-mussoorie") return <CompareTable />;
  return <CostTable kind={kind} />;
}

function SeasonsTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="bg-slate-50 text-left text-xs tracking-wide text-slate-500 uppercase">
          <tr><th className="px-4 py-3">Months</th><th className="px-4 py-3">What to expect</th><th className="px-4 py-3">Go to</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {seasons.map((s) => (
            <tr key={s.months}>
              <td className="px-4 py-3 font-semibold whitespace-nowrap text-forest-900">{s.months}</td>
              <td className="px-4 py-3 text-slate-700"><strong>{s.title}.</strong> {s.text}</td>
              <td className="px-4 py-3 text-slate-600">{s.places.map((id) => placeById(id)?.name.replace(/ \(.*\)/, "")).join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function CompareTable() {
  const destinations = await getPublishedDestinations();
  const n = destinations.find((d) => d.slug === "nainital");
  const m = destinations.find((d) => d.slug === "mussoorie");
  const km = (a: string, b: string) => {
    const r = routeBetween(a, b);
    return r ? `${r.km} km (${r.time})` : "—";
  };
  const rows: [string, string, string][] = [
    ["From Delhi by road", km("delhi", "nainital"), km("delhi", "mussoorie")],
    ["Nearest railway station", `Kathgodam — ${km("kathgodam", "nainital")}`, `Dehradun — ${km("dehradun", "mussoorie")}`],
    ["Nearest airport", `Pantnagar — ${km("pantnagar", "nainital")}`, `Dehradun (Jolly Grant) — ${km("jollygrant", "mussoorie")}`],
    ["Best for", n?.bestFor ?? "Families, couples", m?.bestFor ?? "Weekends, families"],
    ["Easy add-ons", "Bhimtal, Mukteshwar, Jim Corbett", "Dhanaulti, Rishikesh"],
    ["Best time", n?.bestTime ?? "March–June, September–November", m?.bestTime ?? "March–June, September–November"],
  ];
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="bg-slate-50 text-left text-xs tracking-wide text-slate-500 uppercase">
          <tr><th className="px-4 py-3" /><th className="px-4 py-3">Nainital</th><th className="px-4 py-3">Mussoorie</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(([k, a, b]) => (
            <tr key={k}>
              <th scope="row" className="px-4 py-3 text-left font-semibold text-forest-900">{k}</th>
              <td className="px-4 py-3 text-slate-700">{a}</td>
              <td className="px-4 py-3 text-slate-700">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Trip cost scenarios priced with the same calculator and rate card as real quotes. */
async function CostTable({ kind }: { kind: "trip-cost" | "char-dham-cost" }) {
  const { vehicles, hotels, settings } = await getRateCard();
  const rules = {
    oneWayMinKm: settings.oneWayMinKm,
    lateNightCharge: settings.lateNightCharge,
    freeWaitMinutes: settings.freeWaitMinutes,
    driverDayRate: settings.driverDayRate,
    driverOutstationDayRate: settings.driverOutstationDayRate,
    driverDayHours: settings.driverDayHours,
    driverOvertimeHour: settings.driverOvertimeHour,
    driverNightAllowance: settings.driverNightAllowance,
  };
  const km = kind === "trip-cost" ? Math.round((routeBetween("delhi", "nainital")?.km ?? 310) * 2 * 1.1) : 1250;
  const days = kind === "trip-cost" ? 5 : 10;
  const scenarios =
    kind === "trip-cost"
      ? [
          { label: "Budget", vehicleId: "SEDAN", hotelId: "BUDGET", persons: 2, rooms: 1 },
          { label: "Standard", vehicleId: "SEDAN", hotelId: "STANDARD", persons: 2, rooms: 1 },
          { label: "Premium", vehicleId: "SUV", hotelId: "PREMIUM", persons: 2, rooms: 1 },
        ]
      : [
          { label: "2 travellers · sedan · budget stays", vehicleId: "SEDAN", hotelId: "BUDGET", persons: 2, rooms: 1 },
          { label: "4 travellers · SUV · standard stays", vehicleId: "SUV", hotelId: "STANDARD", persons: 4, rooms: 2 },
        ];
  const priced = scenarios.map((s) => {
    const calc: CalcInput = { ...emptyCalc, mode: "OUTSTATION", vehicleId: s.vehicleId, totalKm: km, days, nights: days - 1, hotelId: s.hotelId, rooms: s.rooms, hotelNights: days - 1, persons: s.persons };
    const v = vehicles.find((x) => x.id === s.vehicleId);
    const h = hotels.find((x) => x.id === s.hotelId);
    const transport = computeTotals(estimateTransport(calc, v, rules), settings.markupPct, settings.gstPct).total;
    const stay = computeTotals(estimateHotel(calc, h, settings.peakSurchargePct), settings.markupPct, settings.gstPct).total;
    return { ...s, vehicle: v?.name ?? s.vehicleId, hotel: h?.name ?? s.hotelId, transport, stay, total: transport + stay };
  });
  const round = (n: number) => Math.round(n / 500) * 500;

  return (
    <figure className="rounded-2xl border border-slate-200 bg-white">
      <figcaption className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
        {kind === "trip-cost"
          ? `Example: Delhi → Nainital → Delhi, ${days} days / ${days - 1} nights, 2 people, about ${km} km by private car.`
          : `Example: Char Dham from Haridwar, ${days} days / ${days - 1} nights, about ${km} km by road.`}
      </figcaption>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs tracking-wide text-slate-500 uppercase">
            <tr><th className="px-4 py-3">Trip style</th><th className="hidden px-4 py-3 sm:table-cell">Car</th><th className="hidden px-4 py-3 sm:table-cell">Hotels</th><th className="px-4 py-3 text-right">Approx. total</th><th className="px-4 py-3 text-right">Per person</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {priced.map((p) => (
              <tr key={p.label}>
                <td className="px-4 py-3">
                  <span className="block font-semibold text-forest-900">{p.label}</span>
                  {/* Phones: car and hotel under the name instead of their own columns */}
                  <span className="block text-xs text-slate-500 sm:hidden">{p.vehicle} {rupees(round(p.transport))} · {p.hotel} hotels {rupees(round(p.stay))}</span>
                </td>
                <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{p.vehicle} · {rupees(round(p.transport))}</td>
                <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{p.hotel} · {rupees(round(p.stay))}</td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap text-forest-900">{rupees(round(p.total))}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap text-slate-700">{rupees(round(p.total / p.persons))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
        Calculated from our current rate card, including driver allowance, night halts, breakfast, service charges and GST. Excludes tolls,
        parking, state tax, other meals, activities and peak-season surcharges. Your written quote gives the exact price for your dates.
      </p>
    </figure>
  );
}
