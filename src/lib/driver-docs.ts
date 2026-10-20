// Document-expiry helpers for driver partners (dates are yyyy-mm-dd, IST).

export type DocKey = "licenceExpiry" | "insuranceExpiry" | "permitExpiry" | "fitnessExpiry" | "pucExpiry";

export const docLabels: Record<DocKey, string> = {
  licenceExpiry: "Driving licence",
  insuranceExpiry: "Insurance",
  permitExpiry: "Permit",
  fitnessExpiry: "Fitness certificate",
  pucExpiry: "PUC",
};

export function daysUntil(date: string | null | undefined) {
  if (!date) return null;
  const today = new Date(new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10));
  return Math.round((Date.parse(date) - today.getTime()) / 86400000);
}

/** Documents that are expired or expire within `withinDays`. */
export function expiringDocs(d: Partial<Record<DocKey, string | null>> & { partnerType: string }, withinDays = 30) {
  const keys: DocKey[] = d.partnerType === "WITH_VEHICLE" ? ["licenceExpiry", "insuranceExpiry", "permitExpiry", "fitnessExpiry", "pucExpiry"] : ["licenceExpiry"];
  return keys
    .map((k) => ({ key: k, label: docLabels[k], date: d[k] ?? null, days: daysUntil(d[k]) }))
    .filter((x) => x.days !== null && x.days <= withinDays);
}
