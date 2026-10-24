// Public fare estimate — the same calculator the admin uses for quotes
// (lib/quote.ts), applied to a typical road distance. Shown as a range because
// the written quote uses the actual route, dates and partner availability.

import { computeTotals, emptyCalc, estimateTransport, type TransportRules, type VehicleRateInput } from "./quote";

export type TripKind = "ONE_WAY" | "ROUND_TRIP";

export type EstimatorRates = {
  vehicles: VehicleRateInput[];
  rules: TransportRules;
  markupPct: number;
  taxPct: number;
};

export type FareEstimate = { vehicleId: string; low: number; high: number };

/** Suggested days for a round trip: one hill day per ~300 km driven, at least 1. */
export function suggestedDays(km: number) {
  return Math.max(1, Math.ceil((km * 2) / 300));
}

const roundTo = (v: number, step: number) => Math.round(v / step) * step;

export function estimateFares(km: number, kind: TripKind, days: number, rates: EstimatorRates): FareEstimate[] {
  const d = Math.max(1, Math.round(days));
  return rates.vehicles.map((v) => {
    const items = estimateTransport(
      kind === "ONE_WAY"
        ? { ...emptyCalc, vehicleId: v.id, mode: "ONE_WAY", totalKm: km, driverAllowanceOneWay: true }
        : // Round trip: there and back plus ~10% for local sightseeing at the destination
          { ...emptyCalc, vehicleId: v.id, mode: "OUTSTATION", totalKm: Math.round(km * 2 * 1.1), days: d, nights: d - 1 },
      v,
      rates.rules,
    );
    const { total } = computeTotals(items, rates.markupPct, rates.taxPct);
    return { vehicleId: v.id, low: roundTo(total, 100), high: roundTo(total * 1.12, 100) };
  });
}
