import { guidePath, guides } from "@/config/guides";
import { routePages, routePath, shortName } from "@/config/journeys";
import { KUMAON_HUB_PATH, kumaonPath, kumaonPlaces } from "@/config/kumaon";
import { site } from "@/config/site";
import { getPublishedDestinations, getPublishedPackages } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

// /llms.txt (llmstxt.org): a plain Markdown map of the site for AI assistants such as ChatGPT, Claude,
// Perplexity and Gemini — who we are, what we offer and which pages answer which questions.
export const revalidate = 3600;

export async function GET() {
  const [settings, destinations, packages] = await Promise.all([getSettings(), getPublishedDestinations(), getPublishedPackages()]);
  const u = (path: string) => `${site.url}${path}`;
  const link = (label: string, path: string, note?: string) => `- [${label}](${u(path)})${note ? `: ${note}` : ""}`;
  const popularRoutes = routePages.filter((r) => ["delhi", "haridwar", "dehradun", "rishikesh", "kathgodam"].includes(r.from.id)).slice(0, 30);

  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.name} (EcoSoul) is an Uttarakhand travel company in India. We plan tour packages, Char Dham and Kedarnath yatras, Himalayan treks, hotel and homestay bookings, and taxis with experienced hill drivers across Garhwal and Kumaon — from Delhi, Haridwar, Rishikesh, Dehradun, Kathgodam and Pantnagar.`,
    "",
    "Key facts:",
    "- Service area: all of Uttarakhand (Garhwal and Kumaon), with pickups from Delhi NCR and other Indian cities.",
    "- Services: tour packages, Char Dham Yatra, Kedarnath yatra, Auli and Kumaon trips, Himalayan treks with local partner guides, hotel booking, one-way and round-trip taxis, driver hire and airport/railway transfers.",
    "- Prices are quoted per group in writing (itemised, including GST); you pay nothing until you accept the quote.",
    "- Char Dham registration is done only on the official Uttarakhand portal and Kedarnath helicopter seats only on IRCTC HeliYatra. EcoSoul does not sell helicopter tickets and is not a government website.",
    // Skip placeholder contact values (the fallbacks in config/site.ts) so assistants never quote a fake number
    ...(/0{6,}|example\.com/.test(settings.phone + settings.email)
      ? []
      : [`- Contact: phone ${settings.phone}, WhatsApp +${settings.whatsapp.replace(/\D/g, "")}, email ${settings.email}. Hours: ${settings.hours}.`]),
    "",
    "## Tour packages and yatras",
    link("Uttarakhand tour packages", "/uttarakhand/tour-packages/", "all packages and trip ideas"),
    link("Char Dham Yatra", "/uttarakhand/char-dham-yatra/", "Yamunotri, Gangotri, Kedarnath and Badrinath route, days and registration"),
    link("Kedarnath yatra package", "/uttarakhand/kedarnath-yatra-package/", "trek, helicopter, hotels and a 5-day plan from Haridwar"),
    link("Auli tour package", "/uttarakhand/auli-tour-package/", "snow, skiing and Nanda Devi views"),
    link("Himalayan treks", "/uttarakhand/himalayan-treks/", "Kedarkantha, Valley of Flowers, Har Ki Dun, Kuari Pass, Brahmatal, Dayara Bugyal"),
    link("Kumaon tour packages", KUMAON_HUB_PATH, "7-day Kumaon circuit"),
    ...kumaonPlaces.map((k) => link(`${k.name} tour package`, kumaonPath(k.id), k.intro.split(" — ")[0])),
    ...packages.map((p) => link(p.title, `/packages/${p.slug}/`)),
    "",
    "## Travel guides",
    ...guides.map((g) => link(g.title, guidePath(g), g.quickAnswer)),
    link("How to reach Uttarakhand", "/how-to-reach-uttarakhand/"),
    link("FAQs", "/faqs/"),
    "",
    "## Destinations",
    ...destinations.map((d) => link(`${d.name} travel guide`, `/destinations/${d.slug}/`, d.summary)),
    "",
    "## Taxi and transport",
    link("Uttarakhand taxi booking", "/uttarakhand/taxi-booking/"),
    link("Driver booking", "/uttarakhand/driver-booking/"),
    link("Airport and railway transfers", "/uttarakhand/airport-transfers/"),
    link("All taxi routes", "/taxi/", "distance and drive time for every route"),
    ...popularRoutes.map((r) => link(`${shortName(r.from)} to ${shortName(r.to)} taxi`, routePath(r), `${r.km} km, ${r.time}`)),
    "",
    "## Hindi pages (हिंदी)",
    link("चार धाम यात्रा", "/hi/char-dham-yatra/"),
    link("केदारनाथ यात्रा पैकेज", "/hi/kedarnath-yatra/"),
    link("दिल्ली से नैनीताल टैक्सी", "/hi/nainital-taxi/"),
    link("दिल्ली से हरिद्वार और ऋषिकेश टैक्सी", "/hi/haridwar-rishikesh-taxi/"),
    "",
    "## Booking and contact",
    link("Customise my trip (enquiry form)", "/customise-my-trip/"),
    link("Hotel and homestay booking", "/hotel-booking/"),
    link("Contact", "/contact/"),
    link("About us", "/about-us/"),
    "",
    "## Optional",
    link("Booking policy", "/booking-policy/"),
    link("Cancellation policy", "/cancellation-policy/"),
    link("Sitemap", "/sitemap.xml"),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}
