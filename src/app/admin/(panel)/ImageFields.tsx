import Image from "next/image";
import { ImageFileInput } from "./ImageFileInput";

// Photo upload block for admin forms (works with lib/media handleImageFields).
export function ImageFields({
  imageUrl,
  imageAlt,
  imageCredit,
  label = "Photo",
  hint = "JPG, PNG, WebP or AVIF, at least 600 px wide (1600 px+ recommended), up to 8 MB. Converted to WebP automatically.",
}: {
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageCredit?: string | null;
  label?: string;
  hint?: string;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-[220px_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-900/5">
        {imageUrl ? (
          <Image src={imageUrl} alt={imageAlt ?? ""} fill sizes="220px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs text-slate-500">
            No photo yet — the illustration is shown on the website.
          </div>
        )}
      </div>
      <div className="space-y-4">
        <label className="block">
          <span className="admin-label">{imageUrl ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}</span>
          <ImageFileInput className="block w-full text-base text-slate-600 lg:text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-forest-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-forest-700 hover:file:bg-forest-100" />
          <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="admin-label">Photo description (alt text)</span>
            <input name="imageAlt" defaultValue={imageAlt ?? ""} placeholder="e.g. Boats on Naini Lake in the morning" className="admin-input" />
          </label>
          <label className="block">
            <span className="admin-label">Credit (optional)</span>
            <input name="imageCredit" defaultValue={imageCredit ?? ""} placeholder="e.g. Photo: EcoSoul team" className="admin-input" />
          </label>
        </div>
        <label className="flex min-h-11 items-start gap-2 text-sm text-slate-700">
          <input type="checkbox" name="imageRights" className="mt-0.5 h-4 w-4" />
          I confirm we own this photo or are licensed to use it on our website (required for new uploads).
        </label>
        {imageUrl && (
          <label className="flex min-h-11 items-center gap-2 text-sm text-rose-700">
            <input type="checkbox" name="removeImage" className="h-4 w-4" /> Remove current photo
          </label>
        )}
      </div>
    </div>
  );
}
