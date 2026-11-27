import { cache } from "react";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

// Real traveller reviews, added in Admin → Reviews only with the customer's permission. Nothing renders
// until at least one review is published, and we never add rating markup or invent reviews.

const getPublishedReviews = cache(() =>
  db.review.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 6 }),
);

export async function TravellerReviews({ limit = 6, className = "" }: { limit?: number; className?: string }) {
  const [reviews, s] = await Promise.all([getPublishedReviews(), getSettings()]);
  if (reviews.length === 0) return null;
  const gbp = s.social.find((l) => l.key === "googleBusiness")?.url;
  const googleProfile = gbp && /^https:\/\/g\.page\/r\/[\w-]+/.test(gbp) ? gbp.replace(/\/review\/?$/, "") : null;

  return (
    <section aria-labelledby="reviews-title" className={className}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Traveller reviews</p>
          <h2 id="reviews-title" className="h2 mt-2">What our travellers say</h2>
        </div>
        {googleProfile && (
          <a href={googleProfile} target="_blank" rel="noopener noreferrer" className="py-2 font-semibold text-forest-700 hover:underline">
            See all reviews on Google →
          </a>
        )}
      </div>
      <div className="snap-row mt-6 md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {reviews.slice(0, limit).map((r) => (
          <figure key={r.id} className="card flex flex-col p-6">
            {r.rating && (
              // SVG stars, not "★" text: gold text on white fails the 4.5:1 text-contrast check
              <p className="flex gap-0.5" role="img" aria-label={`${r.rating} out of 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <svg key={n} viewBox="0 0 20 20" className={`h-4 w-4 ${n <= r.rating! ? "text-amber-500" : "text-slate-300"}`} fill="currentColor" aria-hidden="true">
                    <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z" />
                  </svg>
                ))}
              </p>
            )}
            <blockquote className="mt-3 flex-1 leading-relaxed text-slate-700">“{r.text}”</blockquote>
            <figcaption className="mt-4 text-sm">
              <span className="font-semibold text-forest-900">{r.name}</span>
              {r.place && <span className="text-slate-500">, {r.place}</span>}
              {r.tripLabel && <span className="block text-xs text-slate-500">{r.tripLabel}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
