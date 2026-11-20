import Link from "next/link";
import { bookingServiceForKind, bookingServiceTypes, bookingStatuses, closedLeadStatuses, commissionStatuses, statusLabel } from "@/config/options";
import { requireUser } from "@/lib/admin-auth";
import { driverTripReady } from "@/lib/bookings";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { can } from "@/lib/permissions";
import { rupees } from "@/lib/quote";
import { PageHeader, StatCard, StatusBadge, compactRupees } from "../ui";
import { createBookingAction } from "../../partner-booking-actions";
import { BookingProgressForm } from "./BookingProgressForm";

// Lead statuses that can't take a new booking, plus finished ones that would only clutter the picker
const NOT_BOOKABLE = [...closedLeadStatuses, "COMPLETED"];

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string; lead?: string }> }) {
  const me = await requireUser("bookings.view");
  const sp = await searchParams;
  const manage = can(me.role, "bookings.manage");
  const notCancelled = { status: { not: "CANCELLED" } };

  const [bookings, totals, pending, paid] = await Promise.all([
    db.booking.findMany({ include: { enquiry: { select: { id: true, ref: true, name: true } }, driverPartner: true, hotelPartner: true }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.booking.aggregate({ where: notCancelled, _sum: { bookingAmount: true }, _count: true }),
    db.booking.aggregate({ where: { ...notCancelled, commissionStatus: "PENDING" }, _sum: { commissionAmount: true }, _count: true }),
    db.booking.aggregate({ where: { commissionStatus: "PAID" }, _sum: { commissionAmount: true }, _count: true }),
  ]);

  // The allocation form's lists are only needed by people who can allocate
  const form = manage ? await allocationData(sp.lead) : null;
  const lead = form?.lead;

  return (
    <>
      <PageHeader eyebrow="Operations & revenue" title="Bookings & commission" subtitle="Allocate taxi and hotel partners, follow booking progress and track EcoSoul commission settlement." />
      {sp.saved && <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Booking created.</p>}
      {sp.error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{sp.error}</p>}

      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Active bookings" value={totals._count} icon="calendar" />
        <StatCard label="Booking value" value={compactRupees(totals._sum.bookingAmount ?? 0)} hint="Excludes cancelled" icon="rupee" />
        <StatCard label="Commission pending" value={compactRupees(pending._sum.commissionAmount ?? 0)} hint={`${pending._count} unsettled bookings`} icon="clock" tone="amber" />
        <StatCard label="Commission received" value={compactRupees(paid._sum.commissionAmount ?? 0)} hint={`${paid._count} settled bookings`} icon="check" tone="emerald" />
      </div>

      {form && (
        <section id="allocate" className="panel mb-6 scroll-mt-6 p-5">
          <h2 className="font-semibold text-slate-900">{lead ? `New booking for ${lead.ref} · ${lead.name}` : "Allocate a new booking"}</h2>
          <p className="mt-1 text-xs text-slate-500">
            {lead ? (
              <>Linked to this lead — its status and timeline update automatically. <Link href={`/admin/leads/${lead.id}/`} className="font-medium text-forest-700 underline">Back to lead</Link></>
            ) : (
              "Link the customer's lead so the booking shows on it. Only taxi partners with valid documents and active hotels are listed."
            )}
          </p>
          {lead && closedLeadStatuses.includes(lead.status) && (
            <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">This lead is {statusLabel(lead.kind, lead.status).toLowerCase()}. Reopen it on the lead page before adding a booking.</p>
          )}
          <form action={createBookingAction} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lead && <input type="hidden" name="fromLead" value={lead.id} />}
            <label className="text-sm">Service
              <select name="serviceType" defaultValue={lead ? bookingServiceForKind(lead.kind) : "TAXI"} className="admin-input mt-1 w-full">
                {Object.entries(bookingServiceTypes).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </label>
            <label className="text-sm">Lead
              <select name="enquiryId" defaultValue={lead?.id ?? ""} className="admin-input mt-1 w-full">
                <option value="">Not linked to a lead</option>
                {form.enquiries.map((e) => (
                  <option key={e.id} value={e.id}>{e.ref} · {e.name} · {e.destination || [e.pickup, e.drop].filter(Boolean).join(" → ") || e.kind}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">Booking value (₹)
              <input required name="bookingAmount" type="number" min="0" step="1" defaultValue="0" className="admin-input mt-1 w-full" />
            </label>
            <label className="text-sm">Taxi partner
              <select name="driverPartnerId" className="admin-input mt-1 w-full">
                <option value="">Not applicable</option>
                {form.drivers.map((d) => <option key={d.id} value={d.id}>{d.name} · {d.phone} · {d.vehicleCategory || "Vehicle"}</option>)}
              </select>
            </label>
            <label className="text-sm">Hotel partner
              <select name="hotelPartnerId" className="admin-input mt-1 w-full">
                <option value="">Not applicable</option>
                {form.hotels.map((h) => <option key={h.id} value={h.id}>{h.name} · {h.location} · {h.commissionPct}%</option>)}
              </select>
            </label>
            <label className="text-sm">Commission method
              <select name="commissionType" className="admin-input mt-1 w-full">
                <option value="PERCENT">Percentage (%)</option>
                <option value="FIXED">Fixed amount (₹)</option>
              </select>
            </label>
            <label className="text-sm">Commission rate / amount
              <input name="commissionRate" type="number" min="0" step="0.01" placeholder="Blank = hotel's default %" className="admin-input mt-1 w-full" />
            </label>
            <label className="text-sm">Travel / check-in date
              <input name="travelDate" type="date" defaultValue={lead?.travelDate ?? ""} className="admin-input mt-1 w-full" />
            </label>
            <label className="text-sm">Return / check-out date
              <input name="endDate" type="date" defaultValue={lead?.returnDate ?? ""} className="admin-input mt-1 w-full" />
            </label>
            <label className="text-sm sm:col-span-2 lg:col-span-3">Internal notes
              <textarea name="notes" rows={2} maxLength={2000} className="admin-input mt-1 w-full" placeholder="Partner quote, room / vehicle details, customer requirements..." />
            </label>
            <div className="sm:col-span-2 lg:col-span-3">
              <button className="btn-admin-primary">Create booking & allocate</button>
            </div>
          </form>
        </section>
      )}

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <h2 className="font-semibold text-slate-900">Booking register</h2>
          <p className="mt-1 text-xs text-slate-500">Commission is a tracking figure based on the agreed rate; mark it paid only after settlement is confirmed.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="admin-th">Booking / lead</th>
                <th className="admin-th">Service / partner</th>
                <th className="admin-th">Dates</th>
                <th className="admin-th text-right">Booking value</th>
                <th className="admin-th text-right">Commission</th>
                <th className="admin-th">Settlement</th>
                <th className="admin-th">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="admin-td">
                    <strong className="font-mono">{b.ref}</strong>
                    {b.enquiry ? (
                      <Link href={`/admin/leads/${b.enquiry.id}/`} className="block text-xs text-forest-700 hover:underline">{b.enquiry.ref} · {b.enquiry.name}</Link>
                    ) : (
                      <span className="block text-xs text-slate-500">No lead linked</span>
                    )}
                  </td>
                  <td className="admin-td">
                    <span>{bookingServiceTypes[b.serviceType as keyof typeof bookingServiceTypes] ?? b.serviceType}</span>
                    <span className="block text-xs text-slate-500">{b.driverPartner?.name ?? b.hotelPartner?.name ?? "Partner not assigned"}</span>
                  </td>
                  <td className="admin-td">
                    {b.travelDate ? formatDate(b.travelDate) : "—"}
                    {b.endDate && <span className="block text-xs text-slate-500">to {formatDate(b.endDate)}</span>}
                  </td>
                  <td className="admin-td text-right">{rupees(b.bookingAmount)}</td>
                  <td className="admin-td text-right">
                    <strong>{rupees(b.commissionAmount)}</strong>
                    <span className="block text-xs text-slate-500">{b.commissionType === "PERCENT" ? `${b.commissionRate}%` : "Fixed"}</span>
                  </td>
                  <td className="admin-td">
                    <StatusBadge status={b.commissionStatus} label={commissionStatuses[b.commissionStatus as keyof typeof commissionStatuses]} />
                    {b.commissionPaidAt && <span className="block text-xs text-slate-500">{formatDate(b.commissionPaidAt)}</span>}
                  </td>
                  <td className="admin-td">
                    {manage ? <BookingProgressForm booking={b} /> : <StatusBadge status={b.status} label={bookingStatuses[b.status as keyof typeof bookingStatuses]} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No bookings yet. Open a confirmed lead and choose “New booking”.</p>}
        </div>
      </section>
    </>
  );
}

async function allocationData(leadId: string | undefined) {
  const [enquiries, drivers, hotels, lead] = await Promise.all([
    db.enquiry.findMany({
      where: { status: { notIn: NOT_BOOKABLE } },
      orderBy: { createdAt: "desc" },
      take: 300,
      select: { id: true, ref: true, name: true, kind: true, destination: true, pickup: true, drop: true },
    }),
    db.driverPartner.findMany({ where: { status: "ACTIVE", partnerType: "WITH_VEHICLE" }, orderBy: { name: "asc" } }),
    db.hotelPartner.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" }, select: { id: true, name: true, location: true, commissionPct: true } }),
    leadId
      ? db.enquiry.findUnique({
          where: { id: leadId },
          select: { id: true, ref: true, name: true, kind: true, status: true, destination: true, pickup: true, drop: true, travelDate: true, returnDate: true },
        })
      : null,
  ]);
  // The lead this booking was started from is always selectable, even if older than the newest 300
  if (lead && !enquiries.some((e) => e.id === lead.id)) enquiries.unshift(lead);
  return {
    lead,
    enquiries,
    // Only drivers whose licence and vehicle documents are valid today (the action re-checks against the trip dates)
    drivers: drivers.filter((d) => driverTripReady(d)),
    hotels,
  };
}
