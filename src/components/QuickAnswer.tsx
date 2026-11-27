import type { ReactNode } from "react";

// A short, direct answer near the top of a page: the summary search snippets and AI assistants
// (Google AI Overviews, ChatGPT, Perplexity) quote. Keep it to two or three factual sentences.
export function QuickAnswer({ children, updated }: { children: ReactNode; updated?: string }) {
  return (
    <section aria-labelledby="quick-answer" className="not-prose rounded-2xl border border-forest-100 bg-forest-50/60 p-5 sm:p-6">
      <h2 id="quick-answer" className="text-sm font-semibold tracking-wide text-forest-700 uppercase">Quick answer</h2>
      <div className="mt-2 text-lg leading-relaxed text-slate-800">{children}</div>
      {updated && <p className="mt-3 text-xs text-slate-500">Updated {updated}</p>}
    </section>
  );
}
