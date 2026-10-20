import Link from "next/link";
import { notFound } from "next/navigation";
import {
  availabilityOptions,
  commercialPermitOptions,
  driverStatuses,
  licenceTypes,
  partnerTypes,
  verificationChecks,
} from "@/config/drivers";
import { vehicleCategories } from "@/config/options";
import { requireUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { daysUntil, docLabels, expiringDocs, type DocKey } from "@/lib/driver-docs";
import { formatDate, formatDateTime } from "@/lib/format";
import { can } from "@/lib/permissions";
import { rupees } from "@/lib/quote";
import { decryptSecret } from "@/lib/secret-box";
import { updateDriverAction } from "../../../drivers-actions";
import { FormBanner } from "../../AdminFields";
import { Avatar, Badge, Icon, Panel, timeAgo, type IconName } from "../../ui";

function waLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0(\d{10})$/, "$1").replace(/^(\d{10})$/, "91$1");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function Fact({ icon, label, children }: { icon: IconName; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-100">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="font-medium break-words text-slate-900">{children}</dd>
      </div>
    </div>
  );
}

function ExpiryChip({ date }: { date: string | null }) {
  const days = daysUntil(date);
  if (days === null) return <span className="text-xs text-slate-400">Not recorded</span>;
  if (days < 0) return <Badge tone="rose">Expired {formatDate(date)}</Badge>;
  if (days <= 30) return <Badge tone="amber">{days} days left</Badge>;
  return <span className="text-xs text-slate-500">Valid till {formatDate(date)}</span>;
}

