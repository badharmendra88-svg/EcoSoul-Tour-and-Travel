-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN "travellingFrom" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN "upiId" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "upiPayeeName" TEXT;

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "amount" INTEGER NOT NULL,
    "orderId" TEXT,
    "paymentId" TEXT,
    "reference" TEXT,
    "note" TEXT,
    "recordedBy" TEXT,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentId_key" ON "Payment"("paymentId");

-- CreateIndex
CREATE INDEX "Payment_quoteId_status_idx" ON "Payment"("quoteId", "status");
