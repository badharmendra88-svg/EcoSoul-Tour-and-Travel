// Kumaon tour package landing pages (/uttarakhand/<id>-tour-package/). Distances and drive times come from
// the taxi route table in journeys.ts; altitudes and timings here are approximate and phrased that way.

export type KumaonPlace = {
  /** Place id in journeys.ts and, where one exists, the destination slug in the database. */
  id: string;
  name: string;
  /** SEO title without the brand suffix (≤ 50 characters so " | EcoSoul" fits). */
  title: string;
  description: string;
  intro: string;
  altitude: string;
  bestTime: string;
  idealStay: string;
  overview: string;
  sights: { title: string; text: string }[];
  plan: { title: string; days: [string, string][]; note?: string };
  tips: string[];
  faqs: { q: string; a: string }[];
  /** Nearby places with their own Kumaon package page. */
  nearby: string[];
};

export const kumaonPlaces: KumaonPlace[] = [
  {
    id: "nainital",
    name: "Nainital",
    title: "Nainital Tour Package — Lakes, Mall Road & Views",
    description:
      "Nainital tour package from Delhi, Kathgodam or Pantnagar: lake-view hotels, SUV with hill driver, Naini Lake boating, Snow View, Tiffin Top and the Bhimtal lakes.",
    intro:
      "Kumaon's favourite hill station — Naini Lake, the Mall Road and Himalayan viewpoints — with hotels in your category, a car with an experienced hill driver and a relaxed day-wise plan.",
    altitude: "About 2,080 m",
    bestTime: "Mar – Jun, Sep – Nov",
    idealStay: "2–3 nights",
    overview:
      "Nainital wraps around the green Naini Lake in the Kumaon hills. Most visitors come for boating, the Mall Road, the Naina Devi temple and sunrise views of the snow peaks from Snow View and Tiffin Top. It also makes the best base for the nearby lakes of Bhimtal, Naukuchiatal and Sattal.",
    sights: [
      { title: "Naini Lake & Mall Road", text: "Boating on the lake, an evening walk on the Mall Road and the Tibetan market at Tallital." },
      { title: "Naina Devi Temple", text: "The temple on the lake's northern shore that gives Nainital its name." },
      { title: "Snow View & Tiffin Top", text: "Viewpoints over the town and the Himalaya — reach Snow View by ropeway (when running) or road." },
      { title: "Lake tour", text: "A half-day drive to Bhimtal, Naukuchiatal and Sattal, the quieter lakes around Nainital." },
    ],
    plan: {
      title: "Sample 3-day Nainital trip from Kathgodam",
      days: [
        ["Day 1", "Pickup at Kathgodam station or Pantnagar Airport → Nainital, check in, evening on the Mall Road"],
        ["Day 2", "Naina Devi temple, boating, Snow View and Tiffin Top; afternoon lake tour to Bhimtal and Naukuchiatal"],
        ["Day 3", "Morning at leisure → drop at Kathgodam / Pantnagar (or continue to Mukteshwar or Jim Corbett)"],
      ],
      note: "From Delhi by road, add a day each way — about 7 hours to Nainital.",
    },
    tips: [
      "Book lake-view rooms early for May–June, Diwali and New Year.",
      "Weekends get traffic and parking queues — a hotel with parking saves time.",
      "Carry a light jacket even in summer; evenings are cool.",
      "Keep a buffer during the monsoon (July–August) for landslides on hill roads.",
    ],
    faqs: [
      { q: "How many days are enough for a Nainital tour package?", a: "2–3 nights cover Nainital and the nearby lakes. Add a night for Mukteshwar or Jim Corbett if you want a longer Kumaon trip." },
      { q: "What is the best time to visit Nainital?", a: "March to June and September to November have pleasant weather. December to February is cold, with occasional snowfall. July and August bring heavy rain." },
      { q: "Which is the nearest railway station and airport to Nainital?", a: "Kathgodam railway station is about 35 km away and Pantnagar Airport about 70 km. Delhi is roughly a 7-hour drive." },
      { q: "Can Nainital be combined with Jim Corbett?", a: "Yes. A 4–5 day plan with 2 nights in Nainital and 1–2 nights at Jim Corbett is one of the most popular Kumaon trips." },
    ],
    nearby: ["bhimtal", "naukuchiatal", "mukteshwar", "ranikhet"],
  },
  {
    id: "bhimtal",
    name: "Bhimtal",
    title: "Bhimtal Tour Package — Lake Stay near Nainital",
    description:
      "Bhimtal tour package: a quiet lake stay near Nainital with boating to the island, Bhimeshwar temple, Sattal and Naukuchiatal, and a car with hill driver.",
    intro:
      "A calmer lake holiday 22 km from Nainital — boating to the island, lakeside walks and easy day trips — with hotels, transfers and a car with an experienced hill driver.",
    altitude: "About 1,370 m",
    bestTime: "Mar – Jun, Sep – Feb",
    idealStay: "2 nights",
    overview:
      "Bhimtal is the largest lake in the Nainital district and far less crowded than Nainital itself. It suits families and couples who want lake views, gentle walks and short drives to Sattal and Naukuchiatal, with Nainital an easy day trip away.",
    sights: [
      { title: "Bhimtal Lake & island", text: "Boating out to the small island in the middle of the lake." },
      { title: "Bhimeshwar Mahadev Temple", text: "An old Shiva temple beside the lake dam." },
      { title: "Sattal", text: "A cluster of forest lakes nearby, known for birdwatching and kayaking." },
      { title: "Naukuchiatal", text: "The 'lake of nine corners', a short drive away, for paragliding and quiet boating." },
    ],
    plan: {
      title: "Sample 3-day Bhimtal trip from Kathgodam",
      days: [
        ["Day 1", "Pickup at Kathgodam / Pantnagar → Bhimtal (about 45 min from Kathgodam), lakeside evening"],
        ["Day 2", "Boating, Bhimeshwar temple, Sattal and Naukuchiatal"],
        ["Day 3", "Optional day trip to Nainital → drop at Kathgodam / Pantnagar"],
      ],
      note: "Bhimtal stays are often combined with Nainital or Mukteshwar for a 4–5 day trip.",
    },
    tips: [
      "Lakeside rooms book out early on long weekends.",
      "Sattal mornings are best for birdwatching — leave early.",
      "Winters are cold but rarely snowy at lake level.",
      "Bhimtal is a good base if Nainital hotels are full or expensive.",
    ],
    faqs: [
      { q: "Is Bhimtal better than Nainital?", a: "Bhimtal is quieter and less crowded, with more relaxed lake views. Nainital has the Mall Road, viewpoints and more activity. Many travellers stay in Bhimtal and visit Nainital for a day." },
      { q: "How far is Bhimtal from Nainital and Kathgodam?", a: "Bhimtal is about 22 km from Nainital and about 22 km from Kathgodam railway station — roughly 45 minutes by road from each." },
      { q: "What is the best time to visit Bhimtal?", a: "March to June and September to February. July and August are rainy." },
      { q: "How many days do I need for Bhimtal?", a: "Two nights are enough for Bhimtal, Sattal and Naukuchiatal. Add a night for Nainital or Mukteshwar." },
    ],
    nearby: ["nainital", "naukuchiatal", "mukteshwar"],
  },
  {
    id: "naukuchiatal",
    name: "Naukuchiatal",
    title: "Naukuchiatal Tour Package — Quiet Lake Stay",
    description:
      "Naukuchiatal tour package: a peaceful stay at the 'lake of nine corners' near Bhimtal, with boating, kayaking, paragliding, birdwatching and transfers from Kathgodam.",
    intro:
      "The quietest of the Nainital lakes — boating, kayaking, birdwatching and paragliding at the 'lake of nine corners' — with a lake-view stay and transfers from Kathgodam, Pantnagar or Delhi.",
    altitude: "About 1,220 m",
    bestTime: "Mar – Jun, Sep – Feb",
    idealStay: "2 nights",
    overview:
      "Naukuchiatal is a small, deep lake about 4 km beyond Bhimtal. It is known for calm water, wooded hills, birdlife and paragliding, and is ideal for travellers who want a slow, peaceful break with Nainital and Bhimtal close by.",
    sights: [
      { title: "Naukuchiatal Lake", text: "Rowing, pedal boats and kayaking on one of the deepest lakes in the region." },
      { title: "Paragliding", text: "Tandem paragliding flights over the lake with local operators, weather permitting." },
      { title: "Birdwatching", text: "The forests around the lake attract many Himalayan bird species, especially in spring and winter." },
      { title: "Bhimtal & Sattal", text: "Neighbouring lakes for a half-day drive." },
    ],
    plan: {
      title: "Sample 3-day Naukuchiatal trip from Kathgodam",
      days: [
        ["Day 1", "Pickup at Kathgodam / Pantnagar → Naukuchiatal (about 50 min from Kathgodam), evening by the lake"],
        ["Day 2", "Boating or kayaking, optional paragliding, afternoon at Bhimtal and Sattal"],
        ["Day 3", "Optional Nainital visit → drop at Kathgodam / Pantnagar"],
      ],
      note: "Paragliding depends on the weather and local operators — we confirm on the day.",
    },
    tips: [
      "Choose a lake-facing resort; the views are the reason to stay here.",
      "Carry cash for boating and small shops.",
      "Paragliding is usually best in the clear months, October to June.",
      "Combine with Nainital and Mukteshwar for a 5-day Kumaon trip.",
    ],
    faqs: [
      { q: "Where is Naukuchiatal?", a: "Naukuchiatal is about 4 km from Bhimtal, 26 km from Nainital and 26 km from Kathgodam railway station in the Nainital district of Kumaon." },
      { q: "What is Naukuchiatal famous for?", a: "Its quiet 'lake of nine corners', boating and kayaking, paragliding and birdwatching." },
      { q: "Is Naukuchiatal good for families?", a: "Yes. It is peaceful and safe, with lake-view resorts and easy day trips to Bhimtal, Sattal and Nainital." },
      { q: "How do I reach Naukuchiatal from Delhi?", a: "By road it is about 305 km, roughly 7 hours. Or take a train to Kathgodam and a 50-minute taxi ride." },
    ],
    nearby: ["bhimtal", "nainital", "mukteshwar"],
  },
  {
    id: "mukteshwar",
    name: "Mukteshwar",
    title: "Mukteshwar Tour Package — Himalayan Views",
    description:
      "Mukteshwar tour package: orchard stays with Himalayan views, Mukteshwar Dham temple, Chauli ki Jali cliffs and sunrise over the snow peaks, with transfers from Kathgodam.",
    intro:
      "Snow-peak sunrises, apple orchards and quiet forest walks — a Mukteshwar stay with hotels or cottages, a car with an experienced hill driver and transfers from Kathgodam, Pantnagar or Delhi.",
    altitude: "About 2,170 m",
    bestTime: "Mar – Jun, Sep – Feb",
    idealStay: "2 nights",
    overview:
      "Mukteshwar sits on a ridge about 50 km from Nainital, with wide views of the Himalaya on clear days. It is known for the old Mukteshwar Dham temple, the Chauli ki Jali rock cliffs, fruit orchards and peaceful cottage stays away from the crowds.",
    sights: [
      { title: "Mukteshwar Dham", text: "A hilltop Shiva temple with views across the valleys." },
      { title: "Chauli ki Jali", text: "Rock cliffs beside the temple, popular for views and, with operators, rappelling." },
      { title: "Himalayan sunrise", text: "On clear mornings, a long line of snow peaks including Nanda Devi and Trishul." },
      { title: "Orchards & forest walks", text: "Apple, peach and apricot orchards and quiet village trails." },
    ],
    plan: {
      title: "Sample 3-day Mukteshwar trip from Kathgodam",
      days: [
        ["Day 1", "Pickup at Kathgodam / Pantnagar → Mukteshwar via Bhimtal, about 2.5–3 hrs"],
        ["Day 2", "Sunrise views, Mukteshwar Dham and Chauli ki Jali, orchard walk"],
        ["Day 3", "Optional stop at Nainital or Bhimtal → drop at Kathgodam / Pantnagar"],
      ],
      note: "Clear mountain views are most likely from October to February.",
    },
    tips: [
      "Book a valley- or Himalaya-facing room for the sunrise.",
      "Winters are cold and can bring snow — carry heavy woollens from December to February.",
      "Mobile network and ATMs are limited; carry some cash.",
      "Pair with Nainital or Almora for a 4–5 day Kumaon trip.",
    ],
    faqs: [
      { q: "How far is Mukteshwar from Nainital?", a: "About 50 km, roughly a 2-hour drive through Bhowali and Ramgarh." },
      { q: "Does it snow in Mukteshwar?", a: "Mukteshwar often gets snowfall between late December and February, depending on the winter." },
      { q: "What is the best time to visit Mukteshwar?", a: "March to June for pleasant weather and orchards in bloom, and October to February for the clearest Himalayan views." },
      { q: "How many days are enough for Mukteshwar?", a: "Two nights are enough for the temple, viewpoints and a relaxed orchard stay." },
    ],
    nearby: ["nainital", "bhimtal", "almora"],
  },
  {
    id: "ranikhet",
    name: "Ranikhet",
    title: "Ranikhet Tour Package — Pine Forests & Orchards",
    description:
      "Ranikhet tour package: a quiet cantonment town with pine forests, Chaubatia orchards, Jhula Devi temple, the Kumaon Regiment museum and Himalayan views.",
    intro:
      "Pine forests, orchards and a calm, clean cantonment town — a Ranikhet holiday with hotels, a car with an experienced hill driver and easy add-ons to Almora, Kausani or Jim Corbett.",
    altitude: "About 1,870 m",
    bestTime: "Mar – Jun, Sep – Feb",
    idealStay: "2 nights",
    overview:
      "Ranikhet is an army cantonment town known for its pine and oak forests, wide Himalayan views and an unhurried pace. Visitors come for the Chaubatia orchards, Jhula Devi temple, the Kumaon Regiment museum and walks along the ridge.",
    sights: [
      { title: "Jhula Devi Temple", text: "A temple hung with thousands of bells offered by devotees." },
      { title: "Chaubatia Gardens", text: "Government orchards with apple and other fruit trees and Himalayan views." },
      { title: "Kumaon Regiment Museum", text: "The history of the Kumaon and Naga regiments, in the cantonment." },
      { title: "Majkhali & Upat", text: "Viewpoints and meadows along the Almora road, including the Upat golf course." },
    ],
    plan: {
      title: "Sample 3-day Ranikhet trip from Kathgodam",
      days: [
        ["Day 1", "Pickup at Kathgodam / Pantnagar → Ranikhet, about 3 hrs"],
        ["Day 2", "Jhula Devi temple, Chaubatia gardens, Kumaon Regiment museum, sunset at Majkhali"],
        ["Day 3", "Drop at Kathgodam, or continue to Almora, Kausani or Jim Corbett"],
      ],
      note: "Ranikhet fits well between Nainital and Kausani or Almora on a week-long Kumaon circuit.",
    },
    tips: [
      "Carry photo ID — parts of the cantonment have entry checks.",
      "Orchards are at their best in spring blossom and summer fruit season.",
      "Evenings are cool all year; pack a warm layer.",
      "Fuel up and carry cash before heading to smaller villages.",
    ],
    faqs: [
      { q: "How far is Ranikhet from Nainital?", a: "About 60 km, roughly a 2–2.5 hour drive." },
      { q: "What is Ranikhet famous for?", a: "Pine forests, the Chaubatia orchards, Jhula Devi temple, the Kumaon Regiment museum and calm cantonment walks with Himalayan views." },
      { q: "What is the best time to visit Ranikhet?", a: "March to June and September to February. Winter is cold with occasional snow on higher ridges." },
      { q: "Can I combine Ranikhet with Almora and Kausani?", a: "Yes. A 5–6 day circuit of Nainital, Ranikhet, Kausani and Almora is a classic Kumaon trip." },
    ],
    nearby: ["almora", "nainital", "mukteshwar"],
  },
  {
    id: "almora",
    name: "Almora",
    title: "Almora Tour Package — Temples, Bazaars & Binsar",
    description:
      "Almora tour package: Kasar Devi, the Jageshwar temples, old bazaars and bal mithai, sunset at Bright End Corner and Binsar sanctuary, with a car and hill driver.",
    intro:
      "Kumaon's cultural heart — old temples, stone bazaars and ridge-top views — with hotels, a car with an experienced hill driver and day trips to Jageshwar and Binsar.",
    altitude: "About 1,650 m",
    bestTime: "Mar – Jun, Sep – Feb",
    idealStay: "2–3 nights",
    overview:
      "Almora is a historic town on a horseshoe-shaped ridge, once a seat of the Chand kings. It is known for Kasar Devi on Crank's Ridge, the Jageshwar temple complex, the old Lala Bazaar, Kumaoni food and bal mithai, and the forests of Binsar nearby.",
    sights: [
      { title: "Kasar Devi", text: "A hilltop temple on Crank's Ridge with wide valley and mountain views." },
      { title: "Jageshwar Dham", text: "A complex of over a hundred stone temples in a deodar forest, a scenic drive from Almora." },
      { title: "Lala Bazaar & Chitai Golu Devta", text: "Old stone-paved markets, bal mithai, and the bell-filled Golu Devta temple." },
      { title: "Binsar sanctuary", text: "Oak and rhododendron forest with a famous Himalayan viewpoint (entry fees apply)." },
    ],
    plan: {
      title: "Sample 4-day Almora trip from Kathgodam",
      days: [
        ["Day 1", "Pickup at Kathgodam / Pantnagar → Almora, about 3 hrs; sunset at Bright End Corner"],
        ["Day 2", "Kasar Devi, Chitai Golu Devta temple, Lala Bazaar"],
        ["Day 3", "Day trip to Jageshwar Dham, or Binsar sanctuary"],
        ["Day 4", "Drive back to Kathgodam / Pantnagar, or continue to Kausani or Ranikhet"],
      ],
      note: "Stay a night inside Binsar for the best mountain views at sunrise.",
    },
    tips: [
      "Try bal mithai and singori from the old bazaar.",
      "Binsar has forest entry and vehicle fees; carry cash.",
      "Clear Himalayan views are most likely from October to February.",
      "Almora pairs well with Kausani and Ranikhet on a 5–6 day circuit.",
    ],
    faqs: [
      { q: "How far is Almora from Nainital?", a: "About 65 km, roughly a 2.5-hour drive." },
      { q: "What is Almora famous for?", a: "Kasar Devi, the Jageshwar temples, old bazaars, bal mithai, Kumaoni culture and the nearby Binsar sanctuary." },
      { q: "How many days do I need for Almora?", a: "Two to three nights cover Almora town, Kasar Devi and a day trip to Jageshwar or Binsar." },
      { q: "What is the best time to visit Almora?", a: "March to June and September to February. October to February has the clearest mountain views." },
    ],
    nearby: ["ranikhet", "mukteshwar", "nainital"],
  },
];

export const kumaonById = (id: string) => kumaonPlaces.find((p) => p.id === id);
export const kumaonPath = (id: string) => `/uttarakhand/${id}-tour-package/`;
export const KUMAON_HUB_PATH = "/uttarakhand/kumaon-tour-packages/";
