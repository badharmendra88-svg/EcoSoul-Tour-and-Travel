import Link from "next/link";
import { notFound } from "next/navigation";
import { serviceTypes, vehicleCategories } from "@/config/options";
import { site } from "@/config/site";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/format";
import { parseList } from "@/lib/json";
import { addDaysISO, emptyCalc, rupees, type CalcInput, type QuoteItem } from "@/lib/quote";
import { getRateCard } from "@/lib/rates";
import { setQuoteStatusAction } from "../../../quote-actions";
import { QuoteBuilder, type BuilderInitial } from "../QuoteBuilder";
import { SendPanel } from "../SendPanel";
import { getSettings, getWhatsAppApiConfig } from "@/lib/settings";
import { Avatar, Icon, PageHeader, Panel, StatusBadge } from "../../ui";

const defaultTransportInclusions = ["Vehicle as per category for the dates and route above", "Fuel and driver charges", "Driver allowance and night halts as listed"];
const defaultTransportExclusions = ["Tolls, parking and state entry taxes beyond the estimate (at actuals)", "Entry tickets, activities and meals", "Anything not listed under inclusions"];
const defaultTripInclusions = ["Hotel stay in the category above with breakfast", "Private vehicle for transfers and sightseeing as per itinerary", "Driver allowance, fuel and night halts"];
const defaultTripExclusions = ["Train / flight tickets", "Entry tickets, boating, ropeway and activity fees", "Lunch and dinner unless listed", "Personal expenses and anything not listed under inclusions"];

function daysBetween(a?: string | null, b?: string | null) {
  if (!a || !b) return null;
  const d = Math.round((Date.parse(b) - Date.parse(a)) / 86400000) + 1;
  return d > 0 ? d : null;
}

