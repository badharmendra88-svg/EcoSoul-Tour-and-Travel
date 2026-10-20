import Link from "next/link";
import { TransportLanding, commonTransportFaqs } from "@/components/TransportLanding";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Hire a Driver in Uttarakhand — Driver for Your Own Car",
  description:
    "Request an experienced driver for your own vehicle in Uttarakhand — for hill routes, outstation trips or daily shifts. Experienced partner drivers, clear shift terms.",
  path: "/uttarakhand/driver-booking/",
});

export default function DriverBookingPage() {
  return (
    <TransportLanding
      title="Book a Driver for Your Own Vehicle"
      intro="Driving your own car to the hills but prefer an experienced mountain driver? Request a driver for a trip or a shift — we match you with an experienced driver from our partner network."
      path="/uttarakhand/driver-booking/"
      crumbLabel="Book a Driver"
      service="DRIVER_ONLY"
      lockService
      showVehicles={false}
      highlights={["Your vehicle", "Experienced hill drivers", "Clear shift & overtime terms"]}
      faqs={[
        { q: "What does a driver-only booking include?", a: "A driver for the agreed shift length or trip. Your quote states shift hours, overtime rate and how meals, stay and return travel for the driver are handled." },
        { q: "How are drivers verified?", a: "Our team checks driving licence validity, identity and partner agreements before a driver is activated. We only describe a driver as verified once these checks are recorded." },
        ...commonTransportFaqs,
      ]}
    >
      <section className="rounded-2xl bg-forest-50 p-6">
        <h2 className="text-lg font-semibold text-forest-900">Please tell us</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
          <li>Vehicle type and whether it is manual or automatic</li>
          <li>Where and when the driver should report</li>
          <li>Route, number of days and expected daily driving hours</li>
          <li>Whether the driver&apos;s stay and meals will be arranged by you</li>
        </ul>
        <p className="mt-3 text-sm text-slate-600">Your vehicle must have valid registration, insurance and other documents required for the route.</p>
        <p className="mt-3 text-sm text-slate-600">
          Are you a driver? <Link href="/join-as-driver/" className="font-semibold text-forest-700 underline">Join as a driver partner</Link>.
        </p>
      </section>
    </TransportLanding>
  );
}
