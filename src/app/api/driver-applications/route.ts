import { NextResponse, after } from "next/server";
import { db } from "@/lib/db";
import { clientIp, ipRateLimit } from "@/lib/rate-limit";
import { serialize } from "@/lib/serialize";
import { encryptSecret } from "@/lib/secret-box";
import { getNotifyWebhookUrl } from "@/lib/settings";
import { driverApplicationSchema, fieldErrors } from "@/lib/validation";
import { site } from "@/config/site";

// Public driver-partner registration.

const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function makeRef() {
  const date = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("");
  return `DR-${date}-${rand}`;
}

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const limit = ipRateLimit("driver", ip, 4, 30 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please try again later or contact us on WhatsApp." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  if (typeof body.website === "string" && body.website.length > 0) return NextResponse.json({ ok: true, ref: makeRef() });

  const parsed = driverApplicationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 422 });
  const v = parsed.data;
  const withVehicle = v.partnerType === "WITH_VEHICLE";

  // Serialised per mobile number so simultaneous double-submits cannot both pass the check
  return serialize(`driver:${v.phone.replace(/\s+/g, " ")}`, async () => {
    // One open application per mobile number
    const existing = await db.driverPartner.findFirst({
      where: { phone: v.phone.replace(/\s+/g, " "), status: { notIn: ["REJECTED", "INACTIVE"] } },
    });
    if (existing) return NextResponse.json({ ok: true, ref: existing.ref, duplicate: true });

    const driver = await db.driverPartner.create({
      data: {
        ref: makeRef(),
        name: v.name,
        phone: v.phone.replace(/\s+/g, " "),
        email: v.email ?? null,
        baseLocation: v.baseLocation,
        serviceAreas: v.serviceAreas.join(", "),
        experienceYears: v.experienceYears,
        hillExperienceYears: v.hillExperienceYears ?? null,
        languages: v.languages.join(", ") || null,
        licenceType: v.licenceType,
        licenceNumberEnc: encryptSecret(v.licenceNumber),
        licenceLast4: v.licenceNumber.slice(-4),
        licenceExpiry: v.licenceExpiry,
        partnerType: v.partnerType,
        vehicleCategory: withVehicle ? v.vehicleCategory ?? null : null,
        vehicleModel: withVehicle ? v.vehicleModel ?? null : null,
        vehicleRegNo: withVehicle ? v.vehicleRegNo ?? null : null,
        vehicleSeats: withVehicle ? v.vehicleSeats ?? null : null,
        commercialPermit: withVehicle ? v.commercialPermit ?? null : null,
        availability: v.availability,
        expectedDailyRate: v.expectedDailyRate ?? null,
        message: v.message ?? null,
        heardFrom: v.heardFrom ?? null,
        consentAt: new Date(),
        events: { create: { actor: "website", action: "registered", detail: withVehicle ? "Driver with own vehicle" : "Driver only" } },
      },
    });

    // Best-effort team alert (no personal details beyond name and base)
    after(async () => {
      const url = await getNotifyWebhookUrl();
      if (!url) return;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `New driver registration ${driver.ref} — ${driver.name}, ${driver.baseLocation}\nOpen: ${site.url}/admin/drivers/${driver.id}/` }),
        signal: AbortSignal.timeout(8000),
      }).catch((e) => console.error("[driver notify]", e));
    });

    return NextResponse.json({ ok: true, ref: driver.ref }, { status: 201 });
  });
}
