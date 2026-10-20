"use client";

import { useState } from "react";
import { budgetBands, interests as interestOptions } from "@/config/options";
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

type Props = {
  /** "custom" = 3-step Customise My Trip; "package" = compact form on a package page */
  mode: "custom" | "package";
  packageSlug?: string;
  packageTitle?: string;
  destinations?: string[];
  initial?: { destination?: string; travelDate?: string; adults?: string; interest?: string };
};

const STEPS = ["Your trip", "Preferences", "Contact"];

export function TripEnquiryForm({ mode, packageSlug, packageTitle, destinations = [], initial = {} }: Props) {
  const { errors, setErrors, status, formError, ref, submit } = useEnquirySubmit();
  const [step, setStep] = useState(0);
  const [v, setV] = useState({
    destination: initial.destination ?? "",
    travelDate: initial.travelDate ?? "",
    dateFlexible: false,
    adults: initial.adults ?? "2",
    children: "0",
    interests: initial.interest ? [initial.interest] : ([] as string[]),
    budgetBand: "",
    message: "",
    name: "",
    phone: "",
    email: "",
    heardFrom: "",
    consent: false,
    website: "",
  });
  const set = (key: string, value: unknown) => setV((prev) => ({ ...prev, [key]: value }));

  const multiStep = mode === "custom";

  function validateStep(i: number): boolean {
    const e: Errors = {};
    if (i === 0 || !multiStep) {
      if (v.travelDate && v.travelDate < todayISO()) e.travelDate = "Date cannot be in the past";
      if (!v.travelDate && !v.dateFlexible) e.travelDate = "Choose a date or tick 'My dates are flexible'";
      if (!(Number(v.adults) >= 1)) e.adults = "At least 1 adult";
    }
    if (i === 2 || !multiStep) {
      if (v.name.trim().length < 2) e.name = "Please enter your name";
      if (!v.phone.trim() && !v.email.trim()) e.phone = "Please share a phone number or email so we can reply";
      if (!v.consent) e.consent = "Please accept the privacy notice and booking terms";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (multiStep && step < STEPS.length - 1) {
      if (validateStep(step)) setStep(step + 1);
      return;
    }
    if (!validateStep(multiStep ? 2 : 0)) return;
    const result = await submit(
      {
        kind: mode === "package" ? "PACKAGE" : "TRIP",
        packageSlug,
        destination: v.destination,
        travelDate: v.travelDate,
        dateFlexible: v.dateFlexible,
        adults: Number(v.adults),
        children: Number(v.children || 0),
        interests: v.interests,
        budgetBand: v.budgetBand,
        message: v.message,
        name: v.name,
        phone: v.phone,
        email: v.email,
        heardFrom: v.heardFrom,
        consent: v.consent,
        website: v.website,
      },
      { enquiry_type: mode === "package" ? "package" : "custom_trip", package_id: packageSlug, destination: v.destination || undefined },
    );
    // Server-side errors on earlier steps: jump back so the user can see them
    if (!result.ok && multiStep) {
      const keys = Object.keys(result.errors);
      if (keys.some((k) => ["destination", "travelDate", "adults", "children"].includes(k))) setStep(0);
      else if (keys.some((k) => ["budgetBand", "message", "interests"].includes(k))) setStep(1);
    }
  }

  if (status === "success") {
    return (
      <SuccessPanel refId={ref}>
        <WhatsAppButton
          label="Follow up on WhatsApp"
          message={`Hi EcoSoul, I just sent enquiry ${ref}${packageTitle ? ` for ${packageTitle}` : ""}.`}
          packageId={packageSlug}
        />
      </SuccessPanel>
    );
  }

  const tripStep = (
    <div className="grid gap-4 sm:grid-cols-2">
      {mode === "custom" && (
        <div className="sm:col-span-2">
          <Field id="destination" label="Where would you like to go?" hint="Pick one or leave blank if you'd like suggestions">
            <input
              {...inputProps("destination")}
              list="destination-options"
              placeholder="e.g. Nainital, Kumaon circuit, Char Dham"
              value={v.destination}
              onChange={(e) => set("destination", e.target.value)}
            />
            <datalist id="destination-options">
              {destinations.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </Field>
        </div>
      )}
      <Field id="travelDate" label="Travel start date" error={errors.travelDate}>
        <input
          {...inputProps("travelDate", errors.travelDate)}
          type="date"
          min={todayISO()}
          value={v.travelDate}
          onChange={(e) => set("travelDate", e.target.value)}
        />
      </Field>
      <div className="flex items-end pb-2.5">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-5 w-5 accent-forest-700" checked={v.dateFlexible} onChange={(e) => set("dateFlexible", e.target.checked)} />
          My dates are flexible
        </label>
      </div>
      <Field id="adults" label="Adults" error={errors.adults} required>
        <input {...inputProps("adults", errors.adults)} type="number" min={1} max={60} value={v.adults} onChange={(e) => set("adults", e.target.value)} />
      </Field>
      <Field id="children" label="Children (under 12)">
        <input {...inputProps("children")} type="number" min={0} max={40} value={v.children} onChange={(e) => set("children", e.target.value)} />
      </Field>
    </div>
  );

  const prefsStep = (
    <div className="grid gap-5">
      <fieldset>
        <legend className="label">What interests you?</legend>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((opt) => {
            const on = v.interests.includes(opt);
            return (
              <label
                key={opt}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-strong ${
                  on ? "border-forest-700 bg-forest-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-forest-500"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => set("interests", on ? v.interests.filter((x) => x !== opt) : [...v.interests, opt])}
                />
                {opt}
              </label>
            );
          })}
        </div>
      </fieldset>
      <Field id="budgetBand" label="Approximate budget">
        <select {...inputProps("budgetBand")} value={v.budgetBand} onChange={(e) => set("budgetBand", e.target.value)}>
          <option value="">Select a range</option>
          {budgetBands.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </Field>
      <Field id="message" label="Anything else we should know?" hint="Pace, hotel preference, accessibility needs, special occasions…">
        <textarea {...inputProps("message")} rows={4} maxLength={1500} value={v.message} onChange={(e) => set("message", e.target.value)} />
      </Field>
    </div>
  );

  const contactStep = (
    <div className="grid gap-5">
      <ContactFields values={v} set={set} errors={errors} />
      <ConsentField checked={v.consent} onChange={(c) => set("consent", c)} error={errors.consent} />
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-6">
      <Honeypot value={v.website} onChange={(x) => set("website", x)} />

      {multiStep ? (
        <>
          <ol className="flex items-center gap-2 text-sm" aria-label="Form progress">
            {STEPS.map((label, i) => (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    i <= step ? "bg-forest-700 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                  aria-current={i === step ? "step" : undefined}
                >
                  {i + 1}
                </span>
                <span className={`hidden sm:inline ${i === step ? "font-semibold text-forest-900" : "text-slate-500"}`}>{label}</span>
                {i < STEPS.length - 1 && <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />}
              </li>
            ))}
          </ol>
          {step === 0 && tripStep}
          {step === 1 && prefsStep}
          {step === 2 && contactStep}
        </>
      ) : (
        <>
          {tripStep}
          <Field id="message" label="Questions or special requests">
            <textarea {...inputProps("message")} rows={3} maxLength={1500} value={v.message} onChange={(e) => set("message", e.target.value)} />
          </Field>
          {contactStep}
        </>
      )}

      <FormAlert message={formError} />

      <div className="flex flex-wrap items-center gap-3">
        {multiStep && step > 0 && (
          <button type="button" className="btn-outline" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={status === "submitting"}>
          {status === "submitting"
            ? "Sending…"
            : multiStep && step < STEPS.length - 1
              ? "Continue"
              : mode === "package"
                ? "Request a quote"
                : "Send my trip request"}
        </button>
        <p className="text-xs text-slate-500">No payment needed. We reply with a written itinerary and quote.</p>
      </div>
    </form>
  );
}
