"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/admin-auth";

const makeRef = (prefix: string) => {
  const date = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 4).toUpperCase();
  return `${prefix}-${date}-${suffix}`;
};
const value = (fd: FormData, key: string, max = 200) => String(fd.get(key) ?? "").trim().slice(0, max);
const amount = (fd: FormData, key: string) => {
  const n = Number(fd.get(key) ?? 0);
  return Number.isFinite(n) ? Math.max(0, Math.min(100000000, Math.round(n))) : 0;
};

export async function createHotelPartnerAction(fd: FormData) {
  const me = await requireUser("partners.manage");
  const name = value(fd, "name", 120);
  const phone = value(fd, "phone", 20);
  const location = value(fd, "location", 120);
  const propertyType = value(fd, "propertyType", 30);
  const commissionPct = Number(fd.get("commissionPct") ?? 0);
  if (name.length < 2 || phone.replace(/\\D/g, "").length < 10 || !location) redirect("/admin/hotels/?error=Please%20enter%20a%20valid%20name%2C%20mobile%20and%20location");
  if (!["HOTEL", "HOMESTAY", "RESORT", "GUESTHOUSE"].includes(propertyType) || !Number.isFinite(commissionPct) || commissionPct < 0 || commissionPct > 100) redirect("/admin/hotels/?error=Please%20check%20property%20type%20and%20commission");
  await db.hotelPartner.create({ data: {
    ref: makeRef("HT"), name, phone, location, propertyType,
    email: value(fd, "email", 120) || null,
    roomTypes: value(fd, "roomTypes", 500) || null,
    commissionPct,
    internalNotes: value(fd, "internalNotes", 2000) || null,
  }});
  revalidatePath("/admin/hotels/");
  redirect("/admin/hotels/?saved=1");
}

export async function updateHotelPartnerAction(fd: FormData) {
  await requireUser("partners.manage");
  const id = value(fd, "id", 80);
  const status = value(fd, "status", 20);
  if (!["ACTIVE", "INACTIVE", "UNDER_REVIEW"].includes(status)) redirect("/admin/hotels/");
  await db.hotelPartner.update({ where: { id }, data: { status, internalNotes: value(fd, "internalNotes", 2000) || null } });
  revalidatePath("/admin/hotels/");
}

export async function createBookingAction(fd: FormData) {
  const me = await requireUser("bookings.manage");
  const serviceType = value(fd, "serviceType", 20);
  const enquiryId = value(fd, "enquiryId", 80) || null;
  const driverPartnerId = value(fd, "driverPartnerId", 80) || null;
  const hotelPartnerId = value(fd, "hotelPartnerId", 80) || null;
  const commissionType = value(fd, "commissionType", 10);
  const commissionRate = Number(fd.get("commissionRate") ?? 0);
  const bookingAmount = amount(fd, "bookingAmount");
  if (!["TAXI", "HOTEL", "PACKAGE", "OTHER"].includes(serviceType)) redirect("/admin/bookings/?error=Choose%20a%20valid%20service");
  if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > (commissionType === "PERCENT" ? 100 : 10000000)) redirect("/admin/bookings/?error=Invalid%20commission");
  if (commissionType !== "PERCENT" && commissionType !== "FIXED") redirect("/admin/bookings/?error=Invalid%20commission%20type");
  if (enquiryId && !(await db.enquiry.findUnique({ where: { id: enquiryId }, select: { id: true } }))) redirect("/admin/bookings/?error=Enquiry%20not%20found");
  if (driverPartnerId) {
    const driver = await db.driverPartner.findUnique({ where: { id: driverPartnerId }, select: { id: true, status: true, partnerType: true } });
    if (!driver || !["ACTIVE", "VERIFIED"].includes(driver.status)) redirect("/admin/bookings/?error=Taxi%20partner%20must%20be%20verified%20or%20active");
  }
  if (hotelPartnerId) {
    const hotel = await db.hotelPartner.findUnique({ where: { id: hotelPartnerId }, select: { id: true, status: true } });
    if (!hotel || hotel.status !== "ACTIVE") redirect("/admin/bookings/?error=Hotel%20partner%20must%20be%20active");
  }
  if (serviceType === "TAXI" && !driverPartnerId) redirect("/admin/bookings/?error=Select%20a%20taxi%20partner");
  if (serviceType === "HOTEL" && !hotelPartnerId) redirect("/admin/bookings/?error=Select%20a%20hotel%20partner");
  const commissionAmount = commissionType === "PERCENT" ? Math.round(bookingAmount * commissionRate / 100) : Math.round(commissionRate);
  await db.booking.create({ data: {
    ref: makeRef("BK"), enquiryId, serviceType, driverPartnerId, hotelPartnerId,
    bookingAmount, commissionType, commissionRate, commissionAmount,
    commissionStatus: commissionAmount > 0 ? "PENDING" : "NOT_DUE",
    travelDate: value(fd, "travelDate", 10) || null,
    endDate: value(fd, "endDate", 10) || null,
    notes: value(fd, "notes", 2000) || null,
    createdBy: me.name,
  }});
  if (enquiryId) {
    await db.enquiry.update({ where: { id: enquiryId }, data: { status: "CONFIRMED", events: { create: { actor: me.name, action: "booking_allocated", detail: "Booking created and partner allocated" } } } });
  }
  revalidatePath("/admin/bookings/");
  revalidatePath("/admin/");
  redirect("/admin/bookings/?saved=1");
}

export async function updateBookingAction(fd: FormData) {
  const me = await requireUser("bookings.manage");
  const id = value(fd, "id", 80);
  const status = value(fd, "status", 20);
  const commissionStatus = value(fd, "commissionStatus", 20);
  if (!["ALLOCATED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) redirect("/admin/bookings/");
  if (!["PENDING", "PAID", "NOT_DUE"].includes(commissionStatus)) redirect("/admin/bookings/");
  const booking = await db.booking.update({ where: { id }, data: {
    status, commissionStatus,
    commissionPaidAt: commissionStatus === "PAID" ? new Date() : null,
    notes: value(fd, "notes", 2000) || null,
  }});
  if (booking.enquiryId) {
    const enquiryStatus = status === "COMPLETED" ? "COMPLETED" : status === "CANCELLED" ? "CANCELLED" : status === "IN_PROGRESS" ? "IN_PROGRESS" : status === "CONFIRMED" ? "CONFIRMED" : "DRIVER_ASSIGNED";
    const allowed = booking.serviceType === "TAXI" ? ["NEW","CHECKING","QUOTE_SENT","AWAITING_CUSTOMER","AWAITING_ADVANCE","CONFIRMED","DRIVER_ASSIGNED","IN_PROGRESS","COMPLETED","CANCELLED","INCIDENT","SPAM"] : null;
    if (!allowed || allowed.includes(enquiryStatus)) {
      await db.enquiry.update({ where: { id: booking.enquiryId }, data: { status: enquiryStatus, events: { create: { actor: me.name, action: "booking_updated", detail: `${status}; commission ${commissionStatus}` } } } });
    }
  }
  revalidatePath("/admin/bookings/");
  revalidatePath("/admin/");
}
