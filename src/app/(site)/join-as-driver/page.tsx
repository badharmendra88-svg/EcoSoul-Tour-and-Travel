import { FaqList } from "@/components/FaqList";
import { DriverRegistrationForm } from "@/components/forms/DriverRegistrationForm";
import { PageHero } from "@/components/PageHero";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Join as a Driver Partner — Taxi & Driver Jobs in Uttarakhand",
  description:
    "Experienced hill drivers and taxi owners in Uttarakhand: register as an EcoSoul driver partner. Free registration, in-person document verification, trips across Kumaon and Garhwal.",
  path: "/join-as-driver/",
});

const steps = [
  { title: "Register online", text: "Share your details, licence and vehicle (if any) — takes about 3 minutes." },
  { title: "Call from our team", text: "We discuss routes, availability and rates with you." },
  { title: "Document verification", text: "We check your licence, ID, police verification and vehicle papers in person." },
  { title: "Start receiving trips", text: "Once active, we offer you trips that match your area and vehicle." },
];

const needs = [
  "Valid driving licence (commercial/transport licence for taxi work)",
  "Government photo ID",
  "Police verification certificate",
  "For your own vehicle: RC, commercial permit, fitness certificate, insurance and PUC",
];

const faqs = [
  { q: "Is there a registration fee?", a: "No. Registering as a driver partner is free." },
  { q: "Do I need my own vehicle?", a: "No. You can register as a driver only — for customers who want a driver for their own car — or as a driver with your own vehicle." },
  { q: "Why don't you ask for document photos online?", a: "To protect your privacy, we don't collect copies of ID or documents through the website. Our team sees the originals during verification and records only that they were checked." },
  { q: "Am I guaranteed trips after registering?", a: "No. Trips depend on demand in your area, your vehicle and your availability. Verified, active partners are offered trips that match." },
];

export default function JoinAsDriverPage() {
  return (
    <>
      <PageHero
        title="Join as a Driver Partner"
        intro="Know the hill roads of Uttarakhand? Drive with EcoSoul — as a driver for customers' cars, or with your own taxi. Free registration, clear rates, verified partners only."
        crumbs={[{ label: "Join as a Driver", href: "/join-as-driver/" }]}
        scene="mountain"
        eyebrow="Driver partners"
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="how-it-works">
            <h2 id="how-it-works" className="h2">How it works</h2>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="rounded-2xl border border-forest-100 bg-forest-50 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-700 text-sm font-bold text-white">{i + 1}</span>
                  <h3 className="mt-3 font-semibold text-forest-900">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section id="register" className="scroll-mt-24">
            <h2 className="h2">Register now</h2>
            <p className="mt-2 text-slate-600">Fields marked * are required.</p>
            <div className="card mt-6 p-6 sm:p-8">
              <DriverRegistrationForm />
            </div>
          </section>

          <section>
            <h2 className="h2">Questions</h2>
            <div className="mt-6">
              <FaqList faqs={faqs} />
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="font-semibold text-forest-900">Keep these ready for verification</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {needs.map((n) => (
                <li key={n} className="flex gap-2">
                  <span aria-hidden="true" className="text-forest-600">✓</span>
                  {n}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">Originals are seen by our team in person. We never publish your documents or licence number.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
