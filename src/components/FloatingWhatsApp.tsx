"use client";

import { whatsappLink } from "@/config/site";
import { track } from "@/lib/analytics";
import { WhatsAppIcon } from "./ContactButtons";
import { useSiteSettings } from "./SiteSettingsProvider";

// Floating WhatsApp chat button (desktop/tablet; phones use the bottom bar).
export function FloatingWhatsApp() {
  const s = useSiteSettings();
  if (!s.whatsappButton) return null;
  return (
    <a
      href={whatsappLink(s.whatsapp, s.whatsappGreeting)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("click_whatsapp", { placement: "floating" })}
      className="group fixed right-5 bottom-5 z-30 hidden items-center gap-2 rounded-full bg-[#1fa855] py-3 pr-5 pl-4 font-semibold text-white shadow-xl shadow-black/20 transition-transform hover:-translate-y-0.5 sm:flex"
      aria-label="Chat with us on WhatsApp"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="text-sm">Chat with us</span>
    </a>
  );
}
