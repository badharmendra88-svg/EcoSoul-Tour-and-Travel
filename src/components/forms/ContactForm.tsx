"use client";

import { useState } from "react";
import { ConsentField, ContactFields, Field, FormAlert, Honeypot, SuccessPanel, inputProps, useEnquirySubmit, type Errors } from "./shared";

export function ContactForm() {
  const { errors, setErrors, status, formError, ref, submit } = useEnquirySubmit();
  const [v, setV] = useState({ name: "", phone: "", email: "", heardFrom: "", message: "", consent: false, website: "" });
  const set = (key: string, value: unknown) => setV((prev) => ({ ...prev, [key]: value }));

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Errors = {};
    if (v.name.trim().length < 2) e.name = "Please enter your name";
    if (!v.phone.trim() && !v.email.trim()) e.phone = "Please share a phone number or email so we can reply";
    if (v.message.trim().length < 5) e.message = "Please write a short message";
    if (!v.consent) e.consent = "Please accept the privacy notice and booking terms";
    setErrors(e);
    if (Object.keys(e).length) return;
    await submit({ kind: "CONTACT", ...v }, { enquiry_type: "contact" });
  }

  if (status === "success") return <SuccessPanel refId={ref} />;

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5">
      <Honeypot value={v.website} onChange={(x) => set("website", x)} />
      <ContactFields values={v} set={set} errors={errors} />
      <Field id="message" label="Message" error={errors.message} required>
        <textarea {...inputProps("message", errors.message)} rows={5} maxLength={2000} value={v.message} onChange={(e) => set("message", e.target.value)} />
      </Field>
      <ConsentField checked={v.consent} onChange={(c) => set("consent", c)} error={errors.consent} />
      <FormAlert message={formError} />
      <button type="submit" className="btn-primary" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
