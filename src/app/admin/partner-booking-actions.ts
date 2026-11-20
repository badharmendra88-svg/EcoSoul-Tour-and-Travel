"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bookingServiceTypes, bookingStatuses, closedLeadStatuses, commissionStatuses, hotelPartnerStatuses, hotelPropertyTypes } from "@/config/options";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { DATE_RE, driverTripReady, leadStatusFromBookings } from "@/lib/bookings";
import { makeRef } from "@/lib/ref";

const value = (fd: FormData, key: string, max = 200) => String(fd.get(key) ?? "").trim().slice(0, max);
const amount = (fd: FormData, key: string) => {
  const n = Number(fd.get(key) ?? 0);
  return Number.isFinite(n) ? Math.max(0, Math.min(100000000, Math.round(n))) : 0;
};
const withError = (path: string, message: string) => `${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`;
const isKey = <T extends object>(obj: T, key: string): key is Extract<keyof T, string> => Object.hasOwn(obj, key);

const leadPath = (id: string) => `/admin/leads/${id}/`;

/** Re-derive a lead's status from all of its bookings and log what happened on its timeline. */
async function syncLead(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  enquiryId: string,
  event: { actor: string; action: string; detail: string },
  moveStatus: boolean,
) {
  const lead = await tx.enquiry.findUnique({ where: { id: enquiryId }, select: { kind: true, status: true } });
  if (!lead) return;
  const bookings = await tx.booking.findMany({ where: { enquiryId }, select: { serviceType: true, status: true } });
  const next = moveStatus ? leadStatusFromBookings(lead, bookings) : null;
  await tx.enquiry.update({
    where: { id: enquiryId },
    data: {
      ...(next && next !== lead.status ? { status: next } : {}),
      events: {
        create: [
          event,
          ...(next && next !== lead.status ? [{ actor: event.actor, action: "status", detail: `${lead.status} → ${next} (from bookings)` }] : []),
        ],
      },
    },
  });
}

export async function createHotelPartnerAction(fd: FormData) {
  await requireAdmin("partners.manage");
  const name = value(fd, "name", 120);
  const phone = value(fd, "phone", 20);
  const location = value(fd, "location", 120);
  const propertyType = value(fd, "propertyType", 30);
  const commissionPct = Number(fd.get("commissionPct") || 0);
  if (name.length < 2 || phone.replace(/\D/g, "").length < 10 || !location) redirect(withError("/admin/hotels/", "Please enter a valid name, mobile and location"));
  if (!isKey(hotelPropertyTypes, propertyType) || !Number.isFinite(commissionPct) || commissionPct < 0 || commissionPct > 100)
    redirect(withError("/admin/hotels/", "Please check property type and commission"));
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
  if (!isKey(hotelPartnerStatuses, status)) redirect(withError("/admin/hotels/", "Choose a valid status"));
  const { count } = await db.hotelPartner.updateMany({ where: { id }, data: { status } });
  if (count === 0) redirect(withError("/admin/hotels/", "That hotel partner no longer exists"));
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
  const travelDate = value(fd, "travelDate", 10) || null;
  const endDate = value(fd, "endDate", 10) || null;
  // Started from a lead page: errors come back to the pre-filled form, success goes back to the lead
  const fromLead = value(fd, "fromLead", 80) || null;
  const formPath = fromLead ? `/admin/bookings/?lead=${encodeURIComponent(fromLead)}#allocate` : "/admin/bookings/#allocate";
  const fail = (message: string): never => redirect(withError(formPath.replace("#allocate", ""), message) + "#allocate");

  if (!isKey(bookingServiceTypes, serviceType)) fail("Choose a valid service");
  if (commissionType !== "PERCENT" && commissionType !== "FIXED") fail("Invalid commission type");
  if (commissionRate !== null && (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > (commissionType === "PERCENT" ? 100 : 10000000)))
    fail("Invalid commission");
  if ((travelDate && !DATE_RE.test(travelDate)) || (endDate && !DATE_RE.test(endDate))) fail("Use valid dates");
  if (endDate && !travelDate) fail("Add the travel / check-in date");
  if (travelDate && endDate && endDate < travelDate) fail("Return / check-out can't be before the travel / check-in date");
  if (serviceType === "TAXI" && (!driverPartnerId || hotelPartnerId)) fail("Select only a taxi partner");
  if (serviceType === "HOTEL" && (!hotelPartnerId || driverPartnerId)) fail("Select only a hotel partner");
  if (serviceType !== "TAXI" && serviceType !== "HOTEL" && (driverPartnerId || hotelPartnerId)) fail("Partner allocation does not match the service");

  const enquiry = enquiryId ? await db.enquiry.findUnique({ where: { id: enquiryId }, select: { id: true, status: true } }) : null;
  if (enquiryId && !enquiry) fail("Enquiry not found");
  if (enquiry && closedLeadStatuses.includes(enquiry.status)) fail("That enquiry is closed (spam, lost or cancelled). Reopen it first.");

  if (driverPartnerId) {
    const driver = await db.driverPartner.findUnique({ where: { id: driverPartnerId } });
    if (!driver || !driverTripReady(driver, endDate ?? travelDate ?? undefined))
      fail("Taxi partner must be an active vehicle operator with licence, insurance, permit, fitness and PUC valid for the trip dates");
  }
  let hotelDefaultPct = 0;
  if (hotelPartnerId) {
    const hotel = await db.hotelPartner.findUnique({ where: { id: hotelPartnerId }, select: { status: true, commissionPct: true } });
    if (!hotel || hotel.status !== "ACTIVE") fail("Hotel partner must be active");
    hotelDefaultPct = hotel?.commissionPct ?? 0;
  }

  const effectiveRate = commissionRate ?? (serviceType === "HOTEL" && commissionType === "PERCENT" ? hotelDefaultPct : 0);
  const commissionAmount = commissionType === "PERCENT" ? Math.round((bookingAmount * effectiveRate) / 100) : Math.round(effectiveRate);
  if (commissionAmount > bookingAmount) fail("Commission can't be more than the booking value");

  const ref = makeRef("BK");
  // Booking and lead update succeed or fail together
  await db.$transaction(async (tx) => {
    await tx.booking.create({
      data: {
        ref,
        enquiryId,
        serviceType,
        driverPartnerId,
        hotelPartnerId,
        bookingAmount,
        commissionType,
        commissionRate: effectiveRate,
        commissionAmount,
        commissionStatus: commissionAmount > 0 ? "PENDING" : "NOT_DUE",
        travelDate,
        endDate,
        notes: value(fd, "notes", 2000) || null,
        createdBy: actor,
      },
    });
    if (enquiryId) {
      await syncLead(tx, enquiryId, { actor, action: "booking_allocated", detail: `${ref} · ${bookingServiceTypes[serviceType as keyof typeof bookingServiceTypes]} booking created` }, true);
    }
  });
  revalidatePath("/admin/bookings/");
  revalidatePath("/admin/");
  if (enquiryId) revalidatePath(leadPath(enquiryId));
  redirect(fromLead && enquiryId === fromLead ? `${leadPath(enquiryId)}?booking=created` : "/admin/bookings/?saved=1");
}

