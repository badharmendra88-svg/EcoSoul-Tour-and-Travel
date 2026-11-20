import { HotelEnquiryForm } from "@/components/forms/HotelEnquiryForm";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Uttarakhand Hotel & Homestay Enquiry",
  description: "Request hotel, resort and homestay options in Nainital, Bhimtal, Mukteshwar and across Uttarakhand. Share your dates and room needs for a written quote.",
  path: "/hotel-booking/",
});

export default function HotelBookingPage() {
  return <div className="container-page py-10 sm:py-16">
    <div className="mx-auto max-w-3xl">
      <p className="tagline text-lg">Stay in Devbhoomi</p>
      <h1 className="mt-2 font-serif text-3xl font-bold text-forest-900 sm:text-4xl">Hotel & Homestay Booking Enquiry</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">Tell us where and when you plan to stay. We will check availability with our local hotel and homestay partners and share suitable options with clear pricing.</p>
      <div className="panel mt-8 p-5 sm:p-8"><HotelEnquiryForm/></div>
    </div>
  </div>;
}
