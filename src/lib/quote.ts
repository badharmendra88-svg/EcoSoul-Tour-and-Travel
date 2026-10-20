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
};

export type HotelRateInput = { id: string; name: string; description: string; perRoomNight: number; mealsPerPerson: number };

export type CalcInput = {
  vehicleId: string;
  mode: "OUTSTATION" | "LOCAL" | "NONE";
  days: number;
  totalKm: number;
  nights: number; // driver night halts
  vehicles: number;
  tolls: number; // estimated tolls + parking
  extraHours: number; // local mode
  extraKm: number; // local mode
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

export function estimateTransport(c: CalcInput, v: VehicleRateInput | undefined): QuoteItem[] {
  if (!v || c.mode === "NONE") return [];
  const vehicles = Math.max(1, Math.round(n(c.vehicles)));
  const days = Math.max(1, Math.round(n(c.days)));
  const each = vehicles > 1 ? ` × ${vehicles} vehicles` : "";
  const items: QuoteItem[] = [];

  if (c.mode === "OUTSTATION") {
    const minKm = v.minKmPerDay * days;
    const km = Math.max(Math.round(n(c.totalKm)), minKm);
    items.push({
      label: `${v.name} (${v.example}) — ${km} km @ ${v.perKm}/km${km === minKm ? ` (min ${v.minKmPerDay} km/day)` : ""}${each}`,
      qty: km * vehicles,
      unit: "km",
      rate: v.perKm,
    });
    items.push({ label: `Driver allowance${each}`, qty: days * vehicles, unit: "day", rate: v.driverAllowance });
    if (n(c.nights) > 0) {
      items.push({ label: `Driver night halt${each}`, qty: Math.round(n(c.nights)) * vehicles, unit: "night", rate: v.nightHalt });
    }
  } else {
    items.push({
      label: `${v.name} (${v.example}) — local package ${v.localHours} hrs / ${v.localKm} km per day${each}`,
      qty: days * vehicles,
      unit: "day",
      rate: v.localPackage,
    });
    if (n(c.extraHours) > 0) items.push({ label: "Extra hours (estimate)", qty: Math.round(n(c.extraHours)) * vehicles, unit: "hour", rate: v.extraHour });
    if (n(c.extraKm) > 0) items.push({ label: "Extra km (estimate)", qty: Math.round(n(c.extraKm)) * vehicles, unit: "km", rate: v.extraKm });
  }

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
