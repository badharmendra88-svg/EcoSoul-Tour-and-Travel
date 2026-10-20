import type { ReactNode } from "react";
import { PageHero } from "./PageHero";

// Set to false once the business owner and legal/accounting adviser approve
// the policy texts (blueprint §14, §20 launch checklist).
export const POLICIES_ARE_DRAFT = true;
export const POLICIES_UPDATED = "20 October 2026";

export function PolicyPage({ title, path, children }: { title: string; path: string; children: ReactNode }) {
  return (
    <>
      <PageHero title={title} crumbs={[{ label: title, href: path }]} scene="forest" />
      <div className="container-page py-12">
        <article className="prose-body max-w-3xl">
          {POLICIES_ARE_DRAFT && (
            <p role="note" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              Draft under review. Final terms applicable to your trip are stated in your written quote and booking confirmation.
            </p>
          )}
          <p className="text-sm text-slate-500">Last updated: {POLICIES_UPDATED}</p>
          {children}
        </article>
      </div>
    </>
  );
}
