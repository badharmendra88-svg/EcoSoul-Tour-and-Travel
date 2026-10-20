import Link from "next/link";
import { notFound } from "next/navigation";
import { enquiryKinds, serviceTypes, statusLabel, statusesFor, vehicleCategories } from "@/config/options";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/format";
import { rupees } from "@/lib/quote";
import { retryNotificationAction, updateEnquiryAction } from "../../../actions";
import { Avatar, Badge, Icon, Panel, StatusBadge, timeAgo, type IconName } from "../../ui";

// Indian 10-digit numbers get the 91 country code for wa.me links
function customerWhatsApp(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0(\d{10})$/, "$1").replace(/^(\d{10})$/, "91$1");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

const eventIcon: Record<string, IconName> = {
  created: "sparkles",
  status: "trend",
  assigned: "user",
  note: "message",
  notes_updated: "edit",
  notify_retry: "bell",
  quote_created: "quote",
  quote_sent: "quote",
  quote_status: "check",
};

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const e = await db.enquiry.findUnique({
    where: { id },
    include: { events: { orderBy: { at: "desc" } }, quotes: { orderBy: { createdAt: "desc" } } },
  });
  if (!e) notFound();

  const statuses = statusesFor(e.kind);
  const vehicle = vehicleCategories.find((v) => v.id === e.vehicleCategory)?.name ?? e.vehicleCategory;
  const travellers = e.adults != null ? `${e.adults} adult${e.adults === 1 ? "" : "s"}${e.children ? ` + ${e.children} child${e.children > 1 ? "ren" : ""}` : ""}` : null;

  const facts: { icon: IconName; label: string; value: string | null | undefined }[] = [
    { icon: "car", label: "Service", value: e.serviceType ? serviceTypes[e.serviceType as keyof typeof serviceTypes] : null },
    { icon: "package", label: "Package", value: e.packageSlug?.replace(/-/g, " ") },
    { icon: "map", label: "Destination", value: e.destination },
    { icon: "route", label: "Route", value: e.pickup ? `${e.pickup}${e.drop ? ` → ${e.drop}` : ""}` : null },
    { icon: "calendar", label: "Travel date", value: e.travelDate ? `${formatDate(e.travelDate)}${e.pickupTime ? `, ${e.pickupTime}` : ""}${e.dateFlexible ? " (flexible)" : ""}` : e.dateFlexible ? "Flexible dates" : null },
    { icon: "calendar", label: "Return", value: e.returnDate ? formatDate(e.returnDate) : null },
    { icon: "users", label: "Travellers", value: travellers },
    { icon: "package", label: "Luggage", value: e.luggage },
    { icon: "car", label: "Vehicle preference", value: vehicle },
    { icon: "quote", label: "Quote type", value: e.fareType === "ESTIMATE" ? "Rough estimate" : e.fareType === "FIXED_QUOTE" ? "Fixed itemised quote" : null },
    { icon: "route", label: "Flight / train", value: e.arrivalRef },
    { icon: "sparkles", label: "Interests", value: e.interests },
    { icon: "rupee", label: "Budget", value: e.budgetBand },
  ];
  const meta = [
    ["Heard from", e.heardFrom],
    ["Source page", e.sourcePage],
    ["Consent", formatDateTime(e.consentAt)],
    ["Last updated", formatDateTime(e.updatedAt)],
  ] as const;

  return (
    <>
      <Link href="/admin/" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-forest-700">
        <Icon name="arrowLeft" /> All leads
      </Link>

      {/* Profile header */}
      <div className="panel mb-6 overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-forest-800 via-forest-700 to-forest-600" />
        <div className="flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <span className="-mt-7 rounded-full ring-4 ring-white"><Avatar name={e.name} size="lg" /></span>
            <div className="pt-4">
              <h1 className="text-xl font-semibold text-slate-900">{e.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="font-mono">{e.ref}</span>
                <span>·</span>
                <span>{enquiryKinds[e.kind as keyof typeof enquiryKinds]}</span>
                <span>·</span>
                <span title={formatDateTime(e.createdAt)}>{timeAgo(e.createdAt)}</span>
                <StatusBadge status={e.status} label={statusLabel(e.kind, e.status)} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {e.phone && (
              <>
                <a href={`tel:${e.phone.replace(/[^\d+]/g, "")}`} className="btn-admin-ghost"><Icon name="phone" /> Call</a>
                <a
                  href={customerWhatsApp(e.phone, `Hi ${e.name}, this is EcoSoul Uttarakhand Travel about your enquiry ${e.ref}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-admin-whatsapp"
                >
                  <Icon name="message" /> WhatsApp
                </a>
              </>
            )}
            {e.email && <a href={`mailto:${e.email}?subject=Your enquiry ${e.ref}`} className="btn-admin-ghost"><Icon name="mail" /> Email</a>}
            <Link href={`/admin/quotes/new/?lead=${e.id}`} className="btn-admin-accent"><Icon name="calculator" /> Create quote</Link>
          </div>
        </div>
        <dl className="grid border-t border-slate-100 sm:grid-cols-3">
          <div className="flex items-center gap-3 px-6 py-4">
            <Icon name="phone" className="h-4 w-4 text-slate-400" />
            <div><dt className="text-xs text-slate-500">Phone</dt><dd className="font-medium text-slate-900">{e.phone ?? "—"}</dd></div>
          </div>
          <div className="flex items-center gap-3 border-slate-100 px-6 py-4 sm:border-l">
            <Icon name="mail" className="h-4 w-4 text-slate-400" />
            <div className="min-w-0"><dt className="text-xs text-slate-500">Email</dt><dd className="truncate font-medium text-slate-900">{e.email ?? "—"}</dd></div>
          </div>
          <div className="flex items-center gap-3 border-slate-100 px-6 py-4 sm:border-l">
            <Icon name="user" className="h-4 w-4 text-slate-400" />
            <div><dt className="text-xs text-slate-500">Owner</dt><dd className="font-medium text-slate-900">{e.assignedTo ?? "Unassigned"}</dd></div>
          </div>
        </dl>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Panel title="Trip request" icon="route">
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {facts
                .filter((f) => f.value)
                .map((f) => (
                  <div key={f.label} className="flex gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-100">
                      <Icon name={f.icon} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-xs text-slate-500">{f.label}</dt>
                      <dd className="font-medium break-words text-slate-900">{f.value}</dd>
                    </div>
                  </div>
                ))}
            </dl>
            {e.message && (
              <blockquote className="mt-6 rounded-xl border-l-4 border-accent bg-amber-50/50 px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                {e.message}
              </blockquote>
            )}
            <dl className="mt-6 grid gap-3 border-t border-slate-100 pt-5 text-xs sm:grid-cols-4">
              {meta.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-slate-400">{k}</dt>
                  <dd className="mt-0.5 break-words text-slate-600">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel title="Activity" icon="clock" description={`${e.events.length} event${e.events.length === 1 ? "" : "s"}`}>
            <ol className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-slate-200">
              {e.events.map((ev) => (
                <li key={ev.id} className="relative flex gap-4">
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-forest-700 ring-1 ring-slate-200">
                    <Icon name={eventIcon[ev.action] ?? "sparkles"} className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 pt-1 text-sm">
                    <p className="text-slate-900">
                      <span className="font-medium capitalize">{ev.action.replace(/_/g, " ")}</span>
                      {ev.detail && <span className="text-slate-600"> — {ev.detail}</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{ev.actor} · {formatDateTime(ev.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Manage lead" icon="settings">
            <form action={updateEnquiryAction} className="space-y-4">
              <input type="hidden" name="id" value={e.id} />
              <div>
                <label htmlFor="status" className="admin-label">Status</label>
                <select id="status" name="status" defaultValue={e.status} className="admin-input">
                  {Object.entries(statuses).map(([k, l]) => (
                    <option key={k} value={k}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="assignedTo" className="admin-label">Assigned to</label>
                <input id="assignedTo" name="assignedTo" defaultValue={e.assignedTo ?? ""} className="admin-input" placeholder="Staff member / partner" />
              </div>
              <div>
                <label htmlFor="internalNotes" className="admin-label">Internal notes</label>
                <textarea id="internalNotes" name="internalNotes" rows={4} defaultValue={e.internalNotes ?? ""} className="admin-input" placeholder="Partner, follow-up date, lost reason…" />
              </div>
              <div>
                <label htmlFor="note" className="admin-label">Log an activity</label>
                <input id="note" name="note" className="admin-input" placeholder="e.g. Called, customer comparing options" />
              </div>
              <button className="btn-admin-primary w-full">Save changes</button>
            </form>
          </Panel>

          <Panel
            title="Quotes"
            icon="quote"
            bodyClassName="p-3"
            actions={<Link href={`/admin/quotes/new/?lead=${e.id}`} className="text-sm font-semibold text-forest-700 hover:underline">+ New</Link>}
          >
            {e.quotes.length === 0 ? (
              <p className="px-3 py-4 text-sm text-slate-500">No quotes yet. Use the calculator to prepare one.</p>
            ) : (
              <ul className="space-y-1">
                {e.quotes.map((q) => (
                  <li key={q.id}>
                    <Link href={`/admin/quotes/${q.id}/`} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
                      <span>
                        <span className="block font-mono text-sm text-slate-900">{q.number}</span>
                        <span className="block text-xs text-slate-500">{formatDate(q.createdAt)}</span>
                      </span>
                      <span className="text-right">
                        <span className="block text-sm font-semibold text-slate-900">{rupees(q.total)}</span>
                        <StatusBadge status={q.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Team notification" icon="bell">
            <div className="flex items-center justify-between gap-3 text-sm">
              <Badge tone={e.notifyStatus === "SENT" ? "emerald" : e.notifyStatus === "FAILED" ? "rose" : "slate"}>{e.notifyStatus.toLowerCase()}</Badge>
              {(e.notifyStatus === "FAILED" || e.notifyStatus === "PENDING") && (
                <form action={retryNotificationAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <button className="btn-admin-ghost py-1.5">Retry</button>
                </form>
              )}
            </div>
            {e.notifyError && <p className="mt-2 text-xs text-rose-700">{e.notifyError}</p>}
            {e.notifyStatus === "SKIPPED" && <p className="mt-2 text-xs text-slate-500">No webhook configured — add one in Settings → Tracking & alerts.</p>}
          </Panel>
        </aside>
      </div>
    </>
  );
}
