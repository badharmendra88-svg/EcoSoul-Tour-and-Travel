import "server-only";
import { cache } from "react";
import { db } from "./db";
import type { EstimatorRates } from "./fare-estimate";
import { defaultHotelRates, defaultQuoteSettings, defaultVehicleRates } from "@/config/rate-defaults";

/** Loads the rate card, creating market-standard defaults the first time. */
export async function getRateCard() {
  let [vehicles, hotels, settings] = await Promise.all([
    db.vehicleRate.findMany({ orderBy: { sortOrder: "asc" } }),
    db.hotelRate.findMany({ orderBy: { sortOrder: "asc" } }),
    db.quoteSettings.findUnique({ where: { id: "default" } }),
  ]);

  // Pages render in parallel (build workers, requests), so several may create the defaults at once
  if (vehicles.length === 0) {
    await db.vehicleRate.createMany({ data: defaultVehicleRates, skipDuplicates: true });
    vehicles = await db.vehicleRate.findMany({ orderBy: { sortOrder: "asc" } });
  }
  if (hotels.length === 0) {
    await db.hotelRate.createMany({ data: defaultHotelRates, skipDuplicates: true });
    hotels = await db.hotelRate.findMany({ orderBy: { sortOrder: "asc" } });
  }
  if (!settings) {
    // createMany + skipDuplicates is one INSERT … ON CONFLICT DO NOTHING; upsert is not atomic here
    await db.quoteSettings.createMany({ data: [{ ...defaultQuoteSettings, id: "default" }], skipDuplicates: true });
    settings = await db.quoteSettings.findUniqueOrThrow({ where: { id: "default" } });
  }

  // One-time backfill for rate cards created before one-way/transfer rates existed
  const missing = vehicles.filter((v) => v.oneWayPerKm === 0 && v.transferBase === 0);
  if (missing.length) {
    await Promise.all(
      missing.map((v) => {
        const d = defaultVehicleRates.find((x) => x.id === v.id);
        return db.vehicleRate.update({
          where: { id: v.id },
          data: d
            ? { oneWayPerKm: d.oneWayPerKm, transferBase: d.transferBase, transferKm: d.transferKm }
            : { oneWayPerKm: Math.round(v.perKm * 1.15), transferBase: v.localPackage / 2, transferKm: 40 },
        });
      }),
    );
    vehicles = await db.vehicleRate.findMany({ orderBy: { sortOrder: "asc" } });
  }
  return { vehicles, hotels, settings };
}

/** The subset of the rate card the public fare estimator needs (no hotel or margin details beyond totals). */
export const getEstimatorRates = cache(async (): Promise<EstimatorRates> => {
  const { vehicles, settings } = await getRateCard();
  return {
    vehicles: vehicles
      .filter((v) => v.active)
      .map(({ id, name, example, seats, perKm, minKmPerDay, driverAllowance, nightHalt, localPackage, localHours, localKm, extraHour, extraKm, oneWayPerKm, transferBase, transferKm }) => ({
        id, name, example, seats, perKm, minKmPerDay, driverAllowance, nightHalt, localPackage, localHours, localKm, extraHour, extraKm, oneWayPerKm, transferBase, transferKm,
      })),
    rules: {
      oneWayMinKm: settings.oneWayMinKm,
      lateNightCharge: settings.lateNightCharge,
      freeWaitMinutes: settings.freeWaitMinutes,
      driverDayRate: settings.driverDayRate,
      driverOutstationDayRate: settings.driverOutstationDayRate,
      driverDayHours: settings.driverDayHours,
      driverOvertimeHour: settings.driverOvertimeHour,
      driverNightAllowance: settings.driverNightAllowance,
    },
    markupPct: settings.markupPct,
    taxPct: settings.gstPct,
  };
});

/**
 * Rates for public pages. When fare estimates are switched off (Admin → Settings → Website prices) the
 * rate card never reaches the browser: vehicles keep their name, example and seats, every money field is 0.
 */
export const getPublicEstimatorRates = cache(async (): Promise<EstimatorRates & { showFares: boolean }> => {
  const [rates, showFares] = await Promise.all([
    getEstimatorRates(),
    db.siteSettings.findUnique({ where: { id: "default" }, select: { showFares: true } }).then((s) => s?.showFares ?? false),
  ]);
  if (showFares) return { ...rates, showFares };
  const zero = <T extends object>(o: T) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === "number" ? 0 : v])) as T;
  return {
    vehicles: rates.vehicles.map((v) => ({ ...zero(v), seats: v.seats })),
    rules: zero(rates.rules),
    markupPct: 0,
    taxPct: 0,
    showFares,
  };
});
