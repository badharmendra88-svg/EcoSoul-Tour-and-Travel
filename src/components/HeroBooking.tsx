"use client";

import { useState } from "react";
import type { EstimatorRates } from "@/lib/fare-estimate";
import { FareEstimator } from "./FareEstimator";

const tabs = [
  { id: "taxi", label: "Taxi fare", icon: "M5 17H3v-5l2-5h11l3 5h2v5h-2M9 17h6M5 12h15" },
  { id: "trip", label: "Tour / custom trip", icon: "m3 20 6-11 4 6 3-4 5 9H3Z" },
] as const;

/** Homepage booking widget: instant taxi fare or a 4-field trip enquiry (plain GET form, works without JS). */
export function HeroBooking({ rates, destinations, tripTypes }: { rates: EstimatorRates; destinations: string[]; tripTypes: string[] }) {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("taxi");
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
      <div role="tablist" aria-label="What do you need?" className="grid grid-cols-2 border-b border-slate-200 bg-slate-50">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`hero-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`hero-panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`flex items-center justify-center gap-2 px-3 py-3.5 text-sm font-semibold transition-colors ${
              tab === t.id ? "bg-white text-forest-800 shadow-[inset_0_-3px_0_var(--color-accent)]" : "text-slate-500 hover:text-forest-800"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d={t.icon} />
            </svg>
            {t.label}
          </button>
        ))}
      </div>

      <div id="hero-panel-taxi" role="tabpanel" aria-labelledby="hero-tab-taxi" hidden={tab !== "taxi"} className="p-5 sm:p-6">
        <FareEstimator rates={rates} compact idPrefix="hero" />
      </div>

      <form id="hero-panel-trip" role="tabpanel" aria-labelledby="hero-tab-trip" hidden={tab !== "trip"} action="/customise-my-trip/" method="get" className="p-5 sm:p-6">
        <p className="text-sm text-slate-600">Four details to start — we&apos;ll send a day-wise plan and an itemised quote.</p>
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor="q-destination" className="label">Destination</label>
            <select id="q-destination" name="destination" className="input" defaultValue="">
              <option value="">Not sure yet — suggest one</option>
              {destinations.map((d) => (
                <option key={d}>{d}</option>
              ))}
              <option>Char Dham Yatra</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="q-date" className="label">Travel date</label>
              <input id="q-date" name="date" type="date" className="input" />
            </div>
            <div>
              <label htmlFor="q-adults" className="label">Travellers</label>
              <input id="q-adults" name="adults" type="number" min={1} max={60} defaultValue={2} className="input" />
            </div>
          </div>
          <div>
            <label htmlFor="q-type" className="label">Trip type</label>
            <select id="q-type" name="interest" className="input" defaultValue="">
              <option value="">Any</option>
              {tripTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary w-full py-3">Continue</button>
        </div>
      </form>
    </div>
  );
}
