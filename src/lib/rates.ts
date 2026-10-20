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
  return { vehicles, hotels, settings };
}
