// Ad-campaign attribution: remember the UTM tags a visitor arrived with (first
// touch in this browser tab) so the enquiry shows which campaign it came from.
// Stored in sessionStorage only — no cookies, nothing personal.

export type Utm = { source?: string; medium?: string; campaign?: string; term?: string; content?: string; landing?: string };

const KEY = "es_utm";
const FIELDS = ["source", "medium", "campaign", "term", "content"] as const;

export function captureUtm() {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const q = new URLSearchParams(window.location.search);
    const utm: Utm = {};
    for (const f of FIELDS) {
      const v = q.get(`utm_${f}`);
      if (v) utm[f] = v.slice(0, 100);
    }
    // Google / Meta ads without UTM tags still identify themselves by click id
    if (!utm.source && q.has("gclid")) Object.assign(utm, { source: "google", medium: "cpc" });
    if (!utm.source && q.has("fbclid")) Object.assign(utm, { source: "facebook", medium: "social" });
    if (!utm.source) return;
    utm.landing = window.location.pathname.slice(0, 200);
    sessionStorage.setItem(KEY, JSON.stringify(utm));
  } catch {
    // Storage blocked (private mode, etc.) — attribution is optional
  }
}

export function readUtm(): Utm | undefined {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Utm) : undefined;
  } catch {
    return undefined;
  }
}
