-- Add internal partner, booking allocation and commission tracking.
CREATE TABLE "HotelPartner" (
  "id" TEXT NOT NULL,
  "ref" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "location" TEXT NOT NULL,
  "propertyType" TEXT NOT NULL,
  "roomTypes" TEXT,
  "commissionPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "internalNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HotelPartner_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Booking" (
  "id" TEXT NOT NULL,
  "ref" TEXT NOT NULL,
  "enquiryId" TEXT,
  "serviceType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ALLOCATED',
  "driverPartnerId" TEXT,
  "hotelPartnerId" TEXT,
  "travelDate" TEXT,
  "endDate" TEXT,
  "bookingAmount" INTEGER NOT NULL DEFAULT 0,
  "commissionType" TEXT NOT NULL DEFAULT 'PERCENT',
  "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "commissionAmount" INTEGER NOT NULL DEFAULT 0,
  "commissionStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "commissionPaidAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HotelPartner_ref_key" ON "HotelPartner"("ref");
CREATE INDEX "HotelPartner_status_location_idx" ON "HotelPartner"("status", "location");
CREATE INDEX "HotelPartner_phone_idx" ON "HotelPartner"("phone");
CREATE UNIQUE INDEX "Booking_ref_key" ON "Booking"("ref");
CREATE INDEX "Booking_status_travelDate_idx" ON "Booking"("status", "travelDate");
CREATE INDEX "Booking_commissionStatus_createdAt_idx" ON "Booking"("commissionStatus", "createdAt");
CREATE INDEX "Booking_enquiryId_idx" ON "Booking"("enquiryId");
CREATE INDEX "Booking_driverPartnerId_idx" ON "Booking"("driverPartnerId");
CREATE INDEX "Booking_hotelPartnerId_idx" ON "Booking"("hotelPartnerId");
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_driverPartnerId_fkey" FOREIGN KEY ("driverPartnerId") REFERENCES "DriverPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hotelPartnerId_fkey" FOREIGN KEY ("hotelPartnerId") REFERENCES "HotelPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
