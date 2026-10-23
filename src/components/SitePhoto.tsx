import Image from "next/image";
import { SceneArt } from "./SceneArt";

// Real (admin-uploaded, licensed) photo when available, illustrated artwork
// otherwise. next/image serves AVIF/WebP at the right size and lazy-loads
// anything below the fold.
export function SitePhoto({
  url,
  alt,
  scene = "mountain",
  sizes,
  priority = false,
  className = "",
  imgClassName = "",
}: {
  url?: string | null;
  alt?: string | null;
  scene?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  // next/image `fill` needs a positioned parent; keep the caller's position (e.g. `absolute inset-0`
  // for full-bleed heroes) instead of adding `relative`, which would collapse the box to zero height
  const positioned = /(^|\s)(absolute|fixed|relative|sticky)(\s|$)/.test(className);
  return (
    <div className={`${positioned ? "" : "relative "}overflow-hidden ${className}`}>
      {url ? (
        <Image src={url} alt={alt ?? ""} fill sizes={sizes} priority={priority} className={`object-cover ${imgClassName}`} />
      ) : (
        <SceneArt scene={scene} className={`h-full w-full ${imgClassName}`} />
      )}
    </div>
  );
}
