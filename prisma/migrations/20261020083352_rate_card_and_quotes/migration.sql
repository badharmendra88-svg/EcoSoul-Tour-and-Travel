-- CreateTable
CREATE TABLE "VehicleRate" (
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
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HotelRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "perRoomNight" INTEGER NOT NULL,
    "mealsPerPerson" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "QuoteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "gstPct" REAL NOT NULL,
    "gstLabel" TEXT NOT NULL,
    "markupPct" REAL NOT NULL,
    "markupLabel" TEXT NOT NULL,
    "validityDays" INTEGER NOT NULL,
    "advancePct" INTEGER NOT NULL,
    "peakSurchargePct" INTEGER NOT NULL,
    "terms" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "enquiryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "title" TEXT NOT NULL,
    "tripSummary" TEXT,
    "travelDate" TEXT,
    "items" TEXT NOT NULL DEFAULT '[]',
    "subtotal" INTEGER NOT NULL,
    "markupPct" REAL NOT NULL,
    "markupLabel" TEXT NOT NULL,
    "markupAmount" INTEGER NOT NULL,
    "taxPct" REAL NOT NULL,
    "taxLabel" TEXT NOT NULL,
    "taxAmount" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "advancePct" INTEGER NOT NULL,
    "inclusions" TEXT NOT NULL DEFAULT '[]',
    "exclusions" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "terms" TEXT NOT NULL DEFAULT '[]',
    "calcInput" TEXT,
    "validUntil" TEXT NOT NULL,
    "sentAt" DATETIME,
    "sentVia" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Quote_token_key" ON "Quote"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_number_key" ON "Quote"("number");

-- CreateIndex
CREATE INDEX "Quote_enquiryId_idx" ON "Quote"("enquiryId");
