import { requireAdmin } from "@/lib/admin-auth";
import { formatDateTime } from "@/lib/format";
import { getRateCard } from "@/lib/rates";
import { saveRatesAction } from "../../quote-actions";

const vehicleCols = [
  ["perKm", "₹ / km"],
  ["minKmPerDay", "Min km / day"],
  ["driverAllowance", "Driver ₹ / day"],
  ["nightHalt", "Night halt ₹"],
  ["localPackage", "Local pkg ₹ / day"],
  ["localHours", "Local hrs"],
  ["localKm", "Local km"],
  ["extraHour", "Extra hr ₹"],
  ["extraKm", "Extra km ₹"],
] as const;

export default async function RatesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { saved } = await searchParams;
  const { vehicles, hotels, settings } = await getRateCard();
  const lastUpdated = [...vehicles.map((v) => v.updatedAt), ...hotels.map((h) => h.updatedAt), settings.updatedAt].sort((a, b) => +b - +a)[0];

  return (
    <form action={saveRatesAction} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rate card</h1>
          <p className="text-sm text-slate-600">
            Used by the quote calculator. Defaults are typical Uttarakhand market rates — replace them with your partners&apos; actual
            rates. Last updated {formatDateTime(lastUpdated)}.
          </p>
        </div>
        <button className="btn-primary">Save rate card</button>
      </div>
      {saved && <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">Rate card saved. New quotes will use these rates; existing quotes are unchanged.</p>}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Vehicle rates</h2>
        <p className="mt-1 text-xs text-slate-500">
          Outstation = max(actual km, min km/day × days) × ₹/km + driver allowance per day + night halts. Local = package per day ({`hrs/km`} as set) + extras.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="text-left text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="pb-2">Vehicle</th>
                <th className="pb-2">Example / seats</th>
                {vehicleCols.map(([, label]) => (
                  <th key={label} className="pb-2">{label}</th>
                ))}
                <th className="pb-2">Active</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {vehicles.map((v) => (
                <tr key={v.id} className="border-t border-slate-100">
                  <td className="py-2 pr-2 font-medium whitespace-nowrap">{v.name}</td>
                  <td className="py-2 pr-2">
                    <input name={`v_${v.id}_example`} defaultValue={v.example} className="input mb-1 min-w-48" aria-label={`${v.name} example`} />
                    <input name={`v_${v.id}_seats`} type="number" min={1} defaultValue={v.seats} className="input w-20" aria-label={`${v.name} seats`} />
                  </td>
                  {vehicleCols.map(([key, label]) => (
                    <td key={key} className="py-2 pr-2">
                      <input name={`v_${v.id}_${key}`} type="number" min={0} defaultValue={v[key]} className="input w-24" aria-label={`${v.name} ${label}`} />
                    </td>
                  ))}
                  <td className="py-4">
                    <input type="checkbox" name={`v_${v.id}_active`} defaultChecked={v.active} className="h-4 w-4" aria-label={`${v.name} active`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Hotel rates</h2>
        <p className="mt-1 text-xs text-slate-500">Per room per night on double occupancy with breakfast. Dinner (MAP) is per person per night.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {hotels.map((h) => (
            <div key={h.id} className="space-y-3 rounded-lg border border-slate-200 p-4">
              <h3 className="font-medium">{h.name}</h3>
              <label className="block"><span className="label">Description</span><input name={`h_${h.id}_description`} defaultValue={h.description} className="input" /></label>
              <label className="block"><span className="label">₹ per room-night</span><input name={`h_${h.id}_perRoomNight`} type="number" min={0} defaultValue={h.perRoomNight} className="input" /></label>
              <label className="block"><span className="label">Dinner ₹ per person-night</span><input name={`h_${h.id}_mealsPerPerson`} type="number" min={0} defaultValue={h.mealsPerPerson} className="input" /></label>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-3">
        <h2 className="font-semibold text-slate-900 sm:col-span-3">Quote defaults</h2>
        <label className="block"><span className="label">Service charge label</span><input name="markupLabel" defaultValue={settings.markupLabel} className="input" /></label>
        <label className="block"><span className="label">Service charge %</span><input name="markupPct" type="number" step="0.5" min={0} defaultValue={settings.markupPct} className="input" /></label>
        <label className="block"><span className="label">Peak-season hotel surcharge %</span><input name="peakSurchargePct" type="number" min={0} defaultValue={settings.peakSurchargePct} className="input" /></label>
        <label className="block"><span className="label">Tax label</span><input name="gstLabel" defaultValue={settings.gstLabel} className="input" /></label>
        <label className="block">
          <span className="label">GST %</span>
          <input name="gstPct" type="number" step="0.5" min={0} defaultValue={settings.gstPct} className="input" />
          <span className="mt-1 block text-xs text-slate-500">5% (tour operator / cab, without ITC) is common — confirm with your CA.</span>
        </label>
        <label className="block"><span className="label">Advance to confirm %</span><input name="advancePct" type="number" min={0} max={100} defaultValue={settings.advancePct} className="input" /></label>
        <label className="block"><span className="label">Quote valid for (days)</span><input name="validityDays" type="number" min={1} max={90} defaultValue={settings.validityDays} className="input" /></label>
        <label className="block sm:col-span-3"><span className="label">Default terms (one per line)</span><textarea name="terms" rows={7} defaultValue={settings.terms} className="input" /></label>
      </section>

      <button className="btn-primary">Save rate card</button>
    </form>
  );
}
