-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "cluster" TEXT NOT NULL,
    "scene" TEXT NOT NULL DEFAULT 'mountain',
    "bestFor" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "imageCredit" TEXT,
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
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
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
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "imageCredit" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "sourcePage" TEXT,
    "heardFrom" TEXT,
    "utm" TEXT,
    "travellingFrom" TEXT,
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
    "tripDays" INTEGER,
    "transmission" TEXT,
    "consent" BOOLEAN NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "assignedTo" TEXT,
    "internalNotes" TEXT,
    "notifyStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "notifyError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleRate" (
    "id" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelRate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "perRoomNight" INTEGER NOT NULL,
    "mealsPerPerson" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "gstPct" DOUBLE PRECISION NOT NULL,
    "gstLabel" TEXT NOT NULL,
    "markupPct" DOUBLE PRECISION NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
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
    "markupPct" DOUBLE PRECISION NOT NULL,
    "markupLabel" TEXT NOT NULL,
    "markupAmount" INTEGER NOT NULL,
    "taxPct" DOUBLE PRECISION NOT NULL,
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
    "sentAt" TIMESTAMP(3),
    "sentVia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "amount" INTEGER NOT NULL,
    "orderId" TEXT,
    "paymentId" TEXT,
    "reference" TEXT,
    "note" TEXT,
    "recordedBy" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MANAGER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "tokenVersion" INTEGER NOT NULL DEFAULT 1,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT,
    "hours" TEXT,
    "whatsappButton" BOOLEAN NOT NULL DEFAULT true,
    "whatsappGreeting" TEXT,
    "waApiEnabled" BOOLEAN NOT NULL DEFAULT false,
    "waPhoneNumberId" TEXT,
    "waBusinessAccountId" TEXT,
    "waAccessTokenEnc" TEXT,
    "waApiVersion" TEXT NOT NULL DEFAULT 'v21.0',
    "waQuoteTemplate" TEXT,
    "waTemplateLang" TEXT NOT NULL DEFAULT 'en',
    "waLastTestAt" TIMESTAMP(3),
    "waLastTestOk" BOOLEAN,
    "waLastTestResult" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "youtube" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "googleBusiness" TEXT,
    "tripadvisor" TEXT,
    "gaId" TEXT,
    "metaPixelId" TEXT,
    "googleVerification" TEXT,
    "notifyWebhookUrl" TEXT,
    "heroImageUrl" TEXT,
    "heroImageAlt" TEXT,
    "serviceToursImageUrl" TEXT,
    "serviceToursImageAlt" TEXT,
    "serviceTaxiImageUrl" TEXT,
    "serviceTaxiImageAlt" TEXT,
    "serviceDriverImageUrl" TEXT,
    "serviceDriverImageAlt" TEXT,
    "serviceCustomImageUrl" TEXT,
    "serviceCustomImageAlt" TEXT,
    "legalName" TEXT,
    "gstin" TEXT,
    "tourismRegNo" TEXT,
    "emergencyPhone" TEXT,
    "upiId" TEXT,
    "upiPayeeName" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "place" TEXT,
    "tripLabel" TEXT,
    "text" TEXT NOT NULL,
    "rating" INTEGER,
    "consentNote" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnquiryEvent" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,

    CONSTRAINT "EnquiryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverPartner" (
    "id" TEXT NOT NULL,
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
    "consentAt" TIMESTAMP(3) NOT NULL,
    "licenceChecked" BOOLEAN NOT NULL DEFAULT false,
    "idChecked" BOOLEAN NOT NULL DEFAULT false,
    "policeVerified" BOOLEAN NOT NULL DEFAULT false,
    "vehicleDocsChecked" BOOLEAN NOT NULL DEFAULT false,
    "agreementSigned" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "insuranceExpiry" TEXT,
    "permitExpiry" TEXT,
    "fitnessExpiry" TEXT,
    "pucExpiry" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverEvent" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,

    CONSTRAINT "DriverEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DestinationToPackage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DestinationToPackage_AB_pkey" PRIMARY KEY ("A","B")
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
CREATE UNIQUE INDEX "Quote_token_key" ON "Quote"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_number_key" ON "Quote"("number");

-- CreateIndex
CREATE INDEX "Quote_enquiryId_idx" ON "Quote"("enquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentId_key" ON "Payment"("paymentId");

-- CreateIndex
CREATE INDEX "Payment_quoteId_status_idx" ON "Payment"("quoteId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "EnquiryEvent_enquiryId_at_idx" ON "EnquiryEvent"("enquiryId", "at");

-- CreateIndex
CREATE UNIQUE INDEX "DriverPartner_ref_key" ON "DriverPartner"("ref");

-- CreateIndex
CREATE INDEX "DriverPartner_status_idx" ON "DriverPartner"("status");

-- CreateIndex
CREATE INDEX "DriverPartner_phone_idx" ON "DriverPartner"("phone");

-- CreateIndex
CREATE INDEX "DriverEvent_driverId_at_idx" ON "DriverEvent"("driverId", "at");

-- CreateIndex
CREATE INDEX "_DestinationToPackage_B_index" ON "_DestinationToPackage"("B");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnquiryEvent" ADD CONSTRAINT "EnquiryEvent_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverEvent" ADD CONSTRAINT "DriverEvent_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "DriverPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DestinationToPackage" ADD CONSTRAINT "_DestinationToPackage_A_fkey" FOREIGN KEY ("A") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DestinationToPackage" ADD CONSTRAINT "_DestinationToPackage_B_fkey" FOREIGN KEY ("B") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
