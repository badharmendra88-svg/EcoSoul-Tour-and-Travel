// Estimate calculator — pure functions shared by the admin UI and the server
// (the server always recomputes totals from line items before saving).

export type QuoteItem = { label: string; qty: number; unit: string; rate: number };

export type VehicleRateInput = {
  id: string;
  name: string;
  example: string;
  seats: number;
  perKm: number;
  minKmPerDay: number;
  driverAllowance: number;
  nightHalt: number;
  localPackage: number;
  localHours: number;
  localKm: number;
  extraHour: number;
  extraKm: number;
  oneWayPerKm: number;
  transferBase: number;
  transferKm: number;
};

export type HotelRateInput = { id: string; name: string; description: string; perRoomNight: number; mealsPerPerson: number };

/** Rate-card rules that are not specific to one vehicle. */
export type TransportRules = {
  oneWayMinKm: number;
  lateNightCharge: number;
  freeWaitMinutes: number;
  driverDayRate: number;
  driverOutstationDayRate: number;
  driverDayHours: number;
  driverOvertimeHour: number;
  driverNightAllowance: number;
};

/**
 * Calculator modes, mapped to the website's transport services:
 *  OUTSTATION  → Car + driver (outstation), Round-trip taxi, Group / tempo traveller
 *  ONE_WAY     → One-way transfer / drop
 *  TRANSFER    → Airport / railway station transfer
 *  LOCAL       → Local sightseeing taxi
 *  DRIVER_ONLY → Driver only (customer's vehicle)
 */
export type TransportMode = "OUTSTATION" | "ONE_WAY" | "TRANSFER" | "LOCAL" | "DRIVER_ONLY" | "NONE";

export const transportModes: { id: TransportMode; label: string; covers: string }[] = [
  { id: "OUTSTATION", label: "Outstation / round trip", covers: "Car + driver (outstation), round-trip taxi, group / tempo traveller" },
  { id: "ONE_WAY", label: "One-way drop", covers: "One-way transfer between towns" },
  { id: "TRANSFER", label: "Airport / railway transfer", covers: "Pickup or drop at an airport or railway station" },
  { id: "LOCAL", label: "Local sightseeing", covers: "Half / full-day local taxi" },
  { id: "DRIVER_ONLY", label: "Driver only", covers: "Driver for the customer's own vehicle" },
  { id: "NONE", label: "No transport", covers: "Hotel / services only" },
];

export type CalcInput = {
  vehicleId: string;
  mode: TransportMode;
  days: number;
  totalKm: number;
  nights: number; // driver night halts / nights away
  vehicles: number;
  tolls: number; // estimated tolls + parking
  extraHours: number; // local / driver-only overtime
  extraKm: number; // local mode
  lateNight: boolean; // 10 pm – 6 am pickup or drop
  waitingHours: number; // transfer waiting beyond the free time
  driverAllowanceOneWay: boolean;
  driverOutstation: boolean; // driver-only: away from base
  driverReturnFare: number; // driver-only: bus/train fare back
  hotelId: string; // "" = no hotel
  rooms: number;
  hotelNights: number;
  persons: number;
  meals: boolean; // add dinner (MAP)
  peak: boolean; // peak-season hotel surcharge
};

export const emptyCalc: CalcInput = {
  vehicleId: "SEDAN",
  mode: "OUTSTATION",
  days: 3,
  totalKm: 500,
  nights: 2,
  vehicles: 1,
  tolls: 0,
  extraHours: 0,
  extraKm: 0,
  lateNight: false,
  waitingHours: 0,
  driverAllowanceOneWay: true,
  driverOutstation: false,
  driverReturnFare: 0,
  hotelId: "",
  rooms: 1,
  hotelNights: 2,
  persons: 2,
  meals: false,
  peak: false,
};

const n = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);

export function lineAmount(item: QuoteItem) {
  return Math.round(n(item.qty) * n(item.rate));
}

