// Stock header photos (free Pexels licence, files in /public/images/hero) for pages that have no
// admin-uploaded photo. An admin photo always wins; these only replace the illustrated fallback.
// Alt text describes what is actually in each picture — never a place the photo doesn't show.

export type HeroImage = { url: string; alt: string };

const img = (file: string, alt: string): HeroImage => ({ url: `/images/hero/${file}.webp`, alt });

export const heroImages = {
  kedarnath: img("kedarnath-temple", "Kedarnath temple with pilgrims and snow-covered Himalayan peaks behind it"),
  kedarnathSpire: img("kedarnath-temple-spire", "Spire of the Kedarnath temple against snow peaks and clouds"),
  tungnath: img("tungnath-temple-snow", "Tungnath temple above Chopta covered in winter snow"),
  nainitalLake: img("nainital-lake-boats", "Colourful rowing boats moored at the edge of Naini Lake, Nainital"),
  choptaView: img("chopta-himalaya-view", "Snow and rocky ridges on the Chopta–Chandrashila trail"),
  chandrashila: img("chandrashila-ridge", "Himalayan ridges and snow peaks seen from the Chandrashila trail"),
  snowPeaks: img("himalaya-snow-peaks", "Snow-capped Himalayan range under a wide blue sky"),
  highPeaks: img("himalaya-high-peaks", "High snow-covered Himalayan peaks above forested slopes"),
  greenHills: img("uttarakhand-green-hills", "Green hills, forests and a village valley in Uttarakhand"),
  terracedVillage: img("uttarakhand-terraced-village", "Terraced green fields and a hill village in Uttarakhand"),
  hillRoad: img("hill-road-taxi", "Cars on a curving hill road with crash barriers in the mountains"),
  cliffRoad: img("himalayan-cliff-road", "Mountain road cut into a sheer rock cliff in the Himalaya"),
  devprayag: img("devprayag-confluence", "Devprayag, where the Bhagirathi and Alaknanda rivers meet to form the Ganga"),
  suvRoad: img("suv-mountain-road", "SUV driving on a mountain road beside a river valley"),
  windingRoad: img("winding-hill-road", "Winding road through forested hills"),
  snowyRoad: img("snowy-mountain-road", "Straight road leading towards snow-covered mountains"),
} satisfies Record<string, HeroImage>;

type Key = keyof typeof heroImages;

/** Header photo per page path (the last breadcrumb). */
const byPath: Record<string, Key> = {
  "/about-us/": "terracedVillage",
  "/contact/": "greenHills",
  "/hotel-booking/": "nainitalLake",
  "/customise-my-trip/": "greenHills",
  "/destinations/": "chandrashila",
  "/faqs/": "snowPeaks",
  "/booking-policy/": "snowPeaks",
  "/cancellation-policy/": "snowPeaks",
  "/privacy-policy/": "highPeaks",
  "/terms-and-conditions/": "highPeaks",
  "/join-as-driver/": "suvRoad",
  "/how-to-reach-uttarakhand/": "devprayag",
  "/taxi/": "hillRoad",
  "/travel-guides/": "choptaView",
  "/travel-guides/best-time-to-visit-uttarakhand/": "chandrashila",
  "/travel-guides/char-dham-yatra-guide/": "kedarnathSpire",
  "/travel-guides/kedarnath-trip-guide/": "kedarnath",
  "/travel-guides/nainital-or-mussoorie/": "nainitalLake",
  "/travel-guides/uttarakhand-packing-list/": "snowyRoad",
  "/travel-guides/uttarakhand-trip-cost/": "greenHills",
  "/hi/char-dham-yatra/": "kedarnath",
  "/hi/kedarnath-yatra/": "kedarnath",
  "/hi/nainital-taxi/": "nainitalLake",
  "/hi/haridwar-rishikesh-taxi/": "hillRoad",
  "/uttarakhand/char-dham-yatra/": "kedarnath",
  "/uttarakhand/kedarnath-yatra-package/": "kedarnath",
  "/uttarakhand/kumaon-tour-packages/": "nainitalLake",
  "/uttarakhand/naukuchiatal-tour-package/": "greenHills",
  "/uttarakhand/tour-packages/": "chandrashila",
  "/uttarakhand/taxi-booking/": "hillRoad",
  "/uttarakhand/driver-booking/": "suvRoad",
  "/uttarakhand/airport-transfers/": "hillRoad",
  "/uttarakhand/haldwani-taxi-service/": "hillRoad",
  "/uttarakhand/local-sightseeing-taxi/": "windingRoad",
};

/** Taxi route pages: photo for the destination when it has no admin photo. */
const byPlace: Record<string, Key> = {
  sonprayag: "kedarnath",
  chopta: "tungnath",
  badrinath: "cliffRoad",
  barkot: "cliffRoad",
  uttarkashi: "devprayag",
  kausani: "snowPeaks",
  naukuchiatal: "greenHills",
};

export function heroForPath(path: string | undefined): HeroImage | null {
  const key = path ? byPath[path] : undefined;
  return key ? heroImages[key] : null;
}

/** Route hero by destination place id; hubs (stations, airports, plains towns) get the hill-road photo. */
export function heroForPlace(placeId: string): HeroImage {
  return heroImages[byPlace[placeId] ?? "hillRoad"];
}
