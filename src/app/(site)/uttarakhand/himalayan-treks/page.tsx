import Link from "next/link";
import { TripLanding } from "@/components/TripLanding";
import { officialLinks } from "@/config/site";
import { getPublishedDestinations } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

const PATH = "/uttarakhand/himalayan-treks/";

export async function generateMetadata() {
  const vof = (await getPublishedDestinations()).find((d) => d.slug === "valley-of-flowers");
  return pageMeta({
    title: "Himalayan Treks in Uttarakhand: Kedarkantha & More",
    description:
      "Himalayan treks in Uttarakhand with local partner guides: Kedarkantha, Valley of Flowers, Har Ki Dun, Kuari Pass, Dayara Bugyal and more, with transport to the base.",
    path: PATH,
    image: vof?.imageUrl,
    imageAlt: vof?.imageAlt,
  });
}

export default async function HimalayanTreksPage() {
  const vof = (await getPublishedDestinations()).find((d) => d.slug === "valley-of-flowers");
  return (
    <TripLanding
      title="Himalayan Treks in Uttarakhand"
      eyebrow="Trekking"
      intro="From easy winter summits to monsoon flower valleys — Himalayan treks in Uttarakhand run with experienced local partner guides, plus transport to the trek base and stays before and after."
      answer={
        <p>
          Uttarakhand&apos;s most popular Himalayan treks are <strong>Kedarkantha and Brahmatal</strong> in winter (December–April),
          <strong> Har Ki Dun</strong> in spring and autumn, and the <strong>Valley of Flowers</strong> in the monsoon (July–September).{" "}
          <strong>Dayara Bugyal</strong> is the easiest first trek. Most treks take 4–8 days, reach about 3,400–3,900 m and start with a
          drive from Dehradun, Rishikesh or Haridwar.
        </p>
      }
      updated="22 Nov 2026"
      crumbLabel="Himalayan Treks"
      path={PATH}
      scene="snow"
      imageUrl={vof?.imageUrl}
      imageAlt={vof?.imageAlt}
      imageCredit={vof?.imageCredit}
      notice={{
        title: "Trek safely",
        body: (
          <p>
            Treks are led by our local partner trek operators and guides. Forest permits, camping rules and trail closures are set by the
            Uttarakhand Forest Department and can change each season — we confirm the current rules, your fitness and the weather before
            every booking.
          </p>
        ),
      }}
      facts={[
        { label: "Trek length", value: "4–8 days" },
        { label: "Highest points", value: "About 3,400–3,900 m" },
        { label: "Winter treks", value: "Dec – Apr" },
        { label: "Summer & monsoon", value: "May – Sep" },
      ]}
      intro2={
        <p>
          Uttarakhand has some of the best beginner and intermediate Himalayan treks in India. Pick by season: snow treks like Kedarkantha
          and Brahmatal in winter, meadows and valleys like Har Ki Dun and the Valley of Flowers in summer and the monsoon. Combine a trek
          with an <Link href="/uttarakhand/auli-tour-package/">Auli tour package</Link> or a few days in Rishikesh.
        </p>
      }
      cardsTitle="Popular Himalayan treks we arrange"
      cards={[
        { title: "Kedarkantha", meta: "Sankri · about 3,800 m · 5–6 days · Dec–Apr · easy–moderate", text: "The classic winter trek: snow-covered forest camps and a summit sunrise over the Garhwal peaks." },
        { title: "Valley of Flowers & Hemkund Sahib", meta: "Govindghat · about 3,600 m · 5–6 days · Jul–Sep · moderate", text: "A UNESCO World Heritage valley that blooms in the monsoon, often combined with Hemkund Sahib." },
        { title: "Har Ki Dun", meta: "Sankri · about 3,550 m · 6–7 days · Apr–Jun, Sep–Dec · easy–moderate", text: "A gentle valley trek through old wooden villages to a meadow below Swargarohini." },
        { title: "Kuari Pass", meta: "Near Joshimath · about 3,800 m · 5–6 days · Oct–Apr · easy–moderate", text: "Wide views of Nanda Devi, Dronagiri and Kamet — pairs well with a stay in Auli." },
        { title: "Brahmatal", meta: "Lohajung · about 3,700 m+ · 6 days · Dec–Mar · moderate", text: "A winter trek to frozen lakes with close views of Trishul and Nanda Ghunti." },
        { title: "Dayara Bugyal", meta: "Raithal · about 3,400 m · 4–5 days · most of the year · easy", text: "One of the easiest high meadows to reach — a good first Himalayan trek for families." },
      ]}
      plan={{
        title: "How a typical trek trip works",
        days: [
          ["Day 1", "Pickup from Dehradun, Rishikesh or Haridwar → drive to the trek base (for example Sankri or Govindghat), overnight stay"],
          ["Days 2–5", "Trek with a local guide, cook and support staff; camps or homestays as the trail allows"],
          ["Last day", "Trek down to the base → drive back to Dehradun, Rishikesh or Haridwar"],
        ],
        note: "Exact days depend on the trek. From Delhi, add a travel day on each side.",
      }}
      checklistTitle="Before your trek"
      checklist={[
        "Build fitness for 4–6 weeks: brisk walks, stairs and some jogging.",
        "Carry layered warm clothing, a rain jacket and broken-in trekking shoes.",
        "Share any health conditions — altitude above 3,000 m needs a sensible pace.",
        "Carry a government photo ID for forest permits.",
        "Leave no trace: carry all plastic and waste back down.",
      ]}
      faqTitle="Himalayan trek FAQs"
      faqs={[
        { q: "Which is the best Himalayan trek in Uttarakhand for beginners?", a: "Dayara Bugyal, Kedarkantha and Har Ki Dun are good first treks. They have gradual climbs, well-used trails and experienced local guides." },
        { q: "What is the best time for trekking in Uttarakhand?", a: "December to April for snow treks like Kedarkantha and Brahmatal, May to June and September to November for meadow and valley treks, and July to September for the Valley of Flowers." },
        { q: "Do I need a permit for treks in Uttarakhand?", a: "Most treks enter forest or protected areas that need a Forest Department permit and fees. Our partner operators arrange permits with your ID. Rules can change each season." },
        { q: "Who leads the treks?", a: "Treks are run by experienced local partner operators with trained guides, cooks and support staff. We arrange the trek together with your transport and stays." },
        { q: "Can a Himalayan trek be combined with other trips?", a: "Yes. Kuari Pass pairs with Auli, the Valley of Flowers with Badrinath, and the Sankri treks with Mussoorie or Dehradun." },
      ]}
      sources={
        <>
          Trail information is a general guide; altitudes and durations are approximate. See{" "}
          <a href={officialLinks.tourism} target="_blank" rel="noopener noreferrer">Uttarakhand Tourism</a> for official updates.
        </>
      }
      cta={{
        title: "Plan your trek",
        text: "Tell us the trek, your dates, group size and fitness level. We reply with a plan covering transport, stays and the trek.",
        href: "/customise-my-trip/?interest=Trekking+%2F+adventure",
        label: "Request a trek plan",
        whatsapp: "Hi EcoSoul, I'd like to plan a Himalayan trek in Uttarakhand.",
      }}
      related={{
        title: "Trek bases & nearby trips",
        links: [
          { href: "/destinations/valley-of-flowers/", label: "Valley of Flowers guide" },
          { href: "/uttarakhand/auli-tour-package/", label: "Auli tour package" },
          { href: "/taxi/dehradun-to-uttarkashi/", label: "Dehradun to Uttarkashi taxi" },
          { href: "/uttarakhand/tour-packages/", label: "Uttarakhand tour packages" },
          { href: "/travel-guides/uttarakhand-packing-list/", label: "Uttarakhand packing list" },
        ],
      }}
    />
  );
}
