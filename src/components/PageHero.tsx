import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { SceneArt } from "./SceneArt";
import { SitePhoto } from "./SitePhoto";

export function PageHero({
  title,
  intro,
  crumbs,
  scene = "mountain",
  eyebrow,
  imageUrl,
  imageAlt,
  imageCredit,
  children,
}: {
  title: string;
  intro?: string;
  crumbs: Crumb[];
  scene?: string;
  eyebrow?: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageCredit?: string | null;
  children?: ReactNode;
}) {
  // With a real photo: dark overlay + light text. Without: illustrated sand header.
  if (imageUrl) {
    return (
      <section className="relative overflow-hidden bg-forest-900">
        <SitePhoto url={imageUrl} alt={imageAlt} sizes="100vw" priority className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-900/90 via-forest-900/65 to-forest-900/20" />
        <div className="container-page relative py-12 text-white sm:py-20 [&_nav]:text-forest-100 [&_nav_a:hover]:text-white [&_nav_[aria-current]]:text-white">
          <Breadcrumbs items={crumbs} />
          {eyebrow && <p className="mt-6 text-xs font-semibold tracking-widest text-accent uppercase">{eyebrow}</p>}
          <h1 className={`max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl ${eyebrow ? "mt-2" : "mt-6"}`}>{title}</h1>
          {intro && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-forest-50">{intro}</p>}
          {children && <div className="mt-6">{children}</div>}
          {imageCredit && <p className="mt-6 text-[11px] text-forest-200/80">{imageCredit}</p>}
        </div>
      </section>
    );
  }
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-sand">
      <SceneArt scene={scene} className="absolute inset-0 h-full w-full opacity-30" />
      <div className="container-page relative py-10 sm:py-14">
        <Breadcrumbs items={crumbs} />
        {eyebrow && <p className="eyebrow mt-6">{eyebrow}</p>}
        <h1 className={`h1 max-w-3xl ${eyebrow ? "mt-2" : "mt-6"}`}>{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-700">{intro}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
