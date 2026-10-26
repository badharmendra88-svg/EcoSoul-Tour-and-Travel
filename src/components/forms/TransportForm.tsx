"use client";

import { useState, useSyncExternalStore } from "react";
import { serviceTypes, vehicleCategories, type ServiceType } from "@/config/options";
import { BookingSteps } from "../BookingSteps";
import { WhatsAppButton } from "../ContactButtons";
import {
  ConsentField,
  ContactFields,
  Field,
  FormAlert,
  Honeypot,
  SuccessPanel,
  inputProps,
  todayISO,
  useEnquirySubmit,
  type Errors,
} from "./shared";

// Blueprint §24.4 — car / taxi / driver booking request form.

export function TransportForm({
  defaultService = "CAR_DRIVER",
  lockService = false,
  initialPickup = "",
  initialDrop = "",
  travellingFrom = "",
}: {
  defaultService?: ServiceType;
  lockService?: boolean;
  initialPickup?: string;
  initialDrop?: string;
  travellingFrom?: string;
}) {
  const { errors, setErrors, status, formError, ref, submit } = useEnquirySubmit();
  const [v, setV] = useState({
    serviceType: defaultService as string,
    pickup: initialPickup,
    drop: initialDrop,
    travelDate: "",
    pickupTime: "",
    returnDate: "",
    adults: "2",
    luggage: "",
    vehicleCategory: "",
    fareType: "FIXED_QUOTE",
    arrivalRef: "",
    tripDays: "",
    transmission: "",
    message: "",
    name: "",
    phone: "",
    email: "",
    heardFrom: "",
    travellingFrom,
    consent: false,
    website: "",
  });
  const set = (key: string, value: unknown) => setV((prev) => ({ ...prev, [key]: value }));

  // Prefill from links like ?pickup=Haldwani&drop=Nainital (popular routes) and the
  // fare estimator's "Book this" (?vehicle=SUV&service=CAR_DRIVER&days=3). Applied once when
  // the URL is known (server render sees ""), adjusting state during render instead of in an effect.
  const search = useSyncExternalStore(noSubscribe, () => window.location.search, () => "");
  const [appliedSearch, setAppliedSearch] = useState("");
  if (search !== appliedSearch) {
    setAppliedSearch(search);
    const q = new URLSearchParams(search);
    const pickup = q.get("pickup")?.slice(0, 120);
    const drop = q.get("drop")?.slice(0, 120);
    const vehicle = q.get("vehicle");
    const service = q.get("service");
    const days = Number(q.get("days"));
    setV((prev) => ({
      ...prev,
      pickup: pickup ?? prev.pickup,
      drop: drop ?? prev.drop,
      vehicleCategory: vehicle && vehicleCategories.some((c) => c.id === vehicle) ? vehicle : prev.vehicleCategory,
      serviceType: !lockService && service && service in serviceTypes ? service : prev.serviceType,
      tripDays: days >= 1 && days <= 60 ? String(days) : prev.tripDays,
    }));
  }

  const st = v.serviceType as ServiceType;
  const needsDrop = st !== "LOCAL" && st !== "DRIVER_ONLY";
  const isRoundTrip = st === "ROUND_TRIP" || st === "CAR_DRIVER" || st === "GROUP";
  const isArrival = st === "AIRPORT_RAIL";
  const isDriverOnly = st === "DRIVER_ONLY";
  const asksDays = st === "CAR_DRIVER" || st === "LOCAL" || st === "DRIVER_ONLY" || st === "GROUP";

  const travellers = Number(v.adults) || 0;
  const selectedVehicle = vehicleCategories.find((c) => c.id === v.vehicleCategory);
  // TR-03: warn when requested capacity may not fit the chosen category
  const capacityWarning =
    selectedVehicle && travellers > selectedVehicle.seats
      ? `A ${selectedVehicle.name} typically seats up to ${selectedVehicle.seats}. We'll suggest a larger vehicle or two vehicles.`
      : "";

  function validate() {
    const e: Errors = {};
    if (v.pickup.trim().length < 2) e.pickup = isDriverOnly ? "Please enter where the driver should report" : "Please enter the pickup point";
    if (needsDrop && v.drop.trim().length < 2) e.drop = "Please enter the drop point / destination";
    if (!v.travelDate) e.travelDate = "Please choose a date";
    else if (v.travelDate < todayISO()) e.travelDate = "Date cannot be in the past";
    if (st === "ROUND_TRIP" && !v.returnDate) e.returnDate = "Please choose a return date";
    if (v.returnDate && v.travelDate && v.returnDate < v.travelDate) e.returnDate = "Return date must be after the travel date";
    if (!(travellers >= 1)) e.adults = "At least 1 traveller";
    if (asksDays && v.tripDays && !(Number(v.tripDays) >= 1)) e.tripDays = "At least 1 day";
    if (v.name.trim().length < 2) e.name = "Please enter your name";
    if (!v.phone.trim() && !v.email.trim()) e.phone = "Please share a phone number or email so we can reply";
    if (!v.consent) e.consent = "Please accept the privacy notice and booking terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    await submit(
      {
        kind: "TRANSPORT",
        ...v,
        drop: needsDrop ? v.drop : "",
        returnDate: isRoundTrip ? v.returnDate : "",
        arrivalRef: isArrival ? v.arrivalRef : "",
        tripDays: asksDays ? v.tripDays : "",
        transmission: isDriverOnly ? v.transmission : "",
        adults: travellers,
      },
      { enquiry_type: "transport", service_type: v.serviceType },
    );
  }

  if (status === "success") {
    return (
      <SuccessPanel refId={ref}>
        <BookingSteps current={0} className="w-full" />
        <WhatsAppButton label="Follow up on WhatsApp" message={`Hi EcoSoul, I just sent transport request ${ref}.`} />
      </SuccessPanel>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-6">
      <Honeypot value={v.website} onChange={(x) => set("website", x)} />

      {!lockService && (
        <Field id="serviceType" label="What do you need?" required>
          <select {...inputProps("serviceType", errors.serviceType)} value={v.serviceType} onChange={(e) => set("serviceType", e.target.value)}>
            {Object.entries(serviceTypes).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="pickup"
          label={isDriverOnly ? "Reporting location" : isArrival ? "Pickup (airport / station)" : "Pickup point"}
          error={errors.pickup}
          hint={isArrival ? "e.g. Pantnagar Airport, Kathgodam Station, Dehradun Airport" : "Landmark or area"}
          required
        >
          <input {...inputProps("pickup", errors.pickup)} value={v.pickup} onChange={(e) => set("pickup", e.target.value)} />
        </Field>
        {needsDrop ? (
          <Field id="drop" label={isArrival ? "Drop address / hotel" : "Destination / route"} error={errors.drop} required>
            <input {...inputProps("drop", errors.drop)} value={v.drop} onChange={(e) => set("drop", e.target.value)} />
          </Field>
        ) : (
          <Field id="drop" label={isDriverOnly ? "Route / places to visit" : "Places you'd like to cover"}>
            <input {...inputProps("drop")} value={v.drop} onChange={(e) => set("drop", e.target.value)} />
          </Field>
        )}
        <Field id="travelDate" label="Travel date" error={errors.travelDate} required>
          <input
            {...inputProps("travelDate", errors.travelDate)}
            type="date"
            min={todayISO()}
            value={v.travelDate}
            onChange={(e) => set("travelDate", e.target.value)}
          />
        </Field>
        <Field id="pickupTime" label={isArrival ? "Arrival time" : "Pickup time"}>
          <input {...inputProps("pickupTime")} type="time" value={v.pickupTime} onChange={(e) => set("pickupTime", e.target.value)} />
        </Field>
        {isRoundTrip && (
          <Field id="returnDate" label="Return date" error={errors.returnDate} required={st === "ROUND_TRIP"}>
            <input
              {...inputProps("returnDate", errors.returnDate)}
              type="date"
              min={v.travelDate || todayISO()}
              value={v.returnDate}
              onChange={(e) => set("returnDate", e.target.value)}
            />
          </Field>
        )}
        {isArrival && (
          <Field id="arrivalRef" label="Flight / train number (optional)" hint="Helps us track delays">
            <input {...inputProps("arrivalRef")} value={v.arrivalRef} onChange={(e) => set("arrivalRef", e.target.value)} />
          </Field>
        )}
        {asksDays && (
          <Field id="tripDays" label={isDriverOnly ? "Number of days" : "Trip duration (days)"} error={errors.tripDays} hint="Approximate is fine">
            <input {...inputProps("tripDays", errors.tripDays)} type="number" min={1} max={60} inputMode="numeric" value={v.tripDays} onChange={(e) => set("tripDays", e.target.value)} />
          </Field>
        )}
        <Field id="adults" label={isDriverOnly ? "People travelling" : "Travellers"} error={errors.adults} required>
          <input {...inputProps("adults", errors.adults)} type="number" min={1} max={60} value={v.adults} onChange={(e) => set("adults", e.target.value)} />
        </Field>
        {!isDriverOnly && (
          <Field id="luggage" label="Luggage">
            <select {...inputProps("luggage")} value={v.luggage} onChange={(e) => set("luggage", e.target.value)}>
              <option value="">Select</option>
              <option>Light (backpacks / 1 bag each)</option>
              <option>Medium (1–2 suitcases each)</option>
              <option>Heavy (large suitcases)</option>
            </select>
          </Field>
        )}
        {isDriverOnly && (
          <>
            <Field id="vehicleCategory" label="Your vehicle type" hint="So we send a driver experienced with it">
              <select {...inputProps("vehicleCategory")} value={v.vehicleCategory} onChange={(e) => set("vehicleCategory", e.target.value)}>
                <option value="">Select</option>
                <option>Hatchback</option>
                <option>Sedan</option>
                <option>SUV / MUV</option>
                <option>Premium / luxury car</option>
                <option>Tempo traveller / van</option>
                <option>Other</option>
              </select>
            </Field>
            <Field id="transmission" label="Transmission">
              <select {...inputProps("transmission")} value={v.transmission} onChange={(e) => set("transmission", e.target.value)}>
                <option value="">Select</option>
                <option value="MANUAL">Manual</option>
                <option value="AUTOMATIC">Automatic</option>
              </select>
            </Field>
          </>
        )}
        {!isDriverOnly && (
          <div className="sm:col-span-2">
            <Field id="vehicleCategory" label="Vehicle preference (optional)" hint="Final vehicle is the confirmed category or equivalent">
              <select {...inputProps("vehicleCategory")} value={v.vehicleCategory} onChange={(e) => set("vehicleCategory", e.target.value)}>
                <option value="">Suggest a suitable vehicle</option>
                {vehicleCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — typically up to {c.seats} passengers
                  </option>
                ))}
              </select>
            </Field>
            {capacityWarning && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
                {capacityWarning}
              </p>
            )}
          </div>
        )}
        <div className="sm:col-span-2">
          <Field id="fareType" label="Quote type">
            <select {...inputProps("fareType")} value={v.fareType} onChange={(e) => set("fareType", e.target.value)}>
              <option value="FIXED_QUOTE">Fixed itemised quote</option>
              <option value="ESTIMATE">Rough estimate first</option>
            </select>
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field id="message" label="Stops, night halts or special requests" hint="Child seat, accessibility needs, specific stops…">
            <textarea {...inputProps("message")} rows={3} maxLength={1500} value={v.message} onChange={(e) => set("message", e.target.value)} />
          </Field>
        </div>
      </div>

      <ContactFields values={v} set={set} errors={errors} />
      <ConsentField checked={v.consent} onChange={(c) => set("consent", c)} error={errors.consent} />
      <FormAlert message={formError} />

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : isDriverOnly ? "Request a Driver" : "Get Taxi Quote"}
        </button>
        <p className="text-xs text-slate-500">This is a request — availability and fare are confirmed by our team.</p>
      </div>
    </form>
  );
}

/** The URL doesn't change while the form is on screen, so there is nothing to subscribe to. */
function noSubscribe() {
  return () => {};
}
