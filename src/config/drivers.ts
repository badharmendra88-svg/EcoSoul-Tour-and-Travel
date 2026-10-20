// Options for driver-partner registration and admin verification.

export const driverServiceAreas = [
  "Nainital & Haldwani",
  "Kumaon hills (Almora, Ranikhet, Mukteshwar)",
  "Pithoragarh & Munsiyari",
  "Jim Corbett & Ramnagar",
  "Dehradun & Mussoorie",
  "Haridwar & Rishikesh",
  "Char Dham routes",
  "Delhi NCR ↔ Uttarakhand",
];

export const driverLanguages = ["Hindi", "English", "Kumaoni", "Garhwali", "Punjabi"];

export const licenceTypes = {
  LMV: "LMV (car, non-transport)",
  LMV_TR: "LMV – Transport / commercial",
  HMV: "HMV / heavy vehicle",
} as const;

export const partnerTypes = {
  DRIVER_ONLY: "Driver only (no vehicle)",
  WITH_VEHICLE: "Driver with own vehicle",
} as const;

export const commercialPermitOptions = {
  YES: "Yes — commercial (yellow plate) permit",
  NO: "No — private vehicle",
  APPLIED: "Applied / in process",
} as const;

export const availabilityOptions = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time / on call",
  WEEKENDS: "Weekends & holidays",
  SEASONAL: "Peak season only",
} as const;

export const driverStatuses = {
  APPLIED: "Applied",
  UNDER_REVIEW: "Under review",
  VERIFIED: "Documents verified",
  ACTIVE: "Active partner",
  INACTIVE: "Inactive",
  REJECTED: "Rejected",
} as const;
export type DriverStatus = keyof typeof driverStatuses;

/** Staff checklist — all must be ticked before a driver can be made Active. */
export const verificationChecks = [
  { key: "licenceChecked", label: "Driving licence seen and valid", vehicleOnly: false },
  { key: "idChecked", label: "Identity verified (seen in person)", vehicleOnly: false },
  { key: "policeVerified", label: "Police verification certificate", vehicleOnly: false },
  { key: "vehicleDocsChecked", label: "RC, permit, fitness, insurance & PUC checked", vehicleOnly: true },
  { key: "agreementSigned", label: "Partner agreement signed", vehicleOnly: false },
] as const;
export type VerificationKey = (typeof verificationChecks)[number]["key"];