export async function updateBookingAction(fd: FormData) {
  const actor = await requireAdmin("bookings.manage");
  const id = value(fd, "id", 80);
  const status = value(fd, "status", 20);
  const commissionStatus = value(fd, "commissionStatus", 20);
  const back = value(fd, "back", 120).startsWith("/admin/") ? value(fd, "back", 120) : "/admin/bookings/";
  if (!isKey(bookingStatuses, status) || !isKey(commissionStatuses, commissionStatus)) redirect(withError(back, "Choose a valid status"));

  const before = await db.booking.findUnique({ where: { id } });
  if (!before) redirect(withError(back, "That booking no longer exists"));

  // A cancelled booking earns no commission unless it was already settled
  const finalCommission = status === "CANCELLED" && commissionStatus === "PENDING" ? "NOT_DUE" : commissionStatus;
  // Keep the real settlement date; only stamp it when the commission becomes PAID
  const commissionPaidAt = finalCommission === "PAID" ? (before.commissionStatus === "PAID" ? before.commissionPaidAt : new Date()) : null;
  const statusChanged = status !== before.status;
  const commissionChanged = finalCommission !== before.commissionStatus;
  if (!statusChanged && !commissionChanged) return;

  await db.$transaction(async (tx) => {
    await tx.booking.update({ where: { id }, data: { status, commissionStatus: finalCommission, commissionPaidAt } });
    if (before.enquiryId) {
      const parts = [
        statusChanged ? `${bookingStatuses[before.status as keyof typeof bookingStatuses] ?? before.status} → ${bookingStatuses[status as keyof typeof bookingStatuses]}` : null,
        commissionChanged ? commissionStatuses[finalCommission as keyof typeof commissionStatuses].toLowerCase() : null,
      ].filter(Boolean);
      // Only booking progress moves the lead; commission-only edits just add a timeline note
      await syncLead(tx, before.enquiryId, { actor, action: "booking_updated", detail: `${before.ref}: ${parts.join("; ")}` }, statusChanged);
    }
  });
  revalidatePath("/admin/bookings/");
  revalidatePath("/admin/");
  if (before.enquiryId) revalidatePath(leadPath(before.enquiryId));
}
