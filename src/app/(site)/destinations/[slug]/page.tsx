import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageCard } from "@/components/Cards";
import { WhatsAppButton } from "@/components/ContactButtons";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { destinationSlugFor, routePages, routePath, shortName } from "@/config/journeys";
import { site } from "@/config/site";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { parseFaqs, parseList } from "@/lib/json";
import { getDestination } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  const rows = await db.destination.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await getDestination(slug);
  if (!d) return {};
  return pageMeta({
    title: d.seoTitle || `${d.name} Travel Guide — Best Time, How to Reach & Tours`,
    description: d.seoDescription || d.summary,
    path: `/destinations/${d.slug}/`,
    image: d.imageUrl,
    imageAlt: d.imageAlt,
  });
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await getDestination(slug);
  if (!d) notFound();

  const experiences = parseList(d.experiences);
  const practical = parseList(d.practical);
  const faqs = parseFaqs(d.faqs);
  const taxiRoutes = routePages.filter((r) => destinationSlugFor(r.to.id) === d.slug).sort((a, b) => a.km - b.km).slice(0, 6);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristDestination",
          name: d.name,
          description: d.summary,
          url: `${site.url}/destinations/${d.slug}/`,
          ...(d.imageUrl ? { image: `${site.url}${d.imageUrl}` } : {}),
          ...(d.bestFor ? { touristType: d.bestFor.split(",").map((t) => t.trim()).filter(Boolean) } : {}),
          containedInPlace: { "@type": "State", name: "Uttarakhand", containedInPlace: { "@type": "Country", name: "India" } },
        }}
      />
      <PageHero
        title={`${d.name} Travel Guide`}
        intro={d.summary}
        eyebrow={`${d.region} · ${d.cluster}`}
        imageUrl={d.imageUrl}
        imageAlt={d.imageAlt}
        imageCredit={d.imageCredit}
        scene={d.scene}
        crumbs={[
          { label: "Destinations", href: "/destinations/" },
          { label: d.name, href: `/destinations/${d.slug}/` },
        ]}
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <article className="prose-body min-w-0">
          <p className="text-lg">{d.intro}</p>

          {/* AEO: direct answers near the top */}
          <div className="grid gap-4 not-prose sm:grid-cols-3">
            {[
              ["Best time to visit", d.bestTime],
              ["How to reach", d.howToReach],
              ["Suggested duration", d.suggestedDuration],
            ].map(([label, text]) => (
              <div key={label} className="card p-5">
                <h2 className="text-sm font-semibold tracking-wide text-forest-700 uppercase">{label}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{text}</p>
              </div>
            ))}
          </div>

          {experiences.length > 0 && (
            <>
              <h2>Things to do in {d.name}</h2>
              <ul>
                {experiences.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </>
          )}

          {practical.length > 0 && (
            <>
              <h2>Practical tips</h2>
              <ul>
                {practical.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          )}

          <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Driving times, weather and access change with the season. Check current road and weather advisories before you travel;
            we confirm the latest conditions when we send your itinerary.
          </p>

          {faqs.length > 0 && (
            <>
              <h2>{d.name} FAQs</h2>
              <FaqList faqs={faqs} />
            </>
          )}

          <p className="text-sm text-slate-500">Last reviewed: {formatDate(d.reviewedAt)}</p>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-forest-900">Plan a trip to {d.name}</h2>
            <p className="mt-2 text-sm text-slate-600">Tell us your dates and group — we&apos;ll send a day-wise plan and quote.</p>
            <div className="mt-4 grid gap-3">
              <Link href={`/customise-my-trip/?destination=${encodeURIComponent(d.name)}`} className="btn-primary w-full">
                Customise My Trip
              </Link>
              <WhatsAppButton className="btn-outline w-full" message={`Hi EcoSoul, I'm planning a trip to ${d.name}.`} />
            </div>
          </div>
          {taxiRoutes.length > 0 && (
            <nav aria-label={`Taxi to ${d.name}`} className="card p-6 text-sm">
              <h2 className="font-semibold text-forest-900">Taxi to {d.name}</h2>
              <ul className="mt-3 space-y-1">
                {taxiRoutes.map((r) => (
                  <li key={r.slug}>
                    <Link href={routePath(r)} className="flex justify-between gap-3 py-1.5 text-forest-700 hover:underline">
                      <span>From {shortName(r.from)}</span>
                      <span className="text-slate-400">{r.km} km · {r.time}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div className="card p-6">
            <h2 className="font-semibold text-forest-900">Need only a taxi?</h2>
            <p className="mt-2 text-sm text-slate-600">Car + driver, transfers and local sightseeing on request.</p>
            <Link href="/uttarakhand/taxi-booking/" className="mt-2 inline-block py-2 font-semibold text-forest-700 hover:underline">
              Book a Car →
            </Link>
          </div>
        </aside>
      </div>

      {d.packages.length > 0 && (
        <section className="bg-sand py-14">
          <div className="container-page">
            <h2 className="h2">{d.name} tour packages</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {d.packages.map((p) => (
                <PackageCard key={p.id} pkg={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
