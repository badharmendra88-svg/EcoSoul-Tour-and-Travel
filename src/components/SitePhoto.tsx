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
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {url ? (
        <Image src={url} alt={alt ?? ""} fill sizes={sizes} priority={priority} className={`object-cover ${imgClassName}`} />
      ) : (
        <SceneArt scene={scene} className={`h-full w-full ${imgClassName}`} />
      )}
    </div>
  );
}
