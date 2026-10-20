import "server-only";
import { db } from "./db";
import { defaultHotelRates, defaultQuoteSettings, defaultVehicleRates } from "@/config/rate-defaults";

/** Loads the rate card, creating market-standard defaults the first time. */
export async function getRateCard() {
  let [vehicles, hotels, settings] = await Promise.all([
    db.vehicleRate.findMany({ orderBy: { sortOrder: "asc" } }),
    db.hotelRate.findMany({ orderBy: { sortOrder: "asc" } }),
    db.quoteSettings.findUnique({ where: { id: "default" } }),
  ]);

  if (vehicles.length === 0) {
    await db.vehicleRate.createMany({ data: defaultVehicleRates });
    vehicles = await db.vehicleRate.findMany({ orderBy: { sortOrder: "asc" } });
  }
  if (hotels.length === 0) {
    await db.hotelRate.createMany({ data: defaultHotelRates });
    hotels = await db.hotelRate.findMany({ orderBy: { sortOrder: "asc" } });
  }
  if (!settings) {
    settings = await db.quoteSettings.create({ data: defaultQuoteSettings });
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
