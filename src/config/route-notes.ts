// Route-specific text for the taxi pages (/taxi/<from>-to-<to>/): what the start of the trip looks like,
// which way the road goes, and what to know on arrival. Each page combines its own origin, road and
// destination notes, so no two route pages read the same. Roads and timings are typical, not guaranteed.

/** Where the trip starts: pickup points and when to leave. */
export const originNotes: Record<string, string> = {
  delhi:
    "Pickups are from anywhere in Delhi NCR — Delhi, Noida, Gurugram, Ghaziabad and Faridabad — and from the airport or a railway station. Leaving by 5–6 am gets you past city traffic and onto the hill roads in daylight.",
  chandigarh:
    "Pickups are from Chandigarh, Mohali, Panchkula or Zirakpur. Morning starts work best; the drive crosses Haryana before entering Uttarakhand.",
  kathgodam:
    "Your driver meets you at Kathgodam railway station or anywhere in Haldwani, about 6 km away — share your train number and we track the arrival. Kathgodam is the last stop of the main trains from Delhi, so morning trains connect well with the hill drive.",
  pantnagar:
    "Pickup is at Pantnagar Airport, the nearest airport for Nainital and Kumaon. Flights are few, so we plan the pickup around your flight time and keep the driver waiting if it is late.",
  jollygrant:
    "Pickup is at Dehradun Airport (Jolly Grant), between Dehradun and Rishikesh. The driver waits at arrivals with your name; share the flight number when you book.",
  dehradun:
    "Pickups are from your hotel or home in Dehradun, the ISBT or Dehradun railway station. Leave early on weekends, when traffic towards Mussoorie and Rishikesh builds up from mid-morning.",
  haridwar:
    "Pickups are from Haridwar railway station, your hotel or ashram, or near Har Ki Pauri (cars wait at the nearest permitted parking). Haridwar is where most Char Dham and Kedarnath road trips begin.",
  rishikesh:
    "Pickups are from your hotel, ashram or camp in Rishikesh, Tapovan or the Laxman Jhula side, or from Rishikesh railway station. For the high Himalaya, a 5–6 am start is usual so you reach before dark.",
  nainital:
    "Pickups are from your hotel in Nainital, at Tallital or Mallital. Cars cannot always stop on the Mall Road, so the driver may meet you at the nearest parking.",
  almora:
    "Pickups are from your hotel in Almora or nearby stays such as Kasar Devi. Almora is a good halfway stop for trips deeper into Kumaon.",
};

/** The road between the two regions. Keyed "fromRegion>toRegion", with origin-specific overrides. */
const roadByRegion: Record<string, string> = {
  "Plains>Kumaon":
    "From Delhi the usual road runs east via Ghaziabad, Moradabad and Rampur to Rudrapur and Haldwani, where the hill climb begins. Gajraula is a common breakfast stop.",
  "Plains>Garhwal":
    "From Delhi the usual road runs north via Meerut, Muzaffarnagar and Roorkee towards Haridwar and Dehradun. Khatauli and the Muzaffarnagar bypass have the usual food stops. During the Kanwar Yatra (usually July) this highway has diversions, so allow extra time.",
  "Kumaon>Kumaon":
    "The drive stays within the Kumaon hills: short distances, but narrow, winding roads where 30 km can take an hour.",
  "Garhwal>Garhwal":
    "The drive stays within Garhwal. Hill sections are slower than the distance suggests, and the monsoon (July–August) can bring landslides.",
  "Kumaon>Garhwal": "This crosses from Kumaon into Garhwal through the foothills.",
  "Garhwal>Kumaon": "This crosses from Garhwal into Kumaon through the foothills.",
};
/** Overrides for particular origins or routes, keyed "from>toRegion" or "from>to". */
const roadOverrides: Record<string, string> = {
  "chandigarh>Garhwal":
    "From Chandigarh the road usually goes via Panchkula, Nahan and Paonta Sahib to Dehradun, or via Yamunanagar and Saharanpur towards Haridwar and Rishikesh.",
  "chandigarh>Kumaon":
    "From Chandigarh this is a long cross-country drive through western Uttar Pradesh to Rudrapur and Haldwani before the hill climb — many travellers break it overnight.",
  "delhi>corbett":
    "From Delhi the road runs east via Ghaziabad, Moradabad and Kashipur to Ramnagar, staying in the plains almost all the way.",
  "kathgodam>corbett": "The road to Ramnagar runs along the foothills via Kaladhungi, through forest rather than up into the hills.",
  "pantnagar>corbett": "The road to Ramnagar stays in the foothills via Kashipur or Kaladhungi.",
  "nainital>corbett": "The road drops from Nainital to the foothills via Kaladhungi before reaching Ramnagar.",
};

