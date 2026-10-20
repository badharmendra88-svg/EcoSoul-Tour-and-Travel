import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileEnquiryBar } from "@/components/MobileEnquiryBar";
import { site } from "@/config/site";
import { jsonLd } from "@/lib/seo";

const organization = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: site.name,
  url: site.url,
  telephone: site.phone,
  email: site.email,
  areaServed: { "@type": "State", name: "Uttarakhand" },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organization)} />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <MobileEnquiryBar />
    </>
  );
}
