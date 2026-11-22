import type { Metadata } from "next";
import { heroForPath } from "@/config/hero-images";
import { site } from "@/config/site";

export const DEFAULT_SHARE_IMAGE = "/brand/og-default.png";

// Public pages say so explicitly: <meta name="robots" content="index, follow"> plus large image previews for Google.
// Metadata merges shallowly, so every page sets `robots` itself instead of relying on the layout.
export const INDEX_ROBOTS = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
} satisfies Metadata["robots"];

// Search results show about 60 characters of a title and 155–160 of a description; longer ones get cut
// off and SEO audits flag them. The layout adds " | EcoSoul" to page titles.
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 158;
const TITLE_SUFFIX = ` | ${site.shortName}`;

/** Keep the brand suffix only when the whole title still fits. */
function seoTitle(title: string): Metadata["title"] {
  return title.length + TITLE_SUFFIX.length <= TITLE_MAX ? title : { absolute: title };
}

/** Trim an over-long description at a word boundary. */
export function seoDescription(text: string, max = DESCRIPTION_MAX) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:—–-]+$/, "")}…`;
}

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
  description = seoDescription(description);
  // Link previews (WhatsApp, Facebook, Google Discover) show the page's own photo: the admin photo, else the
  // stock header photo chosen for this page, else the brand card
  const stock = image ? null : heroForPath(path);
  const images = [
    image
      ? { url: `${site.url}${image}`, alt: imageAlt ?? title }
      : stock
        ? { url: `${site.url}${stock.url}`, width: 1920, height: 1080, alt: stock.alt }
        : { url: `${site.url}${DEFAULT_SHARE_IMAGE}`, width: 1200, height: 630, alt: site.name },
  ];
  return {
    title: seoTitle(title),
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: site.name, locale: site.locale, type: "website", images },
    twitter: { card: "summary_large_image", title, description, images },
    robots: noindex ? { index: false, follow: true } : INDEX_ROBOTS,
  };
}

export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
