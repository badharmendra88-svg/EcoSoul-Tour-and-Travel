import { requireUser } from "@/lib/admin-auth";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { rupees } from "@/lib/quote";
import { Badge, PageHeader, StatCard, StatusBadge } from "../ui";
import { createBookingAction, updateBookingAction } from "../partner-booking-actions";

const bookingStatuses = ["ALLOCATED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const me = await requireUser("bookings.view");
  const sp = await searchParams;
  const [bookings, enquiries, drivers, hotels, totals, pending, paid] = await Promise.all([
    db.booking.findMany({ include: { enquiry: true, driverPartner: true, hotelPartner: true }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.enquiry.findMany({ where: { status: { notIn: ["SPAM", "LOST"] } }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, ref: true, name: true, kind: true, destination: true, pickup: true, drop: true, travelDate: true } }),
    db.driverPartner.findMany({ where: { status: { in: ["ACTIVE", "VERIFIED"] }, partnerType: "WITH_VEHICLE" }, orderBy: { name: "asc" }, select: { id: true, name: true, phone: true, vehicleCategory: true } }),
    db.hotelPartner.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" }, select: { id: true, name: true, location: true, commissionPct: true } }),
    db.booking.aggregate({ _sum: { bookingAmount: true, commissionAmount: true }, _count: true }),
    db.booking.aggregate({ where: { commissionStatus: "PENDING" }, _sum: { commissionAmount: true }, _count: true }),
    db.booking.aggregate({ where: { commissionStatus: "PAID" }, _sum: { commissionAmount: true }, _count: true }),
  ]);
  const manage = can(me.role, "bookings.manage");
  return <>
    <PageHeader eyebrow="Operations & revenue" title="Bookings & commission" subtitle="Allocate taxi and hotel partners, follow booking progress and track EcoSoul commission settlement."/>
    {sp.saved && <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Booking created and linked to the enquiry.</p>}
    {sp.error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{sp.error}</p>}
    <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatCard label="Bookings" value={totals._count} icon="calendar" />
      <StatCard label="Booking value" value={rupees(totals._sum.bookingAmount ?? 0)} icon="rupee" />
      <StatCard label="Commission pending" value={rupees(pending._sum.commissionAmount ?? 0)} hint={`${pending._count} unsettled bookings`} icon="clock" tone="amber"/>
      <StatCard label="Commission received" value={rupees(paid._sum.commissionAmount ?? 0)} hint={`${paid._count} settled bookings`} icon="check" tone="emerald"/>
    </div>
    {manage && <section className="panel mb-6 p-5"><h2 className="font-semibold text-slate-900">Allocate a new booking</h2><p className="mt-1 text-xs text-slate-500">Only active/verified partners appear in the allocation lists. Enter the agreed customer booking value and commission terms.</p>
      <form action={createBookingAction} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm">Service<select name="serviceType" className="admin-input mt-1 w-full"><option value="TAXI">Taxi</option><option value="HOTEL">Hotel / homestay</option><option value="PACKAGE">Tour package</option><option value="OTHER">Other</option></select></label>
        <label className="text-sm">Link enquiry (optional)<select name="enquiryId" className="admin-input mt-1 w-full"><option value="">Select enquiry</option>{enquiries.map(e=><option key={e.id} value={e.id}>{e.ref} · {e.name} · {e.destination || [e.pickup,e.drop].filter(Boolean).join(" → ") || e.kind}</option>)}</select></label>
        <label className="text-sm">Booking value (₹)<input required name="bookingAmount" type="number" min="0" step="1" defaultValue="0" className="admin-input mt-1 w-full"/></label>
        <label className="text-sm">Taxi partner<select name="driverPartnerId" className="admin-input mt-1 w-full"><option value="">Not applicable</option>{drivers.map(d=><option key={d.id} value={d.id}>{d.name} · {d.phone} · {d.vehicleCategory || "Vehicle"}</option>)}</select></label>
        <label className="text-sm">Hotel partner<select name="hotelPartnerId" className="admin-input mt-1 w-full"><option value="">Not applicable</option>{hotels.map(h=><option key={h.id} value={h.id}>{h.name} · {h.location}</option>)}</select></label>
        <label className="text-sm">Commission method<select name="commissionType" className="admin-input mt-1 w-full"><option value="PERCENT">Percentage (%)</option><option value="FIXED">Fixed amount (₹)</option></select></label>
        <label className="text-sm">Commission rate / amount<input required name="commissionRate" type="number" min="0" step="0.5" defaultValue="0" className="admin-input mt-1 w-full"/></label>
        <label className="text-sm">Travel / check-in date<input name="travelDate" type="date" className="admin-input mt-1 w-full"/></label>
        <label className="text-sm">Return / check-out date<input name="endDate" type="date" className="admin-input mt-1 w-full"/></label>
        <label className="text-sm sm:col-span-2 lg:col-span-3">Internal notes<textarea name="notes" rows={2} maxLength={2000} className="admin-input mt-1 w-full" placeholder="Partner quote, room / vehicle details, customer requirements..."/></label>
        <div className="sm:col-span-2 lg:col-span-3"><button className="btn-admin-primary">Create booking & allocate</button></div>
      </form>
    </section>}
    <section className="panel overflow-hidden"><div className="border-b border-slate-100 p-4"><h2 className="font-semibold text-slate-900">Booking register</h2><p className="mt-1 text-xs text-slate-500">Commission is a tracking figure based on the agreed rate; mark it paid only after settlement is confirmed.</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-sm"><thead className="bg-slate-50"><tr><th className="admin-th">Booking / customer</th><th className="admin-th">Service / partner</th><th className="admin-th">Dates</th><th className="admin-th text-right">Booking value</th><th className="admin-th text-right">Commission</th><th className="admin-th">Settlement</th><th className="admin-th">Progress</th></tr></thead><tbody className="divide-y divide-slate-100">{bookings.map(b=><tr key={b.id}><td className="admin-td"><strong>{b.ref}</strong><span className="block text-xs text-slate-500">{b.enquiry?.name ?? "No enquiry linked"} {b.enquiry?.ref ? `· ${b.enquiry.ref}` : ""}</span></td><td className="admin-td"><span>{b.serviceType}</span><span className="block text-xs text-slate-500">{b.driverPartner?.name ?? b.hotelPartner?.name ?? "Partner not assigned"}</span></td><td className="admin-td">{b.travelDate ? formatDate(b.travelDate) : "—"}{b.endDate ? <span className="block text-xs text-slate-500">to {formatDate(b.endDate)}</span> : null}</td><td className="admin-td text-right">{rupees(b.bookingAmount)}</td><td className="admin-td text-right"><strong>{rupees(b.commissionAmount)}</strong><span className="block text-xs text-slate-500">{b.commissionType==="PERCENT" ? `${b.commissionRate}%` : "Fixed"}</span></td><td className="admin-td"><StatusBadge status={b.commissionStatus}/>{b.commissionPaidAt && <span className="block text-xs text-slate-500">{formatDate(b.commissionPaidAt)}</span>}</td><td className="admin-td">{manage ? <form action={updateBookingAction} className="flex flex-col gap-2"><input type="hidden" name="id" value={b.id}/><select name="status" defaultValue={b.status} className="admin-input">{bookingStatuses.map(s=><option key={s} value={s}>{s.replace(/_/g," ")}</option>)}</select><select name="commissionStatus" defaultValue={b.commissionStatus} className="admin-input"><option value="PENDING">Commission pending</option><option value="PAID">Commission paid</option><option value="NOT_DUE">Not due</option></select><button className="btn-admin-ghost">Update</button></form> : <Badge>{b.status}</Badge>}</td></tr>)}</tbody></table>{bookings.length===0 && <p className="p-8 text-center text-sm text-slate-500">No bookings yet. Create a booking after confirming a customer enquiry and partner.</p>}</div>
    </section>
  </>;
}
