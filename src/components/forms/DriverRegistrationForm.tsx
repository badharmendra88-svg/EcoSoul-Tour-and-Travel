"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  availabilityOptions,
  commercialPermitOptions,
  driverLanguages,
  driverServiceAreas,
  licenceTypes,
  partnerTypes,
} from "@/config/drivers";
import { heardFromOptions, vehicleCategories } from "@/config/options";
import { track } from "@/lib/analytics";
import { WhatsAppButton } from "../ContactButtons";
import { Field, FormAlert, Honeypot, SUBMIT_TIMEOUT_MS, inputProps, networkErrorMessage, todayISO, type Errors } from "./shared";

type Values = Record<string, string | boolean | string[]>;

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 border-t border-slate-100 pt-6 first:border-0 first:pt-0">
      <legend className="mb-4 flex items-center gap-3 text-lg font-semibold text-forest-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-700 text-sm font-bold text-white">{n}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function ChipGroup({ name, options, values, onToggle, error }: { name: string; options: string[]; values: string[]; onToggle: (v: string) => void; error?: string }) {
  return (
    <div role="group" aria-labelledby={`${name}-label`} aria-describedby={error ? `${name}-error` : undefined} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = values.includes(o);
        return (
          <label
            key={o}
            className={`flex min-h-10 cursor-pointer items-center rounded-full border px-3.5 py-2 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-strong ${
              on ? "border-forest-700 bg-forest-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-forest-500"
            }`}
          >
            <input type="checkbox" className="sr-only" checked={on} onChange={() => onToggle(o)} />
            {on && <span aria-hidden="true" className="mr-1.5">✓</span>}
            {o}
          </label>
        );
      })}
    </div>
  );
}

