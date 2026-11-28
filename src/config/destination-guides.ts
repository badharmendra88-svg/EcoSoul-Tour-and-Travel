// Extra guide sections for destination pages (/destinations/<slug>/), added in code so admin-edited
// fields in the database are never overwritten. Facts are approximate and phrased that way.
export type DestinationGuide = {
  places: { name: string; text: string }[]; // 5–7 places/sights in and around, 1–2 sentences each
  stay: string[]; // 2–3 bullets: which area to stay in and why
  gettingAround: string[]; // 2–4 bullets: local transport, roads, parking, permits/fees/timings if relevant
  plan: { title: string; days: [string, string][] }; // a realistic 2- or 3-day plan, e.g. ["Day 1", "..."]
  faqs: { q: string; a: string }[]; // 3–4 NEW questions people actually search (not already in seed faqs)
};

export const destinationGuides: Record<string, DestinationGuide> = {
  ranikhet: {
    places: [
      { name: "Rani Jheel", text: "A small lake inside the cantonment with rowing boats and a paved walk around the edge. It is an easy first-evening outing for families." },
      { name: "Haidakhan Babaji Temple, Chilianaula", text: "A white temple and ashram about 4 km from town, set on a quiet slope with views over the valley. Visitors are expected to dress modestly and keep noise low." },
      { name: "Bhalu Dam", text: "A small reservoir reached by a forest path of roughly 3 km beyond the Chaubatia area. Pack water and a snack, as there are no facilities at the dam." },
      { name: "Tarikhet", text: "A village about 8 km away linked to Mahatma Gandhi's stay in the area, with a memorial cottage known as Gandhi Kuti. The drive passes through pine forest." },
      { name: "Dwarahat", text: "A small town roughly 35 km north with clusters of carved stone temples from the medieval period. The Dunagiri temple, on a hill nearby, involves a long flight of steps." },
      { name: "Sadar Bazaar", text: "The main market below the cantonment, with tea stalls, woollens and local sweets. Most taxis and buses leave from here." },
    ],
    stay: [
      "Near the Mall Road and cantonment: quiet, clean streets and an easy walk to Rani Jheel and the main viewpoints.",
      "Chilianaula and the Chaubatia side: greener and quieter, but you will need the car for meals and sightseeing.",
      "Majkhali and the Almora road: wide valley views and a good halt if you are continuing towards Almora or Kausani.",
    ],
    gettingAround: [
      "Kathgodam is roughly 80 km away and Ranikhet is also linked by road to Almora, Kausani and Ramnagar, so it fits easily into a circuit.",
      "Local taxis run from Sadar Bazaar, but there is no app-based cab service, so keep your own car for day trips.",
      "Cantonment roads are narrow and parking is restricted in places; drivers usually drop you near a sight and wait nearby.",
    ],
    plan: {
      title: "A relaxed 2-day Ranikhet guide",
      days: [
        ["Day 1", "Arrive by afternoon, boating or a walk at Rani Jheel, evening in Sadar Bazaar"],
        ["Day 2", "Morning at Haidakhan Babaji temple, walk to Bhalu Dam, afternoon drive to Tarikhet or onward to Dwarahat"],
      ],
    },
    faqs: [
      { q: "Can you see snow peaks from Ranikhet?", a: "On clear days, especially from October to February, the snow peaks of the central Himalaya are visible from several points in and around town. Cloud often hides them in the monsoon and on hazy summer afternoons." },
      { q: "Ranikhet or Kausani — which should I choose?", a: "Ranikhet is a larger town with forest walks and more facilities; Kausani is smaller and known mainly for its long mountain view. Many travellers stay one night in each on the same circuit." },
      { q: "Is Ranikhet suitable for elderly travellers?", a: "Yes, for the most part. Roads within town are gentle and most sights are close to the car, though a few places such as Bhalu Dam and Dunagiri involve walking or steps." },
    ],
  },

  auli: {
    places: [
      { name: "Joshimath (Jyotirmath)", text: "The town below Auli and the main base for supplies, fuel and most stays. It is home to one of the four mathas linked to Adi Shankaracharya." },
      { name: "Narsingh Temple", text: "A temple in Joshimath that is the winter seat of Lord Badrinath, when the Badrinath shrine is closed. It is a short walk from the main market." },
      { name: "Auli artificial lake", text: "A high-altitude reservoir built to supply snow-making for the ski slopes. In summer it makes a calm walk with views of the surrounding peaks." },
      { name: "Auli ropeway and chairlift", text: "A long ropeway has linked Joshimath and Auli, and a chairlift runs on the slopes. Their operation has been suspended at times, so check whether they are running before you plan around them." },
      { name: "Vishnuprayag", text: "The confluence of the Alaknanda and Dhauliganga rivers, a short drive from Joshimath on the Badrinath road. It is one of the Panch Prayag." },
      { name: "Badrinath and Mana", text: "Badrinath is roughly 45 km beyond Joshimath and Mana village lies a few kilometres further. The shrine usually opens from around May to November, with dates announced each year." },
    ],
    stay: [
      "Auli itself: closest to the slopes and views, with fewer options that fill quickly in the ski season.",
      "Joshimath: more choice, shops and medical help, and a good base for Badrinath day trips.",
      "Parts of Joshimath were affected by land subsidence in 2023, so check current local advisories when choosing a stay.",
    ],
    gettingAround: [
      "Auli is reached by a road of roughly 12–15 km from Joshimath; after heavy snow this stretch can close or need snow chains.",
      "Rishikesh to Joshimath is a long day of about 250 km on the Badrinath highway, which is prone to landslide delays in the monsoon.",
      "Ski courses and equipment hire are run by government and licensed operators in season; book with a certified instructor only.",
    ],
    plan: {
      title: "3 days in Auli and Joshimath",
      days: [
        ["Day 1", "Reach Joshimath from a halt at Rudraprayag or Pipalkoti, evening at Narsingh temple and the matha"],
        ["Day 2", "Drive up to Auli, walk to the artificial lake and towards Gorson Bugyal, or a beginner ski session in winter"],
        ["Day 3", "Vishnuprayag, and in season a day trip to Badrinath and Mana, back to Joshimath"],
      ],
    },
    faqs: [
      { q: "What is the altitude of Auli?", a: "Roughly 2,500–3,000 m depending on where you are on the slopes. Take the first day easy and drink plenty of water." },
      { q: "Can beginners ski in Auli?", a: "Yes. Short courses for beginners are usually offered in the snow season by licensed operators and government institutes. Snow cover varies from year to year, so keep the plan flexible." },
      { q: "Which peaks can you see from Auli?", a: "On clear days the view usually includes Nanda Devi, Dronagiri and Kamet, among others. Mornings tend to be clearer than afternoons." },
    ],
  },

  munsiyari: {
    places: [
      { name: "Birthi Falls", text: "A tall waterfall beside the road roughly 35 km before Munsiyari on the Thal route. It is fullest after the monsoon." },
      { name: "Kalamuni Top", text: "A high point on the approach road with a small temple and, on clear days, an early view of the Panchachuli range." },
      { name: "Nanda Devi Temple", text: "A hilltop temple a short walk from town with open views over the valley and peaks. Sunrise and sunset are the quietest times." },
      { name: "Thamri Kund", text: "A small forest lake reached by a day hike through oak and rhododendron. Go with a local guide, as trails are not always marked." },
      { name: "Darkot village", text: "A village near Munsiyari known for hand-woven woollen shawls and carpets. You can often see weavers at work." },
      { name: "Gori Ganga valley", text: "The river valley below town leads towards Madkot, where there are hot springs. Longer treks up the Johar valley towards Milam need permits and an experienced local outfitter." },
    ],
    stay: [
      "Munsiyari town: closest to the market, taxi stand and a few basic medical facilities.",
      "Sarmoli and nearby villages: community-run homestays with home-cooked food and walks starting from the door.",
      "If you are tired from the drive, a night at Birthi or Chaukori first makes the arrival far easier.",
    ],
    gettingAround: [
      "The usual route is via Bageshwar or Pithoragarh to Thal and then over Kalamuni; another road follows the Gori Ganga from Jauljibi via Madkot.",
      "Shared jeeps link Munsiyari with Thal, Bageshwar and Pithoragarh, but they leave early and do not run to a fixed timetable.",
      "Mobile coverage and ATMs are patchy; fuel up and draw cash in Bageshwar or Pithoragarh before the final stretch.",
    ],
    plan: {
      title: "3 days in and around Munsiyari",
      days: [
        ["Day 1", "Drive in via Thal, stopping at Birthi Falls and Kalamuni Top; evening at Nanda Devi temple"],
        ["Day 2", "Early start for Khaliya Top or Thamri Kund with a local guide, rest in the afternoon"],
        ["Day 3", "Darkot village and the heritage museum, or a drive down the Gori Ganga towards Madkot"],
      ],
    },
    faqs: [
      { q: "What is the altitude of Munsiyari?", a: "About 2,200 m. Nights are cold for most of the year, and higher hikes such as Khaliya Top go well above that." },
      { q: "Do I need a permit to visit Munsiyari?", a: "Not for the town itself. Treks towards Milam and other areas close to the border usually need an inner line permit, which local outfitters can guide you on." },
      { q: "Is Munsiyari open in winter?", a: "The town is lived in all year, but snow can block the Kalamuni road for days at a time. Winter trips need spare days and a driver used to icy roads." },
      { q: "Can Munsiyari be visited with children?", a: "Yes, if they are fine with long road journeys. Most walks are optional, and homestays are usually happy to cook simple food." },
    ],
  },

  "valley-of-flowers": {
    places: [
      { name: "Govindghat", text: "The roadhead on the Badrinath highway, about 20 km beyond Joshimath, with a large gurudwara and parking. Most trekkers start walking from the bridge here or from Pulna, a short drive up." },
      { name: "Ghangaria", text: "A small seasonal settlement at roughly 3,000 m with basic lodges and a gurudwara. It is the overnight base for both the valley and Hemkund Sahib." },
      { name: "The valley floor", text: "The main bloom area begins a few kilometres from Ghangaria along the Pushpawati river. Flowers such as the blue poppy, cobra lily and primulas appear at different points in the season." },
      { name: "Margaret Legge memorial", text: "A small memorial inside the valley to a botanist who died here in 1939. It is a common turning point for day visitors." },
      { name: "Hemkund Sahib", text: "A Sikh shrine beside a glacial lake at about 4,300 m, reached by a steep trail of roughly 6 km from Ghangaria. Brahma kamal flowers are often seen near the lake later in the season." },
      { name: "Lakshman Temple", text: "A small Hindu temple beside the Hemkund lake, visited by many pilgrims along with the gurudwara." },
    ],
    stay: [
      "Ghangaria: the only practical base, as camping or staying overnight inside the valley is not permitted. Lodges are simple and fill quickly in July and August.",
      "Govindghat or Joshimath: for the nights before and after the trek, with more rooms, shops and phone coverage.",
    ],
    gettingAround: [
      "From Govindghat, a shared vehicle usually covers the first few kilometres to Pulna, followed by a trek of roughly 9–10 km to Ghangaria. Ponies and porters are available locally.",
      "The valley entry permit is usually issued at the forest department checkpost on the trail just beyond Ghangaria. Entry is allowed only in daytime hours and visitors must return the same day; check current rules, timings and fees on the official portal before you go.",
      "A helicopter service between Govindghat and Ghangaria has operated in some seasons; check with the authorised operator, as we do not sell these tickets.",
      "Hemkund Sahib's opening and closing dates are announced each year and can differ from the park's dates.",
    ],
    plan: {
      title: "3 days on the trail from Govindghat",
      days: [
        ["Day 1", "Early start from Govindghat, shared vehicle to Pulna, trek to Ghangaria, rest and acclimatise"],
        ["Day 2", "Morning entry to the Valley of Flowers, walk along the Pushpawati river, return to Ghangaria by afternoon"],
        ["Day 3", "Optional climb to Hemkund Sahib and back, or trek down to Govindghat and drive to Joshimath"],
      ],
    },
    faqs: [
      { q: "How difficult is the Valley of Flowers trek?", a: "It is usually rated easy to moderate. The trek to Ghangaria is long and steady, and the valley itself is gentler; Hemkund Sahib is the hardest part because of the steep climb." },
      { q: "Can Valley of Flowers and Hemkund Sahib be done on the same day?", a: "It is possible for very fit trekkers but rarely enjoyable. Most people spend one day on each from Ghangaria." },
      { q: "What should I pack for the trek?", a: "A rain jacket and pack cover, quick-dry layers, a warm fleece, good trekking shoes, a torch, water, snacks and any personal medicines. Plastic use is restricted in the park." },
      { q: "Is the valley suitable for older travellers?", a: "Many older trekkers do it at a slow pace, and ponies can help on the Ghangaria stretch. Talk to your doctor first if you have heart or breathing conditions." },
    ],
  },

  dhanaulti: {
    places: [
      { name: "Amber and Dhara eco-parks", text: "Two forest parks maintained by the forest department, with deodar trails, swings and picnic spots. A small entry fee is usually charged." },
      { name: "Kanatal", text: "A ridge roughly 15 km towards Chamba with apple orchards, camps and open views. The Kodia forest nearby is good for a gentle walk." },
      { name: "Chamba", text: "A small market town at the junction of the roads to Tehri, Rishikesh and Mussoorie. It is a useful stop for tea and supplies." },
      { name: "Tehri Lake", text: "A large reservoir roughly 2 hours away via Chamba, with boating and water sports run by licensed operators in season." },
      { name: "Mussoorie–Dhanaulti road", text: "The drive from Mussoorie passes through forest with valley views and small roadside stalls, and is worth taking slowly." },
    ],
    stay: [
      "Dhanaulti itself: forest views and quiet evenings, with only a small market for meals and supplies.",
      "Kanatal: more open views and camp-style stays, and a good base if you plan to visit Tehri.",
      "Mussoorie: more choice and easier for families who only want a day in Dhanaulti.",
    ],
    gettingAround: [
      "Dhanaulti is about 25–30 km from Mussoorie and roughly 60 km from Dehradun by road.",
      "You can return to the plains via Chamba and Rishikesh instead of Mussoorie, which avoids Mussoorie's weekend traffic.",
      "After snowfall, police sometimes stop vehicles short of Dhanaulti for safety; carry warm clothes and follow local instructions.",
    ],
    plan: {
      title: "2 days in Dhanaulti and Kanatal",
      days: [
        ["Day 1", "Drive from Mussoorie, forest walk at the eco-parks, quiet evening in Dhanaulti"],
        ["Day 2", "Drive to Kanatal and the Kodia forest, optional extension to Tehri Lake, then return via Chamba"],
      ],
    },
    faqs: [
      { q: "What is the altitude of Dhanaulti?", a: "About 2,200–2,300 m, which makes it noticeably colder than Mussoorie, especially in the evenings." },
      { q: "When does it snow in Dhanaulti?", a: "Snowfall, when it happens, is usually between late December and February. It is never guaranteed on particular dates." },
      { q: "Dhanaulti or Kanatal — which is better for a quiet stay?", a: "Both are quiet. Dhanaulti has more forest cover; Kanatal has more open views and is closer to Tehri." },
    ],
  },

  binsar: {
    places: [
      { name: "Bineshwar temple", text: "An old stone Shiva temple inside the sanctuary, linked to the Chand rulers of Kumaon. It sits in thick forest a short way off the main road." },
      { name: "Khali Estate area", text: "A historic estate inside the sanctuary associated with the British-era administrator Sir Henry Ramsay. The forest around it is good for slow walks." },
      { name: "Zero Point trail", text: "The forest trail of roughly 2 km to the main viewpoint passes through oak and rhododendron. In early spring the rhododendrons are usually in flower." },
      { name: "Himalayan panorama", text: "On clear days the view stretches across a long arc of peaks, including Trishul, Nanda Devi and the Panchachuli group." },
      { name: "Wildlife", text: "Barking deer, goral and many bird species are seen along the trails, and leopards live in the forest but are rarely seen. Early mornings are the best time for birds." },
      { name: "Kasar Devi road", text: "The drive between Almora and Binsar passes the Kasar Devi ridge and small villages, so it is easy to combine the two." },
    ],
    stay: [
      "Inside the sanctuary: a few forest and heritage stays with simple facilities, where you wake up close to the viewpoint trail.",
      "Outside the gate along the Almora road: more options and easier access to shops, with a short drive in for the trails.",
      "Almora town: a practical choice if you are only visiting Binsar for the day.",
    ],
    gettingAround: [
      "Binsar is roughly 30 km from Almora; the last stretch inside the sanctuary is narrow and slow.",
      "There is an entry gate where sanctuary fees are charged per person and per vehicle, and gate hours apply. Check current fees and timings with the forest department before you go.",
      "There is no public transport inside the sanctuary, so you will need your own car or taxi.",
    ],
    plan: {
      title: "2 days in Binsar",
      days: [
        ["Day 1", "Drive from Almora via the Kasar Devi road, enter the sanctuary, visit the Bineshwar temple, sunset walk"],
        ["Day 2", "Early walk to Zero Point for the morning view, birdwatching on the forest trails, return towards Almora or onwards"],
      ],
    },
    faqs: [
      { q: "What is the altitude of Binsar?", a: "The ridge is roughly 2,400 m at its highest, so it is cooler than Almora throughout the year." },
      { q: "Is Binsar good for birdwatching?", a: "Yes. The sanctuary is known for a wide range of Himalayan birds; spring and early winter mornings are usually the most rewarding." },
      { q: "Can Binsar be done as a day trip from Almora?", a: "Yes, but an overnight stay gives you a better chance of a clear early-morning view and a quieter forest." },
    ],
  },

  almora: {
    places: [
      { name: "Nanda Devi Temple", text: "A temple complex in the heart of town from the Chand period, dedicated to the goddess Nanda Devi. It hosts a large fair around September." },
      { name: "Katarmal Sun Temple", text: "A group of old stone temples dedicated to the sun god, roughly 17 km from Almora. The site is looked after by the Archaeological Survey of India." },
      { name: "Govind Ballabh Pant Museum", text: "A small state museum in town with sculpture, coins and folk art from the Kumaon region. It is a good stop on a rainy afternoon." },
      { name: "Kalimath", text: "A ridge near Kasar Devi with wide views over the valley and town, quieter than the main viewpoints." },
      { name: "Kakrighat", text: "A riverside spot on the Kosi on the Nainital road, where Swami Vivekananda is said to have meditated. It makes a short break on the drive in." },
      { name: "Mall Road", text: "The upper road through town with older buildings, shops and a long valley view, easy to walk in an evening." },
    ],
    stay: [
      "Near the Mall Road: convenient for markets, temples and food, though rooms on the road can be noisy.",
      "Kasar Devi and Kalimath: quieter, with cafés and views, about 8–10 km from the town centre.",
      "The road towards Binsar: forest settings and fewer people, but a drive away from town.",
    ],
    gettingAround: [
      "The old bazaar area is best explored on foot; vehicles cannot enter the narrowest lanes.",
      "Parking near the Mall Road is limited and some roads run one way at busy times, so drivers usually drop you and wait nearby.",
      "Local taxis are available, but a car for the whole trip is easier for Katarmal, Kasar Devi and Jageshwar.",
    ],
    plan: {
      title: "2 days in Almora town",
      days: [
        ["Day 1", "Stop at Kakrighat on the way in, Nanda Devi temple and the museum, evening on the Mall Road"],
        ["Day 2", "Morning at Katarmal Sun Temple, afternoon at Kalimath and the Kasar Devi ridge"],
      ],
    },
    faqs: [
      { q: "How far is Jageshwar from Almora?", a: "Roughly 35 km, about an hour and a half by road. It is usually done as a half-day or full-day trip." },
      { q: "What can I buy in Almora?", a: "Bal mithai, local woollens, copperware made in the region and Kumaoni spices and pulses are popular buys." },
      { q: "Is Almora worth visiting if I have already seen Nainital?", a: "Yes. Almora is less about lakes and more about temples, old bazaars and views, so it feels quite different." },
    ],
  },

  mukteshwar: {
    places: [
      { name: "IVRI campus", text: "Mukteshwar grew around a veterinary research institute set up in the 1890s, and some heritage buildings remain. Access is restricted, so view it from outside unless you have permission." },
      { name: "Bhalu Gaad waterfall", text: "A waterfall reached by a forest trail of roughly 2–3 km near Sitla. It is fullest after the monsoon; the path can be slippery." },
      { name: "Ramgarh", text: "An orchard area on the way to Mukteshwar, with Tagore Top, a hill linked to Rabindranath Tagore's stay. Mahadevi Verma's house nearby is now a literary centre." },
      { name: "Sitla and Satkhol", text: "Quiet villages near Mukteshwar with cottage stays and forest walks, good for a slower day." },
      { name: "Dhanachuli", text: "A ridge on the Ramgarh side with views and a few stays, useful as a quieter alternative base." },
    ],
    stay: [
      "Mukteshwar ridge: closest to the viewpoints and the main market, which is small.",
      "Sitla, Satkhol and Dhanachuli: cottages and homestays in quieter forest settings, best if you have a car.",
      "Ramgarh: convenient if you want to split your time between Mukteshwar and Nainital.",
    ],
    gettingAround: [
      "The usual route is via Bhowali and Ramgarh; traffic at Bhowali can be slow on weekends and holidays.",
      "Taxis are few locally, so keep your car for the stay if you are staying outside the main ridge.",
      "Roads are narrow and can be icy after winter snow; drive in daylight where possible.",
    ],
    plan: {
      title: "2 days in Mukteshwar",
      days: [
        ["Day 1", "Drive in via Ramgarh, stop at Tagore Top, evening walk on the Mukteshwar ridge"],
        ["Day 2", "Forest trail to Bhalu Gaad waterfall, afternoon in Sitla or Satkhol, early night for the next morning's view"],
      ],
    },
    faqs: [
      { q: "Is Mukteshwar suitable for children?", a: "Yes, for families who enjoy quiet stays and short walks. There is little organised entertainment, so bring games for evenings." },
      { q: "Do I need a car in Mukteshwar?", a: "It helps. Stays are spread out and local taxis are limited, especially outside the main ridge." },
      { q: "Mukteshwar or Nainital — which is better for a quiet trip?", a: "Mukteshwar is far quieter, with forest and mountain views; Nainital has more shops, crowds and activities. Many travellers combine the two." },
    ],
  },

  bhimtal: {
    places: [
      { name: "Karkotak Temple", text: "A hilltop temple dedicated to the serpent deity Karkotak, reached by a steep walk. It is busy around Nag Panchami." },
      { name: "Butterfly Research Centre, Jones Estate", text: "A private collection of Himalayan butterflies and moths near Bhimtal. Visiting hours vary, so call ahead." },
      { name: "Kainchi Dham", text: "The ashram of Neem Karoli Baba, roughly 20 km away via Bhowali. It draws very large crowds, especially around its foundation day in mid-June." },
      { name: "Ghorakhal Golu Devta Temple", text: "A temple near Bhowali known for the thousands of bells tied by devotees, with views over the valley." },
      { name: "Bhowali", text: "A small market town on the way to Nainital and Almora, known for its fruit stalls in summer." },
      { name: "Lake promenade", text: "The road along the dam end of the lake has benches, small eateries and boating counters, and is pleasant in the early evening." },
    ],
    stay: [
      "Near the dam and main road: convenient for boating, eateries and taxis.",
      "The quieter far shore and slopes above the lake: more space and views, but you will rely on your car.",
      "Sattal or Naukuchiatal side: for forest surroundings, while still close to Bhimtal for meals.",
    ],
    gettingAround: [
      "Bhimtal is a short drive from Kathgodam and well connected to Nainital, Bhowali and Mukteshwar.",
      "Expect slow traffic on the Bhowali–Kainchi road on weekends and around temple festival days; leave early.",
      "Lakeside parking is limited in peak season, so it is easier for drivers to drop you and park nearby.",
    ],
    plan: {
      title: "2 days in Bhimtal",
      days: [
        ["Day 1", "Arrive by afternoon, walk along the lake promenade, short climb to Karkotak temple if energy allows"],
        ["Day 2", "Early visit to Kainchi Dham, Ghorakhal Golu Devta temple, fruit stalls at Bhowali, back to the lake by evening"],
      ],
    },
    faqs: [
      { q: "Can I visit Kainchi Dham from Bhimtal?", a: "Yes. It is roughly 20 km via Bhowali and fits easily into a half-day trip. Start early to avoid crowds and traffic." },
      { q: "Is Bhimtal good to visit in the monsoon?", a: "It can be, with green hills and fewer visitors, but expect rain, some road delays and limited boating on wet days." },
      { q: "Is boating available all year in Bhimtal?", a: "Boating usually runs through most of the year, but it is paused in bad weather and timings can vary. Check at the lakeside counters on the day." },
    ],
  },

  "jim-corbett": {
    places: [
      { name: "Garjia Devi Temple", text: "A temple on a large rock in the Kosi river, about 14 km from Ramnagar on the Ranikhet road. It is reached by steps and gets busy during Navratri." },
      { name: "Corbett Falls", text: "A waterfall near Kaladhungi reached by a short forest walk. Access is managed by the forest department and may close in heavy rain." },
      { name: "Dhikala", text: "A core area deep inside the park with grasslands and views over the Ramganga reservoir. Overnight forest lodges here are booked through the official park system." },
      { name: "Dhangarhi museum", text: "A small interpretation centre at the Dhangarhi gate with displays on the park's history and wildlife." },
      { name: "Kosi riverside at Dhikuli", text: "The river runs beside the Ramnagar–Ranikhet road, with walks, birdlife and many riverside stays." },
      { name: "Sitabani", text: "A forest area outside the main park with a temple linked to Sita, known for birdwatching. Rules and permits here differ from the core zones." },
    ],
    stay: [
      "Dhikuli and the Kosi river belt: the main resort area, convenient for the Bijrani and Garjia zones.",
      "Ramnagar town: practical for the park reception centre, railway station and budget stays.",
      "Near the Jhirna and Dhela gates, or inside at Dhikala: closer to those zones and quieter, though facilities are fewer.",
    ],
    gettingAround: [
      "Safaris run in registered open jeeps with a forest guide, usually in a morning and an afternoon shift; private cars are not allowed in the zones.",
      "Safari and Dhikala permits are booked on the official Corbett online booking site, and every passenger needs valid ID matching the booking. We do not sell permits.",
      "Zones open and close on dates set by the park authority, and most core areas close during the monsoon. Check the official portal before you plan.",
      "Ramnagar is roughly 250 km from Delhi; most visitors drive or take a train to Ramnagar.",
    ],
    plan: {
      title: "2 days at Jim Corbett",
      days: [
        ["Day 1", "Arrive by midday, check in along the Kosi, afternoon safari shift, evening riverside walk"],
        ["Day 2", "Early morning safari in a second zone, Garjia Devi temple, Corbett Falls on the way out via Kaladhungi"],
      ],
    },
    faqs: [
      { q: "Which Corbett zone is good for a first visit?", a: "Bijrani and Dhikala are popular for mixed forest and grassland, while Jhirna and Dhela often stay open longer. Availability changes, so check the official portal when you book." },
      { q: "How early should I book a Corbett safari?", a: "Permits for weekends, holidays and Dhikala can sell out weeks ahead. Book as soon as your dates are fixed, on the official booking site." },
      { q: "Are children allowed on Corbett safaris?", a: "Yes, children usually travel with their families, though rules on age and ID can change. Check current park rules when booking." },
      { q: "What should I wear on a jeep safari?", a: "Muted colours, layers for cold mornings in winter, a cap and sunscreen. Carry water and avoid strong perfumes." },
    ],
  },
};
