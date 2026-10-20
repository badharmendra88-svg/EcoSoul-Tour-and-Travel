import { site } from "@/config/site";

// Website PWA (served as a route so the admin can declare its own manifest) — installable from Chrome/Android ("Install app") and
// iOS Safari ("Add to Home Screen").
export const dynamic = "force-static";

export function GET() {
  const manifest = {
    id: "/",
    name: site.name,
    short_name: "EcoSoul",
    description: site.description,
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf7f0",
    theme_color: "#1d4630",
    lang: "en-IN",
    categories: ["travel", "lifestyle"],
    icons: [
      { src: "/pwa-icon/site-192/", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/site-512/", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/site-192-maskable/", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/pwa-icon/site-512-maskable/", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Plan My Trip", url: "/customise-my-trip/" },
      { name: "Book a Car", url: "/uttarakhand/taxi-booking/" },
      { name: "Tour Packages", url: "/uttarakhand/tour-packages/" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" },
  });
}