export function DriverRegistrationForm() {
  const [v, setV] = useState<Values>({
    name: "",
    phone: "",
    email: "",
    baseLocation: "",
    serviceAreas: [] as string[],
    experienceYears: "",
    hillExperienceYears: "",
    languages: ["Hindi"],
    licenceType: "",
    licenceNumber: "",
    licenceExpiry: "",
    partnerType: "",
    vehicleCategory: "",
    vehicleModel: "",
    vehicleRegNo: "",
    vehicleSeats: "",
    commercialPermit: "",
    availability: "",
    expectedDailyRate: "",
    message: "",
    heardFrom: "",
    consent: false,
    website: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  // State updates are async, so rapid repeat clicks need a synchronous guard
  const inFlight = useRef(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [formError, setFormError] = useState("");
  const [result, setResult] = useState<{ ref?: string; duplicate?: boolean } | null>(null);

  const set = (k: string, val: Values[string]) => setV((p) => ({ ...p, [k]: val }));
  const toggle = (k: string, item: string) =>
    setV((p) => {
      const list = p[k] as string[];
      return { ...p, [k]: list.includes(item) ? list.filter((x) => x !== item) : [...list, item] };
    });
  const str = (k: string) => v[k] as string;
  const withVehicle = v.partnerType === "WITH_VEHICLE";

  function validate() {
    const e: Errors = {};
    if (str("name").trim().length < 2) e.name = "Please enter your full name";
    if (!/^\+?[0-9\s-]{10,16}$/.test(str("phone").trim())) e.phone = "Please enter a valid mobile number";
    if (str("baseLocation").trim().length < 2) e.baseLocation = "Where are you based?";
    if ((v.serviceAreas as string[]).length === 0) e.serviceAreas = "Choose at least one area";
    if (str("experienceYears") === "") e.experienceYears = "Enter years of experience";
    if (!str("licenceType")) e.licenceType = "Choose your licence type";
    if (str("licenceNumber").replace(/[\s-]/g, "").length < 10) e.licenceNumber = "Enter the licence number as printed";
    if (!str("licenceExpiry")) e.licenceExpiry = "Choose the licence valid-till date";
    else if (str("licenceExpiry") < todayISO()) e.licenceExpiry = "Licence must be valid today";
    if (!str("partnerType")) e.partnerType = "Choose how you'd like to partner";
    if (withVehicle) {
      if (!str("vehicleCategory")) e.vehicleCategory = "Choose your vehicle type";
      if (str("vehicleRegNo").trim().length < 6) e.vehicleRegNo = "Enter the registration number";
      if (!str("commercialPermit")) e.commercialPermit = "Tell us about the vehicle permit";
    }
    if (!str("availability")) e.availability = "Choose your availability";
    if (!v.consent) e.consent = "Please accept the privacy notice and verification terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (inFlight.current) return;
    if (!validate()) {
      setFormError("Please check the highlighted fields.");
      return;
    }
    inFlight.current = true;
    setStatus("submitting");
    setFormError("");
    try {
      const res = await fetch("/api/driver-applications/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
        signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setResult({ ref: data.ref, duplicate: data.duplicate });
        setStatus("done");
        track("submit_enquiry", { enquiry_type: "driver_registration" });
        return;
      }
      if (data.errors) setErrors(data.errors);
      setFormError(data.error || "Please check the highlighted fields.");
    } catch (err) {
      setFormError(networkErrorMessage(err));
    } finally {
      inFlight.current = false;
    }
    setStatus("idle");
  }

  if (status === "done" && result) {
    return (
      <div role="status" className="rounded-2xl border border-forest-200 bg-forest-50 p-6 text-center sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest-700 text-2xl text-white" aria-hidden="true">✓</div>
        <h2 className="mt-4 text-xl font-semibold text-forest-900">
          {result.duplicate ? "You're already registered with us" : "Thank you — your registration is received"}
        </h2>
        <p className="mt-2 text-slate-700">
          {result.ref ? (
            <>Your registration ID is <strong className="font-mono">{result.ref}</strong>. </>
          ) : (
            <>Your earlier registration with this mobile number is still open. </>
          )}
          Our team will call you to arrange document verification. Registration doesn&apos;t guarantee trips — you&apos;ll become an
          active partner after verification.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <WhatsAppButton
            label="Message us on WhatsApp"
            message={result.ref ? `Hi EcoSoul, I registered as a driver partner (${result.ref}).` : "Hi EcoSoul, I registered as a driver partner earlier."}
          />
        </div>
      </div>
    );
  }

  const ip = (k: string) => inputProps(k, errors[k]);

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-8">
      <Honeypot value={str("website")} onChange={(x) => set("website", x)} />

      <Section n={1} title="About you">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="name" label="Full name (as on driving licence)" error={errors.name} required>
              <input {...ip("name")} autoComplete="name" value={str("name")} onChange={(e) => set("name", e.target.value)} />
            </Field>
          </div>
          <Field id="phone" label="Mobile / WhatsApp number" error={errors.phone} required>
            <input {...ip("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 98xxxxxxxx" value={str("phone")} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field id="email" label="Email (optional)" error={errors.email}>
            <input {...ip("email")} type="email" autoComplete="email" value={str("email")} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field id="baseLocation" label="Where are you based?" error={errors.baseLocation} hint="Town or city, e.g. Haldwani, Dehradun, Rishikesh" required>
              <input {...ip("baseLocation")} value={str("baseLocation")} onChange={(e) => set("baseLocation", e.target.value)} />
            </Field>
          </div>
        </div>
        <div>
          <p id="serviceAreas-label" className="label">Areas you can drive in <span className="text-red-700">*</span></p>
          <ChipGroup name="serviceAreas" options={driverServiceAreas} values={v.serviceAreas as string[]} onToggle={(o) => toggle("serviceAreas", o)} error={errors.serviceAreas} />
          {errors.serviceAreas && <p id="serviceAreas-error" className="field-error" role="alert">{errors.serviceAreas}</p>}
        </div>
        <div>
          <p id="languages-label" className="label">Languages you speak</p>
          <ChipGroup name="languages" options={driverLanguages} values={v.languages as string[]} onToggle={(o) => toggle("languages", o)} />
        </div>
      </Section>

      <Section n={2} title="Licence & experience">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="experienceYears" label="Years of driving experience" error={errors.experienceYears} required>
            <input {...ip("experienceYears")} type="number" inputMode="numeric" min={0} max={50} value={str("experienceYears")} onChange={(e) => set("experienceYears", e.target.value)} />
          </Field>
          <Field id="hillExperienceYears" label="Years of hill / mountain driving" error={errors.hillExperienceYears}>
            <input {...ip("hillExperienceYears")} type="number" inputMode="numeric" min={0} max={50} value={str("hillExperienceYears")} onChange={(e) => set("hillExperienceYears", e.target.value)} />
          </Field>
          <Field id="licenceType" label="Licence type" error={errors.licenceType} required>
            <select {...ip("licenceType")} value={str("licenceType")} onChange={(e) => set("licenceType", e.target.value)}>
              <option value="">Select</option>
              {Object.entries(licenceTypes).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
          <Field id="licenceExpiry" label="Licence valid till" error={errors.licenceExpiry} required>
            <input {...ip("licenceExpiry")} type="date" min={todayISO()} value={str("licenceExpiry")} onChange={(e) => set("licenceExpiry", e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field id="licenceNumber" label="Driving licence number" error={errors.licenceNumber} hint="Stored encrypted and used only for verification — never shown publicly." required>
              <input {...ip("licenceNumber")} autoComplete="off" placeholder="e.g. UK07 20190012345" value={str("licenceNumber")} onChange={(e) => set("licenceNumber", e.target.value)} />
            </Field>
          </div>
        </div>
      </Section>

      <Section n={3} title="Vehicle">
        <Field id="partnerType" label="How would you like to partner with us?" error={errors.partnerType} required>
          <select {...ip("partnerType")} value={str("partnerType")} onChange={(e) => set("partnerType", e.target.value)}>
            <option value="">Select</option>
            {Object.entries(partnerTypes).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Field>
        {withVehicle && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="vehicleCategory" label="Vehicle type" error={errors.vehicleCategory} required>
              <select {...ip("vehicleCategory")} value={str("vehicleCategory")} onChange={(e) => set("vehicleCategory", e.target.value)}>
                <option value="">Select</option>
                {vehicleCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field id="vehicleModel" label="Make & model" hint="e.g. Toyota Innova Crysta">
              <input {...ip("vehicleModel")} value={str("vehicleModel")} onChange={(e) => set("vehicleModel", e.target.value)} />
            </Field>
            <Field id="vehicleRegNo" label="Registration number" error={errors.vehicleRegNo} required>
              <input {...ip("vehicleRegNo")} autoComplete="off" placeholder="e.g. UK 04 TA 1234" value={str("vehicleRegNo")} onChange={(e) => set("vehicleRegNo", e.target.value)} />
            </Field>
            <Field id="vehicleSeats" label="Passenger seats">
              <input {...ip("vehicleSeats")} type="number" inputMode="numeric" min={2} max={30} value={str("vehicleSeats")} onChange={(e) => set("vehicleSeats", e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field id="commercialPermit" label="Commercial (taxi) permit" error={errors.commercialPermit} required>
                <select {...ip("commercialPermit")} value={str("commercialPermit")} onChange={(e) => set("commercialPermit", e.target.value)}>
                  <option value="">Select</option>
                  {Object.entries(commercialPermitOptions).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </Field>
            </div>
          </div>
        )}
      </Section>

      <Section n={4} title="Availability">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="availability" label="When can you drive?" error={errors.availability} required>
            <select {...ip("availability")} value={str("availability")} onChange={(e) => set("availability", e.target.value)}>
              <option value="">Select</option>
              {Object.entries(availabilityOptions).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
          <Field id="expectedDailyRate" label="Expected daily charge (₹, optional)" hint={withVehicle ? "For vehicle + driver, per day" : "For driver only, per day"}>
            <input {...ip("expectedDailyRate")} type="number" inputMode="numeric" min={0} value={str("expectedDailyRate")} onChange={(e) => set("expectedDailyRate", e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field id="message" label="Anything else? (optional)" hint="Routes you know well, Char Dham experience, preferred timings…">
              <textarea {...ip("message")} rows={3} maxLength={1000} value={str("message")} onChange={(e) => set("message", e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field id="heardFrom" label="How did you hear about us? (optional)">
              <select {...ip("heardFrom")} value={str("heardFrom")} onChange={(e) => set("heardFrom", e.target.value)}>
                <option value="">Select</option>
                {heardFromOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </Section>

      <div>
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 accent-forest-700"
            checked={v.consent as boolean}
            onChange={(e) => set("consent", e.target.checked)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "consent-error" : undefined}
          />
          <span>
            I confirm these details are correct. I agree that EcoSoul may contact me, verify my licence, identity, police verification
            and vehicle documents in person, and store my details as described in the{" "}
            <Link href="/privacy-policy/" target="_blank" className="font-medium text-forest-700 underline">Privacy Policy</Link>.
          </span>
        </label>
        {errors.consent && <p id="consent-error" className="field-error" role="alert">{errors.consent}</p>}
      </div>

      <FormAlert message={formError} />
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary px-6 py-3" disabled={status === "submitting"}>
          {status === "submitting" ? "Submitting…" : "Register as a driver partner"}
        </button>
        <p className="text-xs text-slate-500">Free to register. No documents are uploaded online.</p>
      </div>
    </form>
  );
}
