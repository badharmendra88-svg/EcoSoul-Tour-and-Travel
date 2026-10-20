-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QuoteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "gstPct" REAL NOT NULL,
    "gstLabel" TEXT NOT NULL,
    "markupPct" REAL NOT NULL,
    "markupLabel" TEXT NOT NULL,
    "validityDays" INTEGER NOT NULL,
    "advancePct" INTEGER NOT NULL,
    "peakSurchargePct" INTEGER NOT NULL,
    "oneWayMinKm" INTEGER NOT NULL DEFAULT 80,
    "lateNightCharge" INTEGER NOT NULL DEFAULT 300,
    "freeWaitMinutes" INTEGER NOT NULL DEFAULT 45,
    "driverDayRate" INTEGER NOT NULL DEFAULT 1000,
    "driverOutstationDayRate" INTEGER NOT NULL DEFAULT 1300,
    "driverDayHours" INTEGER NOT NULL DEFAULT 10,
    "driverOvertimeHour" INTEGER NOT NULL DEFAULT 100,
    "driverNightAllowance" INTEGER NOT NULL DEFAULT 300,
    "terms" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_QuoteSettings" ("advancePct", "gstLabel", "gstPct", "id", "markupLabel", "markupPct", "peakSurchargePct", "terms", "updatedAt", "validityDays") SELECT "advancePct", "gstLabel", "gstPct", "id", "markupLabel", "markupPct", "peakSurchargePct", "terms", "updatedAt", "validityDays" FROM "QuoteSettings";
DROP TABLE "QuoteSettings";
ALTER TABLE "new_QuoteSettings" RENAME TO "QuoteSettings";
CREATE TABLE "new_VehicleRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "perKm" INTEGER NOT NULL,
    "minKmPerDay" INTEGER NOT NULL,
    "driverAllowance" INTEGER NOT NULL,
    "nightHalt" INTEGER NOT NULL,
    "localPackage" INTEGER NOT NULL,
    "localHours" INTEGER NOT NULL DEFAULT 8,
    "localKm" INTEGER NOT NULL DEFAULT 80,
    "extraHour" INTEGER NOT NULL,
    "extraKm" INTEGER NOT NULL,
    "oneWayPerKm" INTEGER NOT NULL DEFAULT 0,
    "transferBase" INTEGER NOT NULL DEFAULT 0,
    "transferKm" INTEGER NOT NULL DEFAULT 40,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_VehicleRate" ("active", "driverAllowance", "example", "extraHour", "extraKm", "id", "localHours", "localKm", "localPackage", "minKmPerDay", "name", "nightHalt", "perKm", "seats", "sortOrder", "updatedAt") SELECT "active", "driverAllowance", "example", "extraHour", "extraKm", "id", "localHours", "localKm", "localPackage", "minKmPerDay", "name", "nightHalt", "perKm", "seats", "sortOrder", "updatedAt" FROM "VehicleRate";
DROP TABLE "VehicleRate";
ALTER TABLE "new_VehicleRate" RENAME TO "VehicleRate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