export default async function DriverDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const me = await requireUser("drivers.view");
  const canManage = can(me.role, "drivers.manage");
  const { id } = await params;
  const { saved, error } = await searchParams;
  const d = await db.driverPartner.findUnique({ where: { id }, include: { events: { orderBy: { at: "desc" } } } });
  if (!d) notFound();

  const withVehicle = d.partnerType === "WITH_VEHICLE";
  const licenceNumber = canManage ? decryptSecret(d.licenceNumberEnc) : null;
  const vehicle = vehicleCategories.find((c) => c.id === d.vehicleCategory)?.name ?? d.vehicleCategory;
  const docs: DocKey[] = withVehicle ? ["licenceExpiry", "insuranceExpiry", "permitExpiry", "fitnessExpiry", "pucExpiry"] : ["licenceExpiry"];
  const warnings = expiringDocs(d);
  const checks = verificationChecks.filter((c) => !c.vehicleOnly || withVehicle);
  const done = checks.filter((c) => d[c.key]).length;

  return (
    <>
      <Link href="/admin/drivers/" className="mb-5 inline-flex items-center gap-1.5 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-forest-700">
        <Icon name="arrowLeft" /> All drivers
      </Link>

      <div className="panel mb-6 overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-forest-800 via-forest-700 to-forest-600" />
        <div className="flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <span className="-mt-7 rounded-full ring-4 ring-white"><Avatar name={d.name} size="lg" /></span>
            <div className="pt-4">
              <h1 className="text-xl font-semibold text-slate-900">{d.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="font-mono">{d.ref}</span>
                <span>·</span>
                <span>{partnerTypes[d.partnerType as keyof typeof partnerTypes]}</span>
                <span>·</span>
                <span title={formatDateTime(d.createdAt)}>registered {timeAgo(d.createdAt)}</span>
                <Badge tone={d.status === "ACTIVE" ? "emerald" : d.status === "REJECTED" ? "rose" : d.status === "APPLIED" ? "amber" : "sky"}>
                  {driverStatuses[d.status as keyof typeof driverStatuses]}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`tel:${d.phone.replace(/[^\d+]/g, "")}`} className="btn-admin-ghost"><Icon name="phone" /> Call</a>
            <a href={waLink(d.phone, `Namaste ${d.name}, this is EcoSoul Uttarakhand Travel about your driver registration ${d.ref}.`)} target="_blank" rel="noopener noreferrer" className="btn-admin-whatsapp">
              <Icon name="message" /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <p role="alert" className="mb-6 flex items-center gap-2 rounded-2xl bg-rose-50 px-5 py-3 text-sm text-rose-800 ring-1 ring-rose-100">
          <Icon name="bell" /> {warnings.map((w) => `${w.label} ${(w.days ?? 0) < 0 ? "expired" : `expires in ${w.days} days`}`).join(" · ")}
        </p>
      )}
      <div className="mb-6"><FormBanner saved={saved} error={error} savedText="Driver record saved." /></div>

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Panel title="Profile" icon="user">
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Fact icon="phone" label="Mobile">{d.phone}</Fact>
              <Fact icon="mail" label="Email">{d.email ?? "—"}</Fact>
              <Fact icon="map" label="Based in">{d.baseLocation}</Fact>
              <Fact icon="route" label="Areas">{d.serviceAreas}</Fact>
              <Fact icon="clock" label="Experience">
                {d.experienceYears} years{d.hillExperienceYears != null ? ` · ${d.hillExperienceYears} years in the hills` : ""}
              </Fact>
              <Fact icon="message" label="Languages">{d.languages ?? "—"}</Fact>
              <Fact icon="calendar" label="Availability">{availabilityOptions[d.availability as keyof typeof availabilityOptions] ?? d.availability}</Fact>
              <Fact icon="rupee" label="Expected daily charge">{d.expectedDailyRate != null ? rupees(d.expectedDailyRate) : "—"}</Fact>
            </dl>
            {d.message && (
              <blockquote className="mt-6 rounded-xl border-l-4 border-accent bg-amber-50/50 px-5 py-4 text-sm whitespace-pre-wrap text-slate-700">{d.message}</blockquote>
            )}
            <p className="mt-5 text-xs text-slate-400">
              Consent recorded {formatDateTime(d.consentAt)}{d.heardFrom ? ` · heard via ${d.heardFrom}` : ""}
            </p>
          </Panel>

          <Panel title="Licence & vehicle" icon="car">
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Fact icon="quote" label="Licence type">{licenceTypes[d.licenceType as keyof typeof licenceTypes] ?? d.licenceType}</Fact>
              <Fact icon="settings" label="Licence number">
                {licenceNumber ? (
                  <details>
                    <summary className="inline-flex min-h-9 cursor-pointer list-none items-center font-mono">•••• {d.licenceLast4} <span className="ml-1 text-xs font-sans font-normal text-forest-700 underline">show</span></summary>
                    <span className="font-mono">{licenceNumber}</span>
                  </details>
                ) : (
                  <span className="font-mono">•••• {d.licenceLast4}</span>
                )}
              </Fact>
              <Fact icon="calendar" label="Licence valid till"><ExpiryChip date={d.licenceExpiry} /></Fact>
              {withVehicle && (
                <>
                  <Fact icon="car" label="Vehicle">{vehicle}{d.vehicleModel ? ` · ${d.vehicleModel}` : ""}{d.vehicleSeats ? ` · ${d.vehicleSeats} seats` : ""}</Fact>
                  <Fact icon="route" label="Registration no.">{d.vehicleRegNo}</Fact>
                  <Fact icon="check" label="Commercial permit">{commercialPermitOptions[d.commercialPermit as keyof typeof commercialPermitOptions] ?? "—"}</Fact>
                </>
              )}
            </dl>
          </Panel>

          <Panel title="Activity" icon="clock" description={`${d.events.length} event${d.events.length === 1 ? "" : "s"}`}>
            <ol className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-slate-200">
              {d.events.map((ev) => (
                <li key={ev.id} className="relative flex gap-4">
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-forest-700 ring-1 ring-slate-200">
                    <Icon name={ev.action === "status" ? "trend" : ev.action === "verification" ? "check" : ev.action === "note" ? "message" : "sparkles"} className="h-3.5 w-3.5" />
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
          {canManage ? (
            <Panel title="Verify & manage" icon="settings" description={`${done}/${checks.length} checks complete${d.verifiedAt ? ` · verified by ${d.verifiedBy} on ${formatDate(d.verifiedAt)}` : ""}`}>
              <form action={updateDriverAction} className="space-y-5">
                <input type="hidden" name="id" value={d.id} />
                <div>
                  <p className="admin-label">Verification checklist</p>
                  <div className="space-y-1">
                    {checks.map((c) => (
                      <label key={c.key} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-slate-700 hover:bg-slate-50">
                        <input type="checkbox" name={c.key} defaultChecked={d[c.key]} className="h-4 w-4 accent-forest-700" />
                        {c.label}
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Check originals in person. Don&apos;t store copies of documents here.</p>
                </div>

                <div className="space-y-3">
                  <p className="admin-label">Document expiry dates</p>
                  {docs.map((k) => (
                    <label key={k} className="grid grid-cols-[1fr_160px] items-center gap-3 text-sm">
                      <span className="text-slate-700">
                        {docLabels[k]}
                        <span className="block"><ExpiryChip date={d[k]} /></span>
                      </span>
                      <input type="date" name={k} defaultValue={d[k] ?? ""} className="admin-input" aria-label={`${docLabels[k]} expiry`} />
                    </label>
                  ))}
                </div>

                <div>
                  <label htmlFor="status" className="admin-label">Status</label>
                  <select id="status" name="status" defaultValue={d.status} className="admin-input">
                    {Object.entries(driverStatuses).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                  <p className="mt-1.5 text-xs text-slate-500">“Verified” and “Active” need every check ticked and valid documents.</p>
                </div>
                <div>
                  <label htmlFor="internalNotes" className="admin-label">Internal notes</label>
                  <textarea id="internalNotes" name="internalNotes" rows={4} defaultValue={d.internalNotes ?? ""} className="admin-input" placeholder="Interview notes, rate agreed, routes known…" />
                </div>
                <div>
                  <label htmlFor="note" className="admin-label">Log an activity</label>
                  <input id="note" name="note" className="admin-input" placeholder="e.g. Called, documents visit on Monday" />
                </div>
                <button className="btn-admin-primary w-full">Save changes</button>
              </form>
            </Panel>
          ) : (
            <Panel title="Verification" icon="check">
              <ul className="space-y-2 text-sm">
                {checks.map((c) => (
                  <li key={c.key} className="flex items-center gap-2">
                    <span className={d[c.key] ? "text-emerald-600" : "text-slate-300"}>{d[c.key] ? "✓" : "○"}</span>
                    {c.label}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-500">Only Admins can change verification or status.</p>
            </Panel>
          )}
        </aside>
      </div>
    </>
  );
}
