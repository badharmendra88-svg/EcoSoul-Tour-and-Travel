import { renderAppIcon } from "@/lib/app-icon";

// PWA icons: /pwa-icon/<site|admin>-<192|512>[-maskable]/
const variants = ["site", "admin"].flatMap((app) =>
  ["192", "512"].flatMap((s) => [`${app}-${s}`, `${app}-${s}-maskable`]),
);

export const dynamic = "force-static";

export function generateStaticParams() {
  return variants.map((variant) => ({ variant }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  if (!variants.includes(variant)) return new Response("Not found", { status: 404 });
  const [app, size, maskable] = variant.split("-");
  return renderAppIcon(Number(size), { maskable: maskable === "maskable", badge: app === "admin" ? "ADMIN" : undefined });
}
