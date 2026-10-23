import Link from "next/link";
import { notFound } from "next/navigation";
import { tripTypes } from "@/config/options";
import { requireUser } from "@/lib/admin-auth";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { itineraryToLines, jsonToLines } from "@/lib/json";
import { savePackageAction } from "../../../actions";
import { FormBanner, TextArea, TextField } from "../../AdminFields";
import { PhotoNote } from "../../ImageFields";
import { Icon, PageHeader } from "../../ui";

export default async function EditPackagePage({
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
  const [pkg, destinations] = await Promise.all([
    isNew ? null : db.package.findUnique({ where: { id }, include: { destinations: { select: { slug: true } } } }),
    db.destination.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } }),
  ]);
  if (!isNew && !pkg) notFound();
  const selected = new Set(pkg?.destinations.map((d) => d.slug));

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        back={{ href: "/admin/packages/", label: "All packages" }}
        eyebrow="Package"
        title={isNew ? "New package" : pkg!.title}
        actions={
          pkg?.status === "PUBLISHED" && (
            <Link href={`/packages/${pkg.slug}/`} target="_blank" className="btn-admin-ghost">
              <Icon name="external" /> View on site
            </Link>
          )
        }
      />
      <FormBanner saved={saved} error={error} />

      <form action={savePackageAction} className="space-y-6">
        <input type="hidden" name="id" value={pkg?.id ?? ""} />

        <section className="grid gap-4 panel p-6 sm:grid-cols-2">
          <div className="sm:col-span-2"><TextField name="title" label="Title" defaultValue={pkg?.title} required maxLength={160} /></div>
          <TextField name="slug" label="URL slug" defaultValue={pkg?.slug} hint="Lowercase words with hyphens. Changing it changes the public URL." />
          <div>
            <label htmlFor="status" className="admin-label">Status</label>
            <select id="status" name="status" defaultValue={pkg?.status ?? "DRAFT"} className="admin-input">
              <option value="DRAFT">Draft (hidden)</option>
              <option value="PUBLISHED">Published</option>
              <option value="PAUSED">Paused (hidden — unavailable/unsafe)</option>
            </select>
          </div>
          <div className="sm:col-span-2"><TextArea name="summary" label="Summary" defaultValue={pkg?.summary} rows={2} required /></div>
          <div>
            <label htmlFor="tripType" className="admin-label">Trip type</label>
            <select id="tripType" name="tripType" defaultValue={pkg?.tripType ?? "FAMILY"} className="admin-input">
              {Object.entries(tripTypes).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </div>
          <TextField name="audience" label="Best for" defaultValue={pkg?.audience} />
          <TextField name="durationDays" label="Duration (days, for filters)" type="number" defaultValue={pkg?.durationDays ?? 3} required />
          <TextField name="durationLabel" label="Duration label" defaultValue={pkg?.durationLabel} hint='e.g. "3 days / 2 nights"' />
          <div className="sm:col-span-2"><TextField name="season" label="Season" defaultValue={pkg?.season} /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={pkg?.featured} className="h-4 w-4" /> Featured on home page
          </label>
          <TextField name="sortOrder" label="Sort order" type="number" defaultValue={pkg?.sortOrder ?? 100} />
        </section>

        <section className="grid gap-4 panel p-6 sm:grid-cols-2">
          <h2 className="text-[15px] font-semibold text-slate-900 sm:col-span-2">Price</h2>
          <TextField name="startingPrice" label="Starting price (INR)" type="number" defaultValue={pkg?.startingPrice} hint="Leave empty to show “Price on request”. Only enter verified, costed prices." />
          <TextField name="priceBasis" label="Price basis" defaultValue={pkg?.priceBasis} hint="Required with a price: per person / per couple / per room / per vehicle…" />
        </section>

        <section className="space-y-4 panel p-6">
          <h2 className="text-[15px] font-semibold text-slate-900">Destinations</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {destinations.map((d) => (
              <label key={d.slug} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="destinations" value={d.slug} defaultChecked={selected.has(d.slug)} className="h-4 w-4" />
                {d.name}
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-4 panel p-6">
          <h2 className="text-[15px] font-semibold text-slate-900">Itinerary & inclusions</h2>
          <TextArea name="itinerary" label="Day-wise itinerary" rows={7} defaultValue={itineraryToLines(pkg?.itinerary)} hint="One day per line: Title | Details" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextArea name="inclusions" label="Inclusions" rows={6} defaultValue={jsonToLines(pkg?.inclusions)} hint="One per line" />
            <TextArea name="exclusions" label="Exclusions" rows={6} defaultValue={jsonToLines(pkg?.exclusions)} hint="One per line" />
          </div>
          <TextArea name="notes" label="Important notes (public)" rows={3} defaultValue={jsonToLines(pkg?.notes)} hint="One per line" />
          <TextArea name="internalNotes" label="Internal notes (never shown publicly)" rows={3} defaultValue={pkg?.internalNotes} hint="What must be clarified before sale, supplier notes…" />
        </section>

        <section className="space-y-4 panel p-6">
          <h2 className="text-[15px] font-semibold text-slate-900">Photo</h2>
          <PhotoNote imageUrl={pkg?.imageUrl} imageAlt={pkg?.imageAlt} anchor={pkg ? `package-${pkg.id}` : undefined} canManage={can(me.role, "media.manage")} />
        </section>

        <section className="grid gap-4 panel p-6">
          <h2 className="text-[15px] font-semibold text-slate-900">SEO</h2>
          <TextField name="seoTitle" label="SEO title" defaultValue={pkg?.seoTitle} maxLength={70} hint="Optional, up to ~60 characters. Defaults to the title + duration." />
          <TextArea name="seoDescription" label="Meta description" defaultValue={pkg?.seoDescription} rows={2} hint="Optional, up to ~155 characters. Defaults to the summary." />
        </section>

        <button className="btn-admin-primary sticky bottom-4 px-6 py-3 shadow-xl shadow-forest-900/25"><Icon name="check" /> Save package</button>
      </form>
    </div>
  );
}
