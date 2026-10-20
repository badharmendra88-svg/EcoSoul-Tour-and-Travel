"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  computeTotals,
  estimateHotel,
  estimateTransport,
  lineAmount,
  rupees,
  type CalcInput,
  type HotelRateInput,
  type QuoteItem,
  type VehicleRateInput,
} from "@/lib/quote";
import { saveQuoteAction } from "../../quote-actions";
import { Icon } from "../ui";

export type BuilderInitial = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  title: string;
  tripSummary: string;
  travelDate: string;
  validUntil: string;
  items: QuoteItem[];
  markupPct: number;
  markupLabel: string;
  taxPct: number;
  taxLabel: string;
  advancePct: number;
  inclusions: string;
  exclusions: string;
  terms: string;
  notes: string;
  calc: CalcInput;
};

type Props = {
  quoteId?: string;
  enquiryId?: string;
  vehicles: VehicleRateInput[];
  hotels: HotelRateInput[];
  peakSurchargePct: number;
  initial: BuilderInitial;
};

const lines = (s: string) => s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

export function QuoteBuilder({ quoteId, enquiryId, vehicles, hotels, peakSurchargePct, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [calc, setCalc] = useState<CalcInput>(initial.calc);
  const [items, setItems] = useState<QuoteItem[]>(initial.items);
  const [m, setM] = useState(initial);

  const setC = <K extends keyof CalcInput>(k: K, v: CalcInput[K]) => setCalc((c) => ({ ...c, [k]: v }));
  const setMeta = <K extends keyof BuilderInitial>(k: K, v: BuilderInitial[K]) => setM((x) => ({ ...x, [k]: v }));

  const vehicle = vehicles.find((v) => v.id === calc.vehicleId);
  const hotel = hotels.find((h) => h.id === calc.hotelId);
  const preview = useMemo(
    () => [...estimateTransport(calc, vehicle), ...estimateHotel(calc, hotel, peakSurchargePct)],
    [calc, vehicle, hotel, peakSurchargePct],
  );
  const totals = computeTotals(items, m.markupPct, m.taxPct);
  const capacityWarn = vehicle && calc.mode !== "NONE" && calc.persons > vehicle.seats * Math.max(1, calc.vehicles);

  function applyCalculator(replace: boolean) {
    setItems((current) => (replace ? preview : [...current, ...preview]));
  }

  function updateItem(i: number, patch: Partial<QuoteItem>) {
    setItems((list) => list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  function save() {
    setError("");
    startTransition(async () => {
      const res = await saveQuoteAction({
        id: quoteId,
        enquiryId: enquiryId ?? null,
        customerName: m.customerName,
        customerPhone: m.customerPhone,
        customerEmail: m.customerEmail,
        title: m.title,
        tripSummary: m.tripSummary,
        travelDate: m.travelDate,
        validUntil: m.validUntil,
        items: items.map((i) => ({ ...i, qty: Number(i.qty) || 0, rate: Number(i.rate) || 0 })),
        markupPct: Number(m.markupPct) || 0,
        markupLabel: m.markupLabel,
        taxPct: Number(m.taxPct) || 0,
        taxLabel: m.taxLabel,
        advancePct: Math.round(Number(m.advancePct) || 0),
        inclusions: lines(m.inclusions),
        exclusions: lines(m.exclusions),
        terms: lines(m.terms),
        notes: m.notes,
        calcInput: calc,
      });
      if (!res.ok) return setError(res.error);
      router.push(`/admin/quotes/${res.id}/?saved=1`);
      router.refresh();
    });
  }

  const numInput = (value: number, onChange: (v: number) => void, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input type="number" min={0} className="admin-input" value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(Number(e.target.value))} {...props} />
  );

  return (
    <div className="space-y-6">
      {/* Customer & trip */}
      <section className="grid gap-4 panel p-6 sm:grid-cols-3">
        <div className="sm:col-span-3"><Step n={1} title="Customer & trip" text="Who the quote is for and what it covers" /></div>
        <Labeled label="Customer name *"><input className="admin-input" value={m.customerName} onChange={(e) => setMeta("customerName", e.target.value)} /></Labeled>
        <Labeled label="Phone / WhatsApp"><input className="admin-input" value={m.customerPhone} onChange={(e) => setMeta("customerPhone", e.target.value)} /></Labeled>
        <Labeled label="Email"><input className="admin-input" value={m.customerEmail} onChange={(e) => setMeta("customerEmail", e.target.value)} /></Labeled>
        <div className="sm:col-span-2"><Labeled label="Quote title *"><input className="admin-input" value={m.title} onChange={(e) => setMeta("title", e.target.value)} placeholder="e.g. Nainital–Bhimtal family trip, 3 days" /></Labeled></div>
        <Labeled label="Travel date"><input type="date" className="admin-input" value={m.travelDate} onChange={(e) => setMeta("travelDate", e.target.value)} /></Labeled>
        <div className="sm:col-span-3"><Labeled label="Trip summary (shown to customer)"><textarea className="admin-input" rows={2} value={m.tripSummary} onChange={(e) => setMeta("tripSummary", e.target.value)} placeholder="Route, travellers, pickup/drop, hotel category…" /></Labeled></div>
      </section>

      {/* Calculator */}
      <section className="space-y-5 panel p-6 ring-forest-200 bg-gradient-to-br from-white to-forest-50/60">
        <Step n={2} title="Estimate calculator" text="Calculated from your rate card — review, then turn into line items" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Labeled label="Transport">
            <select className="admin-input" value={calc.mode} onChange={(e) => setC("mode", e.target.value as CalcInput["mode"])}>
              <option value="OUTSTATION">Outstation</option>
              <option value="LOCAL">Local package</option>
              <option value="NONE">No transport</option>
            </select>
          </Labeled>
          {calc.mode !== "NONE" && (
            <>
              <Labeled label="Vehicle">
                <select className="admin-input" value={calc.vehicleId} onChange={(e) => setC("vehicleId", e.target.value)}>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} ({v.seats} seats)</option>
                  ))}
                </select>
              </Labeled>
              <Labeled label="Vehicles">{numInput(calc.vehicles, (v) => setC("vehicles", v), { min: 1 })}</Labeled>
              <Labeled label="Days">{numInput(calc.days, (v) => setC("days", v), { min: 1 })}</Labeled>
              {calc.mode === "OUTSTATION" ? (
                <>
                  <Labeled label="Estimated total km" hint={vehicle ? `Min billed: ${vehicle.minKmPerDay * Math.max(1, calc.days)} km` : undefined}>
                    {numInput(calc.totalKm, (v) => setC("totalKm", v))}
                  </Labeled>
                  <Labeled label="Driver night halts">{numInput(calc.nights, (v) => setC("nights", v))}</Labeled>
                </>
              ) : (
                <>
                  <Labeled label="Extra hours (est.)">{numInput(calc.extraHours, (v) => setC("extraHours", v))}</Labeled>
                  <Labeled label="Extra km (est.)">{numInput(calc.extraKm, (v) => setC("extraKm", v))}</Labeled>
                </>
              )}
              <Labeled label="Tolls & parking (₹ est.)">{numInput(calc.tolls, (v) => setC("tolls", v))}</Labeled>
            </>
          )}
        </div>

        <div className="grid gap-4 border-t border-forest-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <Labeled label="Hotel">
            <select className="admin-input" value={calc.hotelId} onChange={(e) => setC("hotelId", e.target.value)}>
              <option value="">No hotel</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>{h.name} · {rupees(h.perRoomNight)}</option>
              ))}
            </select>
          </Labeled>
          <Labeled label="Travellers">{numInput(calc.persons, (v) => setC("persons", v), { min: 1 })}</Labeled>
          {calc.hotelId && (
            <>
              <Labeled label="Rooms">{numInput(calc.rooms, (v) => setC("rooms", v), { min: 1 })}</Labeled>
              <Labeled label="Nights">{numInput(calc.hotelNights, (v) => setC("hotelNights", v))}</Labeled>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={calc.meals} onChange={(e) => setC("meals", e.target.checked)} /> Add dinner (MAP)</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={calc.peak} onChange={(e) => setC("peak", e.target.checked)} /> Peak season (+{peakSurchargePct}%)</label>
            </>
          )}
        </div>

        {capacityWarn && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
            {calc.persons} travellers may not fit {calc.vehicles} × {vehicle?.name} ({vehicle?.seats} seats). Consider a larger vehicle or more vehicles.
          </p>
        )}

        <div className="rounded-xl bg-white p-5 text-sm shadow-sm ring-1 ring-forest-100">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-slate-800">Calculator preview</p>
            {preview.length > 0 && <p className="text-base font-semibold text-forest-800 tabular-nums">{rupees(preview.reduce((t, p) => t + lineAmount(p), 0))}</p>}
          </div>
          {preview.length === 0 ? (
            <p className="mt-1 text-slate-500">Choose transport and/or hotel to calculate.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {preview.map((p, i) => (
                <li key={i} className="flex justify-between gap-4 py-2">
                  <span className="text-slate-600">{p.label} — {p.qty} {p.unit} × {rupees(p.rate)}</span>
                  <span className="font-medium whitespace-nowrap">{rupees(lineAmount(p))}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <button type="button" className="btn-admin-primary px-4 py-2" disabled={preview.length === 0} onClick={() => applyCalculator(true)}>
              Use as line items
            </button>
            <button type="button" className="btn-admin-ghost px-4 py-2" disabled={preview.length === 0} onClick={() => applyCalculator(false)}>
              Add to existing items
            </button>
          </div>
        </div>
      </section>

      {/* Line items */}
      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Step n={3} title="Line items & pricing" text="Everything here is editable and appears on the PDF" />
          <button type="button" className="btn-admin-ghost px-4 py-2" onClick={() => setItems((l) => [...l, { label: "", qty: 1, unit: "lump sum", rate: 0 }])}>
            + Add line
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="pb-2">Description</th>
                <th className="w-24 pb-2">Qty</th>
                <th className="w-32 pb-2">Unit</th>
                <th className="w-32 pb-2">Rate (₹)</th>
                <th className="w-32 pb-2 text-right">Amount</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="align-top">
              {items.map((it, i) => (
                <tr key={i}>
                  <td className="py-1 pr-2"><input className="admin-input" value={it.label} onChange={(e) => updateItem(i, { label: e.target.value })} placeholder="Item description" aria-label="Description" /></td>
                  <td className="py-1 pr-2"><input type="number" min={0} className="admin-input" value={it.qty} onChange={(e) => updateItem(i, { qty: Number(e.target.value) })} aria-label="Quantity" /></td>
                  <td className="py-1 pr-2"><input className="admin-input" value={it.unit} onChange={(e) => updateItem(i, { unit: e.target.value })} aria-label="Unit" /></td>
                  <td className="py-1 pr-2"><input type="number" min={0} className="admin-input" value={it.rate} onChange={(e) => updateItem(i, { rate: Number(e.target.value) })} aria-label="Rate" /></td>
                  <td className="py-3 pr-2 text-right font-medium whitespace-nowrap">{rupees(lineAmount(it))}</td>
                  <td className="py-1">
                    <button type="button" onClick={() => setItems((l) => l.filter((_, idx) => idx !== i))} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600" aria-label="Remove line"><Icon name="close" /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-slate-500">No items yet — use the calculator or add a line.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-6 border-t border-slate-100 pt-6 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Service charge label"><input className="admin-input" value={m.markupLabel} onChange={(e) => setMeta("markupLabel", e.target.value)} /></Labeled>
            <Labeled label="Service charge %">{numInput(m.markupPct, (v) => setMeta("markupPct", v), { step: 0.5 })}</Labeled>
            <Labeled label="Tax label"><input className="admin-input" value={m.taxLabel} onChange={(e) => setMeta("taxLabel", e.target.value)} /></Labeled>
            <Labeled label="Tax %">{numInput(m.taxPct, (v) => setMeta("taxPct", v), { step: 0.5 })}</Labeled>
            <Labeled label="Advance to confirm %">{numInput(m.advancePct, (v) => setMeta("advancePct", v))}</Labeled>
            <Labeled label="Valid until *"><input type="date" className="admin-input" value={m.validUntil} onChange={(e) => setMeta("validUntil", e.target.value)} /></Labeled>
          </div>
          <dl className="space-y-2.5 rounded-2xl bg-gradient-to-br from-forest-800 to-forest-900 p-5 text-sm text-forest-100 shadow-lg shadow-forest-900/20">
            <Row label="Subtotal" value={rupees(totals.subtotal)} />
            <Row label={`${m.markupLabel} (${m.markupPct}%)`} value={rupees(totals.markupAmount)} />
            <Row label={`${m.taxLabel} (${m.taxPct}%)`} value={rupees(totals.taxAmount)} />
            <div className="flex items-baseline justify-between border-t border-white/10 pt-3 text-2xl font-semibold text-white tabular-nums">
              <dt>Total</dt>
              <dd>{rupees(totals.total)}</dd>
            </div>
            {m.advancePct > 0 && <Row label={`Advance (${m.advancePct}%)`} value={rupees(Math.round((totals.total * m.advancePct) / 100))} />}
            {calc.persons > 0 && <Row label={`Per person (${calc.persons})`} value={rupees(Math.round(totals.total / calc.persons))} />}
          </dl>
        </div>
      </section>

      {/* Inclusions, terms */}
      <section className="grid gap-4 panel p-6 sm:grid-cols-2">
        <div className="sm:col-span-2"><Step n={4} title="Inclusions, notes & terms" text="Prefilled from your defaults — edit for this trip" /></div>
        <Labeled label="Inclusions (one per line)"><textarea className="admin-input" rows={6} value={m.inclusions} onChange={(e) => setMeta("inclusions", e.target.value)} /></Labeled>
        <Labeled label="Exclusions (one per line)"><textarea className="admin-input" rows={6} value={m.exclusions} onChange={(e) => setMeta("exclusions", e.target.value)} /></Labeled>
        <div className="sm:col-span-2"><Labeled label="Notes for customer"><textarea className="admin-input" rows={3} value={m.notes} onChange={(e) => setMeta("notes", e.target.value)} /></Labeled></div>
        <div className="sm:col-span-2"><Labeled label="Terms (one per line)"><textarea className="admin-input" rows={6} value={m.terms} onChange={(e) => setMeta("terms", e.target.value)} /></Labeled></div>
      </section>

      {error && <p role="alert" className="rounded-2xl bg-rose-50 px-5 py-3 text-sm text-rose-800 ring-1 ring-rose-100">{error}</p>}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 rounded-2xl bg-forest-900/95 px-5 py-3.5 text-white shadow-2xl shadow-forest-900/30 ring-1 ring-white/10 backdrop-blur">
        <button type="button" className="btn-admin-accent px-6" onClick={save} disabled={pending}>
          {pending ? "Saving…" : quoteId ? "Save changes" : "Save quote"}
        </button>
        <span className="text-sm text-forest-200">Total <strong className="ml-1 text-lg text-white tabular-nums">{rupees(totals.total)}</strong></span>
        <span className="hidden text-xs text-forest-300 sm:inline">{items.length} line item{items.length === 1 ? "" : "s"} · save, then send from the panel</span>
      </div>
    </div>
  );
}

function Labeled({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function Step({ n, title, text }: { n: number; title: string; text?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-700 text-sm font-semibold text-white shadow-sm">{n}</span>
      <div>
        <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
        {text && <p className="text-xs text-slate-500">{text}</p>}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-forest-200">{label}</dt>
      <dd className="font-medium text-white tabular-nums">{value}</dd>
    </div>
  );
}
