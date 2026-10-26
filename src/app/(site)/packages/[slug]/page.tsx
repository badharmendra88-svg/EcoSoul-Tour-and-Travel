import Link from "next/link";
import { notFound } from "next/navigation";
import { WhatsAppButton } from "@/components/ContactButtons";
import { TripEnquiryForm } from "@/components/forms/TripEnquiryForm";
import { PageHero } from "@/components/PageHero";
import { TrackPackageView } from "@/components/TrackView";
import { tripTypes } from "@/config/options";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { parseItinerary, parseList } from "@/lib/json";
import { getPackage } from "@/lib/queries";
import { jsonLd, pageMeta } from "@/lib/seo";
import { site } from "@/config/site";

export const revalidate = 300;

export async function generateStaticParams() {
  const rows = await db.package.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPackage(slug);
  if (!p) return {};
  return pageMeta({
    title: p.seoTitle || `${p.title} — ${p.durationLabel}`,
    description: p.seoDescription || p.summary,
    path: `/packages/${p.slug}/`,
    image: p.imageUrl,
    imageAlt: p.imageAlt,
  });
}

export default async function PackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPackage(slug);
  if (!p) notFound();

  const itinerary = parseItinerary(p.itinerary);
  const inclusions = parseList(p.inclusions);
  const exclusions = parseList(p.exclusions);
  const notes = parseList(p.notes);
  const price = formatPrice(p.startingPrice, p.currency);
  const scene = p.destinations[0]?.scene ?? (p.tripType === "PILGRIMAGE" ? "temple" : "mountain");

  return (
    <>
      <TrackPackageView packageId={p.slug} />
      {/* TouristTrip: lets search and AI assistants read the route and day-wise plan */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: p.title,
          description: p.summary,
          url: `${site.url}/packages/${p.slug}/`,
          ...(p.imageUrl ? { image: `${site.url}${p.imageUrl}` } : {}),
          touristType: p.audience || undefined,
          provider: { "@type": "TravelAgency", name: site.name, url: site.url },
          ...(itinerary.length
            ? {
                itinerary: {
                  "@type": "ItemList",
                  numberOfItems: itinerary.length,
                  itemListElement: itinerary.map((day, i) => ({ "@type": "ListItem", position: i + 1, name: day.title, description: day.detail })),
                },
              }
            : {}),
          ...(p.destinations.length ? { subjectOf: p.destinations.map((d) => ({ "@type": "TouristDestination", name: d.name, url: `${site.url}/destinations/${d.slug}/` })) } : {}),
        })}
      />
      {/* Offer markup only when a real, visible price exists (review §3) */}
      {p.startingPrice != null && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.title,
            description: p.summary,
            ...(p.imageUrl ? { image: `${site.url}${p.imageUrl}` } : {}),
            brand: { "@type": "Brand", name: site.name },
            offers: {
              "@type": "Offer",
              price: p.startingPrice,
              priceCurrency: p.currency,
              url: `${site.url}/packages/${p.slug}/`,
              availability: "https://schema.org/InStock",
            },
          })}
        />
      )}
      <PageHero
        title={p.title}
        intro={p.summary}
        eyebrow={`${p.durationLabel} · ${tripTypes[p.tripType as keyof typeof tripTypes] ?? p.tripType}`}
        imageUrl={p.imageUrl}
        imageAlt={p.imageAlt}
        imageCredit={p.imageCredit}
        scene={scene}
        crumbs={[
          { label: "Tour Packages", href: "/uttarakhand/tour-packages/" },
          { label: p.title, href: `/packages/${p.slug}/` },
        ]}
      >
        <div className="flex flex-wrap gap-2">
          {p.destinations.map((d) => (
            <Link key={d.slug} href={`/destinations/${d.slug}/`} className="chip hover:bg-forest-100">
              {d.name}
            </Link>
          ))}
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-10">
          {/* Key facts */}
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="card p-5">
              <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Duration</dt>
              <dd className="mt-1 font-semibold text-forest-900">{p.durationLabel}</dd>
            </div>
            <div className="card p-5">
              <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Best for</dt>
              <dd className="mt-1 font-semibold text-forest-900">{p.audience}</dd>
            </div>
            <div className="card p-5">
              <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Season</dt>
              <dd className="mt-1 font-semibold text-forest-900">{p.season}</dd>
            </div>
          </dl>

          {itinerary.length > 0 && (
            <section>
              <h2 className="h2">Day-wise itinerary</h2>
              <ol className="mt-6 space-y-4 border-l-2 border-forest-200 pl-6">
                {itinerary.map((day) => (
                  <li key={day.day} className="relative">
                    <span className="absolute top-0.5 -left-[35px] flex h-6 w-6 items-center justify-center rounded-full bg-forest-700 text-xs font-bold text-white">
                      {day.day}
                    </span>
                    <h3 className="font-semibold text-forest-900">
                      Day {day.day}: {day.title}
                    </h3>
                    <p className="mt-1 leading-relaxed text-slate-600">{day.detail}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="grid gap-6 sm:grid-cols-2">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-forest-900">Inclusions</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {inclusions.map((i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden="true" className="text-forest-600">✓</span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-forest-900">Exclusions</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {exclusions.map((i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden="true" className="text-red-700">✕</span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {notes.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-forest-900">Important notes</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
                {notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl bg-forest-50 p-6 text-sm text-slate-700">
            <h2 className="font-semibold text-forest-900">How the price is worked out</h2>
            <p className="mt-2">
              {price
                ? `The starting price is ${p.priceBasis ?? "per person"} for the lowest hotel category and off-peak dates.`
                : "We don't show a fixed price until your trip details are known."}{" "}
              Your final quote depends on travel dates, hotel category, vehicle type and group size, and lists every inclusion and
              exclusion before you pay anything.
            </p>
            <h2 className="mt-4 font-semibold text-forest-900">Cancellation summary</h2>
            <p className="mt-2">
              Cancellation and refund terms depend on hotel and transport partners and are stated in your written quote before you
              pay. See our{" "}
              <Link href="/cancellation-policy/" className="font-medium text-forest-700 underline">Cancellation Policy</Link> and{" "}
              <Link href="/booking-policy/" className="font-medium text-forest-700 underline">Booking Policy</Link>.
            </p>
          </section>

          <section id="enquire" className="scroll-mt-24">
            <h2 className="h2">Request a quote for this trip</h2>
            <p className="mt-2 text-slate-600">No payment needed now. We confirm availability and send an itemised quote.</p>
            <div className="card mt-6 p-6">
              <TripEnquiryForm mode="package" packageSlug={p.slug} packageTitle={p.title} />
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            {price ? (
              <>
                <p className="text-sm text-slate-500">Starting from</p>
                <p className="text-3xl font-bold text-forest-900">{price}</p>
                <p className="mt-1 text-sm text-slate-600">{p.priceBasis}</p>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-500">Price</p>
                <p className="text-2xl font-bold text-forest-900">On request</p>
                <p className="mt-1 text-sm text-slate-600">{p.priceBasis}</p>
              </>
            )}
            <div className="mt-5 grid gap-3">
              <a href="#enquire" className="btn-primary w-full">Get Package Quote</a>
              <WhatsAppButton
                className="btn-outline w-full"
                packageId={p.slug}
                message={`Hi EcoSoul, I'm interested in the "${p.title}" package.`}
                label="Ask on WhatsApp"
              />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Hotels and vehicles are confirmed only after you accept the quote and the booking terms.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
