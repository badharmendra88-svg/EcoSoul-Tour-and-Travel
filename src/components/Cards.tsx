import Link from "next/link";
import type { Destination, Package } from "@prisma/client";
import { tripTypes } from "@/config/options";
import { formatPrice } from "@/lib/format";
import { parseList } from "@/lib/json";
import { SitePhoto } from "./SitePhoto";

type PackageWithDest = Package & { destinations?: Pick<Destination, "scene" | "name">[] };

// Review §B: real photo, duration, destination, who it suits, included
// services, price or "Request a customised quote", and a quote CTA.
export function PackageCard({ pkg }: { pkg: PackageWithDest }) {
  const price = formatPrice(pkg.startingPrice, pkg.currency);
  const scene = pkg.destinations?.[0]?.scene ?? (pkg.tripType === "PILGRIMAGE" ? "temple" : "mountain");
  const facts = parseList(pkg.inclusions).slice(0, 3);
  const places = pkg.destinations?.map((d) => d.name).join(" · ");
  return (
    <article className="card group relative flex flex-col overflow-hidden">
      <SitePhoto
        url={pkg.imageUrl}
        alt={pkg.imageAlt}
        scene={scene}
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="aspect-[16/10]"
        imgClassName="transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-forest-800">
        {tripTypes[pkg.tripType as keyof typeof tripTypes] ?? pkg.tripType}
      </span>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-sm font-medium text-forest-600">
            {pkg.durationLabel}
            {places ? ` · ${places}` : ""}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-forest-900">
            <Link href={`/packages/${pkg.slug}/`} className="after:absolute after:inset-0 hover:underline">
              {pkg.title}
            </Link>
          </h3>
          {pkg.audience && <p className="mt-1 text-xs font-medium text-slate-500">Best for: {pkg.audience}</p>}
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{pkg.summary}</p>
        </div>
        {facts.length > 0 && (
          <ul className="space-y-1 text-sm text-slate-600">
            {facts.map((f) => (
              <li key={f} className="flex gap-2">
                <span aria-hidden="true" className="text-forest-500">✓</span>
                <span className="line-clamp-1">{f}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto border-t border-slate-100 pt-4">
          {price ? (
            <p className="text-sm text-slate-600">
              From <strong className="text-lg text-forest-900">{price}</strong> <span className="text-xs">{pkg.priceBasis}</span>
            </p>
          ) : (
            <p className="text-sm font-semibold text-forest-900">Request a customised quote</p>
          )}
          <div className="relative z-10 mt-3 grid grid-cols-2 gap-2">
            <Link href={`/packages/${pkg.slug}/`} className="btn-outline px-3 py-2">View details</Link>
            <Link href={`/packages/${pkg.slug}/#enquire`} className="btn-primary px-3 py-2">Get Package Quote</Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function DestinationCard({
  d,
}: {
  d: Pick<Destination, "slug" | "name" | "summary" | "scene" | "region" | "cluster" | "bestFor" | "imageUrl" | "imageAlt">;
}) {
  const tags = (d.bestFor ?? "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 3);
  return (
    <article className="card group relative flex flex-col overflow-hidden">
      <SitePhoto
        url={d.imageUrl}
        alt={d.imageAlt}
        scene={d.scene}
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
        className="aspect-[4/3]"
        imgClassName="transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-forest-800">{d.region}</span>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-forest-900">
          <Link href={`/destinations/${d.slug}/`} className="after:absolute after:inset-0 group-hover:underline">
            {d.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{d.summary}</p>
        {tags.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1" aria-label="Best for">
            {tags.map((t) => (
              <li key={t} className="rounded-full bg-forest-50 px-2 py-0.5 text-[11px] font-medium text-forest-700">{t}</li>
            ))}
          </ul>
        )}
        <span className="mt-auto pt-3 text-sm font-semibold text-forest-700" aria-hidden="true">Explore destination →</span>
      </div>
    </article>
  );
}
