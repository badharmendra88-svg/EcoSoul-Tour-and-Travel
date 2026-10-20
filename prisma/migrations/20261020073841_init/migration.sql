-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "cluster" TEXT NOT NULL,
    "scene" TEXT NOT NULL DEFAULT 'mountain',
    "summary" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "bestTime" TEXT NOT NULL,
    "howToReach" TEXT NOT NULL,
    "suggestedDuration" TEXT NOT NULL,
    "experiences" TEXT NOT NULL DEFAULT '[]',
    "practical" TEXT NOT NULL DEFAULT '[]',
    "faqs" TEXT NOT NULL DEFAULT '[]',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "reviewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "durationLabel" TEXT NOT NULL,
    "tripType" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "startingPrice" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "priceBasis" TEXT,
    "season" TEXT NOT NULL,
    "itinerary" TEXT NOT NULL DEFAULT '[]',
    "inclusions" TEXT NOT NULL DEFAULT '[]',
    "exclusions" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT NOT NULL DEFAULT '[]',
    "internalNotes" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ref" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "sourcePage" TEXT,
    "heardFrom" TEXT,
    "utm" TEXT,
    "packageSlug" TEXT,
    "destination" TEXT,
    "travelDate" TEXT,
    "dateFlexible" BOOLEAN NOT NULL DEFAULT false,
    "adults" INTEGER,
    "children" INTEGER,
    "interests" TEXT,
    "budgetBand" TEXT,
    "message" TEXT,
    "serviceType" TEXT,
    "pickup" TEXT,
    "drop" TEXT,
    "pickupTime" TEXT,
    "returnDate" TEXT,
    "luggage" TEXT,
    "vehicleCategory" TEXT,
    "fareType" TEXT,
    "arrivalRef" TEXT,
    "consent" BOOLEAN NOT NULL,
    "consentAt" DATETIME NOT NULL,
    "assignedTo" TEXT,
    "internalNotes" TEXT,
    "notifyStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "notifyError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EnquiryEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enquiryId" TEXT NOT NULL,
    "at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    CONSTRAINT "EnquiryEvent_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_DestinationToPackage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_DestinationToPackage_A_fkey" FOREIGN KEY ("A") REFERENCES "Destination" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DestinationToPackage_B_fkey" FOREIGN KEY ("B") REFERENCES "Package" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Package_slug_key" ON "Package"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_ref_key" ON "Enquiry"("ref");

-- CreateIndex
CREATE INDEX "Enquiry_status_idx" ON "Enquiry"("status");

-- CreateIndex
CREATE INDEX "Enquiry_kind_createdAt_idx" ON "Enquiry"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "EnquiryEvent_enquiryId_at_idx" ON "EnquiryEvent"("enquiryId", "at");

-- CreateIndex
CREATE UNIQUE INDEX "_DestinationToPackage_AB_unique" ON "_DestinationToPackage"("A", "B");

-- CreateIndex
CREATE INDEX "_DestinationToPackage_B_index" ON "_DestinationToPackage"("B");
