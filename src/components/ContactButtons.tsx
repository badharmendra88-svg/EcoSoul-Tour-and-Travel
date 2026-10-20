"use client";

import { site, telLink, whatsappLink } from "@/config/site";
import { track } from "@/lib/analytics";

// FR-05: WhatsApp / phone CTAs with click tracking. The pre-filled message
// carries only trip context (no personal data).

export function WhatsAppButton({
  message,
  packageId,
  className = "btn-secondary",
  label = "Chat on WhatsApp",
}: {
  message?: string;
  packageId?: string;
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={whatsappLink(message ?? `Hi ${site.shortName}, I'd like help planning an Uttarakhand trip.`)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => track("click_whatsapp", { package_id: packageId })}
    >
      <WhatsAppIcon />
      {label}
    </a>
  );
}

export function PhoneButton({ className = "btn-outline", label }: { className?: string; label?: string }) {
  return (
    <a href={telLink()} className={className} onClick={() => track("click_phone")}>
      <PhoneIcon />
      {label ?? `Call ${site.phone}`}
    </a>
  );
}

export function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm5.8 14.12c-.24.68-1.43 1.32-1.97 1.37-.5.05-1.13.07-1.83-.11a16.7 16.7 0 0 1-1.66-.61c-2.92-1.26-4.82-4.2-4.97-4.39-.14-.2-1.18-1.58-1.18-3.01 0-1.43.75-2.13 1.02-2.42.26-.29.58-.36.77-.36h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.2-.14.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.3-.12.59.17.29.75 1.24 1.61 2 1.1.98 2.04 1.29 2.33 1.43.29.14.46.12.63-.07.17-.2.72-.84.92-1.13.19-.29.38-.24.65-.14.26.1 1.68.79 1.97.94.29.14.48.21.55.33.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

export function PhoneIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}
