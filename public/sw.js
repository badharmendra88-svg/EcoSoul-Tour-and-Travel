// EcoSoul service worker — deliberately minimal.
// Pages and admin data are always fetched fresh from the network; the only
// thing cached is a small offline page shown when there is no connection.
const CACHE = "ecosoul-offline-v2";
const OFFLINE_URL = "/offline/";

// Used if the offline page could not be cached (e.g. storage unavailable)
const FALLBACK_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>You're offline</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#faf7f0;color:#0f261b;text-align:center;padding:24px}a{display:inline-block;margin-top:16px;background:#f0a53c;color:#0f261b;padding:12px 22px;border-radius:999px;font-weight:600;text-decoration:none}</style>
</head><body><div><h1>No network in the hills?</h1><p>You're offline right now. Check your connection and try again.</p><a href="/">Try again</a></div></body></html>`;

self.addEventListener("install", (event) => {
  // Never let a caching problem block installation
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      .catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .catch(() => undefined)
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(OFFLINE_URL).catch(() => undefined);
      return cached || new Response(FALLBACK_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }),
  );
});
