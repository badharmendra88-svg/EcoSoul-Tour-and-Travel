import { requireAdmin } from "@/lib/admin-auth";
import { formatDateTime } from "@/lib/format";
import { rupees } from "@/lib/quote";
import { getRateCard } from "@/lib/rates";
import { saveRatesAction } from "../../quote-actions";
import { Icon, PageHeader, Panel } from "../ui";

const outstationFields = [
  ["perKm", "Rate per km", "₹"],
  ["minKmPerDay", "Min km / day", "km"],
  ["driverAllowance", "Driver allowance / day", "₹"],
  ["nightHalt", "Night halt", "₹"],
] as const;

const localFields = [
  ["localPackage", "Package / day", "₹"],
  ["localHours", "Hours", "hrs"],
  ["localKm", "Km", "km"],
  ["extraHour", "Extra hour", "₹"],
  ["extraKm", "Extra km", "₹"],
] as const;

const transferFields = [
  ["oneWayPerKm", "One-way rate per km", "₹"],
  ["transferBase", "Transfer fare", "₹"],
  ["transferKm", "Transfer includes", "km"],
] as const;

const coverage = [
  ["Car + driver (outstation)", "Outstation / round trip", "max(km, min km/day × days) × ₹/km + driver allowance/day + night halts + tolls"],
  ["Round-trip taxi", "Outstation / round trip", "Same as outstation, using total return distance"],
  ["Group / tempo traveller", "Outstation or Local + Tempo Traveller", "Tempo Traveller rates; add vehicles for larger groups"],
  ["One-way transfer", "One-way drop", "max(km, one-way minimum) × one-way ₹/km + driver allowance + late-night charge"],
  ["Airport / railway station transfer", "Airport / railway transfer", "Transfer fare (first N km) + extra km × one-way ₹/km + waiting + late-night"],
  ["Local sightseeing taxi", "Local sightseeing", "Package/day (hrs/km) + extra hours + extra km"],
  ["Driver only (your vehicle)", "Driver only", "Driver/day (local or outstation) + night allowance + overtime + return fare"],
] as const;

