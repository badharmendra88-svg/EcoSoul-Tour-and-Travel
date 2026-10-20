// Separate installable app for the admin console, opening straight to /admin/.
export const dynamic = "force-static";

export function GET() {
  const manifest = {
    id: "/admin/",
    name: "EcoSoul Admin",
    short_name: "EcoSoul Admin",
    description: "Leads, quotes and bookings for EcoSoul Uttarakhand Travel",
    start_url: "/admin/",
    scope: "/admin/",
    display: "standalone",
    orientation: "any",
    background_color: "#0f261b",
    theme_color: "#0f261b",
    icons: [
      { src: "/pwa-icon/admin-192/", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/admin-512/", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/admin-192-maskable/", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/pwa-icon/admin-512-maskable/", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Leads", url: "/admin/" },
      { name: "New quote", url: "/admin/quotes/new/" },
      { name: "Rate card", url: "/admin/rates/" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" },
  });
}
