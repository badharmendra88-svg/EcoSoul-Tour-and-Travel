"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { destinationsFrom, estimatorPlaces, placeById, routeBetween } from "@/config/journeys";
import { whatsappLink } from "@/config/site";
import { track } from "@/lib/analytics";
import { estimateFares, suggestedDays, type EstimatorRates, type TripKind } from "@/lib/fare-estimate";
import { rupees } from "@/lib/quote";
import { useSiteSettings } from "./SiteSettingsProvider";

const groups: { label: string; kinds: string[] }[] = [
  { label: "Start from your city", kinds: ["city"] },
  { label: "Airports & railway stations", kinds: ["hub"] },
  { label: "Hill stations & pilgrim towns", kinds: ["destination"] },
];

/**
 * Instant taxi fare range from the live rate card. `compact` is the homepage
 * widget (3 cars + link to the full list); the full version lists every car.
 */
export function FareEstimator({
  rates,
  defaultFrom = "delhi",
  defaultTo = "nainital",
  compact = false,
  readUrl = false,
  idPrefix = "fare",
}: {
  rates: EstimatorRates;
  defaultFrom?: string;
  defaultTo?: string;
  compact?: boolean;
  /** Take ?from=&to= from the URL (taxi page, linked from the homepage widget). */
  readUrl?: boolean;
  idPrefix?: string;
}) {
  const s = useSiteSettings();
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [kind, setKind] = useState<TripKind>("ONE_WAY");
  const [days, setDays] = useState<number | null>(null);

  // Apply ?from=&to= once when the URL is known (server render sees ""), adjusting state during
  // render — React's recommended alternative to setting state in an effect.
  const search = useSyncExternalStore(noSubscribe, () => (readUrl ? window.location.search : ""), () => "");
  const [appliedSearch, setAppliedSearch] = useState("");
  if (search !== appliedSearch) {
    setAppliedSearch(search);
    const q = new URLSearchParams(search);
    const f = q.get("from");
    const t = q.get("to");
    if (f && placeById(f)) setFrom(f);
    if (t && placeById(t)) setTo(t);
  }

  const options = useMemo(() => destinationsFrom(from), [from]);
  // Keep the destination valid when the starting point changes
  const toId = options.some((o) => o.to === to) ? to : options[0]?.to ?? "";
  const route = routeBetween(from, toId);
  const tripDays = days ?? (route ? suggestedDays(route.km) : 1);
  const fares = useMemo(() => (route ? estimateFares(route.km, kind, tripDays, rates) : []), [route, kind, tripDays, rates]);

  const fromName = placeById(from)?.name ?? "";
  const toName = placeById(toId)?.name ?? "";
  const shown = compact ? fares.filter((f) => ["SEDAN", "SUV", "TEMPO"].includes(f.vehicleId)).slice(0, 3) : fares;
  const vehicle = (id: string) => rates.vehicles.find((v) => v.id === id);

  function bookHref(vehicleId: string) {
    const q = new URLSearchParams({
      pickup: fromName,
      drop: toName,
      vehicle: vehicleId,
      // Multi-day round trips map to "Car + driver (outstation)", which asks for the number of days
      service: kind === "ONE_WAY" ? "ONE_WAY" : "CAR_DRIVER",
      ...(kind === "ROUND_TRIP" ? { days: String(tripDays) } : {}),
    });
    return `/uttarakhand/taxi-booking/?${q}#book`;
  }

  const waMessage = `Hi EcoSoul, please share the exact taxi fare: ${fromName} → ${toName}, ${kind === "ONE_WAY" ? "one way" : `round trip, ${tripDays} day${tripDays > 1 ? "s" : ""}`}. Date: ___ Travellers: ___`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2 sm:gap-3">
        <div>
          <label htmlFor={`${idPrefix}-from`} className="label">From</label>
          <select
            id={`${idPrefix}-from`}
            className="input"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setDays(null);
            }}
          >
            {groups.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {estimatorPlaces
                  .filter((p) => g.kinds.includes(p.kind))
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="mb-1 flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-forest-700 hover:bg-forest-50 sm:mb-0.5 sm:h-10 sm:w-10"
          aria-label="Swap from and to"
          onClick={() => {
            if (!toId) return;
            setFrom(toId);
            setTo(from);
            setDays(null);
          }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M7 16h13M17 20l3-4-3-4M17 8H4M7 4 4 8l3 4" />
          </svg>
        </button>
        <div>
          <label htmlFor={`${idPrefix}-to`} className="label">To</label>
          <select
            id={`${idPrefix}-to`}
            className="input"
            value={toId}
            onChange={(e) => {
              setTo(e.target.value);
              setDays(null);
            }}
          >
            {options.map((o) => (
              <option key={o.to} value={o.to}>{o.place.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div role="radiogroup" aria-label="Trip type" className="inline-flex rounded-full bg-slate-100 p-1">
          {(["ONE_WAY", "ROUND_TRIP"] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={kind === k}
              onClick={() => setKind(k)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${kind === k ? "bg-white text-forest-800 shadow-sm" : "text-slate-600 hover:text-forest-800"}`}
            >
              {k === "ONE_WAY" ? "One way" : "Round trip"}
            </button>
          ))}
        </div>
        {kind === "ROUND_TRIP" && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600" id={`${idPrefix}-days-label`}>Days</span>
            <div className="inline-flex items-center rounded-full border border-slate-300 bg-white" role="group" aria-labelledby={`${idPrefix}-days-label`}>
              <button type="button" className="h-9 w-9 rounded-full text-lg text-forest-700 disabled:opacity-40" onClick={() => setDays(Math.max(1, tripDays - 1))} disabled={tripDays <= 1} aria-label="One day less">−</button>
              <span className="w-6 text-center font-semibold text-forest-900" aria-live="polite">{tripDays}</span>
              <button type="button" className="h-9 w-9 rounded-full text-lg text-forest-700 disabled:opacity-40" onClick={() => setDays(Math.min(15, tripDays + 1))} disabled={tripDays >= 15} aria-label="One day more">+</button>
            </div>
          </div>
        )}
        {route && (
          <p className="text-sm text-slate-600 sm:ml-auto">
            ≈ <strong className="text-forest-900">{route.km} km</strong> · {route.time} drive
          </p>
        )}
      </div>

      {route ? (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white" aria-live="polite">
          {shown.map((f) => {
            const v = vehicle(f.vehicleId);
            if (!v) return null;
            return (
              <li key={f.vehicleId} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700" aria-hidden="true">
                  <CarIcon big={v.seats > 6} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-forest-900">{v.name}</p>
                  <p className="truncate text-xs text-slate-500">{v.example} · up to {v.seats} seats</p>
                </div>
                <div className="text-right">
                  <p className="font-bold whitespace-nowrap text-forest-900">{rupees(f.low)}<span className="font-medium text-slate-400">–{rupees(f.high).slice(1)}</span></p>
                  <Link
                    href={bookHref(f.vehicleId)}
                    onClick={() => track("fare_estimate", { from, to: toId, kind, vehicle: f.vehicleId })}
                    className="text-sm font-semibold text-forest-700 underline-offset-2 hover:underline"
                  >
                    Book this →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Choose a route to see an estimate.</p>
      )}

      <p className="text-xs leading-relaxed text-slate-500">
        Approximate total for the vehicle, fuel, driver allowance{kind === "ROUND_TRIP" ? ", night halts" : ""}, service charges and GST. Tolls, parking
        and state entry tax are extra. Your written quote confirms the exact fare before you pay anything.
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {compact && route && (
          <Link href={`/uttarakhand/taxi-booking/?from=${from}&to=${toId}#fare`} className="text-sm font-semibold text-forest-700 hover:underline">
            See all cars & book →
          </Link>
        )}
        <a
          href={whatsappLink(s.whatsapp, waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("click_whatsapp", { source: "fare_estimate" })}
          className="text-sm font-semibold text-forest-700 hover:underline"
        >
          Get the exact fare on WhatsApp →
        </a>
      </div>
    </div>
  );
}

function CarIcon({ big }: { big: boolean }) {
  return big ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 16V7a2 2 0 0 1 2-2h11l4 5v6a1 1 0 0 1-1 1h-1M3 16a1 1 0 0 0 1 1h1m4 0h6M3 11h17M8 5v6M13 5v6" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 17H3v-5l2-5h11l3 5h2v5h-2M9 17h6M5 12h15" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

/** The URL doesn't change while the estimator is on screen, so there is nothing to subscribe to. */
function noSubscribe() {
  return () => {};
}
