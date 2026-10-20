-- CreateTable
CREATE TABLE "DriverPartner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ref" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "baseLocation" TEXT NOT NULL,
    "serviceAreas" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "hillExperienceYears" INTEGER,
    "languages" TEXT,
    "licenceType" TEXT NOT NULL,
    "licenceNumberEnc" TEXT NOT NULL,
    "licenceLast4" TEXT NOT NULL,
    "licenceExpiry" TEXT NOT NULL,
    "partnerType" TEXT NOT NULL,
    "vehicleCategory" TEXT,
    "vehicleModel" TEXT,
    "vehicleRegNo" TEXT,
    "vehicleSeats" INTEGER,
    "commercialPermit" TEXT,
    "availability" TEXT NOT NULL,
    "expectedDailyRate" INTEGER,
    "message" TEXT,
    "heardFrom" TEXT,
    "consentAt" DATETIME NOT NULL,
    "licenceChecked" BOOLEAN NOT NULL DEFAULT false,
    "idChecked" BOOLEAN NOT NULL DEFAULT false,
    "policeVerified" BOOLEAN NOT NULL DEFAULT false,
    "vehicleDocsChecked" BOOLEAN NOT NULL DEFAULT false,
    "agreementSigned" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "verifiedBy" TEXT,
    "insuranceExpiry" TEXT,
    "permitExpiry" TEXT,
    "fitnessExpiry" TEXT,
    "pucExpiry" TEXT,
    "internalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DriverEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "driverId" TEXT NOT NULL,
    "at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    CONSTRAINT "DriverEvent_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "DriverPartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DriverPartner_ref_key" ON "DriverPartner"("ref");

-- CreateIndex
CREATE INDEX "DriverPartner_status_idx" ON "DriverPartner"("status");

-- CreateIndex
CREATE INDEX "DriverPartner_phone_idx" ON "DriverPartner"("phone");

-- CreateIndex
CREATE INDEX "DriverEvent_driverId_at_idx" ON "DriverEvent"("driverId", "at");
