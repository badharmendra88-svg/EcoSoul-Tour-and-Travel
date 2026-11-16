import { CookieConsent } from "@/components/CookieConsent";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileEnquiryBar } from "@/components/MobileEnquiryBar";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import { UtmCapture } from "@/components/UtmCapture";
import { site } from "@/config/site";
import { getSettings } from "@/lib/settings";
import { jsonLd } from "@/lib/seo";

// "Street, Area, City, State 263001" → schema.org PostalAddress (only for a full address with a PIN code)
function postalAddress(address: string) {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  const last = parts.pop()?.match(/^(.+?)\s+(\d{6})$/);
  const city = parts.pop();
  if (!last || !city) return {};
  return {
    address: {
      "@type": "PostalAddress",
      ...(parts.length ? { streetAddress: parts.join(", ") } : {}),
      addressLocality: city,
      addressRegion: last[1],
      postalCode: last[2],
      addressCountry: "IN",
    },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const organization = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: site.name,
    url: site.url,
    telephone: settings.phone,
    email: settings.email,
    areaServed: { "@type": "State", name: "Uttarakhand" },
    ...postalAddress(settings.address),
    ...(settings.social.length ? { sameAs: settings.social.map((s) => s.url) } : {}),
  };

  return (
    <SiteSettingsProvider value={settings}>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organization)} />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <MobileEnquiryBar />
      <FloatingWhatsApp />
      <UtmCapture />
      <CookieConsent gaId={settings.gaId} metaPixelId={settings.metaPixelId} />
    </SiteSettingsProvider>
  );
}
