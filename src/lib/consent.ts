// Cookie consent (DPDP Act 2023 / GDPR-style opt-in). Analytics and marketing
// tags load only after the visitor agrees; strictly necessary storage (admin
// session, this choice itself, the per-tab campaign tag) needs no consent.
//
// The choice is a first-party cookie, e.g. "v1.a1.m0.1761300000", kept 180 days.

export type Consent = { analytics: boolean; marketing: boolean; at: number };

export const CONSENT_COOKIE = "es_consent";
export const CONSENT_EVENT = "es:consent";
export const OPEN_CONSENT_EVENT = "es:open-consent";
const VERSION = "v1"; // bump to ask everyone again when the categories change
const MAX_AGE = 180 * 24 * 3600;

/** The raw cookie value ("" when unset) — a stable string snapshot for useSyncExternalStore. */
export function rawConsent(): string {
  if (typeof document === "undefined") return "";
  return decodeURIComponent(document.cookie.split("; ").find((c) => c.startsWith(`${CONSENT_COOKIE}=`))?.split("=")[1] ?? "");
}

export function parseConsent(raw: string): Consent | null {
  const m = raw.match(/^v1\.a([01])\.m([01])\.(\d+)$/);
  return m ? { analytics: m[1] === "1", marketing: m[2] === "1", at: Number(m[3]) } : null;
}

export function readConsent(): Consent | null {
  return parseConsent(rawConsent());
}

/** Notifies `onChange` whenever the visitor saves a new choice (useSyncExternalStore subscribe). */
export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

export function saveConsent(choice: { analytics: boolean; marketing: boolean }) {
  const previous = readConsent();
  const value = `${VERSION}.a${choice.analytics ? 1 : 0}.m${choice.marketing ? 1 : 0}.${Math.floor(Date.now() / 1000)}`;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;

  // Withdrawn consent: remove the tags' cookies. Scripts already running can't be
  // unloaded, so the caller reloads the page.
  const withdrew = (previous?.analytics && !choice.analytics) || (previous?.marketing && !choice.marketing);
  if (previous?.analytics && !choice.analytics) clearCookies(/^(_ga|_gid|_gat)/);
  if (previous?.marketing && !choice.marketing) clearCookies(/^(_fbp|_fbc)/);

  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: readConsent() }));
  return { withdrew: Boolean(withdrew) };
}

function clearCookies(name: RegExp) {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const c of document.cookie.split("; ")) {
    const key = c.split("=")[0];
    if (!name.test(key)) continue;
    for (const d of domains) document.cookie = `${key}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ""}`;
  }
}

/** Opens the cookie settings panel (footer link, privacy policy). */
export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}
