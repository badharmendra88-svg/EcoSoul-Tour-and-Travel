// Shared option lists for forms, filters and admin status workflows.

export const tripTypes = {
  FAMILY: "Family",
  WEEKEND: "Weekend break",
  PILGRIMAGE: "Pilgrimage",
  NATURE: "Nature & wildlife",
  WELLNESS: "Culture & wellness",
  CUSTOM: "Custom trip",
} as const;
export type TripType = keyof typeof tripTypes;

export const interests = [
  "Hill stations",
  "Lakes",
  "Pilgrimage",
  "Nature & wildlife",
  "Yoga & wellness",
  "Trekking / adventure",
  "Local culture & food",
  "Relaxed stay",
];

export const budgetBands = [
  "Under ₹15,000 per person",
  "₹15,000 – ₹30,000 per person",
  "₹30,000 – ₹50,000 per person",
  "Above ₹50,000 per person",
  "Not sure yet",
];

export const heardFromOptions = [
  "Google search",
  "Google Maps / Business Profile",
  "Instagram / Facebook",
  "YouTube",
  "Friend or family",
  "Hotel / homestay partner",
  "Brochure / QR code",
  "Other",
];

// Blueprint §24.1
export const serviceTypes = {
  CAR_DRIVER: "Car + driver (outstation)",
  ROUND_TRIP: "Round-trip taxi",
  ONE_WAY: "One-way transfer",
  LOCAL: "Local sightseeing taxi",
  AIRPORT_RAIL: "Airport / railway station transfer",
  DRIVER_ONLY: "Driver only (your vehicle)",
  GROUP: "Group / tempo traveller",
} as const;
export type ServiceType = keyof typeof serviceTypes;

// Blueprint §24.2 — seat counts are typical guidance, never a guarantee
export const vehicleCategories = [
  {
    id: "HATCHBACK",
    name: "Hatchback / compact",
    seats: 4,
    use: "Small groups with light luggage",
    note: "Actual model or equivalent; luggage space is limited.",
  },
  {
    id: "SEDAN",
    name: "Sedan",
    seats: 4,
    use: "Couples, small families and point-to-point transfers",
    note: "Boot space suits 2–3 medium bags.",
  },
  {
    id: "SUV",
    name: "SUV / MUV",
    seats: 6,
    use: "Family trips and mountain routes",
    note: "Hill-route suitability is confirmed by the operator for each trip.",
  },
  {
    id: "PREMIUM",
    name: "Premium vehicle",
    seats: 4,
    use: "Comfort-focused or special occasions",
    note: "Amenities and additional fare conditions shared in the quote.",
  },
  {
    id: "TEMPO",
    name: "Tempo traveller / group vehicle",
    seats: 12,
    use: "Larger families and groups",
    note: "Legal seating capacity, route and permit constraints apply.",
  },
] as const;

export const enquiryKinds = {
  TRIP: "Custom trip",
  PACKAGE: "Package",
  TRANSPORT: "Transport",
  CONTACT: "Contact",
} as const;
export type EnquiryKind = keyof typeof enquiryKinds;

// FR-07 (trip/package/contact) and §24.7 (transport) status workflows
export const tripStatuses = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  QUOTE_SENT: "Quote Sent",
  CONFIRMED: "Confirmed",
  LOST: "Lost",
  SPAM: "Spam",
} as const;

export const transportStatuses = {
  NEW: "New Enquiry",
  CHECKING: "Checking Availability",
  QUOTE_SENT: "Quote Sent",
  AWAITING_CUSTOMER: "Awaiting Customer",
  AWAITING_ADVANCE: "Awaiting Advance",
  CONFIRMED: "Confirmed",
  DRIVER_ASSIGNED: "Driver Assigned",
  IN_PROGRESS: "Trip In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled / Rejected",
  INCIDENT: "Issue / Incident",
  SPAM: "Spam",
} as const;

export function statusesFor(kind: string): Record<string, string> {
  return kind === "TRANSPORT" ? transportStatuses : tripStatuses;
}

export function statusLabel(kind: string, status: string) {
  return statusesFor(kind)[status] ?? status;
}
