"use client";

import { openConsentSettings } from "@/lib/consent";

/** Re-opens the cookie settings panel so visitors can change or withdraw consent. */
export function CookieSettingsButton({ className = "", label = "Cookie settings" }: { className?: string; label?: string }) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      {label}
    </button>
  );
}
