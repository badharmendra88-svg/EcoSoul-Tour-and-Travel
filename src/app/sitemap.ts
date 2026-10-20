import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { db } from "@/lib/db";

export const revalidate = 3600;

const staticPaths = [
  "/",
  "/destinations/",
  "/uttarakhand/tour-packages/",
  "/uttarakhand/taxi-booking/",
  "/uttarakhand/driver-booking/",
  "/uttarakhand/airport-transfers/",
  "/uttarakhand/local-sightseeing-taxi/",
  "/uttarakhand/haldwani-taxi-service/",
  "/uttarakhand/char-dham-yatra/",
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
  const [destinations, packages] = await Promise.all([
    db.destination.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.package.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);
  return [
    ...staticPaths.map((p) => ({ url: `${site.url}${p}` })),
    ...destinations.map((d) => ({ url: `${site.url}/destinations/${d.slug}/`, lastModified: d.updatedAt })),
    ...packages.map((p) => ({ url: `${site.url}/packages/${p.slug}/`, lastModified: p.updatedAt })),
  ];
}
