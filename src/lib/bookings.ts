import "server-only";

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Today's date in India (yyyy-mm-dd), matching how document expiry dates are stored. */
export const todayIST = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

type DriverDocs = {
  status: string;
  partnerType: string;
  licenceExpiry: string;
  insuranceExpiry: string | null;
  permitExpiry: string | null;
  fitnessExpiry: string | null;
  pucExpiry: string | null;
};

/**
 * A taxi partner can be offered a trip only when ACTIVE (the status the driver workflow grants after
 * checking vehicle documents), operating their own vehicle, and with licence, insurance, permit,
 * fitness and PUC all valid until the last day of the trip.
 */
export function driverTripReady(d: DriverDocs, lastTripDay: string = todayIST()) {
  if (d.status !== "ACTIVE" || d.partnerType !== "WITH_VEHICLE") return false;
  const until = lastTripDay > todayIST() ? lastTripDay : todayIST();
  return [d.licenceExpiry, d.insuranceExpiry, d.permitExpiry, d.fitnessExpiry, d.pucExpiry].every((x) => !!x && x >= until);
}

/** Lead statuses a booking change never overwrites (staff set these deliberately). */
const LOCKED_LEAD_STATUSES = ["SPAM", "INCIDENT"];

/**
 * The lead status implied by all of its bookings together, in the lead's own workflow
 * (transport leads have a richer workflow than trip / package / hotel / contact leads).
 * Returns null when the lead has no bookings, or is locked, so nothing should change.
 */
export function leadStatusFromBookings(
  lead: { kind: string; status: string },
  bookings: { serviceType: string; status: string }[],
): string | null {
  if (bookings.length === 0 || LOCKED_LEAD_STATUSES.includes(lead.status)) return null;
  const active = bookings.filter((b) => b.status !== "CANCELLED");
  if (lead.kind !== "TRANSPORT") return active.length ? "CONFIRMED" : "LOST";
  if (active.length === 0) return "CANCELLED";
  if (active.every((b) => b.status === "COMPLETED")) return "COMPLETED";
  if (active.some((b) => b.status === "IN_PROGRESS" || b.status === "COMPLETED")) return "IN_PROGRESS";
  if (active.some((b) => b.serviceType === "TAXI")) return "DRIVER_ASSIGNED";
  return "CONFIRMED";
}
