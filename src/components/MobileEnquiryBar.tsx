"use client";

import Link from "next/link";
import { telLink, whatsappLink } from "@/config/site";
import { track } from "@/lib/analytics";
import { PhoneIcon, WhatsAppIcon } from "./ContactButtons";

// Sticky but unobtrusive mobile CTA bar (blueprint §13 Mobile UX).
export function MobileEnquiryBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur sm:hidden">
      <div className="grid grid-cols-[auto_auto_1fr] gap-2">
        <a href={telLink()} onClick={() => track("click_phone")} className="btn-outline px-4" aria-label="Call us">
          <PhoneIcon />
        </a>
        <a
          href={whatsappLink("Hi EcoSoul, I'd like help planning an Uttarakhand trip.")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("click_whatsapp")}
          className="btn-secondary px-4"
          aria-label="Chat on WhatsApp"
        >
          <WhatsAppIcon />
        </a>
        <Link href="/customise-my-trip/" className="btn-primary">
          Plan My Trip
        </Link>
      </div>
    </div>
  );
}
