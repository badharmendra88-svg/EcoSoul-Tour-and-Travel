"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import { heardFromOptions } from "@/config/options";
import { travellingFromOptions } from "@/config/journeys";
import { readUtm } from "@/lib/utm";
import { Combobox } from "./Combobox";

export type Errors = Record<string, string>;

/** Give up on a form request that hasn't answered after this long. */
export const SUBMIT_TIMEOUT_MS = 20_000;

export function networkErrorMessage(err: unknown) {
  return err instanceof DOMException && err.name === "TimeoutError"
    ? "The server is taking too long to respond. Please try again, or contact us on WhatsApp."
    : "We couldn't reach the server. Please check your connection or contact us on WhatsApp.";
}

/**
 * Shared submit logic for all enquiry forms: client validation hook-in,
 * double-submit guard, server error mapping and success state (FR-04).
 */
export function useEnquirySubmit() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [ref, setRef] = useState("");
  // State updates are async, so rapid repeat clicks need a synchronous guard
  const inFlight = useRef(false);

  async function submit(
    payload: Record<string, unknown>,
    analytics: Record<string, string | undefined>,
  ): Promise<{ ok: boolean; errors: Errors }> {
    if (inFlight.current) return { ok: false, errors: {} };
    inFlight.current = true;
    setStatus("submitting");
    setFormError("");
    setErrors({});
    try {
      const res = await fetch("/api/enquiries/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, sourcePage: window.location.pathname, utm: readUtm() }),
        signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setRef(data.ref);
        setStatus("success");
        track("submit_enquiry", analytics);
        return { ok: true, errors: {} };
      }
      if (data.errors) setErrors(data.errors);
      setFormError(data.error || (data.errors ? "Please check the highlighted fields." : "Something went wrong. Please try again."));
      setStatus("error");
      return { ok: false, errors: data.errors ?? {} };
    } catch (err) {
      setFormError(networkErrorMessage(err));
      setStatus("error");
    } finally {
      inFlight.current = false;
    }
    return { ok: false, errors: {} };
  }

  return { errors, setErrors, status, formError, ref, submit };
}

export function Field({
  id,
  label,
  error,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {required && <span className="text-red-700"> *</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function inputProps(id: string, error?: string) {
  return {
    id,
    name: id,
    className: `input ${error ? "input-error" : ""}`,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
}

export function ContactFields({
  values,
  set,
  errors,
}: {
  /** Include `travellingFrom` in the form state to ask for the customer's home city. */
  values: { name: string; phone: string; email: string; heardFrom: string; travellingFrom?: string };
  set: (key: string, value: string) => void;
  errors: Errors;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field id="name" label="Your name" error={errors.name} required>
          <input {...inputProps("name", errors.name)} autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
      </div>
      <Field id="phone" label="Phone / WhatsApp" error={errors.phone} hint="Phone or email — at least one">
        <input
          {...inputProps("phone", errors.phone)}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+91 98xxxxxxxx"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </Field>
      <Field id="email" label="Email" error={errors.email}>
        <input
          {...inputProps("email", errors.email)}
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
        />
      </Field>
      {values.travellingFrom !== undefined && (
        <Field id="travellingFrom" label="Travelling from (city)" hint="Helps us plan pickup, trains and flights">
          <Combobox
            id="travellingFrom"
            value={values.travellingFrom}
            onChange={(x) => set("travellingFrom", x.slice(0, 80))}
            options={travellingFromOptions.map((value) => ({ value }))}
            placeholder="e.g. Delhi NCR"
            describedBy="travellingFrom-hint"
          />
        </Field>
      )}
      <div className={values.travellingFrom !== undefined ? "" : "sm:col-span-2"}>
        <Field id="heardFrom" label="How did you hear about us? (optional)">
          <select {...inputProps("heardFrom")} value={values.heardFrom} onChange={(e) => set("heardFrom", e.target.value)}>
            <option value="">Select</option>
            {heardFromOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

export function ConsentField({ checked, onChange, error }: { checked: boolean; onChange: (v: boolean) => void; error?: string }) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm text-slate-700">
        <input
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 accent-forest-700"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "consent-error" : undefined}
        />
        <span>
          I agree that EcoSoul may contact me about this request and share necessary trip details with service partners, as
          described in the{" "}
          <Link href="/privacy-policy/" className="font-medium text-forest-700 underline" target="_blank">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/booking-policy/" className="font-medium text-forest-700 underline" target="_blank">
            Booking Policy
          </Link>
          .
        </span>
      </label>
      {error && (
        <p id="consent-error" className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Hidden honeypot field — bots fill it, humans never see it. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

export function FormAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {message}
    </div>
  );
}

export function SuccessPanel({ refId, children }: { refId: string; children?: ReactNode }) {
  return (
    <div role="status" className="rounded-2xl border border-forest-200 bg-forest-50 p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest-700 text-2xl text-white" aria-hidden="true">
        ✓
      </div>
      <h3 className="mt-4 text-xl font-semibold text-forest-900">Thank you — we&apos;ve received your request</h3>
      <p className="mt-2 text-slate-700">
        Your enquiry ID is <strong className="font-mono">{refId}</strong>. Our team will review availability and reply during
        working hours. This is an enquiry, not a confirmed booking.
      </p>
      {children && <div className="mt-5 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

export function todayISO() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}
