import Link from "next/link";
import { DestinationCard } from "@/components/Cards";
import { WhatsAppButton } from "@/components/ContactButtons";
import { IconTile, RidgeTop } from "@/components/Depth";
import { PageHero } from "@/components/PageHero";
import { QuickAnswer } from "@/components/QuickAnswer";
import { SitePhoto } from "@/components/SitePhoto";
import { guidePath, guides, type Guide } from "@/config/guides";
import { heroForPath } from "@/config/hero-images";
import { placeById, seasons } from "@/config/journeys";
import { site } from "@/config/site";
import { formatDate } from "@/lib/format";
import { getPublishedDestinations } from "@/lib/queries";
import { jsonLd, pageMeta } from "@/lib/seo";

// Re-render daily so the "Good to go right now" box follows the calendar month
export const revalidate = 86400;

export const metadata = pageMeta({
  title: "Uttarakhand Travel Guide: Best Time, Costs & Tips",
  description: "Practical Uttarakhand travel guides: the best time to visit, Char Dham and Kedarnath planning, trip costs, Nainital vs Mussoorie, packing lists and destination guides.",
  path: "/travel-guides/",
});

// Topic label + icon per guide (icons are 24px stroke paths)
const ICONS = {
  calendar: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  temple: "M12 3 7 9h10l-5-6ZM6 9h12v3H6zM7 12v8M17 12v8M10 20v-5h4v5M4 20h16",
  mountain: "m3 20 6-10 4 6 3-4 5 8H3Z",
  scale: "M12 4v16M5 8h14M5 8l-2 6a3 3 0 0 0 6 0L7 8M19 8l-2 6a3 3 0 0 0 6 0l-2-6M8 20h8",
  wallet: "M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4V7Zm0 0 12-3v3M16 13h2",
  bag: "M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2",
};
const topics: Record<string, { tag: string; icon: string; ask: string }> = {
  "best-time-to-visit-uttarakhand": { tag: "When to go", icon: ICONS.calendar, ask: "When should I go?" },
  "char-dham-yatra-guide": { tag: "Pilgrimage", icon: ICONS.temple, ask: "Planning the Char Dham" },
  "kedarnath-trip-guide": { tag: "Pilgrimage", icon: ICONS.mountain, ask: "Kedarnath trek or helicopter?" },
  "nainital-or-mussoorie": { tag: "Compare", icon: ICONS.scale, ask: "Nainital or Mussoorie?" },
  "uttarakhand-trip-cost": { tag: "Budget", icon: ICONS.wallet, ask: "How much will it cost?" },
  "uttarakhand-packing-list": { tag: "Packing", icon: ICONS.bag, ask: "What should I pack?" },
};
const topicOf = (g: Guide) => topics[g.slug] ?? { tag: "Guide", icon: ICONS.mountain, ask: g.title };

// Month (0 = Jan) → season card in config/journeys
const seasonIndex = [4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 3, 4];

const morePlanning = [
  { label: "How to reach Uttarakhand by train, flight and road", href: "/how-to-reach-uttarakhand/" },
  { label: "Char Dham Yatra — routes and packages", href: "/uttarakhand/char-dham-yatra/" },
  { label: "Kedarnath Yatra packages", href: "/uttarakhand/kedarnath-yatra-package/" },
  { label: "Kumaon tour packages and hill towns", href: "/uttarakhand/kumaon-tour-packages/" },
  { label: "Himalayan treks for beginners", href: "/uttarakhand/himalayan-treks/" },
  { label: "Taxi routes, distances and drive times", href: "/taxi/" },
];

const hindi = [
  { label: "केदारनाथ यात्रा गाइड", href: "/hi/kedarnath-yatra/" },
  { label: "चार धाम यात्रा", href: "/hi/char-dham-yatra/" },
  { label: "दिल्ली से नैनीताल टैक्सी", href: "/hi/nainital-taxi/" },
  { label: "हरिद्वार–ऋषिकेश टैक्सी", href: "/hi/haridwar-rishikesh-taxi/" },
];

