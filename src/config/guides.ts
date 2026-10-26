// Travel guides (/travel-guides/<slug>/). Written to answer the questions people
// ask search engines and AI assistants: a direct "quick answer" first, then the
// detail. Facts that change every season (temple dates, permits, heli booking)
// point to the official source instead of stating a date.
//
// Re-check each guide against official sources at least once a season and update
// `reviewed` — the date is shown on the page and in the Article markup.

export type GuideSection = { heading: string; paras?: string[]; bullets?: string[] };
export type Guide = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  quickAnswer: string;
  reviewed: string; // yyyy-mm-dd
  readMinutes: number;
  /** Live block rendered from site data in the middle of the guide. */
  widget?: "seasons" | "trip-cost" | "char-dham-cost" | "compare-nainital-mussoorie";
  widgetAfter?: number; // section index the widget follows
  sections: GuideSection[];
  faqs: { q: string; a: string }[];
  related: { label: string; href: string }[];
};

export const guides: Guide[] = [
  {
    slug: "best-time-to-visit-uttarakhand",
    title: "Best Time to Visit Uttarakhand — Month by Month",
    metaTitle: "Best Time to Visit Uttarakhand (Month-by-Month Guide)",
    description: "When to visit Uttarakhand for hill stations, snow, Char Dham, the Valley of Flowers and Jim Corbett — month by month, with what to avoid in the monsoon.",
    quickAnswer:
      "The best time to visit Uttarakhand is March to June and September to November, when days are clear and roads are open. Visit in December to February for snow (Auli, Dhanaulti) and avoid July–August if you can, when monsoon landslides often close hill roads.",
    reviewed: "2026-10-26",
    readMinutes: 5,
    widget: "seasons",
    widgetAfter: 0,
    sections: [
      {
        heading: "Uttarakhand through the year",
        paras: [
          "Uttarakhand runs from the plains near Haridwar to Himalayan peaks above 7,000 m, so the right month depends on where you are going. The lower hill stations (Nainital, Mussoorie, Bhimtal, Rishikesh) are pleasant most of the year; the high Himalaya — the Char Dham temples, Auli, Munsiyari and the Valley of Flowers — has a shorter season.",
        ],
      },
      {
        heading: "Spring and summer: March to June",
        paras: ["Clear skies, rhododendrons in the forests and the opening of the Char Dham yatra make this the busiest season. School holidays in May and June bring the biggest crowds to Nainital and Mussoorie."],
        bullets: [
          "Best for: family hill-station trips, Char Dham (from late April / May), Rishikesh rafting and Jim Corbett safaris",
          "Book hotels and taxis 4–6 weeks ahead for May–June and long weekends",
          "Days are warm in Rishikesh and Haridwar; evenings in the hills still need a light jacket",
        ],
      },
      {
        heading: "Monsoon: July and August",
        paras: [
          "Heavy rain makes the valleys green, but landslides regularly block roads for hours or days — especially on the routes to Kedarnath, Badrinath and Kumaon's higher towns. Travel only with buffer days and a flexible plan.",
        ],
        bullets: [
          "Good for: the Valley of Flowers (usually open from June, flowers peak in July–August), Dehradun, Rishikesh and lower hill stations",
          "Most Jim Corbett safari zones close in the monsoon; check the official Corbett booking site for the zones open on your dates",
          "Check road and weather advisories every morning and avoid driving in the hills after dark",
        ],
      },
      {
        heading: "Autumn: September to November",
        paras: [
          "Once the rain stops the air is the clearest of the year, with the best views of the snow peaks from Kausani, Munsiyari, Binsar and Mukteshwar. The second Char Dham season runs until the temples close around Diwali, and Durga Puja and Diwali holidays make October busy.",
        ],
      },
      {
        heading: "Winter: December to February",
        paras: ["Cold, sunny days in the lower hills and snow at higher places. Auli is the main snow destination; Dhanaulti and Nainital get occasional snowfall. The Char Dham temples are closed for winter."],
        bullets: [
          "Best for: snow trips to Auli, quiet hill-station breaks, New Year getaways",
          "Carry heavy woollens; some high roads need chains or close briefly after snowfall",
        ],
      },
    ],
    faqs: [
      { q: "Which month is best for Uttarakhand?", a: "October is the best single month: clear Himalayan views, pleasant days and open roads. April–June is also excellent but busier." },
      { q: "When does it snow in Uttarakhand?", a: "Snow usually falls from late December to February at higher places such as Auli, and occasionally at Dhanaulti and Nainital. Snowfall varies every year." },
      { q: "Is it safe to visit Uttarakhand in the monsoon?", a: "It is possible but plan carefully: landslides can close roads for hours or days in July–August. Keep buffer days, avoid night driving and follow official advisories." },
      { q: "When is the Char Dham yatra open?", a: "The temples usually open in late April or May and close around October–November. Exact dates are announced each year by the temple authorities." },
    ],
    related: [
      { label: "Char Dham Yatra guide", href: "/travel-guides/char-dham-yatra-guide/" },
      { label: "What a trip to Uttarakhand costs", href: "/travel-guides/uttarakhand-trip-cost/" },
      { label: "Packing list by season", href: "/travel-guides/uttarakhand-packing-list/" },
    ],
  },
  {
    slug: "char-dham-yatra-guide",
    title: "Char Dham Yatra Guide — Route, Days, Registration and Cost",
    metaTitle: "Char Dham Yatra Guide: Route, Days, Registration & Cost",
    description: "Plan the Char Dham Yatra to Yamunotri, Gangotri, Kedarnath and Badrinath: route order, how many days, official registration, treks, helicopters and what it costs.",
    quickAnswer:
      "The Char Dham Yatra visits Yamunotri, Gangotri, Kedarnath and Badrinath, usually in that order, and takes 10–12 days by road from Haridwar or Rishikesh. Registration on the official Uttarakhand portal is compulsory. Yamunotri and Kedarnath involve treks (ponies, palkis and, for Kedarnath, helicopters are available); Gangotri and Badrinath are reached by road.",
    reviewed: "2026-10-26",
    readMinutes: 7,
    widget: "char-dham-cost",
    widgetAfter: 3,
    sections: [
      {
        heading: "The route",
        paras: ["Pilgrims traditionally travel west to east: Yamunotri → Gangotri → Kedarnath → Badrinath. Most road itineraries start and end in Haridwar or Rishikesh; travellers from far-off cities usually fly to Dehradun (Jolly Grant) or take a train to Haridwar."],
        bullets: [
          "Yamunotri — road to Janki Chatti, then a trek of about 6 km",
          "Gangotri — reachable by road, usually with a halt at Uttarkashi or Harsil",
          "Kedarnath — road to Sonprayag, shuttle to Gaurikund, then a trek of about 16 km (or a helicopter)",
          "Badrinath — reachable by road via Joshimath; Mana village is nearby",
        ],
      },
      {
        heading: "How many days you need",
        paras: ["Plan 10–12 days on the ground for all four dhams at a comfortable pace, plus 1–2 buffer days for weather. A Do Dham trip (Kedarnath and Badrinath) takes about 6–7 days."],
      },
      {
        heading: "Registration and documents",
        bullets: [
          "Register every pilgrim on the official Uttarakhand Registration & Tourist Care portal before travel and carry the confirmation",
          "Carry a government photo ID for each traveller",
          "Rules change each season — check the official portal close to your dates",
        ],
      },
      {
        heading: "Treks, ponies and helicopters",
        paras: [
          "Ponies, palkis (palanquins) and porters are available at Janki Chatti and Gaurikund at regulated rates. Kedarnath helicopter seats are sold only on the official IRCTC HeliYatra portal, in the pilgrim's name — avoid websites or agents claiming to sell heli tickets.",
        ],
      },
      {
        heading: "Health and fitness",
        bullets: [
          "Kedarnath and the other dhams are above 3,000 m — get a medical check-up, especially if you have heart, lung or blood-pressure conditions",
          "Walk regularly for a few weeks before the trek and climb slowly; rest if you feel breathless or dizzy",
          "Carry warm layers, rain gear and personal medicines even in summer",
        ],
      },
    ],
    faqs: [
      { q: "How many days does the Char Dham Yatra take?", a: "About 10–12 days by road from Haridwar or Rishikesh, plus 1–2 buffer days. Do Dham (Kedarnath and Badrinath) takes 6–7 days." },
      { q: "Is registration compulsory for Char Dham?", a: "Yes. Every pilgrim must register on the official Uttarakhand Registration & Tourist Care portal before travelling." },
      { q: "What is the correct order of the Char Dham?", a: "Traditionally Yamunotri, Gangotri, Kedarnath and then Badrinath — travelling from west to east." },
      { q: "How do I book a Kedarnath helicopter?", a: "Only on the official IRCTC HeliYatra portal. Tickets are issued in the pilgrim's name, so beware of agents or websites selling them." },
      { q: "Can elderly people do the Char Dham Yatra?", a: "Yes, many do — with a slower plan, rest days, an SUV for comfort, ponies or palkis for the treks and a doctor's clearance first." },
    ],
    related: [
      { label: "Kedarnath trip guide", href: "/travel-guides/kedarnath-trip-guide/" },
      { label: "Char Dham planning help", href: "/uttarakhand/char-dham-yatra/" },
      { label: "Haridwar to Kedarnath route taxi", href: "/taxi/haridwar-to-sonprayag/" },
    ],
  },
  {
    slug: "kedarnath-trip-guide",
    title: "How to Plan a Kedarnath Trip — Trek, Helicopter, Days and Stay",
    metaTitle: "Kedarnath Trip Guide: Trek, Helicopter, Best Time & Days",
    description: "How to reach Kedarnath: road to Sonprayag, the Gaurikund trek, helicopter booking on the official portal, how many days you need, the best months and what to carry.",
    quickAnswer:
      "To reach Kedarnath, drive to Sonprayag (about 7–8 hours from Rishikesh), take the shuttle to Gaurikund and trek about 16 km to the temple — 6 to 8 hours uphill on foot, or by pony or palki. Helicopters fly from the Guptkashi–Phata–Sersi area and are booked only on IRCTC HeliYatra. Plan 4–5 days from Haridwar or Rishikesh, and go in May–June or September–October.",
    reviewed: "2026-10-26",
    readMinutes: 6,
    sections: [
      {
        heading: "Getting to the base",
        bullets: [
          "Haridwar or Rishikesh → Sonprayag by road: about 210–240 km, 7–9 hours",
          "Stay the night at Sonprayag, Sitapur or Guptkashi",
          "Sonprayag → Gaurikund by the local shuttle; private vehicles stop at Sonprayag",
        ],
      },
      {
        heading: "The trek",
        paras: ["The paved trail from Gaurikund to Kedarnath is about 16 km and climbs steadily. Fit walkers take 6–8 hours up and 4–6 hours down. Ponies, palkis and porters are available at regulated rates; start early to finish before afternoon weather."],
      },
      {
        heading: "Helicopter",
        paras: ["Helicopter services operate in the season from helipads in the Guptkashi, Phata and Sersi area. Seats are released on the official IRCTC HeliYatra portal and sell out fast. Plan your road route so you reach the helipad town the day before your slot."],
      },
      {
        heading: "Suggested plan (from Haridwar or Rishikesh)",
        bullets: [
          "Day 1: Drive to Guptkashi / Sitapur",
          "Day 2: Sonprayag → Gaurikund → trek to Kedarnath, evening darshan",
          "Day 3: Morning darshan, trek down, night at Guptkashi",
          "Day 4: Drive back (or continue to Badrinath for a Do Dham trip)",
          "Add a buffer day — weather can delay treks and helicopters",
        ],
      },
      {
        heading: "What to carry",
        bullets: ["Yatra registration and photo ID", "Warm jacket, rain poncho, good walking shoes", "Personal medicines, water bottle, energy snacks", "A small backpack — leave heavy luggage in the car or hotel"],
      },
    ],
    faqs: [
      { q: "How long is the Kedarnath trek?", a: "About 16 km from Gaurikund to the temple. Most people take 6–8 hours to walk up and 4–6 hours to come down." },
      { q: "How many days are needed for Kedarnath?", a: "Plan 4–5 days from Haridwar or Rishikesh, including a buffer day for weather." },
      { q: "When is the best time to visit Kedarnath?", a: "May–June and September–October. The temple is closed in winter, and July–August brings monsoon landslide risk." },
      { q: "Where do I book the Kedarnath helicopter?", a: "Only on the official IRCTC HeliYatra portal, in the pilgrim's name." },
    ],
    related: [
      { label: "Char Dham Yatra guide", href: "/travel-guides/char-dham-yatra-guide/" },
      { label: "Rishikesh to Kedarnath route taxi", href: "/taxi/rishikesh-to-sonprayag/" },
      { label: "Char Dham planning help", href: "/uttarakhand/char-dham-yatra/" },
    ],
  },
  {
    slug: "nainital-or-mussoorie",
    title: "Nainital or Mussoorie — Which Hill Station Should You Choose?",
    metaTitle: "Nainital vs Mussoorie: Which Is Better for Your Trip?",
    description: "Nainital or Mussoorie? Compare distance from Delhi, how to reach, things to do, crowds and who each suits — and which places to add nearby.",
    quickAnswer:
      "Choose Nainital for a lake holiday with boating and quieter Kumaon add-ons like Bhimtal and Mukteshwar; choose Mussoorie for Mall Road, viewpoints and an easy add-on to Dhanaulti or Rishikesh. Both are about 290–310 km from Delhi (7–8 hours); Mussoorie is closer to Dehradun's airport and station, Nainital to Kathgodam station.",
    reviewed: "2026-10-26",
    readMinutes: 4,
    widget: "compare-nainital-mussoorie",
    widgetAfter: 0,
    sections: [
      { heading: "At a glance", paras: ["Both are classic first hill-station trips from Delhi NCR. The real difference is the feel of the place and what you can combine it with."] },
      {
        heading: "Choose Nainital if…",
        bullets: ["You want a lake — boating, the lakeside Mall Road and ridge viewpoints", "You'd like quieter extensions: Bhimtal, Sattal, Mukteshwar or Jim Corbett", "You are coming by train (Kathgodam is about an hour away)"],
      },
      {
        heading: "Choose Mussoorie if…",
        bullets: ["You want Mall Road, viewpoints and colonial-era walks", "You'd like to add Dhanaulti's forests or Rishikesh's river and ashrams", "You are flying in (Dehradun airport is about 2 hours away)"],
      },
      {
        heading: "Crowds and the best time",
        paras: ["Both get very busy on long weekends and in May–June. For space and clear views, go in March–April or October–November, or stay in Bhimtal or Dhanaulti and visit the main town for the day."],
      },
    ],
    faqs: [
      { q: "Which is closer to Delhi, Nainital or Mussoorie?", a: "They are similar: Mussoorie is about 290 km and Nainital about 310 km by road, each a 7–8 hour drive." },
      { q: "Is Nainital or Mussoorie better for families?", a: "Both work well. Nainital suits families who enjoy boating and calm lakes; Mussoorie suits those who like walking, shopping and viewpoints." },
      { q: "How many days are enough for Nainital or Mussoorie?", a: "Two to three nights is ideal for either, or four to five if you add Bhimtal and Mukteshwar or Dhanaulti and Rishikesh." },
    ],
    related: [
      { label: "Delhi to Nainital taxi", href: "/taxi/delhi-to-nainital/" },
      { label: "Delhi to Mussoorie taxi", href: "/taxi/delhi-to-mussoorie/" },
      { label: "Nainital travel guide", href: "/destinations/nainital/" },
      { label: "Mussoorie travel guide", href: "/destinations/mussoorie/" },
    ],
  },
  {
    slug: "uttarakhand-trip-cost",
    title: "How Much Does a Trip to Uttarakhand Cost?",
    metaTitle: "Uttarakhand Trip Cost: Budget for Taxi, Hotels & Days",
    description: "What a 3–5 day Uttarakhand trip costs for two people — taxi from Delhi, hotels by category and taxes — calculated from our current rates, plus how to keep costs down.",
    quickAnswer:
      "For two people, a 4-night hill-station trip from Delhi (for example Nainital) costs roughly the amounts in the table below — the private taxi and the hotel category make up most of the cost. Travelling outside May–June, choosing a sedan and staying in a standard hotel keeps it lower.",
    reviewed: "2026-10-26",
    readMinutes: 4,
    widget: "trip-cost",
    widgetAfter: 0,
    sections: [
      { heading: "What the cost is made of", paras: ["A private road trip in Uttarakhand has three main parts: the taxi (charged per km with a daily minimum, plus driver allowance and night halts), the hotel (per room per night, by category) and taxes. Meals, entry tickets and activities are extra."] },
      {
        heading: "Ways to spend less",
        bullets: [
          "Travel in March–April or September–November instead of May–June peak season",
          "Choose a sedan if you are up to four people with light luggage",
          "Stay two or more nights in one base instead of moving every day",
          "Book trains to Kathgodam, Haridwar or Dehradun and take a shorter taxi from there",
        ],
      },
      {
        heading: "What is usually extra",
        bullets: ["Tolls, parking and state entry tax", "Lunch and dinner unless included", "Boating, ropeways, safaris and entry tickets", "Peak-season hotel surcharges on long weekends and holidays"],
      },
    ],
    faqs: [
      { q: "What is the cost of a Nainital trip from Delhi for 2 people?", a: "See the table on this page — it is calculated from our current taxi and hotel rates for a 4-night trip. Your written quote gives the exact price for your dates." },
      { q: "Is a train cheaper than a taxi from Delhi?", a: "Usually yes for the long leg: take a train to Kathgodam, Haridwar or Dehradun and a taxi from there. A taxi from home is more convenient for families with luggage." },
      { q: "Does the cost include GST?", a: "The estimates on this page include service charges and GST. Tolls, parking, meals and activities are extra." },
    ],
    related: [
      { label: "Taxi routes & fares", href: "/taxi/" },
      { label: "Customise my trip", href: "/customise-my-trip/" },
      { label: "Best time to visit", href: "/travel-guides/best-time-to-visit-uttarakhand/" },
    ],
  },
  {
    slug: "uttarakhand-packing-list",
    title: "Uttarakhand Packing List by Season",
    metaTitle: "Uttarakhand Packing List: What to Carry in Every Season",
    description: "What to pack for Uttarakhand in summer, monsoon, autumn and winter — clothes, shoes, documents and medicines for hill stations, treks and the Char Dham.",
    quickAnswer:
      "Pack layers in every season: hill evenings are cool even in summer. Add a rain jacket and quick-dry shoes for July–September, heavy woollens and thermals for December–February, and good walking shoes, ID and personal medicines for any trek or the Char Dham.",
    reviewed: "2026-10-26",
    readMinutes: 3,
    sections: [
      { heading: "Every trip", bullets: ["Government photo ID for every traveller (and yatra registration for the Char Dham)", "Personal medicines, motion-sickness tablets for hill roads, a small first-aid kit", "Sunscreen, sunglasses and a cap — the mountain sun is strong", "Power bank; mobile signal can be weak in the higher hills", "Reusable water bottle — carry your waste back down"] },
      { heading: "Summer (March–June)", bullets: ["Cotton clothes for the day", "A light jacket or fleece for evenings", "Comfortable walking shoes"] },
      { heading: "Monsoon (July–September)", bullets: ["Rain jacket or poncho and an umbrella", "Quick-dry clothes and waterproof or sports sandals", "Waterproof covers for phones and bags"] },
      { heading: "Autumn (October–November)", bullets: ["Warm layers — mornings and nights get cold", "A down or padded jacket for Munsiyari, Kausani and the Char Dham"] },
      { heading: "Winter (December–February)", bullets: ["Thermal innerwear, heavy woollens and a padded jacket", "Gloves, a woollen cap and warm socks", "Shoes with good grip for icy paths in Auli or Dhanaulti"] },
    ],
    faqs: [
      { q: "Do I need warm clothes in Uttarakhand in summer?", a: "Yes, a light jacket or fleece — evenings in hill stations like Nainital and Mussoorie are cool even in May and June." },
      { q: "What shoes are best for Kedarnath?", a: "Broken-in trekking or sports shoes with good grip, plus a spare pair of socks and a rain cover." },
    ],
    related: [
      { label: "Best time to visit", href: "/travel-guides/best-time-to-visit-uttarakhand/" },
      { label: "Kedarnath trip guide", href: "/travel-guides/kedarnath-trip-guide/" },
    ],
  },
];

export const guidePath = (g: Pick<Guide, "slug">) => `/travel-guides/${g.slug}/`;
export const guideBySlug = (slug: string) => guides.find((g) => g.slug === slug);
