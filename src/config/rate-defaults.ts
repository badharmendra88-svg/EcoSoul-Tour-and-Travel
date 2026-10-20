// Starting rate card for the admin estimate calculator.
//
// Typical Uttarakhand market ranges (2025–26, hill routes, partner taxis):
//   per-km outstation: hatchback ₹11–13 · sedan ₹12–14 · Ertiga-class ₹14–16 ·
//   Innova ₹17–20 · Crysta ₹20–24 · 12-seat tempo traveller ₹24–30
//   minimum 250 km/day billing, driver allowance ₹300–500/day,
//   local 8 hr / 80 km packages ₹2,000–6,000 depending on vehicle.
//   one-way drops are priced ~10–20% above round-trip per-km (empty return);
//   airport/railway transfers ₹1,000–3,000 for the first ~40 km;
//   driver-only ₹800–1,200/day local, ₹1,200–1,500/day outstation + night allowance.
// Hotels vary heavily by town and season — these are mid-range starting points.
//
// These are DEFAULTS ONLY. Owners must replace them with actual partner rates
// from the admin "Rate card" page before sending real quotes.

export const defaultVehicleRates = [
  { id: "HATCHBACK", name: "Hatchback", example: "WagonR / Swift or similar", seats: 4, perKm: 12, minKmPerDay: 250, driverAllowance: 400, nightHalt: 300, localPackage: 2200, extraHour: 150, extraKm: 12, oneWayPerKm: 14, transferBase: 1100, transferKm: 40, sortOrder: 1 },
  { id: "SEDAN", name: "Sedan", example: "Swift Dzire / Etios or similar", seats: 4, perKm: 13, minKmPerDay: 250, driverAllowance: 400, nightHalt: 300, localPackage: 2600, extraHour: 200, extraKm: 13, oneWayPerKm: 15, transferBase: 1300, transferKm: 40, sortOrder: 2 },
  { id: "SUV", name: "SUV / MUV", example: "Ertiga / Innova or similar", seats: 6, perKm: 17, minKmPerDay: 250, driverAllowance: 450, nightHalt: 300, localPackage: 3600, extraHour: 250, extraKm: 17, oneWayPerKm: 19, transferBase: 1800, transferKm: 40, sortOrder: 3 },
  { id: "PREMIUM", name: "Premium", example: "Innova Crysta or similar", seats: 6, perKm: 21, minKmPerDay: 250, driverAllowance: 500, nightHalt: 400, localPackage: 4500, extraHour: 300, extraKm: 21, oneWayPerKm: 24, transferBase: 2300, transferKm: 40, sortOrder: 4 },
  { id: "TEMPO", name: "Tempo Traveller", example: "12-seater Force Traveller or similar", seats: 12, perKm: 26, minKmPerDay: 250, driverAllowance: 600, nightHalt: 400, localPackage: 5500, extraHour: 400, extraKm: 26, oneWayPerKm: 30, transferBase: 3000, transferKm: 40, sortOrder: 5 },
];

export const defaultHotelRates = [
  { id: "BUDGET", name: "Budget", description: "Clean guesthouse / 2-star, breakfast included", perRoomNight: 2000, mealsPerPerson: 600, sortOrder: 1 },
  { id: "STANDARD", name: "Standard", description: "3-star hotel / good homestay, breakfast included", perRoomNight: 3500, mealsPerPerson: 800, sortOrder: 2 },
  { id: "PREMIUM", name: "Premium", description: "4-star / premium resort, breakfast included", perRoomNight: 7000, mealsPerPerson: 1200, sortOrder: 3 },
];

export const defaultQuoteSettings = {
  id: "default",
  // Tour-operator / passenger-transport GST is commonly 5% without ITC — confirm with your CA.
  gstPct: 5,
  gstLabel: "GST",
  markupPct: 10,
  markupLabel: "Service & planning charges",
  validityDays: 7,
  advancePct: 30,
  peakSurchargePct: 25,
  oneWayMinKm: 80,
  lateNightCharge: 300,
  freeWaitMinutes: 45,
  driverDayRate: 1000,
  driverOutstationDayRate: 1300,
  driverDayHours: 10,
  driverOvertimeHour: 100,
  driverNightAllowance: 300,
  terms: [
    "This is a quotation, not a booking confirmation. Hotels and vehicles are confirmed only after the advance is received and partners confirm availability.",
    "Prices are valid until the date shown and subject to availability at the time of confirmation.",
    "Tolls, parking, state entry taxes and permits are payable at actuals unless listed as included.",
    "Vehicle is the confirmed category or an equivalent; a specific make/model is not guaranteed.",
    "Driving times are estimates and depend on traffic, weather and road conditions.",
    "Cancellation charges depend on hotel and transport partners and are shared in the booking confirmation.",
  ].join("\n"),
};
