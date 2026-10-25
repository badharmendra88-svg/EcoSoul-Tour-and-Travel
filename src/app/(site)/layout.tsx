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
