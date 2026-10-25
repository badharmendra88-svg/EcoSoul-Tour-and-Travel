import { z } from "zod";
import { serviceTypes } from "@/config/options";

// Shared by the browser forms and the API so both enforce the same rules
// (FR-04, §24.4). The server is the source of truth.

// zod 4's default for a missing field ("Invalid input: expected string, received undefined")
// isn't meant for customers; fields with their own messages keep them.
z.config({ customError: (issue) => (issue.code === "invalid_type" && issue.input === undefined ? "This field is required" : undefined) });

const phoneRe = /^\+?[0-9\s-]{10,16}$/;
const dateRe = /^\d{4}-\d{2}-\d{2}$/;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

function todayIST() {
  // yyyy-mm-dd in India time so "today" is not rejected late at night
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

const futureDate = z
  .string()
  .regex(dateRe, "Please choose a valid date")
  .refine((d) => d >= todayIST(), "Date cannot be in the past");

const contact = {
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => !v || phoneRe.test(v), "Please enter a valid phone number"),
  email: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => !v || z.email().safeParse(v).success, "Please enter a valid email"),
  consent: z.literal(true, { error: "Please accept the privacy notice and booking terms" }),
  heardFrom: optionalText(60),
  travellingFrom: optionalText(80),
  sourcePage: optionalText(200),
  // Ad-campaign tags captured on landing (lib/utm.ts); malformed values are dropped, never rejected
  utm: z
    .object({
      source: optionalText(100),
      medium: optionalText(100),
      campaign: optionalText(100),
      term: optionalText(100),
      content: optionalText(100),
      landing: optionalText(200),
    })
    .optional()
    .catch(undefined),
  // Honeypot: real users never see or fill this field
  website: z.string().max(0).optional(),
};

const base = z.object(contact);

const tripFields = {
  destination: optionalText(120),
  travelDate: futureDate.optional().or(z.literal("").transform(() => undefined)),
  dateFlexible: z.boolean().optional().default(false),
  adults: z.coerce.number().int().min(1, "At least 1 adult").max(60),
  children: z.coerce.number().int().min(0).max(40).optional().default(0),
  interests: z.array(z.string().max(40)).max(10).optional().default([]),
  budgetBand: optionalText(60),
  message: optionalText(1500),
};

export const tripEnquirySchema = base.extend({
  kind: z.literal("TRIP"),
  ...tripFields,
});

export const packageEnquirySchema = base.extend({
  kind: z.literal("PACKAGE"),
  packageSlug: z.string().trim().min(1).max(120),
  ...tripFields,
});

export const transportEnquirySchema = base
  .extend({
    kind: z.literal("TRANSPORT"),
    serviceType: z.enum(Object.keys(serviceTypes) as [keyof typeof serviceTypes, ...(keyof typeof serviceTypes)[]], { error: "Please choose a service type" }),
    pickup: z.string().trim().min(2, "Please enter the pickup point").max(200),
    drop: optionalText(200),
    travelDate: futureDate,
    pickupTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Please choose a pickup time")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    returnDate: futureDate.optional().or(z.literal("").transform(() => undefined)),
    adults: z.coerce.number().int().min(1, "At least 1 traveller").max(60),
    luggage: optionalText(60),
    vehicleCategory: optionalText(40),
    fareType: z.enum(["FIXED_QUOTE", "ESTIMATE"]).optional(),
    arrivalRef: optionalText(40),
    tripDays: z.preprocess((x) => (x === "" || x == null ? undefined : Number(x)), z.number().int().min(1, "At least 1 day").max(60).optional()),
    transmission: z.enum(["MANUAL", "AUTOMATIC"]).optional().or(z.literal("").transform(() => undefined)),
    message: optionalText(1500),
  })
  .superRefine((v, ctx) => {
    if (v.serviceType !== "LOCAL" && v.serviceType !== "DRIVER_ONLY" && !v.drop) {
      ctx.addIssue({ code: "custom", path: ["drop"], message: "Please enter the drop point / destination" });
    }
    if (v.serviceType === "ROUND_TRIP" && !v.returnDate) {
      ctx.addIssue({ code: "custom", path: ["returnDate"], message: "Please choose a return date" });
    }
    if (v.returnDate && v.returnDate < v.travelDate) {
      ctx.addIssue({ code: "custom", path: ["returnDate"], message: "Return date must be after the travel date" });
    }
  });