export function estimateTransport(c: CalcInput, v: VehicleRateInput | undefined, rules: TransportRules): QuoteItem[] {
  if (c.mode === "NONE") return [];
  const days = Math.max(1, Math.round(n(c.days)));
  const items: QuoteItem[] = [];

  // Driver only — no vehicle rates involved
  if (c.mode === "DRIVER_ONLY") {
    const rate = c.driverOutstation ? rules.driverOutstationDayRate : rules.driverDayRate;
    items.push({
      label: `Driver for your vehicle — ${c.driverOutstation ? "outstation" : "local"}, up to ${rules.driverDayHours} hrs/day`,
      qty: days,
      unit: "day",
      rate,
    });
    if (n(c.nights) > 0) items.push({ label: "Driver night allowance (food & stay)", qty: Math.round(n(c.nights)), unit: "night", rate: rules.driverNightAllowance });
    if (n(c.extraHours) > 0) items.push({ label: "Driver overtime (estimate)", qty: Math.round(n(c.extraHours)), unit: "hour", rate: rules.driverOvertimeHour });
    if (n(c.driverReturnFare) > 0) items.push({ label: "Driver's return travel fare", qty: 1, unit: "lump sum", rate: Math.round(n(c.driverReturnFare)) });
    return items;
  }

  if (!v) return [];
  const vehicles = Math.max(1, Math.round(n(c.vehicles)));
  const each = vehicles > 1 ? ` × ${vehicles} vehicles` : "";
  const name = `${v.name} (${v.example})`;

  if (c.mode === "OUTSTATION") {
    const minKm = v.minKmPerDay * days;
    const km = Math.max(Math.round(n(c.totalKm)), minKm);
    items.push({
      label: `${name} — ${km} km @ ${v.perKm}/km${km === minKm ? ` (min ${v.minKmPerDay} km/day)` : ""}${each}`,
      qty: km * vehicles,
      unit: "km",
      rate: v.perKm,
    });
    items.push({ label: `Driver allowance${each}`, qty: days * vehicles, unit: "day", rate: v.driverAllowance });
    if (n(c.nights) > 0) items.push({ label: `Driver night halt${each}`, qty: Math.round(n(c.nights)) * vehicles, unit: "night", rate: v.nightHalt });
  } else if (c.mode === "ONE_WAY") {
    const km = Math.max(Math.round(n(c.totalKm)), rules.oneWayMinKm);
    items.push({
      label: `${name} — one-way drop, ${km} km @ ${v.oneWayPerKm}/km${km === rules.oneWayMinKm ? ` (min ${rules.oneWayMinKm} km)` : ""}${each}`,
      qty: km * vehicles,
      unit: "km",
      rate: v.oneWayPerKm,
    });
    if (c.driverAllowanceOneWay) items.push({ label: `Driver allowance${each}`, qty: vehicles, unit: "trip", rate: v.driverAllowance });
  } else if (c.mode === "TRANSFER") {
    items.push({ label: `${name} — airport / railway transfer (includes ${v.transferKm} km)${each}`, qty: vehicles, unit: "transfer", rate: v.transferBase });
    const extra = Math.max(0, Math.round(n(c.totalKm)) - v.transferKm);
    if (extra > 0) items.push({ label: `Distance beyond ${v.transferKm} km${each}`, qty: extra * vehicles, unit: "km", rate: v.oneWayPerKm });
    if (n(c.waitingHours) > 0)
      items.push({ label: `Waiting beyond ${rules.freeWaitMinutes} free minutes (estimate)${each}`, qty: Math.ceil(n(c.waitingHours)) * vehicles, unit: "hour", rate: v.extraHour });
  } else {
    items.push({
      label: `${name} — local package ${v.localHours} hrs / ${v.localKm} km per day${each}`,
      qty: days * vehicles,
      unit: "day",
      rate: v.localPackage,
    });
    if (n(c.extraHours) > 0) items.push({ label: "Extra hours (estimate)", qty: Math.round(n(c.extraHours)) * vehicles, unit: "hour", rate: v.extraHour });
    if (n(c.extraKm) > 0) items.push({ label: "Extra km (estimate)", qty: Math.round(n(c.extraKm)) * vehicles, unit: "km", rate: v.extraKm });
  }

  if (c.lateNight && (c.mode === "TRANSFER" || c.mode === "ONE_WAY"))
    items.push({ label: `Late-night charge (10 pm – 6 am)${each}`, qty: vehicles, unit: "trip", rate: rules.lateNightCharge });
  if (n(c.tolls) > 0) items.push({ label: "Tolls & parking (estimate)", qty: 1, unit: "lump sum", rate: Math.round(n(c.tolls)) });
  return items;
}

export function estimateHotel(c: CalcInput, h: HotelRateInput | undefined, peakSurchargePct: number): QuoteItem[] {
  if (!h) return [];
  const rooms = Math.max(1, Math.round(n(c.rooms)));
  const nights = Math.round(n(c.hotelNights));
  if (nights < 1) return [];
  const factor = c.peak ? 1 + n(peakSurchargePct) / 100 : 1;
  const items: QuoteItem[] = [
    {
      label: `Hotel — ${h.name} category, ${rooms} room${rooms > 1 ? "s" : ""} × ${nights} night${nights > 1 ? "s" : ""}, breakfast included${c.peak ? " (peak season)" : ""}`,
      qty: rooms * nights,
      unit: "room-night",
      rate: Math.round(h.perRoomNight * factor),
    },
  ];
  if (c.meals && n(c.persons) > 0) {
    items.push({ label: "Dinner (MAP plan)", qty: Math.round(n(c.persons)) * nights, unit: "person-night", rate: h.mealsPerPerson });
  }
  return items;
}

export function computeTotals(items: QuoteItem[], markupPct: number, taxPct: number) {
  const subtotal = items.reduce((s, i) => s + lineAmount(i), 0);
  const markupAmount = Math.round((subtotal * n(markupPct)) / 100);
  const taxAmount = Math.round(((subtotal + markupAmount) * n(taxPct)) / 100);
  return { subtotal, markupAmount, taxAmount, total: subtotal + markupAmount + taxAmount };
}

/** Indian-grouped rupees, e.g. "Rs. 1,25,000" (PDF-safe; no ₹ glyph needed). */
export function rupees(amount: number, symbol = "₹") {
  return `${symbol}${symbol === "₹" ? "" : " "}${Math.round(amount).toLocaleString("en-IN")}`;
}

export function addDaysISO(days: number, from = new Date()) {
  const d = new Date(from.getTime() + 5.5 * 3600 * 1000 + days * 86400 * 1000);
  return d.toISOString().slice(0, 10);
}
