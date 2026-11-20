"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { makeRef } from "@/lib/ref";

const value = (fd: FormData, key: string, max = 200) => String(fd.get(key) ?? "").trim().slice(0, max);
const amount = (fd: FormData, key: string) => {
  const n = Number(fd.get(key) ?? 0);
  return Number.isFinite(n) ? Math.max(0, Math.min(100000000, Math.round(n))) : 0;
};
const fail = (path: string, message: string): never => redirect(`${path}?error=${encodeURIComponent(message)}`);

const BOOKING_STATUSES = ["ALLOCATED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const COMMISSION_STATUSES = ["PENDING", "PAID", "NOT_DUE"];

// Lead statuses that come before a booking exists. Allocating a booking only moves a lead forward from
// one of these, so a lead already further along (or closed) is never pushed backwards.
const PRE_BOOKING = {
  TRANSPORT: ["NEW", "CHECKING", "QUOTE_SENT", "AWAITING_CUSTOMER", "AWAITING_ADVANCE", "CONFIRMED"],
  OTHER: ["NEW", "CONTACTED", "QUALIFIED", "QUOTE_SENT"],
};

/**
 * The lead status that matches a booking status. The lead's workflow is decided by the enquiry kind
 * (see statusesFor in config/options), not by the booking's service type.
 */
function leadStatusFor(enquiryKind: string, serviceType: string, bookingStatus: string) {
  if (enquiryKind === "TRANSPORT") {
    if (bookingStatus === "ALLOCATED") return serviceType === "TAXI" ? "DRIVER_ASSIGNED" : "CONFIRMED";
    return bookingStatus; // CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED all exist in the transport workflow
  }
  return bookingStatus === "CANCELLED" ? "LOST" : "CONFIRMED";
}

export async function createHotelPartnerAction(fd: FormData) {
  await requireAdmin("partners.manage");
  const name = value(fd, "name", 120);
  const phone = value(fd, "phone", 20);
  const location = value(fd, "location", 120);
  const propertyType = value(fd, "propertyType", 30);
  const commissionPct = Number(fd.get("commissionPct") ?? 0);
  if (name.length < 2 || phone.replace(/\D/g, "").length < 10 || !location) fail("/admin/hotels/", "Please enter a valid name, mobile and location");
  if (!["HOTEL", "HOMESTAY", "RESORT", "GUESTHOUSE"].includes(propertyType) || !Number.isFinite(commissionPct) || commissionPct < 0 || commissionPct > 100)
    fail("/admin/hotels/", "Please check property type and commission");
  await db.hotelPartner.create({
    data: {
      ref: makeRef("HT"),
      name,
      phone,
      location,
      propertyType,
      email: value(fd, "email", 120) || null,
      roomTypes: value(fd, "roomTypes", 500) || null,
      commissionPct,
      internalNotes: value(fd, "internalNotes", 2000) || null,
    },
  });
  revalidatePath("/admin/hotels/");
  redirect("/admin/hotels/?saved=1");
}

export async function updateHotelPartnerAction(fd: FormData) {
  await requireAdmin("partners.manage");
  const id = value(fd, "id", 80);
  const status = value(fd, "status", 20);
  if (!["ACTIVE", "INACTIVE", "UNDER_REVIEW"].includes(status)) fail("/admin/hotels/", "Choose a valid status");
  const { count } = await db.hotelPartner.updateMany({ where: { id }, data: { status } });
  if (count === 0) fail("/admin/hotels/", "That hotel partner no longer exists");
  revalidatePath("/admin/hotels/");
}

export async function createBookingAction(fd: FormData) {
  const actor = await requireAdmin("bookings.manage");
  const serviceType = value(fd, "serviceType", 20);
  const enquiryId = value(fd, "enquiryId", 80) || null;
  const driverPartnerId = value(fd, "driverPartnerId", 80) || null;
  const hotelPartnerId = value(fd, "hotelPartnerId", 80) || null;
  const commissionType = value(fd, "commissionType", 10);
  // Blank rate on a hotel booking = use the hotel's default; an explicit 0 means "no commission"
  const rateInput = value(fd, "commissionRate", 20);
  const commissionRate = rateInput === "" ? null : Number(rateInput);
  const bookingAmount = amount(fd, "bookingAmount");

  if (!["TAXI", "HOTEL", "PACKAGE", "OTHER"].includes(serviceType)) fail("/admin/bookings/", "Choose a valid service");
  if (commissionType !== "PERCENT" && commissionType !== "FIXED") fail("/admin/bookings/", "Invalid commission type");
  if (commissionRate !== null && (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > (commissionType === "PERCENT" ? 100 : 10000000)))
    fail("/admin/bookings/", "Invalid commission");
  if (serviceType === "TAXI" && (!driverPartnerId || hotelPartnerId)) fail("/admin/bookings/", "Select only a taxi partner");
  if (serviceType === "HOTEL" && (!hotelPartnerId || driverPartnerId)) fail("/admin/bookings/", "Select only a hotel partner");
  if (serviceType !== "TAXI" && serviceType !== "HOTEL" && (driverPartnerId || hotelPartnerId)) fail("/admin/bookings/", "Partner allocation does not match the service");

  const enquiry = enquiryId ? await db.enquiry.findUnique({ where: { id: enquiryId }, select: { id: true, kind: true, status: true } }) : null;
  if (enquiryId && !enquiry) fail("/admin/bookings/", "Enquiry not found");
  if (enquiry && ["SPAM", "LOST"].includes(enquiry.status)) fail("/admin/bookings/", "That enquiry is closed (spam or lost)");

  if (driverPartnerId) {
    const driver = await db.driverPartner.findUnique({ where: { id: driverPartnerId }, select: { status: true, partnerType: true } });
    if (!driver || !["ACTIVE", "VERIFIED"].includes(driver.status) || driver.partnerType !== "WITH_VEHICLE")
      fail("/admin/bookings/", "Taxi partner must be a verified vehicle operator");
  }
  let hotelDefaultPct = 0;
  if (hotelPartnerId) {
    const hotel = await db.hotelPartner.findUnique({ where: { id: hotelPartnerId }, select: { status: true, commissionPct: true } });
    if (!hotel || hotel.status !== "ACTIVE") fail("/admin/bookings/", "Hotel partner must be active");
    hotelDefaultPct = hotel!.commissionPct;
  }

  const effectiveRate = commissionRate ?? (serviceType === "HOTEL" && commissionType === "PERCENT" ? hotelDefaultPct : 0);
  const commissionAmount = commissionType === "PERCENT" ? Math.round((bookingAmount * effectiveRate) / 100) : Math.round(effectiveRate);

  // Booking and lead update succeed or fail together
  await db.$transaction(async (tx) => {
    await tx.booking.create({
      data: {
        ref: makeRef("BK"),
        enquiryId,
        serviceType,
        driverPartnerId,
        hotelPartnerId,
        bookingAmount,
        commissionType,
        commissionRate: effectiveRate,
        commissionAmount,
        commissionStatus: commissionAmount > 0 ? "PENDING" : "NOT_DUE",
        travelDate: value(fd, "travelDate", 10) || null,
        endDate: value(fd, "endDate", 10) || null,
        notes: value(fd, "notes", 2000) || null,
        createdBy: actor,
      },
    });
    if (enquiry) {
      const preBooking = enquiry.kind === "TRANSPORT" ? PRE_BOOKING.TRANSPORT : PRE_BOOKING.OTHER;
      const next = leadStatusFor(enquiry.kind, serviceType, "ALLOCATED");
      await tx.enquiry.update({
        where: { id: enquiry.id },
        data: {
          ...(preBooking.includes(enquiry.status) && next !== enquiry.status ? { status: next } : {}),
          events: { create: { actor, action: "booking_allocated", detail: `${serviceType} booking created and partner allocated` } },
        },
      });
    }
  });
  revalidatePath("/admin/bookings/");
  revalidatePath("/admin/");
  redirect("/admin/bookings/?saved=1");
}

export async function updateBookingAction(fd: FormData) {
  const actor = await requireAdmin("bookings.manage");
  const id = value(fd, "id", 80);
  const status = value(fd, "status", 20);
  const commissionStatus = value(fd, "commissionStatus", 20);
  if (!BOOKING_STATUSES.includes(status) || !COMMISSION_STATUSES.includes(commissionStatus)) fail("/admin/bookings/", "Choose a valid status");

  const before = await db.booking.findUnique({ where: { id }, include: { enquiry: { select: { id: true, kind: true, status: true } } } });
  if (!before) return fail("/admin/bookings/", "That booking no longer exists");

  // A cancelled booking earns no commission unless it was already settled
  const finalCommission = status === "CANCELLED" && commissionStatus === "PENDING" ? "NOT_DUE" : commissionStatus;
  // Keep the real settlement date; only stamp it when the commission becomes PAID
  const commissionPaidAt = finalCommission === "PAID" ? (before.commissionStatus === "PAID" ? before.commissionPaidAt : new Date()) : null;

  await db.$transaction(async (tx) => {
    await tx.booking.update({ where: { id }, data: { status, commissionStatus: finalCommission, commissionPaidAt } });
    const enquiry = before.enquiry;
    if (!enquiry) return;
    const statusChanged = status !== before.status;
    const commissionChanged = finalCommission !== before.commissionStatus;
    if (!statusChanged && !commissionChanged) return;
    // Only a change of booking progress moves the lead; commission-only edits just add a timeline note.
    // Closed leads (spam / lost) are left alone.
    const next = leadStatusFor(enquiry.kind, before.serviceType, status);
    const moveLead = statusChanged && !["SPAM", "LOST"].includes(enquiry.status) && next !== enquiry.status;
    await tx.enquiry.update({
      where: { id: enquiry.id },
      data: {
        ...(moveLead ? { status: next } : {}),
        events: { create: { actor, action: "booking_updated", detail: `${before.ref}: ${status.replace(/_/g, " ").toLowerCase()}; commission ${finalCommission.replace(/_/g, " ").toLowerCase()}` } },
      },
    });
  });
  revalidatePath("/admin/bookings/");
  revalidatePath("/admin/");
}
