// How travellers from across India reach Uttarakhand, plus the road distances
// used by the public fare estimator.
//
// Distances and drive times are typical road figures (rounded) for planning
// only — the written quote uses the actual route. Train names are long-running
// services; schedules change, so pages always point people to IRCTC / airlines.

export type Place = { id: string; name: string; kind: "city" | "hub" | "destination"; region?: "Kumaon" | "Garhwal" | "Plains" };

export const places: Place[] = [
  // Where most travellers start or arrive
  { id: "delhi", name: "Delhi / NCR", kind: "city", region: "Plains" },
  { id: "chandigarh", name: "Chandigarh", kind: "city", region: "Plains" },
  { id: "kathgodam", name: "Kathgodam Railway Station", kind: "hub", region: "Kumaon" },
  { id: "haldwani", name: "Haldwani", kind: "hub", region: "Kumaon" },
  { id: "pantnagar", name: "Pantnagar Airport", kind: "hub", region: "Kumaon" },
  { id: "jollygrant", name: "Dehradun Airport (Jolly Grant)", kind: "hub", region: "Garhwal" },
  { id: "dehradun", name: "Dehradun", kind: "hub", region: "Garhwal" },
  { id: "haridwar", name: "Haridwar", kind: "hub", region: "Garhwal" },
  // Destinations
  { id: "rishikesh", name: "Rishikesh", kind: "destination", region: "Garhwal" },
  { id: "mussoorie", name: "Mussoorie", kind: "destination", region: "Garhwal" },
  { id: "dhanaulti", name: "Dhanaulti", kind: "destination", region: "Garhwal" },
  { id: "nainital", name: "Nainital", kind: "destination", region: "Kumaon" },
  { id: "bhimtal", name: "Bhimtal", kind: "destination", region: "Kumaon" },
  { id: "mukteshwar", name: "Mukteshwar", kind: "destination", region: "Kumaon" },
  { id: "almora", name: "Almora", kind: "destination", region: "Kumaon" },
  { id: "ranikhet", name: "Ranikhet", kind: "destination", region: "Kumaon" },
  { id: "kausani", name: "Kausani", kind: "destination", region: "Kumaon" },
  { id: "binsar", name: "Binsar", kind: "destination", region: "Kumaon" },
  { id: "munsiyari", name: "Munsiyari", kind: "destination", region: "Kumaon" },
  { id: "corbett", name: "Jim Corbett (Ramnagar)", kind: "destination", region: "Kumaon" },
  { id: "auli", name: "Auli / Joshimath", kind: "destination", region: "Garhwal" },
  { id: "chopta", name: "Chopta", kind: "destination", region: "Garhwal" },
  { id: "sonprayag", name: "Sonprayag (Kedarnath route)", kind: "destination", region: "Garhwal" },
  { id: "badrinath", name: "Badrinath", kind: "destination", region: "Garhwal" },
  { id: "barkot", name: "Barkot (Yamunotri route)", kind: "destination", region: "Garhwal" },
  { id: "uttarkashi", name: "Uttarkashi (Gangotri route)", kind: "destination", region: "Garhwal" },
];

