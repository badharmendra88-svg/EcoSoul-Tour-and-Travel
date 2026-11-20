"use client";

import { useState } from "react";
import { ConsentField, ContactFields, Field, FormAlert, Honeypot, SuccessPanel, inputProps, todayISO, useEnquirySubmit } from "./shared";

export function HotelEnquiryForm() {
  const { errors, setErrors, status, formError, ref, submit } = useEnquirySubmit();
  const [v, setV] = useState({ destination: "", travelDate: "", returnDate: "", rooms: "1", adults: "2", children: "0", roomCategory: "", message: "", name: "", phone: "", email: "", heardFrom: "", travellingFrom: "", consent: false, website: "" });
  const set = (key: string, value: string | boolean) => setV(old => ({ ...old, [key]: value }));
  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const e: Record<string,string> = {};
    if (v.travelDate && v.travelDate < todayISO()) e.travelDate = "Check-in cannot be in the past";
    if (!v.travelDate) e.travelDate = "Please choose your check-in date";
    if (!v.returnDate || v.returnDate <= v.travelDate) e.returnDate = "Check-out must be after check-in";
    if (Number(v.rooms) < 1 || Number(v.rooms) > 20) e.rooms = "Choose 1–20 rooms";
    if (Number(v.adults) < 1) e.adults = "At least one guest is required";
    if (v.name.trim().length < 2) e.name = "Please enter your name";
    if (!v.phone.trim() && !v.email.trim()) e.phone = "Please share a phone number or email";
    if (!v.consent) e.consent = "Please accept the privacy notice and booking terms";
    setErrors(e);
    if (Object.keys(e).length) return;
    await submit({ kind: "HOTEL", destination: v.destination, travelDate: v.travelDate, returnDate: v.returnDate, rooms: Number(v.rooms), adults: Number(v.adults), children: Number(v.children || 0), roomCategory: v.roomCategory, message: v.message, name: v.name, phone: v.phone, email: v.email, heardFrom: v.heardFrom, travellingFrom: v.travellingFrom, consent: v.consent, website: v.website }, { enquiry_type: "hotel_stay", destination: v.destination });
  }
  if (status === "success") return <SuccessPanel refId={ref}/>;
  return <form onSubmit={onSubmit} noValidate className="@container space-y-5">
    <Honeypot value={v.website} onChange={x=>set("website",x)}/>
    <div className="grid gap-4 @md:grid-cols-2">
      <Field id="destination" label="Where do you need a stay?" error={errors.destination} required><input {...inputProps("destination",errors.destination)} value={v.destination} onChange={e=>set("destination",e.target.value)} placeholder="Nainital, Bhimtal, Mukteshwar..."/></Field>
      <Field id="roomCategory" label="Preferred stay type"><select {...inputProps("roomCategory")} value={v.roomCategory} onChange={e=>set("roomCategory",e.target.value)}><option value="">No preference</option><option>Budget</option><option>Standard</option><option>Premium</option><option>Homestay</option><option>Resort</option></select></Field>
      <Field id="travelDate" label="Check-in" error={errors.travelDate} required><input {...inputProps("travelDate",errors.travelDate)} type="date" min={todayISO()} value={v.travelDate} onChange={e=>set("travelDate",e.target.value)}/></Field>
      <Field id="returnDate" label="Check-out" error={errors.returnDate} required><input {...inputProps("returnDate",errors.returnDate)} type="date" min={v.travelDate || todayISO()} value={v.returnDate} onChange={e=>set("returnDate",e.target.value)}/></Field>
      <Field id="rooms" label="Rooms" error={errors.rooms}><input {...inputProps("rooms",errors.rooms)} type="number" min="1" max="20" value={v.rooms} onChange={e=>set("rooms",e.target.value)}/></Field>
      <Field id="adults" label="Adults" error={errors.adults}><input {...inputProps("adults",errors.adults)} type="number" min="1" max="60" value={v.adults} onChange={e=>set("adults",e.target.value)}/></Field>
      <Field id="children" label="Children"><input {...inputProps("children")} type="number" min="0" max="40" value={v.children} onChange={e=>set("children",e.target.value)}/></Field>
    </div>
    <Field id="message" label="Additional requirements"><textarea {...inputProps("message")} rows={3} maxLength={1500} value={v.message} onChange={e=>set("message",e.target.value)} placeholder="Lake view, parking, breakfast, family room..."/></Field>
    <ContactFields values={v} set={set} errors={errors}/>
    <ConsentField checked={v.consent} onChange={x=>set("consent",x)} error={errors.consent}/>
    <FormAlert message={formError}/>
    <button type="submit" className="btn-primary" disabled={status==="submitting"}>{status==="submitting" ? "Sending..." : "Send hotel enquiry"}</button>
    <p className="text-xs text-slate-500">This is an enquiry, not a confirmed room reservation. We will check partner availability and send you a quote.</p>
  </form>;
}
