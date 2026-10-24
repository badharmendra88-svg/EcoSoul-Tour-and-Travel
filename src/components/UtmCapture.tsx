"use client";

import { useEffect } from "react";
import { captureUtm } from "@/lib/utm";

/** Remembers the ad campaign a visitor arrived from (see lib/utm.ts). */
export function UtmCapture() {
  useEffect(() => captureUtm(), []);
  return null;
}