/** [from, to, km, typical drive time] — symmetric. */
const legs: [string, string, number, string][] = [
  // From Delhi / NCR
  ["delhi", "haridwar", 220, "5–6 hrs"],
  ["delhi", "rishikesh", 240, "6 hrs"],
  ["delhi", "dehradun", 250, "5–6 hrs"],
  ["delhi", "jollygrant", 245, "5–6 hrs"],
  ["delhi", "mussoorie", 290, "7 hrs"],
  ["delhi", "dhanaulti", 315, "8 hrs"],
  ["delhi", "kathgodam", 280, "6–7 hrs"],
  ["delhi", "haldwani", 275, "6–7 hrs"],
  ["delhi", "nainital", 310, "7–8 hrs"],
  ["delhi", "bhimtal", 300, "7 hrs"],
  ["delhi", "mukteshwar", 345, "8–9 hrs"],
  ["delhi", "almora", 370, "9 hrs"],
  ["delhi", "ranikhet", 360, "8–9 hrs"],
  ["delhi", "kausani", 420, "10–11 hrs"],
  ["delhi", "binsar", 395, "10 hrs"],
  ["delhi", "corbett", 250, "6 hrs"],
  ["delhi", "chopta", 450, "11–12 hrs"],
  ["delhi", "auli", 500, "12–13 hrs"],
  ["delhi", "sonprayag", 455, "11–12 hrs"],
  ["delhi", "badrinath", 530, "13–14 hrs"],
  // From Chandigarh
  ["chandigarh", "dehradun", 170, "4 hrs"],
  ["chandigarh", "mussoorie", 205, "5–6 hrs"],
  ["chandigarh", "haridwar", 205, "4–5 hrs"],
  ["chandigarh", "rishikesh", 215, "5 hrs"],
  ["chandigarh", "nainital", 440, "10 hrs"],
  // Kumaon hubs
  ["kathgodam", "nainital", 35, "1–1.5 hrs"],
  ["kathgodam", "bhimtal", 22, "45 min"],
  ["kathgodam", "mukteshwar", 62, "2 hrs"],
  ["kathgodam", "almora", 85, "3 hrs"],
  ["kathgodam", "ranikhet", 80, "3 hrs"],
  ["kathgodam", "kausani", 135, "4.5–5 hrs"],
  ["kathgodam", "binsar", 105, "3.5–4 hrs"],
  ["kathgodam", "munsiyari", 275, "9–10 hrs"],
  ["kathgodam", "corbett", 75, "2 hrs"],
  ["haldwani", "nainital", 40, "1.5 hrs"],
  ["haldwani", "bhimtal", 27, "1 hr"],
  ["haldwani", "almora", 90, "3 hrs"],
  ["haldwani", "mukteshwar", 67, "2 hrs"],
  ["haldwani", "ranikhet", 85, "3 hrs"],
  ["haldwani", "corbett", 70, "2 hrs"],
  ["pantnagar", "nainital", 65, "2 hrs"],
  ["pantnagar", "bhimtal", 55, "1.5–2 hrs"],
  ["pantnagar", "almora", 115, "3.5–4 hrs"],
  ["pantnagar", "corbett", 85, "2–2.5 hrs"],
  ["pantnagar", "mukteshwar", 95, "3 hrs"],
  ["nainital", "bhimtal", 22, "45 min"],
  ["nainital", "mukteshwar", 50, "1.5–2 hrs"],
  ["nainital", "almora", 65, "2–2.5 hrs"],
  ["nainital", "ranikhet", 60, "2 hrs"],
  ["nainital", "kausani", 120, "4 hrs"],
  ["nainital", "corbett", 65, "2 hrs"],
  ["almora", "kausani", 52, "2 hrs"],
  ["almora", "binsar", 30, "1 hr"],
  ["almora", "munsiyari", 210, "7–8 hrs"],
  // Garhwal hubs
  ["jollygrant", "rishikesh", 20, "35 min"],
  ["jollygrant", "haridwar", 35, "1 hr"],
  ["jollygrant", "dehradun", 25, "45 min"],
  ["jollygrant", "mussoorie", 60, "2 hrs"],
  ["jollygrant", "dhanaulti", 85, "2.5–3 hrs"],
  ["dehradun", "mussoorie", 35, "1–1.5 hrs"],
  ["dehradun", "dhanaulti", 60, "2 hrs"],
  ["dehradun", "rishikesh", 45, "1–1.5 hrs"],
  ["dehradun", "haridwar", 55, "1.5 hrs"],
  ["haridwar", "rishikesh", 25, "45 min"],
  ["haridwar", "mussoorie", 90, "3 hrs"],
  ["haridwar", "sonprayag", 240, "8–9 hrs"],
  ["haridwar", "badrinath", 315, "10–11 hrs"],
  ["haridwar", "auli", 280, "9–10 hrs"],
  ["haridwar", "chopta", 215, "7–8 hrs"],
  ["haridwar", "barkot", 185, "6–7 hrs"],
  ["haridwar", "uttarkashi", 195, "6–7 hrs"],
  ["haridwar", "corbett", 200, "5–6 hrs"],
  ["rishikesh", "sonprayag", 210, "7–8 hrs"],
  ["rishikesh", "badrinath", 295, "10 hrs"],
  ["rishikesh", "auli", 260, "8–9 hrs"],
  ["rishikesh", "chopta", 190, "6–7 hrs"],
  ["rishikesh", "barkot", 165, "5–6 hrs"],
  ["rishikesh", "uttarkashi", 170, "5–6 hrs"],
  ["rishikesh", "mussoorie", 75, "2.5 hrs"],
  ["dehradun", "barkot", 135, "4–5 hrs"],
  ["dehradun", "uttarkashi", 145, "5 hrs"],
];

