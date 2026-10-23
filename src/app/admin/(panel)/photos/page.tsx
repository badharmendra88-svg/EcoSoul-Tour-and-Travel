import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { savePhotoAction } from "../../photos-actions";
import { ImageFields } from "../ImageFields";
import { Badge, Icon, PageHeader, Panel } from "../ui";

export const metadata = { title: "Photos" };

type Slot = {
  anchor: string;
  target: "hero" | "destination" | "package";
  id: string;
  name: string;
  meta: string;
  href: string;
  imageUrl: string | null;
  imageAlt: string | null;
  imageCredit: string | null;
};

export default async function PhotosPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string; at?: string }> }) {
  await requireAdmin("media.manage");
  const { saved, error, at } = await searchParams;
  const [settings, destinations, packages] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "default" }, select: { heroImageUrl: true, heroImageAlt: true } }),
    db.destination.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, slug: true, name: true, region: true, status: true, imageUrl: true, imageAlt: true, imageCredit: true } }),
    db.package.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }], select: { id: true, slug: true, title: true, durationDays: true, status: true, imageUrl: true, imageAlt: true, imageCredit: true } }),
  ]);

  const hero: Slot = { anchor: "hero", target: "hero", id: "default", name: "Homepage hero", meta: "Full-width photo behind the homepage headline", href: "/", imageUrl: settings?.heroImageUrl ?? null, imageAlt: settings?.heroImageAlt ?? null, imageCredit: null };
  const destSlots: Slot[] = destinations.map((d) => ({ anchor: `destination-${d.id}`, target: "destination", id: d.id, name: d.name, meta: `${d.region}${d.status === "PUBLISHED" ? "" : " · draft"}`, href: `/destinations/${d.slug}/`, imageUrl: d.imageUrl, imageAlt: d.imageAlt, imageCredit: d.imageCredit }));
  const pkgSlots: Slot[] = packages.map((p) => ({ anchor: `package-${p.id}`, target: "package", id: p.id, name: p.title, meta: `${p.durationDays ? `${p.durationDays} days` : "Flexible"}${p.status === "PUBLISHED" ? "" : " · draft"}`, href: `/packages/${p.slug}/`, imageUrl: p.imageUrl, imageAlt: p.imageAlt, imageCredit: p.imageCredit }));
  const all = [hero, ...destSlots, ...pkgSlots];
  const withPhoto = all.filter((s) => s.imageUrl).length;

  const card = (s: Slot) => (
    <Panel
      key={s.anchor}
      className="scroll-mt-24"
      title={<span id={s.anchor}>{s.name}</span>}
      icon="image"
      description={s.meta}
      actions={
        <div className="flex items-center gap-3">
          {s.imageUrl ? <Badge tone="emerald">Photo</Badge> : <Badge tone="slate">Illustration</Badge>}
          <Link href={s.href} target="_blank" className="inline-flex items-center gap-1 text-sm font-medium text-forest-700 hover:underline">
            View <Icon name="external" className="h-3.5 w-3.5" />
          </Link>
        </div>
      }
    >
      <form action={savePhotoAction} className="space-y-4">
        <input type="hidden" name="target" value={s.target} />
        <input type="hidden" name="id" value={s.id} />
        {saved === s.anchor && (
          <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 ring-1 ring-emerald-100">
            <Icon name="check" /> Saved. The website has been updated.
          </p>
        )}
        {error && at === s.anchor && (
          <p role="alert" className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800 ring-1 ring-rose-100">
            <Icon name="bell" /> {error}
          </p>
        )}
        <ImageFields
          imageUrl={s.imageUrl}
          imageAlt={s.imageAlt}
          imageCredit={s.imageCredit}
          showCredit={s.target !== "hero"}
          label={s.target === "hero" ? "Hero photo" : "Photo"}
          hint={s.target === "hero" ? "Landscape photo, 1920 px+ wide (e.g. a Himalayan view). Up to 8 MB; converted to WebP automatically." : undefined}
        />
        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button className="btn-admin-primary">Save photo</button>
        </div>
      </form>
    </Panel>
  );

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Photos"
        subtitle={`${withPhoto} of ${all.length} places on the website have a photo; the rest show an illustration. Only Super Admins can change photos.`}
      />
      {error && !at && (
        <p role="alert" className="mb-6 flex items-center gap-2 rounded-2xl bg-rose-50 px-5 py-3 text-sm text-rose-800 ring-1 ring-rose-100">
          <Icon name="bell" /> {error}
        </p>
      )}
      <nav aria-label="Photo sections" className="mb-6 flex flex-wrap gap-2 text-sm">
        {[["#hero", "Homepage"], ["#destinations", `Destinations (${destSlots.length})`], ["#packages", `Packages (${pkgSlots.length})`]].map(([href, label]) => (
          <a key={href} href={href} className="rounded-full bg-white px-4 py-2 font-medium text-forest-700 ring-1 ring-slate-200 hover:bg-forest-50">{label}</a>
        ))}
      </nav>
      <div className="space-y-10">
        <section className="space-y-4">{card(hero)}</section>
        <section className="space-y-4">
          <h2 id="destinations" className="scroll-mt-24 font-serif text-xl font-bold text-forest-900">Destinations</h2>
          {destSlots.map(card)}
        </section>
        <section className="space-y-4">
          <h2 id="packages" className="scroll-mt-24 font-serif text-xl font-bold text-forest-900">Packages</h2>
          {pkgSlots.map(card)}
        </section>
      </div>
    </>
  );
}
