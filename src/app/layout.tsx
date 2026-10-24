import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Dancing_Script, Inter, Merriweather } from "next/font/google";
import { site } from "@/config/site";
import { getSettings } from "@/lib/settings";
import { ServiceWorker } from "@/components/ServiceWorker";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Brand fonts matching the logo: bold serif wordmark + script tagline
// Only weight 700 is used; the script face is decorative (footer tagline) so it isn't preloaded
// and doesn't compete with the hero for bandwidth on slow mobile connections.
const brandSerif = Merriweather({ subsets: ["latin"], weight: "700", variable: "--font-brand-serif", display: "swap" });
const brandScript = Dancing_Script({ subsets: ["latin"], weight: "600", variable: "--font-brand-script", display: "swap", preload: false });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name} — Tours, Taxis & Custom Trips`, template: `%s | ${site.name}` },
    description: site.description,
    applicationName: site.name,
    manifest: "/site-app/manifest/",
    appleWebApp: { capable: true, title: "EcoSoul", statusBarStyle: "default" },
    formatDetection: { telephone: false },
    openGraph: { siteName: site.name, locale: site.locale, type: "website" },
    ...(s.googleVerification ? { verification: { google: s.googleVerification } } : {}),
  };
}

// Attributes injected by common browser extensions (never used by this app)
const EXTENSION_ATTRS = ["fdprocessedid", "data-new-gr-c-s-check-loaded", "data-gr-ext-installed", "cz-shortcut-listen", "data-lt-installed"];

export const viewport: Viewport = {
  themeColor: "#0b4a30",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Tracking IDs are managed in Admin → Settings → Tracking (validated there)
  const { gaId, metaPixelId } = await getSettings();
  return (
    // English at launch; architecture keeps copy in pages/DB so Hindi can be added as /hi/ routes later
    <html lang="en-IN" className={`${inter.variable} ${brandSerif.variable} ${brandScript.variable}`}>
      <body className="min-h-screen font-sans">
        {/* Some browser extensions (form fillers, password managers, Grammarly) stamp attributes such as
            `fdprocessedid` on inputs/buttons before React hydrates, causing hydration-mismatch warnings.
            Strip only those known extension attributes until hydration has finished. */}
        <Script id="strip-extension-attrs" strategy="beforeInteractive">
          {`(function(){var A=${JSON.stringify(EXTENSION_ATTRS)};function c(e){for(var i=0;i<A.length;i++){if(e.hasAttribute&&e.hasAttribute(A[i]))e.removeAttribute(A[i]);}}function all(){for(var i=0;i<A.length;i++){var n=document.querySelectorAll('['+A[i]+']');for(var j=0;j<n.length;j++)c(n[j]);}}all();var o=new MutationObserver(function(m){for(var i=0;i<m.length;i++)c(m[i].target);});o.observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:A});document.addEventListener('DOMContentLoaded',all);setTimeout(function(){o.disconnect();},10000);})();`}
        </Script>
        {/* A page refresh always starts at the top. Browsers otherwise restore the old scroll position
            (or jump back to a #section from an earlier click). Back/forward keep their normal restore. */}
        <Script id="reload-to-top" strategy="beforeInteractive">
          {`(function(){try{var n=performance.getEntriesByType('navigation')[0];if(!n||n.type!=='reload')return;history.scrollRestoration='manual';if(location.hash)history.replaceState(history.state,'',location.pathname+location.search);var top=function(){window.scrollTo(0,0)};top();addEventListener('DOMContentLoaded',top);addEventListener('load',function(){top();setTimeout(function(){history.scrollRestoration='auto'},0)})}catch(e){}})();`}
        </Script>
        {children}
        <ServiceWorker />
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
            </Script>
          </>
        )}
        {metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
          </Script>
        )}
      </body>
    </html>
  );
}