function Money({ name, label, unit, value }: { name: string; label: string; unit: string; value: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      <span className="relative block">
        {unit === "₹" && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">₹</span>}
        <input name={name} type="number" min={0} defaultValue={value} className={`admin-input tabular-nums ${unit === "₹" ? "pl-7" : "pr-10"}`} />
        {unit !== "₹" && <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400">{unit}</span>}
      </span>
    </label>
  );
}

export default async function RatesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin("rates.edit");
  const { saved } = await searchParams;
  const { vehicles, hotels, settings } = await getRateCard();
  const lastUpdated = [...vehicles.map((v) => v.updatedAt), ...hotels.map((h) => h.updatedAt), settings.updatedAt].sort((a, b) => +b - +a)[0];

  return (
    <form action={saveRatesAction}>
      <PageHeader
        eyebrow="Pricing"
        title="Rate card"
        subtitle={<>Powers the quote calculator. Defaults reflect typical Uttarakhand market rates — replace with your partners&apos; rates. Updated {formatDateTime(lastUpdated)}.</>}
        actions={<button className="btn-admin-primary"><Icon name="check" /> Save rate card</button>}
      />
      {saved && (
        <p role="status" className="-mt-2 mb-6 flex items-center gap-2 rounded-2xl bg-emerald-50 px-5 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
          <Icon name="check" /> Rate card saved. New quotes use these rates; existing quotes are unchanged.
        </p>
      )}

      <div className="space-y-8">
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Icon name="car" className="h-5 w-5 text-forest-600" /> Vehicles</h2>
              <p className="text-sm text-slate-500">Outstation = max(actual km, min km/day × days) × rate + driver allowance + night halts.</p>
            </div>
          </div>
          <div className="grid gap-5 2xl:grid-cols-2">
            {vehicles.map((v) => (
              <div key={v.id} className={`panel overflow-hidden ${v.active ? "" : "opacity-70"}`}>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-forest-50/70 to-white px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-700 text-white shadow-sm"><Icon name="car" className="h-5 w-5" /></span>
                    <div>
                      <h3 className="font-semibold text-slate-900">{v.name}</h3>
                      <p className="text-xs text-slate-500">{v.seats} seats · from {rupees(v.perKm)}/km · local {rupees(v.localPackage)}/day</p>
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                    <input type="checkbox" name={`v_${v.id}_active`} defaultChecked={v.active} className="peer sr-only" />
                    <span className="relative h-5 w-9 rounded-full bg-slate-300 transition-colors peer-checked:bg-forest-600 peer-focus-visible:ring-2 peer-focus-visible:ring-accent after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
                    Active
                  </label>
                </div>
                <div className="space-y-5 p-5">
                  <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-500">Shown as</span>
                      <input name={`v_${v.id}_example`} defaultValue={v.example} className="admin-input" />
                    </label>
                    <Money name={`v_${v.id}_seats`} label="Seats" unit="pax" value={v.seats} />
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold tracking-wider text-forest-700 uppercase">Outstation</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {outstationFields.map(([key, label, unit]) => (
                        <Money key={key} name={`v_${v.id}_${key}`} label={label} unit={unit} value={v[key]} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold tracking-wider text-forest-700 uppercase">Local package</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                      {localFields.map(([key, label, unit]) => (
                        <Money key={key} name={`v_${v.id}_${key}`} label={label} unit={unit} value={v[key]} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold tracking-wider text-forest-700 uppercase">One-way & airport / railway transfer</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {transferFields.map(([key, label, unit]) => (
                        <Money key={key} name={`v_${v.id}_${key}`} label={label} unit={unit} value={v[key]} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900"><Icon name="hotel" className="h-5 w-5 text-forest-600" /> Hotels</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {hotels.map((h, i) => (
              <div key={h.id} className="panel overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h3 className="font-semibold text-slate-900">{h.name}</h3>
                  <span className="text-amber-500" aria-label={`${i + 2} star level`}>{"★".repeat(i + 2)}</span>
                </div>
                <div className="space-y-3 p-5">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Description</span>
                    <input name={`h_${h.id}_description`} defaultValue={h.description} className="admin-input" />
                  </label>
                  <Money name={`h_${h.id}_perRoomNight`} label="Per room-night (with breakfast)" unit="₹" value={h.perRoomNight} />
                  <Money name={`h_${h.id}_mealsPerPerson`} label="Dinner per person-night" unit="₹" value={h.mealsPerPerson} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <Panel title="Driver only, one-way & transfer rules" icon="user" description="Rates that apply across vehicles">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-[11px] font-semibold tracking-wider text-forest-700 uppercase">Driver only (customer&apos;s vehicle)</p>
              <div className="grid grid-cols-2 gap-3">
                <Money name="driverDayRate" label="Local, per day" unit="₹" value={settings.driverDayRate} />
                <Money name="driverOutstationDayRate" label="Outstation, per day" unit="₹" value={settings.driverOutstationDayRate} />
                <Money name="driverDayHours" label="Hours per day" unit="hrs" value={settings.driverDayHours} />
                <Money name="driverOvertimeHour" label="Overtime per hour" unit="₹" value={settings.driverOvertimeHour} />
                <Money name="driverNightAllowance" label="Night allowance (food & stay)" unit="₹" value={settings.driverNightAllowance} />
              </div>
            </div>
            <div>
              <p className="mb-3 text-[11px] font-semibold tracking-wider text-forest-700 uppercase">One-way & transfers</p>
              <div className="grid grid-cols-2 gap-3">
                <Money name="oneWayMinKm" label="One-way minimum" unit="km" value={settings.oneWayMinKm} />
                <Money name="lateNightCharge" label="Late-night charge (10 pm–6 am)" unit="₹" value={settings.lateNightCharge} />
                <Money name="freeWaitMinutes" label="Free waiting (transfers)" unit="min" value={settings.freeWaitMinutes} />
              </div>
              <p className="mt-3 text-xs text-slate-500">Waiting beyond the free time is charged at each vehicle&apos;s “Extra hour” rate.</p>
            </div>
          </div>
        </Panel>

        <Panel title="Service coverage" icon="check" description="How each transport service on the website is priced by the calculator">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr>
                  <th className="admin-th pl-0">Website service</th>
                  <th className="admin-th">Calculator mode</th>
                  <th className="admin-th">Fare formula</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coverage.map(([service, mode, formula]) => (
                  <tr key={service}>
                    <td className="py-3 pr-4 font-medium text-slate-900"><span className="mr-2 text-emerald-600">✓</span>{service}</td>
                    <td className="px-5 py-3 text-slate-600">{mode}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formula}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Quote defaults" icon="settings" description="Applied to every new quote — can be changed per quote">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block"><span className="admin-label">Service charge label</span><input name="markupLabel" defaultValue={settings.markupLabel} className="admin-input" /></label>
            <label className="block"><span className="admin-label">Service charge %</span><input name="markupPct" type="number" step="0.5" min={0} defaultValue={settings.markupPct} className="admin-input" /></label>
            <label className="block"><span className="admin-label">Tax label</span><input name="gstLabel" defaultValue={settings.gstLabel} className="admin-input" /></label>
            <label className="block">
              <span className="admin-label">GST %</span>
              <input name="gstPct" type="number" step="0.5" min={0} defaultValue={settings.gstPct} className="admin-input" />
              <span className="mt-1 block text-xs text-slate-500">5% without ITC is common — confirm with your CA.</span>
            </label>
            <label className="block"><span className="admin-label">Advance to confirm %</span><input name="advancePct" type="number" min={0} max={100} defaultValue={settings.advancePct} className="admin-input" /></label>
            <label className="block"><span className="admin-label">Quote valid for (days)</span><input name="validityDays" type="number" min={1} max={90} defaultValue={settings.validityDays} className="admin-input" /></label>
            <label className="block"><span className="admin-label">Peak-season hotel surcharge %</span><input name="peakSurchargePct" type="number" min={0} defaultValue={settings.peakSurchargePct} className="admin-input" /></label>
            <label className="block sm:col-span-2 lg:col-span-4"><span className="admin-label">Default terms (one per line)</span><textarea name="terms" rows={7} defaultValue={settings.terms} className="admin-input" /></label>
          </div>
        </Panel>

        <div className="sticky bottom-4 z-10 flex justify-end">
          <button className="btn-admin-primary px-6 py-3 shadow-xl shadow-forest-900/25"><Icon name="check" /> Save rate card</button>
        </div>
      </div>
    </form>
  );
}
