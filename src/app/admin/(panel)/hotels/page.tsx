import { requireUser } from "@/lib/admin-auth";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { PageHeader, StatusBadge } from "../ui";
import { createHotelPartnerAction, updateHotelPartnerAction } from "../partner-booking-actions";

export default async function HotelsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const me = await requireUser("partners.view");
  const sp = await searchParams;
  const [hotels, total, active] = await Promise.all([
    db.hotelPartner.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    db.hotelPartner.count(),
    db.hotelPartner.count({ where: { status: "ACTIVE" } }),
  ]);
  const manage = can(me.role, "partners.manage");
  return <>
    <PageHeader eyebrow="Partner network" title="Hotel & homestay partners" subtitle="Maintain your verified accommodation partner list for Uttarakhand enquiries." />
    {sp.saved && <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Hotel partner saved successfully.</p>}
    {sp.error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{sp.error}</p>}
    <div className="mb-6 grid grid-cols-2 gap-3"><div className="panel p-4"><p className="text-sm text-slate-500">Total partners</p><p className="mt-1 text-2xl font-semibold">{total}</p></div><div className="panel p-4"><p className="text-sm text-slate-500">Active partners</p><p className="mt-1 text-2xl font-semibold">{active}</p></div></div>
    {manage && <section className="panel mb-6 p-5"><h2 className="font-semibold text-slate-900">Add hotel partner</h2><form action={createHotelPartnerAction} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <label className="text-sm">Property / business name<input required name="name" className="admin-input mt-1 w-full" maxLength={120}/></label>
      <label className="text-sm">Mobile number<input required name="phone" className="admin-input mt-1 w-full" inputMode="tel" maxLength={20}/></label>
      <label className="text-sm">Email<input name="email" type="email" className="admin-input mt-1 w-full" maxLength={120}/></label>
      <label className="text-sm">Location<input required name="location" placeholder="Nainital / Bhimtal / Mukteshwar" className="admin-input mt-1 w-full" maxLength={120}/></label>
      <label className="text-sm">Property type<select name="propertyType" className="admin-input mt-1 w-full"><option value="HOTEL">Hotel</option><option value="HOMESTAY">Homestay</option><option value="RESORT">Resort</option><option value="GUESTHOUSE">Guesthouse</option></select></label>
      <label className="text-sm">Default commission (%)<input name="commissionPct" type="number" min="0" max="100" step="0.5" defaultValue="0" className="admin-input mt-1 w-full"/></label>
      <label className="text-sm sm:col-span-2 lg:col-span-3">Room types / notes<input name="roomTypes" className="admin-input mt-1 w-full" placeholder="Deluxe, family room, lake view..." maxLength={500}/></label>
      <label className="text-sm sm:col-span-2 lg:col-span-3">Internal notes<textarea name="internalNotes" className="admin-input mt-1 w-full" rows={2} maxLength={2000}/></label>
      <div className="sm:col-span-2 lg:col-span-3"><button className="btn-admin-primary">Save hotel partner</button></div>
    </form></section>}
    <section className="panel overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50"><tr><th className="admin-th">Partner</th><th className="admin-th">Location</th><th className="admin-th">Type</th><th className="admin-th">Commission</th><th className="admin-th">Status</th>{manage && <th className="admin-th">Update</th>}</tr></thead><tbody className="divide-y divide-slate-100">{hotels.map(h=><tr key={h.id}><td className="admin-td"><strong>{h.name}</strong><span className="block text-xs text-slate-500">{h.ref} · {h.phone}</span></td><td className="admin-td">{h.location}</td><td className="admin-td">{h.propertyType}</td><td className="admin-td">{h.commissionPct}%</td><td className="admin-td"><StatusBadge status={h.status}/></td>{manage && <td className="admin-td"><form action={updateHotelPartnerAction} className="flex items-center gap-2"><input type="hidden" name="id" value={h.id}/><select name="status" defaultValue={h.status} className="admin-input"><option value="ACTIVE">Active</option><option value="UNDER_REVIEW">Under review</option><option value="INACTIVE">Inactive</option></select><button className="btn-admin-ghost">Save</button></form></td>}</tr>)}</tbody></table>{hotels.length===0 && <p className="p-8 text-center text-sm text-slate-500">No hotel partners yet. Add your first hotel or homestay above.</p>}</div></section>
  </>;
}
