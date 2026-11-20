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
  await requireUser("partners.manage");
  const name = value(fd, "name", 120);
  const phone = value(fd, "phone", 20);
  const location = value(fd, "location", 120);
  const propertyType = value(fd, "propertyType", 30);
  const commissionPct = Number(fd.get("commissionPct") ?? 0);
  if (name.length < 2 || phone.replace(/\D/g, "").length < 10 || !location) redirect("/admin/hotels/?error=Please%20enter%20a%20valid%20name%2C%20mobile%20and%20location");
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
  await db.hotelPartner.update({ where: { id }, data: { status } });
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
  if (serviceType === "TAXI" && (!driverPartnerId || hotelPartnerId)) redirect("/admin/bookings/?error=Select%20only%20a%20taxi%20partner");
  if (serviceType === "HOTEL" && (!hotelPartnerId || driverPartnerId)) redirect("/admin/bookings/?error=Select%20only%20a%20hotel%20partner");
  if (serviceType !== "TAXI" && serviceType !== "HOTEL" && (driverPartnerId || hotelPartnerId)) redirect("/admin/bookings/?error=Partner%20allocation%20does%20not%20match%20the%20service");
  if (driverPartnerId) {
    const driver = await db.driverPartner.findUnique({ where: { id: driverPartnerId }, select: { id: true, status: true, partnerType: true } });
    if (!driver || !["ACTIVE", "VERIFIED"].includes(driver.status) || driver.partnerType !== "WITH_VEHICLE") redirect("/admin/bookings/?error=Taxi%20partner%20must%20be%20a%20verified%20vehicle%20operator");
  }
  let hotelDefaultPct = 0;
  if (hotelPartnerId) {
    const hotel = await db.hotelPartner.findUnique({ where: { id: hotelPartnerId }, select: { id: true, status: true, commissionPct: true } });
    if (!hotel || hotel.status !== "ACTIVE") redirect("/admin/bookings/?error=Hotel%20partner%20must%20be%20active");
    hotelDefaultPct = hotel.commissionPct;
  }
  const effectiveRate = commissionType === "PERCENT" && commissionRate === 0 && serviceType === "HOTEL" ? hotelDefaultPct : commissionRate;
  const commissionAmount = commissionType === "PERCENT" ? Math.round(bookingAmount * effectiveRate / 100) : Math.round(effectiveRate);
  await db.booking.create({ data: {
    ref: makeRef("BK"), enquiryId, serviceType, driverPartnerId, hotelPartnerId,
    bookingAmount, commissionType, commissionRate: effectiveRate, commissionAmount,
    commissionStatus: commissionAmount > 0 ? "PENDING" : "NOT_DUE",
    travelDate: value(fd, "travelDate", 10) || null,
    endDate: value(fd, "endDate", 10) || null,
    notes: value(fd, "notes", 2000) || null,
    createdBy: me.name,
  }});
  if (enquiryId) {
    const enquiry = await db.enquiry.findUnique({ where: { id: enquiryId }, select: { kind: true } });
    await db.enquiry.update({ where: { id: enquiryId }, data: {
      status: enquiry?.kind === "TRANSPORT" ? "CONFIRMED" : "CONFIRMED",
      events: { create: { actor: me.name, action: "booking_allocated", detail: "Booking created and partner allocated" } },
    }});
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
  }});
  if (booking.enquiryId) {
    const enquiry = await db.enquiry.findUnique({ where: { id: booking.enquiryId }, select: { kind: true } });
    const next = booking.serviceType === "TAXI"
      ? (status === "CANCELLED" ? "CANCELLED" : status === "COMPLETED" ? "COMPLETED" : status === "IN_PROGRESS" ? "IN_PROGRESS" : status === "CONFIRMED" ? "CONFIRMED" : "DRIVER_ASSIGNED")
      : (status === "CANCELLED" ? "LOST" : "CONFIRMED");
    const valid = booking.serviceType === "TAXI"
      ? ["NEW", "CHECKING", "QUOTE_SENT", "AWAITING_CUSTOMER", "AWAITING_ADVANCE", "CONFIRMED", "DRIVER_ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "INCIDENT", "SPAM"]
      : ["NEW", "CONTACTED", "QUALIFIED", "QUOTE_SENT", "CONFIRMED", "LOST", "SPAM"];
    if (enquiry && valid.includes(next)) {
      await db.enquiry.update({ where: { id: booking.enquiryId }, data: {
        status: next,
        events: { create: { actor: me.name, action: "booking_updated", detail: `${status}; commission ${commissionStatus}` } },
      }});
    }
  }
  revalidatePath("/admin/bookings/");
  revalidatePath("/admin/");
}
