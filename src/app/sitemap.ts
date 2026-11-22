import type { MetadataRoute } from "next";
import { guidePath, guides } from "@/config/guides";
import { heroForPath, heroForPlace } from "@/config/hero-images";
import { destinationSlugFor, originPath, origins, routePages, routePath } from "@/config/journeys";
import { kumaonPath, kumaonPlaces } from "@/config/kumaon";
import { site } from "@/config/site";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

const staticPaths = [
  "/",
  "/destinations/",
  "/uttarakhand/tour-packages/",
  "/uttarakhand/taxi-booking/",
  "/uttarakhand/driver-booking/",
  "/hotel-booking/",
  "/uttarakhand/airport-transfers/",
  "/uttarakhand/local-sightseeing-taxi/",
  "/uttarakhand/haldwani-taxi-service/",
  "/uttarakhand/char-dham-yatra/",
  "/uttarakhand/kedarnath-yatra-package/",
  "/uttarakhand/auli-tour-package/",
  "/uttarakhand/himalayan-treks/",
  "/uttarakhand/kumaon-tour-packages/",
  ...kumaonPlaces.map((p) => kumaonPath(p.id)),
  "/hi/char-dham-yatra/",
  "/how-to-reach-uttarakhand/",
  ...origins.map(originPath),
  "/taxi/",
  "/travel-guides/",
  ...guides.map(guidePath),
  ...routePages.map(routePath),
  "/customise-my-trip/",
  "/join-as-driver/",
  "/about-us/",
  "/contact/",
  "/faqs/",
  "/booking-policy/",
  "/cancellation-policy/",
  "/privacy-policy/",
  "/terms-and-conditions/",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [destinations, packages, settings] = await Promise.all([
    db.destination.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true, imageUrl: true } }),
    db.package.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true, imageUrl: true } }),
    getSettings(),
  ]);
  const destPhoto = new Map(destinations.map((d) => [d.slug, d.imageUrl]));
  const abs = (u: string | null | undefined) => (u ? [u.startsWith("http") ? u : `${site.url}${u}`] : undefined);

  // The photo each page shows in its header, mirroring the page code (admin photo first, then stock photo)
  function photoFor(path: string): string | null | undefined {
    if (path === "/") return settings.heroImageUrl;
    const route = routePages.find((r) => routePath(r) === path);
    if (route) return destPhoto.get(destinationSlugFor(route.to.id)) ?? heroForPlace(route.to.id).url;
    const kumaon = kumaonPlaces.find((k) => kumaonPath(k.id) === path);
    if (kumaon && destPhoto.get(kumaon.id)) return destPhoto.get(kumaon.id);
    if (path === "/uttarakhand/auli-tour-package/") return destPhoto.get("auli");
    if (path === "/uttarakhand/himalayan-treks/") return destPhoto.get("valley-of-flowers");
    const origin = origins.find((o) => originPath(o) === path);
    if (origin) return origin.picks.map((id) => destPhoto.get(destinationSlugFor(id))).find(Boolean);
    return heroForPath(path)?.url;
  }

  return [
    ...staticPaths.map((p) => ({ url: `${site.url}${p}`, images: abs(photoFor(p)) })),
    ...destinations.map((d) => ({ url: `${site.url}/destinations/${d.slug}/`, lastModified: d.updatedAt, images: abs(d.imageUrl) })),
    ...packages.map((p) => ({ url: `${site.url}/packages/${p.slug}/`, lastModified: p.updatedAt, images: abs(p.imageUrl) })),
  ];
}
