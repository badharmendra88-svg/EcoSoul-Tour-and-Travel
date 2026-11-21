import Link from "next/link";
import type { ReactNode } from "react";
import { WhatsAppButton } from "@/components/ContactButtons";
import { FaqList } from "@/components/FaqList";
import { PageHero } from "@/components/PageHero";

// Shared layout for keyword landing pages (Kedarnath yatra, Auli, Himalayan treks): quick facts,
// what we arrange, a sample plan, a checklist, FAQs and an enquiry sidebar. Prices are quoted per
// group, so these pages never show a fixed price.

export type TripLandingProps = {
  title: string;
  eyebrow: string;
  intro: string;
  crumbLabel: string;
  path: string;
  scene: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageCredit?: string | null;
  /** Shown above the content, e.g. "not a government website" or safety rules. */
  notice?: { title: string; body: ReactNode };
  facts: { label: string; value: string }[];
  intro2?: ReactNode;
  cardsTitle: string;
  cards: { title: string; text: string; meta?: string }[];
  plan?: { title: string; days: [string, string][]; note?: string };
  checklistTitle: string;
  checklist: string[];
  faqTitle: string;
  faqs: { q: string; a: string }[];
  sources?: ReactNode;
  cta: { title: string; text: string; href: string; label: string; whatsapp: string };
  related: { title: string; links: { href: string; label: string }[] };
};

export function TripLanding(p: TripLandingProps) {
  return (
    <>
      <PageHero
        title={p.title}
        intro={p.intro}
        eyebrow={p.eyebrow}
        crumbs={[{ label: p.crumbLabel, href: p.path }]}
        scene={p.scene}
        imageUrl={p.imageUrl}
        imageAlt={p.imageAlt}
        imageCredit={p.imageCredit}
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <article className="prose-body min-w-0">
          {p.notice && (
            <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
              <p className="font-semibold">{p.notice.title}</p>
              <div className="mt-1 text-sm">{p.notice.body}</div>
            </div>
          )}

          <dl className="not-prose grid grid-cols-2 gap-3 sm:grid-cols-4">
            {p.facts.map((f) => (
              <div key={f.label} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <dt className="text-xs text-slate-500">{f.label}</dt>
                <dd className="mt-1 text-sm font-semibold text-forest-900">{f.value}</dd>
              </div>
            ))}
          </dl>

          {p.intro2}

          <h2>{p.cardsTitle}</h2>
          <div className="not-prose grid gap-4 sm:grid-cols-2">
            {p.cards.map((c) => (
              <div key={c.title} className="card p-5">
                <h3 className="font-semibold text-forest-900">{c.title}</h3>
                {c.meta && <p className="mt-1 text-xs font-medium text-leaf-700">{c.meta}</p>}
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.text}</p>
              </div>
            ))}
          </div>

          {p.plan && (
            <>
              <h2>{p.plan.title}</h2>
              <ol className="not-prose relative space-y-3 border-l-2 border-forest-100 pl-5">
                {p.plan.days.map(([day, text]) => (
                  <li key={day} className="relative">
                    <span className="absolute top-1 -left-[1.6rem] h-3 w-3 rounded-full bg-forest-600 ring-4 ring-cream" aria-hidden="true" />
                    <p className="text-sm"><strong className="text-forest-900">{day}:</strong> <span className="text-slate-700">{text}</span></p>
                  </li>
                ))}
              </ol>
              {p.plan.note && <p className="text-sm text-slate-500">{p.plan.note}</p>}
            </>
          )}

          <h2>{p.checklistTitle}</h2>
          <ul>
            {p.checklist.map((c) => <li key={c}>{c}</li>)}
          </ul>

          <h2>{p.faqTitle}</h2>
          <FaqList faqs={p.faqs} />

          {p.sources && <p className="text-sm text-slate-500">{p.sources}</p>}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-forest-900">{p.cta.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{p.cta.text}</p>
            <div className="mt-4 grid gap-3">
              <Link href={p.cta.href} className="btn-primary w-full">{p.cta.label}</Link>
              <WhatsAppButton className="btn-secondary w-full" message={p.cta.whatsapp} />
            </div>
          </div>
          <nav aria-label={p.related.title} className="card p-6 text-sm">
            <h2 className="font-semibold text-forest-900">{p.related.title}</h2>
            <ul className="mt-3 space-y-1">
              {p.related.links.map((l) => (
                <li key={l.href}><Link href={l.href} className="inline-block py-1.5 text-forest-700 hover:underline">{l.label} →</Link></li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}