export function placeById(id: string) {
  return places.find((p) => p.id === id);
}

/** Typical road distance between two places, or null if not in the table. */
export function routeBetween(a: string, b: string): { km: number; time: string } | null {
  const leg = legs.find(([x, y]) => (x === a && y === b) || (x === b && y === a));
  return leg ? { km: leg[2], time: leg[3] } : null;
}

/** Places reachable from `id` in the table, nearest first. */
export function destinationsFrom(id: string) {
  return legs
    .flatMap(([x, y, km, time]) => (x === id ? [{ to: y, km, time }] : y === id ? [{ to: x, km, time }] : []))
    .sort((p, q) => p.km - q.km)
    .map((r) => ({ ...r, place: placeById(r.to)! }));
}

/** Places that appear in at least one route (for the estimator's "From" list). */
export const estimatorPlaces = places.filter((p) => legs.some(([x, y]) => x === p.id || y === p.id));

export const estimatorRoutes = legs.map(([a, b, km, time]) => ({ a, b, km, time }));

// ---------- Origin cities (who comes to Uttarakhand, and how) ----------

export type Origin = {
  slug: string; // URL: /uttarakhand/from-<slug>/
  city: string; // display name
  state: string;
  /** Short line used in cards and meta descriptions. */
  blurb: string;
  /** Estimator / taxi form starting point: a road origin or the hub people arrive at. */
  startPlace: string;
  air: string;
  rail: string;
  road: string;
  /** Destinations that work best for travellers from this city. */
  picks: string[];
  /** When people from this city usually travel. */
  holidays: string;
  faqs: { q: string; a: string }[];
};

