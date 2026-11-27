import Link from "next/link";
import { WhatsAppButton } from "@/components/ContactButtons";
import { FaqList } from "@/components/FaqList";
import { TransportForm } from "@/components/forms/TransportForm";
import { PageHero } from "@/components/PageHero";
import { QuickAnswer } from "@/components/QuickAnswer";
import { routePages, routePath, type RoutePage } from "@/config/journeys";
import { site } from "@/config/site";

// Hindi taxi landing pages (/hi/<x>-taxi/) for travellers who search in Hindi. Distances and drive
// times come from the same route table as the English /taxi/ pages; fares are always quoted in writing.

export type HindiRoute = { from: string; to: string; fromHi: string; toHi: string };

export function findRoute(from: string, to: string): RoutePage | undefined {
  return routePages.find((r) => r.from.id === from && r.to.id === to);
}

/** "5–6 hrs" / "45 min" → Hindi */
export function hindiTime(t: string) {
  return t.replace("hrs", "घंटे").replace("hr", "घंटा").replace("min", "मिनट");
}

export function HindiTaxiPage({
  title,
  intro,
  path,
  englishPath,
  routes,
  answer,
  points,
  faqs,
  dropName,
  related,
}: {
  title: string;
  intro: string;
  path: string;
  englishPath: string;
  routes: HindiRoute[];
  answer: React.ReactNode;
  points: string[];
  faqs: { q: string; a: string }[];
  /** English place name pre-filled as the drop in the booking form. */
  dropName: string;
  related: { href: string; label: string }[];
}) {
  const rows = routes.map((r) => ({ ...r, page: findRoute(r.from, r.to) })).filter((r) => r.page);
  const main = rows[0]?.page;

  return (
    <div lang="hi">
      <PageHero title={title} intro={intro} crumbs={[{ label: title, href: path }]} eyebrow="टैक्सी बुकिंग" scene="mountain">
        <Link href={englishPath} lang="en" hrefLang="en" className="chip bg-white/90">Read in English →</Link>
      </PageHero>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <article className="prose-body min-w-0">
          <QuickAnswer label="सीधा जवाब">{answer}</QuickAnswer>

          <h2>दूरी और समय</h2>
          <div className="not-prose overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3">रूट</th>
                  <th className="px-4 py-3">दूरी</th>
                  <th className="px-4 py-3">समय</th>
                  <th className="px-4 py-3"><span className="sr-only">बुक करें</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.page!.slug}>
                    <td className="px-4 py-3 font-semibold text-forest-900">{r.fromHi} → {r.toHi}</td>
                    <td className="px-4 py-3 text-slate-700">लगभग {r.page!.km} किमी</td>
                    <td className="px-4 py-3 text-slate-700">{hindiTime(r.page!.time)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={routePath(r.page!)} className="font-semibold whitespace-nowrap text-forest-700 hover:underline">विवरण →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>गाड़ियाँ</h2>
          <ul>
            <li><strong>सेडान</strong> (Swift Dzire / Etios या समान) — 4 यात्री तक, कम सामान।</li>
            <li><strong>SUV</strong> (Ertiga / Innova या समान) — 6 यात्री तक, परिवार और ज़्यादा सामान के लिए सबसे आरामदायक।</li>
            <li><strong>टेम्पो ट्रैवलर</strong> (12 सीटर) — 7 से 12 यात्रियों के ग्रुप के लिए।</li>
          </ul>

          <h2>हमारे साथ क्यों</h2>
          <ul>
            {points.map((p) => <li key={p}>{p}</li>)}
          </ul>

          <div id="book" className="not-prose scroll-mt-24">
            <h2 className="h2">टैक्सी बुक करें</h2>
            <p className="mt-2 text-slate-600">फ़ॉर्म भरने में एक मिनट लगता है। हम {site.replyTime.replace("minutes", "मिनट")} में WhatsApp पर किराया और गाड़ी की पुष्टि भेजते हैं।</p>
            <div className="card mt-6 p-6 sm:p-8" lang="en">
              <TransportForm defaultService="ONE_WAY" initialPickup={main?.from.name ?? ""} initialDrop={dropName} />
            </div>
          </div>

          <h2>अक्सर पूछे जाने वाले सवाल</h2>
          <FaqList faqs={faqs} />
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-forest-900">किराया जानना है?</h2>
            <p className="mt-2 text-sm text-slate-600">तारीख़ और यात्रियों की संख्या WhatsApp पर भेजिए — हम लिखित किराया भेजेंगे।</p>
            <div className="mt-4 grid gap-3">
              <a href="#book" className="btn-primary w-full">टैक्सी बुक करें</a>
              <WhatsAppButton className="btn-secondary w-full" label="WhatsApp पर पूछें" message={`नमस्ते EcoSoul, मुझे ${title} चाहिए। तारीख़: ___ यात्री: ___`} />
            </div>
          </div>
          <nav aria-label="और जानकारी" className="card p-6 text-sm">
            <h2 className="font-semibold text-forest-900">और जानकारी</h2>
            <ul className="mt-3 space-y-1">
              {related.map((l) => (
                <li key={l.href}><Link href={l.href} className="inline-block py-1.5 text-forest-700 hover:underline">{l.label} →</Link></li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}
