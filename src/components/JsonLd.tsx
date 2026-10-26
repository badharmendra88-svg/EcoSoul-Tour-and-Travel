import { jsonLd } from "@/lib/seo";

/** Structured data block (schema.org JSON-LD); `<` is escaped by jsonLd(). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(data)} />;
}
