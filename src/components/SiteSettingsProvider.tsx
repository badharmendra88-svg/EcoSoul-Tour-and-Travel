"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PublicSettings } from "@/lib/settings";

// Admin-managed contact / WhatsApp settings for client components.
const SettingsContext = createContext<PublicSettings | null>(null);

export function SiteSettingsProvider({ value, children }: { value: PublicSettings; children: ReactNode }) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSiteSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used inside SiteSettingsProvider");
  return ctx;
}
