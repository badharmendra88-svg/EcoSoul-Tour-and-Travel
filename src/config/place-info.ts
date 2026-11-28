// "About <place>" for taxi-route destinations that have no destination guide in the database
// (mostly yatra halts). Facts are approximate and phrased that way; seasons depend on official dates.

export type PlaceInfo = { summary: string; bestTime: string; stay: string; highlights: string[] };

export const placeInfo: Record<string, PlaceInfo> = {
  sonprayag: {
    summary:
      "Sonprayag, at roughly 1,800 m, is where the Mandakini meets the Basuki river and the last point private cars can reach on the Kedarnath route. Shared shuttles run the last few kilometres to Gaurikund, where the trek begins.",
    bestTime: "May–June and September–October, within the Kedarnath yatra season; temple dates are announced each year.",
    stay: "Sonprayag, Sitapur, Phata or Guptkashi — most pilgrims stay one night here before the trek and one after.",
    highlights: [
      "Triyuginarayan temple, roughly 12 km away, linked to the wedding of Shiva and Parvati",
      "Gaurikund, the start of the 16–18 km trek to Kedarnath",
      "Guptkashi's Vishwanath temple on the way up",
    ],
  },
  chopta: {
    summary:
      "Chopta is a meadow at roughly 2,700 m in Rudraprayag district, surrounded by oak and rhododendron forest. It is the base for the Tungnath temple and the Chandrashila summit.",
    bestTime: "April–June and September–November for clear trails; December–March brings snow and road closures at times.",
    stay: "Simple camps and lodges at Chopta, or more choice at Ukhimath and Sari village.",
    highlights: [
      "Tungnath, often called the highest Shiva temple, about 3.5 km uphill from Chopta",
      "Chandrashila summit, roughly 1.5 km above Tungnath, for a wide Himalayan view at sunrise",
      "Deoria Tal lake, a short trek from Sari village",
      "Omkareshwar temple at Ukhimath, the winter seat of Kedarnath",
    ],
  },
  badrinath: {
    summary:
      "Badrinath, at roughly 3,300 m on the Alaknanda between the Nar and Narayan ranges, is one of the Char Dham and is reachable by road in the yatra season.",
    bestTime: "May–June and September–October; the temple usually opens around May and closes in November, on dates announced each year.",
    stay: "Badrinath itself (rooms fill up in peak weeks) or Joshimath, about 45 km below.",
    highlights: [
      "Tapt Kund hot spring below the temple",
      "Mana village, a few kilometres away, with Vyas Gufa and Bheem Pul",
      "Narsingh temple in Joshimath, the winter seat of Badrinath",
    ],
  },
  barkot: {
    summary:
      "Barkot, at roughly 1,200 m on the Yamuna, is the usual overnight halt for Yamunotri. Janki Chatti, where the trek to the temple starts, is about 45 km further.",
    bestTime: "May–June and September–October, within the Yamunotri season; temple dates are announced each year.",
    stay: "Barkot has the most hotels on this route; a few stays are also available near Janki Chatti.",
    highlights: [
      "The trek of roughly 6 km from Janki Chatti to Yamunotri, with ponies and palkis available",
      "Kharsali village, the winter seat of the goddess Yamuna",
      "Riverside views along the Yamuna valley on the drive",
    ],
  },
  uttarkashi: {
    summary:
      "Uttarkashi, at roughly 1,150 m on the Bhagirathi, is the main town on the Gangotri route and the usual overnight halt before Gangotri, about 100 km further.",
    bestTime: "May–June and September–October for the Gangotri yatra; the town itself is open all year.",
    stay: "Uttarkashi has the widest choice; Harsil is a quieter halt closer to Gangotri.",
    highlights: [
      "The Kashi Vishwanath temple in town",
      "Gangnani hot springs on the way to Gangotri",
      "Harsil valley's apple orchards and riverside meadows",
    ],
  },
  kausani: {
    summary:
      "Kausani, at roughly 1,900 m in Bageshwar district, is known for one of the widest views of the Himalaya in Kumaon, stretching across peaks such as Trishul and Nanda Devi.",
    bestTime: "October–February for the clearest mountain views; March–June for pleasant weather.",
    stay: "Hotels along the ridge face the peaks — ask for a mountain-view room.",
    highlights: [
      "Anasakti Ashram, where Mahatma Gandhi stayed in 1929",
      "The tea estate on the edge of town",
      "Baijnath's old stone temples, roughly 17 km away",
    ],
  },
};
