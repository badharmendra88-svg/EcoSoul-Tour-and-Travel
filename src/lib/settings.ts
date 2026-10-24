import "server-only";
import { cache } from "react";
import type { SiteSettings } from "@prisma/client";
import { site } from "@/config/site";
import { db } from "./db";
import { decryptSecret } from "./secret-box";

// Public settings are safe to send to the browser; secrets never are.
export type PublicSettings = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  whatsappButton: boolean;
  whatsappGreeting: string;
  social: { key: SocialKey; label: string; url: string }[];
  gaId: string;
  metaPixelId: string;
  googleVerification: string;
  heroImageUrl: string;
  heroImageAlt: string;
  serviceImages: Record<ServiceKey, { url: string; alt: string }>;
  legalName: string;
  gstin: string;
  tourismRegNo: string;
  emergencyPhone: string;
  upiId: string;
  upiPayeeName: string;
};

export const socialNetworks = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
  { key: "twitter", label: "X (Twitter)" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "googleBusiness", label: "Google Business Profile" },
  { key: "tripadvisor", label: "Tripadvisor" },
] as const;
export type SocialKey = (typeof socialNetworks)[number]["key"];

// Photos on the homepage "Choose your travel service" cards (Admin → Photos)
export const serviceSlots = [
  { key: "tours", name: "Tour Packages", url: "serviceToursImageUrl", alt: "serviceToursImageAlt" },
  { key: "taxi", name: "Book a Taxi", url: "serviceTaxiImageUrl", alt: "serviceTaxiImageAlt" },
  { key: "driver", name: "Book a Driver", url: "serviceDriverImageUrl", alt: "serviceDriverImageAlt" },
  { key: "custom", name: "Custom Trip", url: "serviceCustomImageUrl", alt: "serviceCustomImageAlt" },
] as const;
export type ServiceKey = (typeof serviceSlots)[number]["key"];

export const getSettingsRow = cache(async (): Promise<SiteSettings> => {
  const row = await db.siteSettings.findUnique({ where: { id: "default" } });
  if (row) return row;
  try {
    return await db.siteSettings.create({ data: { id: "default" } });
  } catch {
    // Another request (e.g. a parallel build worker) created it first
    return db.siteSettings.findUniqueOrThrow({ where: { id: "default" } });
  }
});

export const getSettings = cache(async (): Promise<PublicSettings> => {
  const s = await getSettingsRow();
  return {
    phone: s.phone || site.phone,
    whatsapp: s.whatsapp || site.whatsapp,
    email: s.email || site.email,
    address: s.address || site.address,
    hours: s.hours || site.hours,
    whatsappButton: s.whatsappButton,
    whatsappGreeting: s.whatsappGreeting || `Hi ${site.shortName}, I'd like help planning an Uttarakhand trip.`,
    social: socialNetworks.flatMap((n) => (s[n.key] ? [{ key: n.key, label: n.label, url: s[n.key] as string }] : [])),
    gaId: s.gaId || site.gaId,
    metaPixelId: s.metaPixelId || "",
    googleVerification: s.googleVerification || "",
    heroImageUrl: s.heroImageUrl || "",
    heroImageAlt: s.heroImageAlt || "",
    serviceImages: Object.fromEntries(
      serviceSlots.map((sl) => [sl.key, { url: s[sl.url] || "", alt: s[sl.alt] || "" }]),
    ) as PublicSettings["serviceImages"],
    legalName: s.legalName || "",
    gstin: s.gstin || "",
    tourismRegNo: s.tourismRegNo || "",
    emergencyPhone: s.emergencyPhone || "",
    upiId: s.upiId || "",
    upiPayeeName: s.upiPayeeName || "",
  };
});

export type WhatsAppApiConfig = {
  phoneNumberId: string;
  accessToken: string;
  version: string;
  template: string | null;
  templateLang: string;
};

/** Server-only: decrypted Cloud API credentials, or null when not configured/enabled. */
export async function getWhatsAppApiConfig(): Promise<WhatsAppApiConfig | null> {
  const s = await getSettingsRow();
  const token = decryptSecret(s.waAccessTokenEnc);
  if (!s.waApiEnabled || !s.waPhoneNumberId || !token) return null;
  return {
    phoneNumberId: s.waPhoneNumberId,
    accessToken: token,
    version: s.waApiVersion || "v21.0",
    template: s.waQuoteTemplate || null,
    templateLang: s.waTemplateLang || "en",
  };
}

export async function getNotifyWebhookUrl() {
  const s = await getSettingsRow();
  return s.notifyWebhookUrl || process.env.NOTIFY_WEBHOOK_URL || "";
}
