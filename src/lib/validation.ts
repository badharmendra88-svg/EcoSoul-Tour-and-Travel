import { z } from "zod";
import { serviceTypes } from "@/config/options";

// Shared by the browser forms and the API so both enforce the same rules
// (FR-04, §24.4). The server is the source of truth.

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
    .refine((v) => !v || z.string().email().safeParse(v).success, "Please enter a valid email"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please accept the privacy notice and booking terms" }),
  }),
  heardFrom: optionalText(60),
  sourcePage: optionalText(200),
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
    serviceType: z.enum(Object.keys(serviceTypes) as [keyof typeof serviceTypes, ...(keyof typeof serviceTypes)[]], {
      errorMap: () => ({ message: "Please choose a service type" }),
    }),
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
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
