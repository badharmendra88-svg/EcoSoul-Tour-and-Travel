import type { Metadata } from "next";
import { site } from "@/config/site";

export const DEFAULT_SHARE_IMAGE = "/brand/og-default.png";

// FR-09: unique title, description and canonical URL per page.
export function pageMeta({
  title,
  description,
  path,
  noindex = false,
  image,
  imageAlt,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  /** Page photo for link previews (e.g. /media/nainital-….webp); defaults to the site share image. */
  image?: string | null;
  imageAlt?: string | null;
}): Metadata {
  const url = `${site.url}${path}`;
  // Every page gets a share image (WhatsApp, Facebook, X): its own photo, or the brand card
  const images = [image ? { url: `${site.url}${image}`, alt: imageAlt ?? title } : { url: `${site.url}${DEFAULT_SHARE_IMAGE}`, width: 1200, height: 630, alt: site.name }];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: site.name, locale: site.locale, type: "website", images },
    twitter: { card: "summary_large_image", title, description, images },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