/** What to know about arriving at the destination. */
export const destinationNotes: Record<string, string> = {
  haridwar: "In Haridwar the lanes near Har Ki Pauri are crowded, especially at evening aarti and on festival days; cars stop at the nearest parking and you walk the last stretch.",
  rishikesh: "Most stays are around Tapovan, Laxman Jhula, Ram Jhula or the rafting camps towards Shivpuri. Some lanes near the river are closed to cars, so the driver drops you at the nearest point.",
  dehradun: "Dehradun is the base for Mussoorie and the Yamunotri and Gangotri routes; drops anywhere in the city, the railway station or ISBT.",
  jollygrant: "For flights, plan to reach Dehradun Airport at least 90 minutes before departure; we add buffer time for the hill traffic.",
  mussoorie: "The last stretch climbs steeply from Dehradun. Mall Road and Library Chowk get congested on weekends and holidays, and parking near hotels is limited, so check whether your hotel has parking.",
  dhanaulti: "Dhanaulti is about 25 km beyond Mussoorie on a quieter forest road. In January–February snow can make the road slippery; drivers carry chains when needed.",
  kathgodam: "Kathgodam is the railhead for Kumaon. For a train, plan to reach the station at least 30 minutes early.",
  nainital: "The road climbs from Kathgodam past Jeolikot. Town entry and parking are regulated in peak season and some Mall Road timings are closed to cars, so hotels with parking save a lot of time.",
  bhimtal: "Bhimtal is reached before the final climb to Nainital, so the drive is shorter and easier. Parking near the lake is simpler than in Nainital.",
  naukuchiatal: "Naukuchiatal is about 4 km beyond Bhimtal, at the end of a quiet road — the drive is easy and the stays are spread around the lake.",
  mukteshwar: "The road goes via Bhowali and the Ramgarh orchard belt. The last section is narrow and forested, so driving in daylight is best.",
  almora: "The road follows the Kosi river past Kainchi Dham, where weekend crowds can slow traffic for a while.",
  ranikhet: "The road reaches Ranikhet through pine forest; the town is a quiet cantonment with easy parking and short distances.",
  kausani: "Kausani is usually reached via Almora. Clear mornings give the widest views of the snow peaks, so a sunrise from your hotel is worth planning around.",
  binsar: "Binsar is a wildlife sanctuary beyond Almora with an entry gate and forest-department fees. Stays inside have limited electricity and mobile signal.",
  munsiyari: "Munsiyari is one of the longest drives in Kumaon, past Birthi Falls on the last stretch. A night halt on the way (for example at Almora or Chaukori) makes it far more comfortable.",
  corbett: "Ramnagar is the base for Jim Corbett. Jeep safari permits are booked on the official Corbett booking website, and safari timings are fixed, so plan your arrival around them.",
  sonprayag: "Private cars stop at Sonprayag; from there shared shuttles run to Gaurikund, where the Kedarnath trek starts. Arrive the evening before your trek, ideally staying in Guptkashi, Phata or Sitapur.",
  badrinath: "The road goes via Rudraprayag, Karnaprayag, Chamoli and Joshimath and is open in the yatra season (roughly May to November). Some stretches are prone to landslides, so keep a buffer day.",
  auli: "Auli is reached from Joshimath by a steep road (and by ropeway when it is running). In winter, snow can close the upper road for a while.",
  chopta: "Chopta is reached via Rudraprayag and Ukhimath. It is the base for the Tungnath–Chandrashila trek; heavy winter snow can close the road for some days.",
  barkot: "Barkot is the overnight halt for Yamunotri; the trek starts from Janki Chatti, about 45 km further.",
  uttarkashi: "Uttarkashi is the overnight halt for Gangotri, about 100 km further up the Bhagirathi valley.",
};

export function routeNotes(from: { id: string; region?: string }, to: { id: string; region?: string }) {
  const key = `${from.region ?? "Plains"}>${to.region ?? "Plains"}`;
  return {
    start: originNotes[from.id] ?? null,
    road: roadOverrides[`${from.id}>${to.id}`] ?? roadOverrides[`${from.id}>${to.region}`] ?? roadByRegion[key] ?? null,
    arrival: destinationNotes[to.id] ?? null,
  };
}
