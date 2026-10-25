"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";
import { CONSENT_EVENT, OPEN_CONSENT_EVENT, readConsent, saveConsent, type Consent } from "@/lib/consent";

/**
 * Cookie banner + settings panel, and the analytics / marketing tags that load
 * only after consent. Accept and reject are equally prominent (no dark patterns).
 */
export function CookieConsent({ gaId, metaPixelId }: { gaId: string; metaPixelId: string }) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);
  const [panel, setPanel] = useState(false);
  // Private pages (the customer's quote link is its only password) never load third-party tags,
  // so the token in the URL can't end up in Google / Meta analytics.
  const privatePage = usePathname().startsWith("/quote/");
  // These values end up inside inline scripts: accept only the documented formats
  const ga = !privatePage && /^G-[A-Z0-9]{4,20}$/.test(gaId) ? gaId : "";
  const pixel = !privatePage && /^\d{6,20}$/.test(metaPixelId) ? metaPixelId : "";

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
    const onChange = (e: Event) => setConsent((e as CustomEvent<Consent | null>).detail);
    const onOpen = () => setPanel(true);
    window.addEventListener(CONSENT_EVENT, onChange);
    window.addEventListener(OPEN_CONSENT_EVENT, onOpen);
    return () => {
      window.removeEventListener(CONSENT_EVENT, onChange);
      window.removeEventListener(OPEN_CONSENT_EVENT, onOpen);
    };
  }, []);

  function choose(choice: { analytics: boolean; marketing: boolean }) {
    const { withdrew } = saveConsent(choice);
    setPanel(false);
    if (withdrew) window.location.reload();
  }

  return (
    <>
      {consent?.analytics && ga && <GoogleAnalytics gaId={ga} marketing={consent.marketing} />}
      {consent?.marketing && pixel && <MetaPixel id={pixel} />}

      {ready && !consent && !panel && !privatePage && (
        <section
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-900/10 sm:inset-x-6 sm:bottom-6 sm:p-5"
        >
          <p className="text-sm font-semibold text-forest-900">We value your privacy</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            We use essential cookies to run this site. With your permission we also use analytics cookies to improve it and
            marketing cookies to measure our ads. We never sell your data.{" "}
            <Link href="/privacy-policy/#cookies" className="font-medium text-forest-700 underline">Learn more</Link>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <button type="button" onClick={() => setPanel(true)} className="col-span-2 rounded-full px-4 py-2.5 text-sm font-semibold text-forest-700 underline-offset-2 hover:underline sm:col-span-1 sm:mr-auto sm:px-2">
              Customise
            </button>
            <button type="button" onClick={() => choose({ analytics: false, marketing: false })} className="btn-outline">
              Reject all
            </button>
            <button type="button" onClick={() => choose({ analytics: true, marketing: true })} className="btn-secondary">
              Accept all
            </button>
          </div>
        </section>
      )}

      {panel && (
        <SettingsPanel
          initial={consent ?? { analytics: false, marketing: false, at: 0 }}
          onSave={choose}
          onClose={() => setPanel(false)}
        />
      )}
    </>
  );
}

function SettingsPanel({
  initial,
  onSave,
  onClose,
}: {
  initial: Consent;
  onSave: (c: { analytics: boolean; marketing: boolean }) => void;
  onClose: () => void;
}) {
  const [analytics, setAnalytics] = useState(initial.analytics);
  const [marketing, setMarketing] = useState(initial.marketing);
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-auto w-[calc(100%-1.5rem)] max-w-lg rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-forest-900/50"
    >
      <div className="max-h-[85vh] overflow-y-auto p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold text-forest-900">Cookie settings</h2>
          <button type="button" onClick={onClose} className="-m-2 rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-600">Choose what you allow. You can change this any time from “Cookie settings” in the footer.</p>

        <ul className="mt-4 space-y-3">
          <Category title="Strictly necessary" text="Keep the site secure and working: your cookie choice, and staff sign-in for the admin area. Always on." checked disabled />
          <Category title="Analytics" text="Google Analytics — which pages are visited and how the site is used. No names, phone numbers or messages." checked={analytics} onChange={setAnalytics} />
          <Category title="Marketing" text="Meta (Facebook / Instagram) and Google ads — measure our ads and show relevant ads to people who visited." checked={marketing} onChange={setMarketing} />
        </ul>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onSave({ analytics: false, marketing: false })} className="btn-outline">Reject all</button>
          <button type="button" onClick={() => onSave({ analytics: true, marketing: true })} className="btn-outline">Accept all</button>
          <button type="button" onClick={() => onSave({ analytics, marketing })} className="btn-secondary col-span-2">
            Save my choices
          </button>
        </div>
      </div>
    </dialog>
  );
}

function Category({ title, text, checked, disabled, onChange }: { title: string; text: string; checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void }) {
  const id = useId();
  return (
    <li className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-900/5">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">{text}</span>
      </label>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full bg-slate-300 transition-colors before:block before:h-4 before:w-4 before:translate-x-0.5 before:rounded-full before:bg-white before:shadow before:transition-transform checked:bg-forest-600 checked:before:translate-x-[18px] disabled:cursor-not-allowed disabled:opacity-60"
      />
    </li>
  );
}

// IDs are validated in Admin → Settings (G-XXXX / digits only) before they reach these inline scripts.
function GoogleAnalytics({ gaId, marketing }: { gaId: string; marketing: boolean }) {
  const ads = marketing ? "granted" : "denied";
  return (
    <>
      <Script id="ga-consent" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('consent','default',{analytics_storage:'granted',ad_storage:'${ads}',ad_user_data:'${ads}',ad_personalization:'${ads}'});gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
    </>
  );
}

function MetaPixel({ id }: { id: string }) {
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`}
    </Script>
  );
}
