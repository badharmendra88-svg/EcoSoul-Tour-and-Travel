import Link from "next/link";
import { notFound } from "next/navigation";
import { enquiryKinds, serviceTypes, statusesFor, vehicleCategories } from "@/config/options";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { rupees } from "@/lib/quote";
import { retryNotificationAction, updateEnquiryAction } from "../../../actions";

// Indian 10-digit numbers get the 91 country code for wa.me links
function customerWhatsApp(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0(\d{10})$/, "$1").replace(/^(\d{10})$/, "91$1");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const e = await db.enquiry.findUnique({ where: { id }, include: { events: { orderBy: { at: "desc" } }, quotes: { orderBy: { createdAt: "desc" } } } });
  if (!e) notFound();

  const statuses = statusesFor(e.kind);
  const vehicle = vehicleCategories.find((v) => v.id === e.vehicleCategory)?.name ?? e.vehicleCategory;

  const rows: [string, string | number | null | undefined][] = [
    ["Type", enquiryKinds[e.kind as keyof typeof enquiryKinds] ?? e.kind],
    ["Service", e.serviceType ? serviceTypes[e.serviceType as keyof typeof serviceTypes] : null],
    ["Package", e.packageSlug],
    ["Destination", e.destination],
    ["Pickup", e.pickup],
    ["Drop / route", e.drop],
    ["Travel date", e.travelDate ? `${e.travelDate}${e.dateFlexible ? " (flexible)" : ""}` : e.dateFlexible ? "Flexible" : null],
    ["Pickup time", e.pickupTime],
    ["Return date", e.returnDate],
    ["Adults / travellers", e.adults],
    ["Children", e.children || null],
    ["Luggage", e.luggage],
    ["Vehicle preference", vehicle],
    ["Quote type", e.fareType === "ESTIMATE" ? "Rough estimate" : e.fareType === "FIXED_QUOTE" ? "Fixed itemised quote" : null],
    ["Flight / train", e.arrivalRef],
    ["Interests", e.interests],
    ["Budget", e.budgetBand],
    ["Heard from", e.heardFrom],
    ["Source page", e.sourcePage],
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/" className="text-sm text-slate-600 hover:underline">← All leads</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold text-slate-900">{e.ref}</h1>
          <p className="text-sm text-slate-600">Received {formatDateTime(e.createdAt)} · updated {formatDateTime(e.updatedAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/quotes/new/?lead=${e.id}`} className="btn-primary">Create quote</Link>
          {e.phone && (
            <>
              <a href={`tel:${e.phone.replace(/[^\d+]/g, "")}`} className="btn-outline">Call</a>
              <a
                href={customerWhatsApp(e.phone, `Hi ${e.name}, this is EcoSoul Uttarakhand Travel about your enquiry ${e.ref}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                WhatsApp customer
              </a>
            </>
          )}
          {e.email && <a href={`mailto:${e.email}?subject=Your enquiry ${e.ref}`} className="btn-outline">Email</a>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">Customer</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div><dt className="text-slate-500">Name</dt><dd className="font-medium">{e.name}</dd></div>
              <div><dt className="text-slate-500">Phone</dt><dd className="font-medium">{e.phone ?? "—"}</dd></div>
              <div><dt className="text-slate-500">Email</dt><dd className="font-medium break-all">{e.email ?? "—"}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-slate-500">Consent recorded {formatDateTime(e.consentAt)}</p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">Request</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              {rows
                .filter(([, v]) => v != null && v !== "")
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-medium break-words">{v}</dd>
                  </div>
                ))}
            </dl>
            {e.message && (
              <div className="mt-4">
                <h3 className="text-sm text-slate-500">Message</h3>
                <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm whitespace-pre-wrap">{e.message}</p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">Activity</h2>
            <ol className="mt-3 space-y-3 text-sm">
              {e.events.map((ev) => (
                <li key={ev.id} className="flex gap-3">
                  <span className="w-40 shrink-0 text-slate-500">{formatDateTime(ev.at)}</span>
                  <span>
                    <span className="font-medium">{ev.actor}</span> · {ev.action.replace(/_/g, " ")}
                    {ev.detail && <span className="text-slate-600"> — {ev.detail}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm">
            <h2 className="font-semibold text-slate-900">Quotes</h2>
            {e.quotes.length === 0 ? (
              <p className="mt-2 text-slate-500">No quotes yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {e.quotes.map((q) => (
                  <li key={q.id} className="flex items-center justify-between gap-3">
                    <Link href={`/admin/quotes/${q.id}/`} className="font-mono text-forest-700 hover:underline">{q.number}</Link>
                    <span className="text-slate-600">{rupees(q.total)} · {q.status}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href={`/admin/quotes/new/?lead=${e.id}`} className="mt-4 inline-block font-semibold text-forest-700 hover:underline">+ New quote from this lead</Link>
          </div>

          <form action={updateEnquiryAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
            <input type="hidden" name="id" value={e.id} />
            <h2 className="font-semibold text-slate-900">Manage</h2>
            <div>
              <label htmlFor="status" className="label">Status</label>
              <select id="status" name="status" defaultValue={e.status} className="input">
                {Object.entries(statuses).map(([k, l]) => (
                  <option key={k} value={k}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="assignedTo" className="label">Assigned to</label>
              <input id="assignedTo" name="assignedTo" defaultValue={e.assignedTo ?? ""} className="input" placeholder="Staff member / partner" />
            </div>
            <div>
              <label htmlFor="internalNotes" className="label">Internal notes</label>
              <textarea id="internalNotes" name="internalNotes" rows={5} defaultValue={e.internalNotes ?? ""} className="input" placeholder="Quote amount, partner, follow-up date, lost reason…" />
            </div>
            <div>
              <label htmlFor="note" className="label">Add to activity log</label>
              <input id="note" name="note" className="input" placeholder="e.g. Called, sent quote on WhatsApp" />
            </div>
            <button className="btn-secondary w-full">Save changes</button>
          </form>

          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm">
            <h2 className="font-semibold text-slate-900">Team notification</h2>
            <p className="mt-2">
              Status: <strong>{e.notifyStatus}</strong>
              {e.notifyError && <span className="block text-red-700">{e.notifyError}</span>}
            </p>
            {(e.notifyStatus === "FAILED" || e.notifyStatus === "PENDING") && (
              <form action={retryNotificationAction} className="mt-3">
                <input type="hidden" name="id" value={e.id} />
                <button className="btn-outline">Retry notification</button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