export const contactEnquirySchema = base.extend({
  kind: z.literal("CONTACT"),
  message: z.string().trim().min(5, "Please write a short message").max(2000),
});

export type EnquiryInput =
  | z.input<typeof tripEnquirySchema>
  | z.input<typeof packageEnquirySchema>
  | z.input<typeof transportEnquirySchema>
  | z.input<typeof contactEnquirySchema>;

export function schemaFor(kind: unknown) {
  switch (kind) {
    case "TRIP":
      return tripEnquirySchema;
    case "PACKAGE":
      return packageEnquirySchema;
    case "TRANSPORT":
      return transportEnquirySchema;
    case "CONTACT":
      return contactEnquirySchema;
    default:
      return null;
  }
}

/** Every enquiry needs at least one way to reach the customer. */
export function hasContactMethod(v: { phone?: string; email?: string }) {
  return Boolean(v.phone || v.email);
}

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// ---------- Driver partner registration ----------
export const driverApplicationSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name").max(80),
    phone: z.string().trim().regex(phoneRe, "Please enter a valid mobile number"),
    email: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => !v || z.email().safeParse(v).success, "Please enter a valid email"),
    baseLocation: z.string().trim().min(2, "Where are you based?").max(80),
    serviceAreas: z.array(z.string().max(60)).min(1, "Choose at least one area").max(10),
    experienceYears: z.coerce.number({ error: "Enter years of experience" }).int().min(0).max(50),
    hillExperienceYears: z.preprocess((x) => (x === "" || x == null ? undefined : Number(x)), z.number().int().min(0).max(50).optional()),
    languages: z.array(z.string().max(30)).max(10).optional().default([]),
    licenceType: z.enum(["LMV", "LMV_TR", "HMV"], { error: "Choose your licence type" }),
    licenceNumber: z
      .string()
      .trim()
      .transform((v) => v.toUpperCase().replace(/[\s-]/g, ""))
      .refine((v) => /^[A-Z]{2}[0-9A-Z]{8,16}$/.test(v), "Enter the licence number as printed, e.g. UK0720190012345"),
    licenceExpiry: z
      .string()
      .regex(dateRe, "Choose the licence valid-till date")
      .refine((d) => d >= todayIST(), "Licence must be valid today"),
    partnerType: z.enum(["DRIVER_ONLY", "WITH_VEHICLE"], { error: "Choose how you'd like to partner" }),
    vehicleCategory: optionalText(40),
    vehicleModel: optionalText(60),
    vehicleRegNo: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v.toUpperCase().replace(/\s+/g, " ") : undefined)),
    vehicleSeats: z.preprocess((x) => (x === "" || x == null ? undefined : Number(x)), z.number().int().min(2).max(30).optional()),
    commercialPermit: z.enum(["YES", "NO", "APPLIED"]).optional().or(z.literal("").transform(() => undefined)),
    availability: z.enum(["FULL_TIME", "PART_TIME", "WEEKENDS", "SEASONAL"], { error: "Choose your availability" }),
    expectedDailyRate: z.preprocess((x) => (x === "" || x == null ? undefined : Number(x)), z.number().int().min(0).max(100000).optional()),
    message: optionalText(1000),
    heardFrom: optionalText(60),
    consent: z.literal(true, { error: "Please accept the privacy notice and verification terms" }),
    website: z.string().max(0).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.partnerType === "WITH_VEHICLE") {
      if (!v.vehicleCategory) ctx.addIssue({ code: "custom", path: ["vehicleCategory"], message: "Choose your vehicle type" });
      if (!v.vehicleRegNo || !/^(?=.*\d)(?=.*[A-Z])[A-Z0-9 ]{6,13}$/.test(v.vehicleRegNo))
        ctx.addIssue({ code: "custom", path: ["vehicleRegNo"], message: "Enter the registration number, e.g. UK 04 TA 1234" });
      if (!v.commercialPermit) ctx.addIssue({ code: "custom", path: ["commercialPermit"], message: "Tell us about the vehicle permit" });
    }
  });
