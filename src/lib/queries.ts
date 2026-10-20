import "server-only";
import { db } from "./db";

// Public read queries — only PUBLISHED content ever reaches visitors.

const destSummary = { select: { slug: true, name: true, scene: true, region: true } } as const;

export function getPublishedPackages(opts: { featured?: boolean; destination?: string; tripType?: string; maxDays?: number; minDays?: number } = {}) {
  return db.package.findMany({
    where: {
      status: "PUBLISHED",
      ...(opts.featured ? { featured: true } : {}),
      ...(opts.tripType ? { tripType: opts.tripType } : {}),
      ...(opts.destination ? { destinations: { some: { slug: opts.destination } } } : {}),
      ...(opts.minDays || opts.maxDays
        ? { durationDays: { ...(opts.minDays ? { gte: opts.minDays } : {}), ...(opts.maxDays ? { lte: opts.maxDays } : {}) } }
        : {}),
    },
    include: { destinations: destSummary },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
}

export function getPackage(slug: string) {
  return db.package.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { destinations: { where: { status: "PUBLISHED" }, ...destSummary } },
  });
}

export function getPublishedDestinations() {
  return db.destination.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export function getDestination(slug: string) {
  return db.destination.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      packages: { where: { status: "PUBLISHED" }, include: { destinations: destSummary }, orderBy: { sortOrder: "asc" } },
    },
  });
}
