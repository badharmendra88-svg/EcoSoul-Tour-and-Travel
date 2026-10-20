-- AlterTable
ALTER TABLE "Destination" ADD COLUMN "bestFor" TEXT;
ALTER TABLE "Destination" ADD COLUMN "imageAlt" TEXT;
ALTER TABLE "Destination" ADD COLUMN "imageCredit" TEXT;
ALTER TABLE "Destination" ADD COLUMN "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN "transmission" TEXT;
ALTER TABLE "Enquiry" ADD COLUMN "tripDays" INTEGER;

-- AlterTable
ALTER TABLE "Package" ADD COLUMN "imageAlt" TEXT;
ALTER TABLE "Package" ADD COLUMN "imageCredit" TEXT;
ALTER TABLE "Package" ADD COLUMN "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN "emergencyPhone" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "gstin" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "heroImageAlt" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "heroImageUrl" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "legalName" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "tourismRegNo" TEXT;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "place" TEXT,
    "tripLabel" TEXT,
    "text" TEXT NOT NULL,
    "rating" INTEGER,
    "consentNote" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
