import Link from "next/link";
import { TripLanding } from "@/components/TripLanding";
import { getPublishedDestinations } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

const PATH = "/uttarakhand/auli-tour-package/";

export async function generateMetadata() {
  const auli = (await getPublishedDestinations()).find((d) => d.slug === "auli");
  return pageMeta({
    title: "Auli Tour Package — Snow, Skiing & Nanda Devi Views",
    description:
      "Auli tour package from Delhi, Haridwar or Dehradun: stays in Auli or Joshimath, SUV with hill driver, snow and skiing days, Gorson Bugyal walk and Nanda Devi views.",
    path: PATH,
    image: auli?.imageUrl,
    imageAlt: auli?.imageAlt,
  });
}

export default async function AuliTourPackagePage() {
  const auli = (await getPublishedDestinations()).find((d) => d.slug === "auli");
  return (
    <TripLanding
      title="Auli Tour Package"
      eyebrow="Snow & skiing"
      intro="Snow slopes, ski lessons and some of the best Himalayan views in India — an Auli trip with stays in Auli or Joshimath, a vehicle with an experienced hill driver and a realistic day-wise plan."
      crumbLabel="Auli Tour Package"
      path={PATH}
      scene="snow"
      imageUrl={auli?.imageUrl}
      imageAlt={auli?.imageAlt}
      imageCredit={auli?.imageCredit}
      notice={{
        title: "Check the ropeway and snow before you travel",
        body: (
          <p>
            The Joshimath–Auli ropeway has been closed for long periods in recent years; when it isn&apos;t running, Auli is reached by road
            from Joshimath. Snow and ski conditions change every season — we confirm both when you book.
          </p>
        ),
      }}
      facts={[
        { label: "Altitude", value: "About 2,500–3,000 m" },
        { label: "Snow & skiing", value: "Usually Jan – Mar" },
        { label: "Green season", value: "Apr – Jun, Sep – Nov" },
        { label: "Package length", value: "4–6 days" },
      ]}
      intro2={
        <p>
          Auli sits above Joshimath in Chamoli district, facing Nanda Devi, Kamet and Dronagiri. In winter it is Uttarakhand&apos;s main ski
          slope; in summer and autumn the meadows are green and the walk to Gorson Bugyal is a favourite. Read more about the place in our{" "}
          <Link href="/destinations/auli/">Auli travel guide</Link>.
        </p>
      }
      cardsTitle="What the Auli package includes"
      cards={[
        { title: "Stay in Auli or Joshimath", text: "Resorts and hotels in Auli for slope-side views, or Joshimath for more choice and easier access — in your chosen category." },
        { title: "Vehicle with hill driver", text: "Sedan, SUV or tempo traveller from Delhi, Haridwar, Rishikesh or Dehradun, with a driver used to snow and mountain roads." },
        { title: "Skiing & snow days", text: "Help arranging ski lessons and equipment with local operators in season, plus a free day for snow play and the chairlift." },
        { title: "Sightseeing add-ons", text: "Gorson Bugyal walk, Joshimath, and on longer trips Badrinath and Mana village (when the Badrinath road is open)." },
      ]}
      plan={{
        title: "Sample 5-day Auli trip from Haridwar",
        days: [
          ["Day 1", "Haridwar / Rishikesh → Rudraprayag or Pipalkoti, about 6–7 hrs along the Alaknanda"],
          ["Day 2", "Drive on to Joshimath and up to Auli, evening views of Nanda Devi"],
          ["Day 3", "Auli: skiing or snow play in winter, or the Gorson Bugyal walk in summer"],
          ["Day 4", "Morning in Auli → drive down to Rudraprayag or Srinagar (Garhwal)"],
          ["Day 5", "Drive back to Rishikesh / Haridwar or Dehradun Airport"],
        ],
        note: "From Delhi, add a day each way. Snowfall can close the Joshimath–Auli road for a day or two — keep a buffer in winter.",
      }}
      checklistTitle="Before your Auli trip"
      checklist={[
        "In winter carry thermal innerwear, a heavy jacket, gloves, a cap and waterproof shoes.",
        "Book ski lessons in advance for January–March weekends and holidays.",
        "Keep one buffer day in winter for snow on the Joshimath–Auli road.",
        "Carry cash; ATMs and card machines are limited above Joshimath.",
        "Children and elderly travellers should acclimatise for a night at Joshimath first.",
      ]}
      faqTitle="Auli tour package FAQs"
      faqs={[
        { q: "What is the best time for an Auli tour package?", a: "January to March for snow and skiing. April to June and September to November for green meadows, clear views and pleasant weather. July and August bring heavy monsoon rain on the route." },
        { q: "How many days do I need for Auli?", a: "Plan 4–5 days from Haridwar or Rishikesh and 5–6 days from Delhi. Joshimath is a long mountain drive, so a night halt on the way makes the trip comfortable." },
        { q: "Can beginners ski in Auli?", a: "Yes. Local ski operators run beginner lessons with equipment on the gentler slopes in season. Snow depends on the winter, so we confirm conditions when you book." },
        { q: "Is the Auli ropeway working?", a: "The Joshimath–Auli ropeway has been shut for long periods in recent years. When it isn't running, Auli is reached by road from Joshimath, about 30–45 minutes. We confirm the latest status before your trip." },
        { q: "Can I combine Auli with Badrinath?", a: "Yes, from May to October when the Badrinath temple and road are open. Add 1–2 days to visit Badrinath and Mana village from Joshimath." },
      ]}
      cta={{
        title: "Get your Auli package quote",
        text: "Tell us your dates, group size, starting city and whether you want skiing. We reply with a day-wise plan and an itemised quote.",
        href: "/customise-my-trip/?destination=Auli",
        label: "Request an Auli quote",
        whatsapp: "Hi EcoSoul, I'd like an Auli tour package quote.",
      }}
      related={{
        title: "Plan your Auli trip",
        links: [
          { href: "/destinations/auli/", label: "Auli travel guide" },
          { href: "/taxi/haridwar-to-auli/", label: "Haridwar to Auli taxi" },
          { href: "/taxi/delhi-to-auli/", label: "Delhi to Auli taxi" },
          { href: "/taxi/rishikesh-to-auli/", label: "Rishikesh to Auli taxi" },
          { href: "/uttarakhand/himalayan-treks/", label: "Himalayan treks near Auli" },
        ],
      }}
    />
  );
}
