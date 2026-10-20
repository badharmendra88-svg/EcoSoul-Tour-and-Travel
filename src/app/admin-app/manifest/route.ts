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
    background_color: "#03291a",
    theme_color: "#03291a",
    icons: [
      { src: "/brand/admin-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/admin-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/admin-icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/brand/admin-icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
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
