"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { deleteUpload, handleImageFields } from "@/lib/media";

// Website photos (homepage hero, destinations, packages). Super Admin only:
// these are the only actions that write image fields.

const BACK = "/admin/photos/";

export async function savePhotoAction(formData: FormData) {
  await requireAdmin("media.manage");
  const target = String(formData.get("target") ?? "");
  const id = String(formData.get("id") ?? "");
  const anchor = target === "hero" ? "hero" : `${target}-${id}`;
  const back = (q: string): never => redirect(`${BACK}?${q}#${anchor}`);

  if (target === "hero") {
    const s = await db.siteSettings.findUnique({ where: { id: "default" }, select: { heroImageUrl: true } });
    const img = await handleImageFields(formData, { imageUrl: s?.heroImageUrl ?? null }, "homepage-hero");
    if ("error" in img) back(`error=${encodeURIComponent(img.error)}&at=${anchor}`);
    else {
      await db.siteSettings.upsert({
        where: { id: "default" },
        create: { id: "default", heroImageUrl: img.imageUrl, heroImageAlt: img.imageAlt },
        update: { heroImageUrl: img.imageUrl, heroImageAlt: img.imageAlt },
      });
      if (img.replaced && img.replaced !== img.imageUrl) await deleteUpload(img.replaced);
    }
  } else if (target === "destination" || target === "package") {
    const row =
      target === "destination"
        ? await db.destination.findUnique({ where: { id }, select: { slug: true, imageUrl: true } })
        : await db.package.findUnique({ where: { id }, select: { slug: true, imageUrl: true } });
    if (!row) back("error=" + encodeURIComponent("That item no longer exists."));
    else {
      const img = await handleImageFields(formData, { imageUrl: row.imageUrl }, row.slug);
      if ("error" in img) back(`error=${encodeURIComponent(img.error)}&at=${anchor}`);
      else {
        const data = { imageUrl: img.imageUrl, imageAlt: img.imageAlt, imageCredit: img.imageCredit };
        if (target === "destination") await db.destination.update({ where: { id }, data });
        else await db.package.update({ where: { id }, data });
        if (img.replaced && img.replaced !== img.imageUrl) await deleteUpload(img.replaced);
      }
    }
  } else {
    back("error=" + encodeURIComponent("Unknown photo slot."));
  }

  revalidatePath("/", "layout");
  back(`saved=${anchor}`);
}
