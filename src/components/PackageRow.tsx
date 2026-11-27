import { PackageCard } from "@/components/Cards";
import { getPublishedPackages } from "@/lib/queries";

/** Published packages picked by slug, in the given order (missing or unpublished ones are skipped). */
export async function PackageRow({ slugs, title, className = "" }: { slugs: string[]; title: string; className?: string }) {
  const all = await getPublishedPackages();
  const picks = slugs.map((s) => all.find((p) => p.slug === s)).filter((p) => p != null);
  if (picks.length === 0) return null;
  return (
    <section aria-labelledby="package-row-title" className={`not-prose ${className}`}>
      <h2 id="package-row-title" className="h2">{title}</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {picks.map((p) => <PackageCard key={p.id} pkg={p} layout="grid" />)}
      </div>
    </section>
  );
}
