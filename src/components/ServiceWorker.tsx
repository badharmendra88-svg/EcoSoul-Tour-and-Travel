"use client";

import { useEffect } from "react";

// Registers /sw.js in production so the site and admin can be installed as apps.
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* installability is a progressive enhancement — ignore failures */
    });
  }, []);
  return null;
}
