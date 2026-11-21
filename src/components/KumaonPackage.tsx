import Link from "next/link";
import { notFound } from "next/navigation";
import { TripLanding } from "@/components/TripLanding";
import { routeBetween, routePages, routePath, shortName } from "@/config/journeys";
import { KUMAON_HUB_PATH, kumaonById, kumaonPath } from "@/config/kumaon";
import { getPublishedDestinations } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

async function destinationPhoto(id: string) {
  return (await getPublishedDestinations()).find((d) => d.slug === id) ?? null;
}

export async function kumaonMetadata(id: string) {
  const p = kumaonById(id);
  if (!p) return {};
  const d = await destinationPhoto(id);
  return pageMeta({ title: p.title, description: p.description, path: kumaonPath(id), image: d?.imageUrl, imageAlt: d?.imageAlt });
}

/** Tour package landing page for one Kumaon destination. */
export async function KumaonPackagePage({ id }: { id: string }) {
  const p = kumaonById(id);
  if (!p) notFound();
  const d = await destinationPhoto(id);
  const fromDelhi = routeBetween("delhi", id);
  const fromKathgodam = routeBetween("kathgodam", id);
  const taxiRoutes = routePages.filter((r) => r.to.id === id).slice(0, 4);

  return (
    <TripLanding
      title={`${p.name} Tour Package`}
      eyebrow="Kumaon"
      intro={p.intro}
      crumbLabel={`${p.name} Tour Package`}
      path={kumaonPath(id)}
      scene="lake"
      imageUrl={d?.imageUrl}
      imageAlt={d?.imageAlt}
      imageCredit={d?.imageCredit}
      facts={[
        { label: "Altitude", value: p.altitude },
        { label: "Best time", value: p.bestTime },
        { label: "Ideal stay", value: p.idealStay },
        fromKathgodam
          ? { label: "From Kathgodam", value: `${fromKathgodam.km} km · ${fromKathgodam.time}` }
          : { label: "From Delhi", value: fromDelhi ? `${fromDelhi.km} km · ${fromDelhi.time}` : "By road" },
      ]}
      intro2={
        <>
          <p>{p.overview}</p>
          <p>
            Our {p.name} tour package includes your stay, a car with an experienced hill driver from{" "}
            {fromDelhi ? `Delhi (about ${fromDelhi.km} km), ` : ""}Kathgodam railway station or Pantnagar Airport, and a day-wise plan you can
            adjust. {d && <>Read more in our <Link href={`/destinations/${id}/`}>{p.name} travel guide</Link>, or </>}see all{" "}
            <Link href={KUMAON_HUB_PATH}>Kumaon tour packages</Link>.
          </p>
        </>
      }
      cardsTitle={`Places to see in ${p.name}`}
      cards={p.sights}
      plan={p.plan}
      checklistTitle={`Tips for your ${p.name} trip`}
      checklist={p.tips}
      faqTitle={`${p.name} tour package FAQs`}
      faqs={p.faqs}
      cta={{
        title: `Get your ${p.name} package quote`,
        text: "Share your dates, group size, starting city and hotel category. We reply with a day-wise plan and an itemised quote.",
        href: `/customise-my-trip/?destination=${encodeURIComponent(p.name)}`,
        label: `Request a ${p.name} quote`,
        whatsapp: `Hi EcoSoul, I'd like a ${p.name} tour package quote.`,
      }}
      related={{
        title: `Plan your ${p.name} trip`,
        links: [
          ...taxiRoutes.map((r) => ({ href: routePath(r), label: `${shortName(r.from)} to ${p.name} taxi` })),
          ...p.nearby.map((n) => ({ href: kumaonPath(n), label: `${kumaonById(n)?.name} tour package` })),
          { href: KUMAON_HUB_PATH, label: "All Kumaon tour packages" },
        ],
      }}
    />
  );
}
