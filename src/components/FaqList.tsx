import type { Faq } from "@/lib/json";
import { jsonLd } from "@/lib/seo";

// AEO: direct, concise answers. FAQPage markup only for visible, genuine FAQs.
export function FaqList({ faqs, withSchema = true }: { faqs: Faq[]; withSchema?: boolean }) {
  if (faqs.length === 0) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {withSchema && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(data)} />}
      {faqs.map((f) => (
        <details key={f.q} className="group p-5">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium text-forest-900">
            {f.q}
            <span aria-hidden="true" className="mt-0.5 text-forest-600 transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 leading-relaxed text-slate-600">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