export const origins: Origin[] = [
  {
    slug: "delhi",
    city: "Delhi NCR",
    state: "Delhi, Noida, Gurugram, Ghaziabad, Faridabad",
    blurb: "Doorstep pickup from anywhere in Delhi NCR — Nainital, Mussoorie and Rishikesh are a day's drive away.",
    startPlace: "delhi",
    air: "Short flights to Dehradun (Jolly Grant) and Pantnagar, but most Delhi travellers simply drive — door-to-door is often faster than flying for hill stations under 8 hours away.",
    rail: "Morning and evening trains to Kathgodam (for Nainital), Haridwar and Dehradun, including Shatabdi and Vande Bharat services. Book early for weekends and holidays on IRCTC.",
    road: "We pick you up from home, office, airport or railway station anywhere in Delhi NCR. Typical drives: Haridwar 5–6 hrs, Rishikesh 6 hrs, Mussoorie 7 hrs, Nainital 7–8 hrs.",
    picks: ["nainital", "mussoorie", "rishikesh", "corbett", "bhimtal", "auli"],
    holidays: "Long weekends, summer holidays (May–June) and Christmas–New Year are peak — book 3–4 weeks ahead.",
    faqs: [
      { q: "Can you pick us up from our home in Noida or Gurugram?", a: "Yes. We pick up from any address in Delhi NCR — home, office, IGI Airport or a railway station. Share the address when you enquire and the quote shows the full fare from your door." },
      { q: "Is a weekend trip from Delhi practical?", a: "For Rishikesh, Haridwar, Mussoorie, Jim Corbett or Nainital, yes — leave early Saturday and return Sunday night. For Auli, Munsiyari or Chopta, plan at least 4–5 days." },
      { q: "Do we pay tolls and Uttarakhand state tax separately?", a: "Your quote lists tolls, parking and state entry tax either as an estimate or at actuals, so nothing is hidden. An interstate taxi needs a valid permit, which our partners carry." },
    ],
  },
  {
    slug: "mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    blurb: "Fly to Dehradun or Delhi and we take it from there — airport pickup, hotels and a hill driver for the whole trip.",
    startPlace: "jollygrant",
    air: "Fly to Dehradun (Jolly Grant) for Rishikesh, Mussoorie and Char Dham, or to Delhi for Nainital and Jim Corbett. Pantnagar works well for Nainital when flights fit your dates.",
    rail: "Direct long-distance trains run to Dehradun and Haridwar from Mumbai, but the journey takes well over a day — most travellers fly.",
    road: "From Dehradun Airport we reach Rishikesh in about 35 minutes and Mussoorie in about 2 hours. From Delhi Airport we drive you straight to the hills.",
    picks: ["rishikesh", "mussoorie", "nainital", "auli", "corbett", "sonprayag"],
    holidays: "Diwali, Christmas and May–June summer holidays are busy; Char Dham season (May–June, Sept–Oct) books out early.",
    faqs: [
      { q: "Which airport should we fly into from Mumbai?", a: "Dehradun (Jolly Grant) for Rishikesh, Mussoorie, Haridwar and Char Dham. Delhi or Pantnagar for Nainital, Bhimtal and Jim Corbett. Tell us your plan and we'll suggest the shortest route." },
      { q: "Can you receive us at the airport and plan the whole trip?", a: "Yes — airport pickup, hotels, sightseeing and drop back to the airport, in one itemised quote." },
      { q: "Is May–June too crowded?", a: "It is peak season. Book hotels and taxis 4–6 weeks ahead, or travel in March–April or September–November for a calmer trip." },
    ],
  },
  {
    slug: "kolkata",
    city: "Kolkata",
    state: "West Bengal",
    blurb: "Puja holidays in the hills — trains to Kathgodam and Haridwar, or fly via Delhi or Dehradun, with pickup on arrival.",
    startPlace: "kathgodam",
    air: "Fly to Delhi or Dehradun. Dehradun suits Rishikesh, Mussoorie and Char Dham; from Delhi we drive you to Kumaon or Garhwal.",
    rail: "Long-running direct trains connect Howrah with Kathgodam (for Nainital and Kumaon) and with Haridwar / Dehradun (for Garhwal and Char Dham). Book on IRCTC as soon as reservations open for Puja dates.",
    road: "We meet your train at Kathgodam, Haridwar or Dehradun. Kathgodam → Nainital is about an hour; Haridwar → Rishikesh about 45 minutes.",
    picks: ["nainital", "kausani", "munsiyari", "almora", "rishikesh", "sonprayag"],
    holidays: "Durga Puja (September–October) is the big season for travellers from Bengal — Kumaon hill stations and Char Dham fill up fast.",
    faqs: [
      { q: "Will you meet our train at Kathgodam or Haridwar?", a: "Yes. Share your train number and we track delays. Free waiting time and any charges after it are written in the quote." },
      { q: "Which hill stations suit a Puja trip?", a: "October is clear and pleasant — Nainital, Kausani, Munsiyari and Almora in Kumaon offer Himalayan views. The Char Dham season is also open until around Diwali." },
      { q: "Can elderly parents travel comfortably?", a: "Yes, with a slower itinerary, fewer hotel changes and an SUV for comfort. Tell us about any health needs and we'll plan rest days." },
    ],
  },
  {
    slug: "ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    blurb: "Char Dham yatra and hill holidays from Gujarat — fly to Dehradun or Delhi and travel with a dedicated hill driver.",
    startPlace: "jollygrant",
    air: "Fly to Dehradun (Jolly Grant) or Delhi. Dehradun is closest for Haridwar, Rishikesh and the Char Dham route.",
    rail: "Direct trains run between Gujarat and Dehradun / Haridwar, taking over a day — check IRCTC for current services.",
    road: "From Dehradun Airport, Haridwar is about an hour and Rishikesh about 35 minutes. Char Dham road trips usually start from Haridwar or Rishikesh.",
    picks: ["sonprayag", "badrinath", "rishikesh", "haridwar", "mussoorie", "nainital"],
    holidays: "Char Dham in May–June, Diwali vacation (October–November) and summer holidays are the busiest times.",
    faqs: [
      { q: "How many days do we need for Char Dham from Ahmedabad?", a: "Plan 10–12 days on the ground from Haridwar or Rishikesh, plus your flights. Do Dham (Kedarnath + Badrinath) takes about 6–7 days." },
      { q: "Can you arrange pure vegetarian meals and stays?", a: "Most hotels on the yatra route serve vegetarian food. Tell us your preferences (e.g. Jain food) and we'll choose stays that can manage it." },
      { q: "Do you help with yatra registration?", a: "Registration is done on the official Uttarakhand portal in the traveller's name. We guide you through it and remind you of current rules before departure." },
    ],
  },
  {
    slug: "bengaluru",
    city: "Bengaluru",
    state: "Karnataka",
    blurb: "Fly into Dehradun or Delhi for Himalayan treks, yoga in Rishikesh and quiet Kumaon hill stays.",
    startPlace: "jollygrant",
    air: "Fly to Dehradun (Jolly Grant) for Rishikesh, Mussoorie and Garhwal, or to Delhi for Nainital, Jim Corbett and Kumaon.",
    rail: "Long-distance trains exist but take two days or more — flying is the practical option.",
    road: "From Dehradun Airport: Rishikesh 35 min, Mussoorie 2 hrs. From Delhi Airport we drive you directly to Kumaon.",
    picks: ["rishikesh", "auli", "chopta", "mussoorie", "nainital", "binsar"],
    holidays: "Long weekends, Christmas–New Year (snow in Auli) and April–June are popular.",
    faqs: [
      { q: "Can we combine Rishikesh with a short trek?", a: "Yes — Rishikesh pairs well with Chopta–Tungnath or Auli. Plan 5–7 days on the ground. We arrange transport and stays; treks are with licensed local operators." },
      { q: "When is snow likely in Auli?", a: "Usually from late December to February, depending on the season. We'll share current conditions before you book." },
      { q: "Do you arrange airport drops for early flights?", a: "Yes. Late-night or early-morning pickups have a small charge, listed in your quote." },
    ],
  },
  {
    slug: "lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    blurb: "Overnight trains to Kathgodam put Nainital within easy reach — or drive up with door pickup from Lucknow.",
    startPlace: "kathgodam",
    air: "Fly to Delhi or Dehradun if you prefer; most Lucknow travellers take the train to Kathgodam or drive.",
    rail: "Overnight trains connect Lucknow with Kathgodam (for Nainital and Kumaon) and with Haridwar / Dehradun. Check IRCTC for current timings.",
    road: "We can pick you up from Lucknow for a full road trip, or meet you at Kathgodam station — Nainital is about an hour away.",
    picks: ["nainital", "bhimtal", "corbett", "mukteshwar", "almora", "rishikesh"],
    holidays: "Summer holidays (May–June), Diwali and New Year are peak for Kumaon trips.",
    faqs: [
      { q: "Is it better to take the train or drive from Lucknow?", a: "The overnight train to Kathgodam is the most relaxed option; we meet you at the station. Driving all the way suits larger families who want one vehicle throughout." },
      { q: "Can we cover Nainital and Jim Corbett together?", a: "Yes — a 4–5 day Kumaon plan covering Nainital, Bhimtal and Jim Corbett works well. Safari permits are booked on the official Corbett portal." },
      { q: "What car is best for a family of six?", a: "An SUV / MUV such as an Ertiga or Innova (or similar) is comfortable for six with luggage on hill roads." },
    ],
  },
  {
    slug: "chandigarh",
    city: "Chandigarh",
    state: "Punjab, Haryana & Himachal",
    blurb: "Mussoorie and Dehradun are about 4–5 hours away — pickup from Chandigarh, Mohali or Panchkula.",
    startPlace: "chandigarh",
    air: "Not usually needed — the drive to Dehradun is about 4 hours.",
    rail: "Trains connect Chandigarh with Haridwar and Dehradun; driving is usually simpler.",
    road: "Door pickup from Chandigarh, Mohali or Panchkula. Typical drives: Dehradun 4 hrs, Mussoorie 5–6 hrs, Rishikesh 5 hrs.",
    picks: ["mussoorie", "rishikesh", "dhanaulti", "auli", "chopta", "nainital"],
    holidays: "Long weekends, summer holidays and Christmas–New Year are peak; Auli snow trips are popular in January.",
    faqs: [
      { q: "Can we do a weekend in Mussoorie from Chandigarh?", a: "Yes — it is about a 5–6 hour drive. Leave early Saturday, stay one or two nights and return Sunday or Monday." },
      { q: "Do you pick up from Mohali and Panchkula?", a: "Yes, pickup anywhere in the tricity is included in your quote." },
      { q: "Is the Auli road open in winter?", a: "Roads are usually open with care in winter, but snow can cause delays. We check conditions and plan buffer time." },
    ],
  },
  {
    slug: "jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    blurb: "Escape the plains heat — fly or drive via Delhi to Nainital, Mussoorie and Rishikesh with one trusted driver.",
    startPlace: "delhi",
    air: "Fly to Dehradun (Jolly Grant) for Garhwal, or to Delhi and drive to Kumaon.",
    rail: "Trains run from Jaipur to Haridwar, Dehradun and Kathgodam — check IRCTC for current services.",
    road: "Many families drive via Delhi; we can pick you up in Delhi NCR or meet your flight or train in Uttarakhand.",
    picks: ["nainital", "mussoorie", "rishikesh", "bhimtal", "corbett", "auli"],
    holidays: "April–June summer holidays are the main season, plus Diwali and New Year.",
    faqs: [
      { q: "Can we start the taxi from Delhi instead of Jaipur?", a: "Yes — many travellers take a train or flight to Delhi and start the hill trip from there. We pick you up at the airport or station." },
      { q: "How cool is Nainital in May–June?", a: "Pleasant days around 20–27°C and cooler evenings — much cooler than the plains. Carry a light jacket." },
      { q: "Do you offer one-way drops?", a: "Yes — one-way drops are priced separately because the car returns empty. The rate is written in your quote." },
    ],
  },
  {
    slug: "pune",
    city: "Pune",
    state: "Maharashtra",
    blurb: "Fly to Dehradun or Delhi for Char Dham, Rishikesh and Kumaon hill stays — we handle the rest on the ground.",
    startPlace: "jollygrant",
    air: "Fly to Dehradun (Jolly Grant) for Rishikesh, Mussoorie and Char Dham, or to Delhi for Nainital and Jim Corbett.",
    rail: "Long-distance trains take well over a day — most travellers fly.",
    road: "From Dehradun Airport we reach Rishikesh in about 35 minutes; Haridwar in about an hour.",
    picks: ["rishikesh", "sonprayag", "badrinath", "mussoorie", "nainital", "auli"],
    holidays: "Summer holidays, Diwali and Char Dham season (May–June, Sept–Oct) are the busiest times.",
    faqs: [
      { q: "Can you plan Kedarnath and Badrinath together?", a: "Yes — a Do Dham plan takes about 6–7 days from Haridwar or Rishikesh. Helicopter tickets, if wanted, are booked only on the official portal." },
      { q: "What should we pack for the hills in October?", a: "Warm layers, a jacket for evenings, comfortable walking shoes and rain protection — mornings in the higher hills can be cold." },
      { q: "Can we pay the advance online?", a: "Yes — once you accept the quote you can pay the advance online by UPI or card from the quote link." },
    ],
  },
  {
    slug: "hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    blurb: "Fly in to Dehradun or Delhi for Himalayan views, Rishikesh and the Char Dham yatra, with a driver from day one.",
    startPlace: "jollygrant",
    air: "Fly to Dehradun (Jolly Grant) for Rishikesh, Haridwar, Mussoorie and Char Dham, or to Delhi for Nainital and Kumaon.",
    rail: "Long-distance trains take two days or more — flying is the practical option.",
    road: "From Dehradun Airport: Rishikesh 35 min, Haridwar 1 hr, Mussoorie 2 hrs.",
    picks: ["rishikesh", "haridwar", "mussoorie", "sonprayag", "auli", "nainital"],
    holidays: "Summer holidays (April–June), Dussehra–Diwali and Christmas are popular times to travel.",
    faqs: [
      { q: "Is Dehradun or Delhi the better airport for us?", a: "Dehradun for Garhwal (Rishikesh, Mussoorie, Char Dham); Delhi for Kumaon (Nainital, Jim Corbett). We'll match the airport to your itinerary." },
      { q: "Can you arrange South Indian food on the trip?", a: "Options are limited in small hill towns, but Rishikesh, Haridwar, Dehradun and Mussoorie have South Indian restaurants. Tell us your preferences and we'll plan stops." },
      { q: "How early should we book for May–June?", a: "Four to six weeks ahead for hotels and vehicles, more for Char Dham dates." },
    ],
  },
];

