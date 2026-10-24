import { NextResponse, after } from "next/server";
import { db } from "@/lib/db";
import { fieldErrors, hasContactMethod, schemaFor } from "@/lib/validation";
import { clientIp, ipRateLimit } from "@/lib/rate-limit";
import { serialize } from "@/lib/serialize";
import { notifyNewEnquiry } from "@/lib/notify";

// Public enquiry endpoint for all forms (trip, package, transport, contact).

const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I

function makeRef() {
  const d = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString();
  const date = d.slice(2, 10).replace(/-/g, "");
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const rand = Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("");
  return `ES-${date}-${rand}`;
}

function utmJson(utm: unknown) {
  if (!utm || typeof utm !== "object") return null;
  const clean = Object.fromEntries(Object.entries(utm).filter(([, x]) => typeof x === "string" && x));
  return Object.keys(clean).length ? JSON.stringify(clean) : null;
}

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const limit = ipRateLimit("enquiry", ip, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again shortly or contact us on WhatsApp." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // Honeypot filled → pretend success so bots learn nothing
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true, ref: makeRef() });
  }

  const schema = schemaFor(body.kind);
  if (!schema) return NextResponse.json({ ok: false, error: "Invalid enquiry type" }, { status: 400 });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 422 });
  }
  const v = parsed.data as Record<string, unknown> & { kind: string; phone?: string; email?: string };
  if (!hasContactMethod(v)) {
    return NextResponse.json(
      { ok: false, errors: { phone: "Please share a phone number or email so we can reply" } },
      { status: 422 },
    );
  }

  if (v.kind === "PACKAGE") {
    const pkg = await db.package.findFirst({ where: { slug: String(v.packageSlug), status: "PUBLISHED" } });
    if (!pkg) return NextResponse.json({ ok: false, error: "This package is not available" }, { status: 422 });
  }

  // Serialised per contact so simultaneous double-submits cannot both pass the duplicate check
  return serialize(`enquiry:${v.kind}:${v.phone ?? ""}:${v.email ?? ""}`, async () => {
    // Duplicate guard: same contact + kind within 2 minutes returns the existing ref
    const recent = await db.enquiry.findFirst({
      where: {
        kind: v.kind,
        phone: v.phone ?? null,
        email: v.email ?? null,
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
    });
    if (recent) return NextResponse.json({ ok: true, ref: recent.ref, duplicate: true });

    const str = (key: string) => (typeof v[key] === "string" ? (v[key] as string) : null);
    const num = (key: string) => (typeof v[key] === "number" ? (v[key] as number) : null);

    const enquiry = await db.enquiry.create({
      data: {
        ref: makeRef(),
        kind: v.kind,
        name: String(v.name),
        phone: v.phone ?? null,
        email: v.email ?? null,
        sourcePage: str("sourcePage"),
        heardFrom: str("heardFrom"),
        travellingFrom: str("travellingFrom"),
        utm: utmJson(v.utm),
        packageSlug: str("packageSlug"),
        destination: str("destination"),
        travelDate: str("travelDate"),
        dateFlexible: v.dateFlexible === true,
        adults: num("adults"),
        children: num("children"),
        interests: Array.isArray(v.interests) ? (v.interests as string[]).join(", ") || null : null,
        budgetBand: str("budgetBand"),
        message: str("message"),
        serviceType: str("serviceType"),
        pickup: str("pickup"),
        drop: str("drop"),
        pickupTime: str("pickupTime"),
        returnDate: str("returnDate"),
        luggage: str("luggage"),
        vehicleCategory: str("vehicleCategory"),
        fareType: str("fareType"),
        arrivalRef: str("arrivalRef"),
        tripDays: num("tripDays"),
        transmission: str("transmission"),
        consent: true,
        consentAt: new Date(),
        events: { create: { actor: "website", action: "created", detail: `Submitted from ${str("sourcePage") ?? "website"}` } },
      },
    });

    // Notify after the response is sent so the visitor is not kept waiting
    after(() => notifyNewEnquiry(enquiry));

    return NextResponse.json({ ok: true, ref: enquiry.ref }, { status: 201 });
  });
}
