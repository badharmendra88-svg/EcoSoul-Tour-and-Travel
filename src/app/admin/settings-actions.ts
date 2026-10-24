"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { encryptSecret } from "@/lib/secret-box";
import { getWhatsAppApiConfig, socialNetworks } from "@/lib/settings";
import { testConnection } from "@/lib/whatsapp-api";

const BACK = "/admin/settings/";

function fail(section: string, message: string): never {
  redirect(`${BACK}?error=${encodeURIComponent(message)}#${section}`);
}

function text(fd: FormData, key: string, max = 300) {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

function optionalUrl(fd: FormData, key: string, label: string, section: string) {
  const v = text(fd, key, 500);
  if (!v) return null;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:") throw new Error();
    return u.toString();
  } catch {
    fail(section, `${label}: enter a full https:// link`);
  }
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin("settings.manage");
  const section = text(formData, "_section", 40) || "contact";

  const phone = text(formData, "phone", 30);
  const whatsapp = text(formData, "whatsapp", 30).replace(/\D/g, "");
  const email = text(formData, "email", 120);
  if (phone && !/^\+?[0-9\s-]{10,16}$/.test(phone)) fail("contact", "Phone: enter a valid number, e.g. +91 98765 43210");
  if (whatsapp && !/^\d{11,15}$/.test(whatsapp)) fail("contact", "WhatsApp: use country code + number, e.g. 919876543210");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("contact", "Email: enter a valid address");

  const gaId = text(formData, "gaId", 30).toUpperCase();
  if (gaId && !/^G-[A-Z0-9]{4,20}$/.test(gaId)) fail("tracking", "Google Analytics ID should look like G-XXXXXXXXXX");
  const metaPixelId = text(formData, "metaPixelId", 30);
  if (metaPixelId && !/^\d{6,20}$/.test(metaPixelId)) fail("tracking", "Meta Pixel ID should be numbers only");
  // Accept either the token or the whole <meta ... content="token"> tag
  let googleVerification = text(formData, "googleVerification", 300);
  const m = googleVerification.match(/content=["']([^"']+)["']/);
  if (m) googleVerification = m[1];
  if (googleVerification && !/^[A-Za-z0-9_-]{10,100}$/.test(googleVerification)) fail("tracking", "Search Console code looks invalid");

  const waPhoneNumberId = text(formData, "waPhoneNumberId", 30);
  const waBusinessAccountId = text(formData, "waBusinessAccountId", 30);
  if (waPhoneNumberId && !/^\d{6,25}$/.test(waPhoneNumberId)) fail("whatsapp", "Phone number ID should be numbers only (from Meta → WhatsApp → API setup)");
  if (waBusinessAccountId && !/^\d{6,25}$/.test(waBusinessAccountId)) fail("whatsapp", "WhatsApp Business Account ID should be numbers only");
  const waApiVersion = text(formData, "waApiVersion", 10) || "v21.0";
  if (!/^v\d{2}\.\d$/.test(waApiVersion)) fail("whatsapp", "API version should look like v21.0");
  const waQuoteTemplate = text(formData, "waQuoteTemplate", 100);
  if (waQuoteTemplate && !/^[a-z0-9_]+$/.test(waQuoteTemplate)) fail("whatsapp", "Template name: lowercase letters, numbers and underscores only");
  const token = text(formData, "waAccessToken", 1000);

  const gstin = text(formData, "gstin", 20).toUpperCase();
  if (gstin && !/^[0-9]{2}[A-Z0-9]{10}[0-9A-Z]{3}$/.test(gstin)) fail("business", "GSTIN should be 15 characters, e.g. 05ABCDE1234F1Z5");
  const emergencyPhone = text(formData, "emergencyPhone", 30);
  if (emergencyPhone && !/^\+?[0-9\s-]{10,16}$/.test(emergencyPhone)) fail("business", "Emergency number: enter a valid phone number");

  const upiId = text(formData, "upiId", 80).toLowerCase();
  if (upiId && !/^[a-z0-9._-]{2,256}@[a-z][a-z0-9.-]{1,64}$/.test(upiId)) fail("payments", "UPI ID should look like name@bank");

  const social = Object.fromEntries(socialNetworks.map((n) => [n.key, optionalUrl(formData, n.key, n.label, "social")]));

  const data = {
    phone: phone || null,
    whatsapp: whatsapp || null,
    email: email || null,
    address: text(formData, "address", 200) || null,
    hours: text(formData, "hours", 120) || null,
    whatsappButton: formData.get("whatsappButton") === "on",
    whatsappGreeting: text(formData, "whatsappGreeting", 300) || null,
    waApiEnabled: formData.get("waApiEnabled") === "on",
    waPhoneNumberId: waPhoneNumberId || null,
    waBusinessAccountId: waBusinessAccountId || null,
    waApiVersion,
    waQuoteTemplate: waQuoteTemplate || null,
    waTemplateLang: text(formData, "waTemplateLang", 10) || "en",
    ...(token ? { waAccessTokenEnc: encryptSecret(token), waLastTestAt: null, waLastTestOk: null, waLastTestResult: null } : {}),
    ...social,
    gaId: gaId || null,
    metaPixelId: metaPixelId || null,
    googleVerification: googleVerification || null,
    notifyWebhookUrl: optionalUrl(formData, "notifyWebhookUrl", "Notification webhook", "tracking"),
    legalName: text(formData, "legalName", 160) || null,
    gstin: gstin || null,
    tourismRegNo: text(formData, "tourismRegNo", 80) || null,
    emergencyPhone: emergencyPhone || null,
    upiId: upiId || null,
    upiPayeeName: text(formData, "upiPayeeName", 80) || null,
  };

  await db.siteSettings.upsert({ where: { id: "default" }, create: { id: "default", ...data }, update: data });
  revalidatePath("/", "layout");
  redirect(`${BACK}?saved=1#${section}`);
}

export async function testWhatsAppAction() {
  await requireAdmin("settings.manage");
  const row = await db.siteSettings.findUnique({ where: { id: "default" } });
  if (!row?.waPhoneNumberId || !row.waAccessTokenEnc) fail("whatsapp", "Save the phone number ID and access token first.");
  if (!row.waApiEnabled) fail("whatsapp", "Turn on “Enable WhatsApp Cloud API” and save first.");

  let ok = false;
  let result: string;
  try {
    const cfg = await getWhatsAppApiConfig();
    if (!cfg) throw new Error("Stored token could not be read — enter it again.");
    const info = await testConnection(cfg);
    ok = true;
    result = `Connected: ${info.verified_name ?? "WhatsApp number"} (${info.display_phone_number ?? cfg.phoneNumberId})${info.quality_rating ? ` · quality ${info.quality_rating}` : ""}`;
  } catch (e) {
    result = e instanceof Error ? e.message : String(e);
  }
  await db.siteSettings.update({ where: { id: "default" }, data: { waLastTestAt: new Date(), waLastTestOk: ok, waLastTestResult: result.slice(0, 500) } });
  revalidatePath(BACK);
  redirect(`${BACK}?tested=1#whatsapp`);
}

export async function removeWhatsAppTokenAction() {
  await requireAdmin("settings.manage");
  await db.siteSettings.update({
    where: { id: "default" },
    data: { waAccessTokenEnc: null, waApiEnabled: false, waLastTestAt: null, waLastTestOk: null, waLastTestResult: null },
  });
  revalidatePath(BACK);
  redirect(`${BACK}?saved=1#whatsapp`);
}