export function originBySlug(slug: string) {
  return origins.find((o) => o.slug === slug);
}

export const originPath = (o: Pick<Origin, "slug">) => `/uttarakhand/from-${o.slug}/`;

/** Options for "Travelling from" fields on forms. */
export const travellingFromOptions = [...origins.map((o) => o.city), "Elsewhere in India", "Outside India"];

// ---------- Season planner (homepage) ----------

export const seasons: { months: string; title: string; text: string; places: string[] }[] = [
  { months: "Mar – Apr", title: "Spring & blossoms", text: "Rhododendrons and orchard blossom, clear days, fewer crowds — great value before summer.", places: ["mukteshwar", "binsar", "chopta"] },
  { months: "May – Jun", title: "Summer escapes & Char Dham", text: "Peak family season and the yatra opening. Book hotels and taxis 4–6 weeks ahead.", places: ["nainital", "mussoorie", "sonprayag"] },
  { months: "Jul – Aug", title: "Monsoon (travel with care)", text: "Lush valleys and the Valley of Flowers, but landslides can close roads. Keep buffer days.", places: ["rishikesh", "dehradun", "corbett"] },
  { months: "Sep – Nov", title: "Clear Himalayan views", text: "Crisp skies, Puja and Diwali holidays, the second yatra season — the best views of the year.", places: ["kausani", "munsiyari", "badrinath"] },
  { months: "Dec – Feb", title: "Snow & winter sun", text: "Snow in Auli and Dhanaulti, sunny days in the lower hills, New Year getaways.", places: ["auli", "dhanaulti", "rishikesh"] },
];