export default async function TravelGuidesPage() {
  const destinations = await getPublishedDestinations();
  const now = new Date();
  const month = now.toLocaleString("en-IN", { month: "long", timeZone: "Asia/Kolkata" });
  const season = seasons[seasonIndex[Number(now.toLocaleString("en-US", { month: "numeric", timeZone: "Asia/Kolkata" })) - 1]];
  const destBySlug = new Map(destinations.map((d) => [d.slug, d]));
  const seasonPlaces = season.places.map((id) => {
    const name = placeById(id)?.name.replace(/ \(.*\)/, "") ?? id;
    const dest = destBySlug.get(id) ?? destinations.find((d) => d.name === name);
    return { name, href: dest ? `/destinations/${dest.slug}/` : null };
  });

  const [featured, ...rest] = guides;
  const regions = ["Kumaon", "Garhwal"].map((r) => ({ region: r, items: destinations.filter((d) => d.region === r) }));
  const otherDest = destinations.filter((d) => d.region !== "Kumaon" && d.region !== "Garhwal");
  if (otherDest.length) regions.push({ region: "More places", items: otherDest });

  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Uttarakhand Travel Guide",
    url: `${site.url}/travel-guides/`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: guides.map((g, i) => ({ "@type": "ListItem", position: i + 1, name: g.title, url: `${site.url}${guidePath(g)}` })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(itemList)} />
      <PageHero
        title="Uttarakhand Travel Guide"
        intro="Straight answers for planning your trip — when to go, how long you need, what it costs and what to carry — plus a guide to every destination we cover."
        crumbs={[{ label: "Travel Guide", href: "/travel-guides/" }]}
        scene="river"
      >
        {/* "I want to know…" shortcuts straight into the right guide */}
        <ul className="flex flex-wrap gap-2" aria-label="Jump to a guide">
          {guides.map((g) => (
            <li key={g.slug}>
              <Link href={guidePath(g)} className="glass inline-flex min-h-9 items-center rounded-full px-3.5 py-1.5 text-sm font-medium text-white ring-1 ring-white/25 transition-colors hover:bg-white/20">
                {topicOf(g).ask}
              </Link>
            </li>
          ))}
        </ul>
      </PageHero>

      <div className="container-page py-12">
        <QuickAnswer>
          The best time for most of Uttarakhand is March–June and September–November. The Char Dham and Kedarnath open around May and
          close in November, on dates announced each year. A hill-station trip needs 3–4 days from Delhi; Char Dham needs 10–12. Start
          with the guide that matches your question below.
        </QuickAnswer>

        {/* Planning guides: one featured + photo cards */}
        <section aria-labelledby="planning" className="mt-12">
          <p className="eyebrow">Plan your trip</p>
          <h2 id="planning" className="h2 mt-2">Planning guides</h2>
          <div className="reveal mt-8 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
            <GuideCard g={featured} big />
            <div className="grid gap-6 sm:grid-cols-2">
              {rest.slice(0, 2).map((g) => <GuideCard key={g.slug} g={g} />)}
            </div>
          </div>
          <div className="reveal mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(2).map((g) => <GuideCard key={g.slug} g={g} />)}
          </div>
        </section>
      </div>

      {/* Good to go right now */}
      <section className="bg-topo relative mt-6 bg-forest-800 py-12 text-white sm:py-14" aria-labelledby="right-now">
        <RidgeTop fill="var(--color-forest-800)" />
        <div className="container-page grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="reveal">
            <p className="text-xs font-semibold tracking-widest text-accent uppercase">Good to go in {month}</p>
            <h2 id="right-now" className="mt-2 font-serif text-2xl font-bold sm:text-3xl">{season.months}: {season.title}</h2>
            <p className="mt-3 max-w-xl text-forest-100">{season.text}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {seasonPlaces.map((p) => (
                <li key={p.name}>
                  {p.href ? (
                    <Link href={p.href} className="inline-flex rounded-full bg-accent px-3.5 py-1.5 text-sm font-semibold text-forest-900 shadow-[0_3px_0_#b86a05] hover:bg-accent-strong">
                      {p.name} →
                    </Link>
                  ) : (
                    <span className="inline-flex rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold ring-1 ring-white/20">{p.name}</span>
                  )}
                </li>
              ))}
            </ul>
            <Link href="/travel-guides/best-time-to-visit-uttarakhand/" className="mt-6 inline-block py-2 font-semibold text-accent hover:underline">
              Month-by-month guide →
            </Link>
          </div>
          {/* Year ring: the five seasons, current one lit */}
          <ol className="reveal grid grid-cols-5 gap-2" aria-label="Seasons through the year">
            {seasons.map((se) => {
              const on = se === season;
              return (
                <li
                  key={se.months}
                  className={`flex flex-col items-center justify-end rounded-2xl p-2 text-center ring-1 transition-transform ${
                    on ? "glass -translate-y-2 bg-white/15 ring-accent" : "ring-white/10"
                  }`}
                  style={{ height: on ? "9.5rem" : "7.5rem" }}
                  aria-current={on ? "true" : undefined}
                >
                  <span className={`text-[11px] font-bold tracking-wide uppercase ${on ? "text-accent" : "text-forest-200"}`}>{se.months.replace(/ /g, "")}</span>
                  <span className="mt-1 line-clamp-2 text-[11px] leading-tight text-forest-100">{se.title}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Destination guides by region */}
      <section className="relative bg-sand py-12 sm:py-16" aria-labelledby="destinations">
        <RidgeTop fill="var(--color-sand)" />
        <div className="container-page">
          <p className="eyebrow">Destination guides</p>
          <h2 id="destinations" className="h2 mt-2">Where to go in Uttarakhand</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Each guide covers the best time, how to reach, where to stay, things to do and a suggested plan.
          </p>
          {regions.filter((r) => r.items.length).map((r) => (
            <div key={r.region} className="mt-10">
              <h3 className="flex items-center gap-3 text-lg font-semibold text-forest-900">
                {r.region}
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-forest-700 ring-1 ring-forest-100">{r.items.length} places</span>
              </h3>
              <div className="reveal mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {r.items.map((d) => <DestinationCard key={d.id} d={d} layout="grid" />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* More planning pages + Hindi + CTA */}
      <section className="container-page grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="h2">More planning pages</h2>
          <ul className="reveal mt-6 grid gap-3 sm:grid-cols-2">
            {morePlanning.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="card tilt flex h-full items-center justify-between gap-3 px-4 py-3.5" data-tilt="5">
                  <span className="font-medium text-forest-900">{m.label}</span>
                  <span className="shrink-0 font-semibold text-forest-700" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="mt-10 text-lg font-semibold text-forest-900" lang="hi">हिंदी में पढ़ें</h2>
          <ul className="mt-3 flex flex-wrap gap-2" lang="hi">
            {hindi.map((h) => (
              <li key={h.href}>
                <Link href={h.href} className="chip hover:bg-forest-100">{h.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <aside className="bg-topo h-fit rounded-2xl bg-forest-800 p-6 text-white shadow-[0_24px_48px_-24px_rgb(3_41_26/0.6)]">
          <IconTile d={ICONS.calendar} className="icon-3d-accent" />
          <h2 className="mt-4 text-xl font-semibold">Still deciding?</h2>
          <p className="mt-2 text-sm text-forest-100">
            Tell us your dates, group and budget. A local planner replies within {site.replyTime} with a day-wise plan and a written quote.
          </p>
          <div className="mt-5 grid gap-3">
            <Link href="/customise-my-trip/" className="btn-primary w-full">Plan my trip</Link>
            <WhatsAppButton className="btn-ghost-light w-full" />
          </div>
        </aside>
      </section>
    </>
  );
}

function GuideCard({ g, big = false }: { g: Guide; big?: boolean }) {
  const t = topicOf(g);
  const photo = heroForPath(guidePath(g));
  return (
    <article data-tilt={big ? "4" : "6"} className="card tilt group relative flex h-full flex-col overflow-hidden">
      <SitePhoto
        url={photo?.url}
        alt={photo?.alt}
        scene="mountain"
        sizes={big ? "(min-width: 1024px) 760px, 100vw" : "(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"}
        className={big ? "aspect-[16/9] lg:aspect-auto lg:min-h-80 lg:flex-1" : "aspect-[16/9]"}
        imgClassName="transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute top-3 left-3 z-[3] rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-forest-800 shadow-md backdrop-blur">{t.tag}</span>
      <div className={`flex flex-col ${big ? "p-6" : "flex-1 p-5"}`}>
        <div className="flex items-center gap-3">
          <IconTile d={t.icon} className={big ? "icon-3d-accent" : ""} />
          <p className="text-xs font-medium text-slate-500">
            {g.readMinutes} min read · Updated {formatDate(g.reviewed)}
          </p>
        </div>
        <h3 className={`mt-3 font-semibold text-forest-900 ${big ? "font-serif text-2xl" : "text-lg"}`}>
          <Link href={guidePath(g)} className="after:absolute after:inset-0 group-hover:underline">{g.title}</Link>
        </h3>
        <p className={`mt-2 text-sm text-slate-600 ${big ? "" : "line-clamp-3"}`}>{big ? g.quickAnswer : g.description}</p>
        <span className="mt-auto pt-4 text-sm font-semibold text-forest-700" aria-hidden="true">Read guide →</span>
      </div>
    </article>
  );
}
