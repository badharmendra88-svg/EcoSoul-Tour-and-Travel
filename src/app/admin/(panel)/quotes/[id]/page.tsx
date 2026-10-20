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
        `— ${site.name}, ${site.phone}`,
      ]
        .filter((l) => l !== null)
        .join("\n")
    : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Link href="/admin/quotes/" className="text-slate-600 hover:underline">← All quotes</Link>
        {lead && <Link href={`/admin/leads/${lead.id}/`} className="text-forest-700 hover:underline">Lead {lead.ref}</Link>}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{quote ? `Quote ${quote.number}` : "New quote"}</h1>
          {quote && (
            <p className="text-sm text-slate-600">
              Status: <strong>{quote.status}</strong> · created {formatDateTime(quote.createdAt)}
              {quote.sentAt && <> · sent {formatDateTime(quote.sentAt)} via {quote.sentVia?.toLowerCase()}</>}
            </p>
          )}
        </div>
      </div>
      {saved && <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">Quote saved. Download the PDF or send it from the panel.</p>}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
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
                emailSubject={`Your quotation ${quote.number} — ${site.name}`}
              />
              <form action={setQuoteStatusAction} className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
                <input type="hidden" name="id" value={quote.id} />
                <h2 className="font-semibold text-slate-900">Customer response</h2>
                <div className="flex flex-wrap gap-2">
                  <button name="status" value="ACCEPTED" className="btn-secondary px-4 py-2">Accepted</button>
                  <button name="status" value="DECLINED" className="btn-outline px-4 py-2">Declined</button>
                </div>
                <p className="text-xs text-slate-500">After acceptance, confirm partners and update the lead status.</p>
              </form>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              Save the quote to get the PDF, customer link and WhatsApp sending options.
            </div>
          )}
          {lead && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm">
              <h2 className="font-semibold text-slate-900">From the enquiry</h2>
              {lead.message ? <p className="mt-2 whitespace-pre-wrap text-slate-700">{lead.message}</p> : <p className="mt-2 text-slate-500">No message.</p>}
              {lead.budgetBand && <p className="mt-2 text-slate-600">Budget: {lead.budgetBand}</p>}
              {lead.interests && <p className="mt-1 text-slate-600">Interests: {lead.interests}</p>}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
