import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/admin-auth";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { faqsToLines, jsonToLines } from "@/lib/json";
import { formatDate } from "@/lib/format";
import { saveDestinationAction } from "../../../actions";
import { FormBanner, TextArea, TextField } from "../../AdminFields";
import { PhotoNote } from "../../ImageFields";
import { Icon, PageHeader } from "../../ui";

const scenes = ["mountain", "lake", "river", "forest", "snow", "temple", "meadow"];

export default async function EditDestinationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const me = await requireUser("content.edit");
  const { id } = await params;
  const { saved, error } = await searchParams;
  const isNew = id === "new";
  const d = isNew ? null : await db.destination.findUnique({ where: { id } });
  if (!isNew && !d) notFound();

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        back={{ href: "/admin/destinations/", label: "All destinations" }}
        eyebrow="Destination"
        title={isNew ? "New destination" : d!.name}
        actions={
          d?.status === "PUBLISHED" && (
            <Link href={`/destinations/${d.slug}/`} target="_blank" className="btn-admin-ghost">
              <Icon name="external" /> View on site
            </Link>
          )
        }
      />
      <FormBanner saved={saved} error={error} />

      <form action={saveDestinationAction} className="space-y-6">
        <input type="hidden" name="id" value={d?.id ?? ""} />

        <section className="grid gap-4 panel p-6 sm:grid-cols-2">
          <TextField name="name" label="Name" defaultValue={d?.name} required />
          <TextField name="slug" label="URL slug" defaultValue={d?.slug} hint="Changing it changes the public URL." />
          <div>
            <label htmlFor="region" className="admin-label">Region</label>
            <select id="region" name="region" defaultValue={d?.region ?? "Kumaon"} className="admin-input">
              <option>Kumaon</option>
              <option>Garhwal</option>
            </select>
          </div>
          <TextField name="bestFor" label="Best for" defaultValue={d?.bestFor} hint="Comma separated, e.g. Families, Couples, Weekend" />
          <TextField name="cluster" label="Category" defaultValue={d?.cluster} hint="e.g. Lake & hill escapes, Hill stations, Wildlife & nature" />
          <div>
            <label htmlFor="scene" className="admin-label">Artwork style</label>
            <select id="scene" name="scene" defaultValue={d?.scene ?? "mountain"} className="admin-input">
              {scenes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="admin-label">Status</label>
            <select id="status" name="status" defaultValue={d?.status ?? "DRAFT"} className="admin-input">
              <option value="DRAFT">Draft (hidden)</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
          <TextField name="sortOrder" label="Sort order" type="number" defaultValue={d?.sortOrder ?? 100} />
        </section>

        <section className="space-y-4 panel p-6">
          <h2 className="text-[15px] font-semibold text-slate-900">Content</h2>
          <TextArea name="summary" label="Card summary" defaultValue={d?.summary} rows={2} required />
          <TextArea name="intro" label="Introduction" defaultValue={d?.intro} rows={4} required hint="Original text: what the place is known for and who it suits." />
          <TextArea name="bestTime" label="Best time to visit" defaultValue={d?.bestTime} rows={3} hint="Qualify by weather, road, snow and activity conditions." />
          <TextArea name="howToReach" label="How to reach" defaultValue={d?.howToReach} rows={3} hint="Verify current rail/air/road services before publishing." />
          <TextField name="suggestedDuration" label="Suggested duration" defaultValue={d?.suggestedDuration} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextArea name="experiences" label="Things to do" rows={6} defaultValue={jsonToLines(d?.experiences)} hint="One per line" />
            <TextArea name="practical" label="Practical tips" rows={6} defaultValue={jsonToLines(d?.practical)} hint="One per line" />
          </div>
          <TextArea name="faqs" label="FAQs" rows={5} defaultValue={faqsToLines(d?.faqs)} hint="One per line: Question? | Answer" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="markReviewed" className="h-4 w-4" defaultChecked={isNew} />
            I have checked this content against current sources — update “last reviewed” date
            {d && <span className="text-slate-500">(currently {formatDate(d.reviewedAt)})</span>}
          </label>
        </section>

        <section className="space-y-4 panel p-6">
          <h2 className="text-[15px] font-semibold text-slate-900">Photo</h2>
          <PhotoNote imageUrl={d?.imageUrl} imageAlt={d?.imageAlt} anchor={d ? `destination-${d.id}` : undefined} canManage={can(me.role, "media.manage")} />
        </section>

        <section className="grid gap-4 panel p-6">
          <h2 className="text-[15px] font-semibold text-slate-900">SEO</h2>
          <TextField name="seoTitle" label="SEO title" defaultValue={d?.seoTitle} maxLength={70} />
          <TextArea name="seoDescription" label="Meta description" defaultValue={d?.seoDescription} rows={2} />
        </section>

        <button className="btn-admin-primary sticky bottom-4 px-6 py-3 shadow-xl shadow-forest-900/25"><Icon name="check" /> Save destination</button>
      </form>
    </div>
  );
}
