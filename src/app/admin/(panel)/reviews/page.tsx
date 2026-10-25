import type { Review } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { deleteReviewAction, saveReviewAction } from "../../actions";
import { FormBanner } from "../AdminFields";
import { Badge, EmptyState, Icon, PageHeader, Panel } from "../ui";

function ReviewForm({ review }: { review?: Review }) {
  return (
    <form action={saveReviewAction} className="space-y-4">
      {review && <input type="hidden" name="id" value={review.id} />}
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block"><span className="admin-label">Name as approved by customer</span><input name="name" defaultValue={review?.name} required placeholder="e.g. Priya S." className="admin-input" /></label>
        <label className="block"><span className="admin-label">From (optional)</span><input name="place" defaultValue={review?.place ?? ""} placeholder="e.g. Delhi" className="admin-input" /></label>
        <label className="block"><span className="admin-label">Trip (optional)</span><input name="tripLabel" defaultValue={review?.tripLabel ?? ""} placeholder="e.g. Nainital family trip, May 2026" className="admin-input" /></label>
      </div>
      <label className="block"><span className="admin-label">Review — customer&apos;s own words</span><textarea name="text" defaultValue={review?.text} required rows={3} className="admin-input" /></label>
      <div className="grid gap-4 sm:grid-cols-[1fr_140px_120px]">
        <label className="block">
          <span className="admin-label">Permission record</span>
          <input name="consentNote" defaultValue={review?.consentNote} required placeholder="e.g. Approved on WhatsApp, 12 May 2026" className="admin-input" />
        </label>
        <label className="block">
          <span className="admin-label">Rating</span>
          <select name="rating" defaultValue={review?.rating ?? ""} className="admin-input">
            <option value="">No rating</option>
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} ★</option>)}
          </select>
        </label>
        <label className="block"><span className="admin-label">Order</span><input name="sortOrder" type="number" defaultValue={review?.sortOrder ?? 100} className="admin-input" /></label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={review?.published} className="h-4 w-4" /> Show on website</label>
        <button className="btn-admin-primary"><Icon name="check" /> {review ? "Save review" : "Add review"}</button>
      </div>
    </form>
  );
}

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin("content.edit");
  const { saved, error } = await searchParams;
  const reviews = await db.review.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Customer reviews"
        subtitle="Publish only genuine reviews, in the customer's own words, with their permission recorded. Never write or edit reviews on a customer's behalf."
      />
      <div className="space-y-6">
        <FormBanner saved={saved} error={error} />
        <Panel title="Add a review" icon="plus">
          <ReviewForm />
        </Panel>
        <Panel title="All reviews" icon="message" description={`${reviews.filter((r) => r.published).length} shown on the website`} bodyClassName="divide-y divide-slate-100">
          {reviews.length === 0 && <EmptyState icon="message" title="No reviews yet" text="After each trip, ask customers for honest feedback and permission to publish it." />}
          {reviews.map((r) => (
            <details key={r.id} className="group px-5 py-4 sm:px-6">
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                <span>
                  <span className="font-medium text-slate-900">{r.name}</span>
                  {r.tripLabel && <span className="text-sm text-slate-500"> · {r.tripLabel}</span>}
                  <span className="mt-0.5 block line-clamp-1 text-sm text-slate-600">“{r.text}”</span>
                </span>
                <span className="flex items-center gap-2">
                  {r.rating && <span className="text-sm text-amber-500">{"★".repeat(r.rating)}</span>}
                  <Badge tone={r.published ? "emerald" : "slate"}>{r.published ? "Published" : "Hidden"}</Badge>
                  <Icon name="chevron" className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90" />
                </span>
              </summary>
              <div className="mt-4 space-y-3">
                <ReviewForm review={r} />
                <form action={deleteReviewAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="py-2 text-sm font-medium text-rose-700 hover:underline">Delete review</button>
                </form>
              </div>
            </details>
          ))}
        </Panel>
      </div>
    </>
  );
}
