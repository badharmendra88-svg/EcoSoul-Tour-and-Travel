import Link from "next/link";
import type { Destination, Package } from "@prisma/client";
import { tripTypes } from "@/config/options";
import { formatPrice } from "@/lib/format";
import { parseList } from "@/lib/json";
import { SceneArt } from "./SceneArt";

type PackageWithDest = Package & { destinations?: Pick<Destination, "scene" | "name">[] };

// §13: cards show image, title, duration, price basis, 2–3 key facts and CTA.
export function PackageCard({ pkg }: { pkg: PackageWithDest }) {
  const price = formatPrice(pkg.startingPrice, pkg.currency);
  const scene = pkg.destinations?.[0]?.scene ?? (pkg.tripType === "PILGRIMAGE" ? "temple" : "mountain");
  const facts = parseList(pkg.inclusions).slice(0, 3);
  return (
    <article className="card group relative flex flex-col overflow-hidden">
      <Link href={`/packages/${pkg.slug}/`} className="relative block aspect-[16/9] overflow-hidden" tabIndex={-1} aria-hidden="true">
        <SceneArt scene={scene} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-forest-800">
          {tripTypes[pkg.tripType as keyof typeof tripTypes] ?? pkg.tripType}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-sm font-medium text-forest-600">{pkg.durationLabel}</p>
          <h3 className="mt-1 text-lg font-semibold text-forest-900">
            <Link href={`/packages/${pkg.slug}/`} className="after:absolute after:inset-0 hover:underline">
              {pkg.title}
            </Link>
          </h3>
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
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            {price ? (
              <>
                <p className="text-xs text-slate-500">Starting from</p>
                <p className="text-lg font-bold text-forest-900">{price}</p>
                {pkg.priceBasis && <p className="text-xs text-slate-500">{pkg.priceBasis}</p>}
              </>
            ) : (
              <>
                <p className="text-xs text-slate-500">Price</p>
                <p className="font-semibold text-forest-900">On request</p>
              </>
            )}
          </div>
          <Link href={`/packages/${pkg.slug}/`} className="btn-outline relative z-10 px-4 py-2">
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function DestinationCard({ d }: { d: Pick<Destination, "slug" | "name" | "summary" | "scene" | "region" | "cluster"> }) {
  return (
    <Link href={`/destinations/${d.slug}/`} className="card group block overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <SceneArt scene={d.scene} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-forest-800">{d.region}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-forest-900 group-hover:underline">{d.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{d.summary}</p>
      </div>
    </Link>
  );
}
