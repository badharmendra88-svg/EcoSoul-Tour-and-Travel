import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { SceneArt } from "./SceneArt";

export function PageHero({
  title,
  intro,
  crumbs,
  scene = "mountain",
  eyebrow,
  children,
}: {
  title: string;
  intro?: string;
  crumbs: Crumb[];
  scene?: string;
  eyebrow?: string;
  children?: ReactNode;
}) {
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