export default async function QuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lead?: string; saved?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { lead: leadId, saved } = await searchParams;
  const { vehicles, hotels, settings } = await getRateCard();
  const contact = await getSettings();
  const waApiReady = (await getWhatsAppApiConfig()) !== null;
  const isNew = id === "new";

  const quote = isNew ? null : await db.quote.findUnique({ where: { id }, include: { enquiry: true } });
  if (!isNew && !quote) notFound();
  const lead = quote?.enquiry ?? (leadId ? await db.enquiry.findUnique({ where: { id: leadId } }) : null);

  let initial: BuilderInitial;
  if (quote) {
    initial = {
      customerName: quote.customerName,
      customerPhone: quote.customerPhone ?? "",
      customerEmail: quote.customerEmail ?? "",
      title: quote.title,
      tripSummary: quote.tripSummary ?? "",
      travelDate: quote.travelDate ?? "",
      validUntil: quote.validUntil,
      items: JSON.parse(quote.items) as QuoteItem[],
      markupPct: quote.markupPct,
      markupLabel: quote.markupLabel,
      taxPct: quote.taxPct,
      taxLabel: quote.taxLabel,
      advancePct: quote.advancePct,
      inclusions: parseList(quote.inclusions).join("\n"),
      exclusions: parseList(quote.exclusions).join("\n"),
      terms: parseList(quote.terms).join("\n"),
      notes: quote.notes ?? "",
      calc: { ...emptyCalc, ...(quote.calcInput ? (JSON.parse(quote.calcInput) as Partial<CalcInput>) : {}) },
    };
  } else {
    // Prefill from the lead where possible
    const pkg = lead?.packageSlug ? await db.package.findUnique({ where: { slug: lead.packageSlug } }) : null;
    const persons = (lead?.adults ?? 2) + (lead?.children ?? 0);
    const isTransport = lead?.kind === "TRANSPORT";
    const days = daysBetween(lead?.travelDate, lead?.returnDate) ?? pkg?.durationDays ?? (isTransport ? 1 : 3);
    const vehicleId =
      lead?.vehicleCategory && vehicles.some((v) => v.id === lead.vehicleCategory)
        ? lead.vehicleCategory
        : persons > 6 ? "TEMPO" : persons > 4 ? "SUV" : "SEDAN";
    const service = lead?.serviceType ? serviceTypes[lead.serviceType as keyof typeof serviceTypes] : null;
    const title = pkg
      ? `${pkg.title} — ${pkg.durationLabel}`
      : isTransport
        ? `${service ?? "Taxi"}: ${lead?.pickup ?? ""}${lead?.drop ? ` to ${lead.drop}` : ""}`
        : lead?.destination
          ? `${lead.destination} trip, ${days} days`
          : "";
    const vehicleName = vehicleCategories.find((v) => v.id === vehicleId)?.name;
    const summary = [
      `${persons} traveller${persons === 1 ? "" : "s"}`,
      lead?.pickup && `Pickup: ${lead.pickup}${lead.pickupTime ? ` at ${lead.pickupTime}` : ""}`,
      lead?.drop && `Drop/route: ${lead.drop}`,
      lead?.returnDate && `Return: ${formatDate(lead.returnDate)}`,
      vehicleName && `Vehicle: ${vehicleName} or equivalent`,
    ]
      .filter(Boolean)
      .join(" · ");

    initial = {
      customerName: lead?.name ?? "",
      customerPhone: lead?.phone ?? "",
      customerEmail: lead?.email ?? "",
      title,
      tripSummary: lead ? summary : "",
      travelDate: lead?.travelDate ?? "",
      validUntil: addDaysISO(settings.validityDays),
      items: [],
      markupPct: settings.markupPct,
      markupLabel: settings.markupLabel,
      taxPct: settings.gstPct,
      taxLabel: settings.gstLabel,
      advancePct: settings.advancePct,
      inclusions: (isTransport ? defaultTransportInclusions : defaultTripInclusions).join("\n"),
      exclusions: (isTransport ? defaultTransportExclusions : defaultTripExclusions).join("\n"),
      terms: settings.terms,
      notes: "",
      calc: {
        ...emptyCalc,
        vehicleId,
        mode: lead?.serviceType === "LOCAL" ? "LOCAL" : lead?.serviceType === "DRIVER_ONLY" ? "NONE" : "OUTSTATION",
        days,
        totalKm: Math.max(250, days * 200),
        nights: Math.max(0, days - 1),
        vehicles: Math.max(1, Math.ceil(persons / (vehicles.find((v) => v.id === vehicleId)?.seats ?? 4))),
        hotelId: isTransport ? "" : "STANDARD",
        persons,
        rooms: Math.max(1, Math.ceil(persons / 2)),
        hotelNights: Math.max(0, days - 1),
      },
    };
  }

  const publicUrl = quote ? `${site.url}/quote/${quote.token}/` : "";
  const message = quote
    ? [
        `Namaste ${quote.customerName},`,
        ``,
        `Thank you for your enquiry with ${site.name}. Here is your quotation:`,
        ``,
        `Quote: ${quote.number}`,
        `Trip: ${quote.title}`,
        quote.travelDate ? `Travel date: ${formatDate(quote.travelDate)}` : null,
        `Total: ${rupees(quote.total)} (incl. ${quote.taxLabel})`,
        quote.advancePct > 0 ? `Advance to confirm: ${rupees(Math.round((quote.total * quote.advancePct) / 100))}` : null,
        `Valid until: ${formatDate(quote.validUntil)}`,
        ``,
        `View / download PDF: ${publicUrl}`,
        ``,
        `This is a quotation, not a booking confirmation. Reply here to confirm or for any changes.`,
        `— ${site.name}, ${contact.phone}`,
      ]
        .filter((l) => l !== null)
        .join("\n")
    : "";

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ href: "/admin/quotes/", label: "All quotes" }}
        eyebrow={quote ? "Quotation" : "Estimate calculator"}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {quote ? <span className="font-mono">{quote.number}</span> : "New quote"}
            {quote && <StatusBadge status={quote.status} />}
          </span>
        }
        subtitle={
          quote ? (
            <>
              Created {formatDateTime(quote.createdAt)}
              {quote.sentAt && <> · sent {formatDateTime(quote.sentAt)} via {quote.sentVia?.toLowerCase()}</>}
            </>
          ) : (
            "Calculate from the rate card, adjust line items, then save to send."
          )
        }
        actions={
          lead && (
            <Link href={`/admin/leads/${lead.id}/`} className="btn-admin-ghost">
              <Avatar name={lead.name} size="sm" /> {lead.name} · <span className="font-mono text-xs">{lead.ref}</span>
            </Link>
          )
        }
      />
      {saved && (
        <p role="status" className="-mt-2 flex items-center gap-2 rounded-2xl bg-emerald-50 px-5 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
          <Icon name="check" /> Quote saved. Download the PDF or send it from the panel.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <QuoteBuilder
          key={quote?.updatedAt.toISOString() ?? "new"}
          quoteId={quote?.id}
          enquiryId={lead?.id}
          vehicles={vehicles.filter((v) => v.active)}
          hotels={hotels}
          peakSurchargePct={settings.peakSurchargePct}
          initial={initial}
        />
        <aside className="space-y-4 xl:sticky xl:top-6 xl:h-fit">
          {quote ? (
            <>
              <SendPanel
                quoteId={quote.id}
                pdfUrl={`/api/quotes/${quote.token}/pdf/`}
                publicUrl={publicUrl}
                isLocalUrl={/localhost|127\.0\.0\.1/.test(site.url)}
                customerPhone={quote.customerPhone}
                customerEmail={quote.customerEmail}
                message={message}
                waApiReady={waApiReady}
                emailSubject={`Your quotation ${quote.number} — ${site.name}`}
              />
              <Panel title="Customer response" icon="check">
                <form action={setQuoteStatusAction} className="space-y-3">
                  <input type="hidden" name="id" value={quote.id} />
                  <div className="grid grid-cols-2 gap-2">
                    <button name="status" value="ACCEPTED" className="btn-admin-primary">Accepted</button>
                    <button name="status" value="DECLINED" className="btn-admin-ghost">Declined</button>
                  </div>
                  <p className="text-xs text-slate-500">After acceptance, confirm partners and update the lead status.</p>
                </form>
              </Panel>
            </>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-8 text-center text-sm text-slate-500">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest-50 text-forest-700"><Icon name="quote" className="h-5 w-5" /></span>
              <p className="mt-3 font-medium text-slate-700">Ready to send?</p>
              <p className="mt-1">Save the quote to unlock the PDF, customer link and WhatsApp sending.</p>
            </div>
          )}
          {lead && (
            <Panel title="From the enquiry" icon="message">
              <div className="text-sm">
                {lead.message ? <p className="whitespace-pre-wrap text-slate-700">{lead.message}</p> : <p className="text-slate-500">No message.</p>}
                {lead.budgetBand && <p className="mt-3 text-slate-600"><span className="text-slate-400">Budget:</span> {lead.budgetBand}</p>}
                {lead.interests && <p className="mt-1 text-slate-600"><span className="text-slate-400">Interests:</span> {lead.interests}</p>}
              </div>
            </Panel>
          )}
        </aside>
      </div>
    </div>
  );
}
