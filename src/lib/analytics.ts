// Client-side event tracking (blueprint §16). Never send names, phone
// numbers, emails or free-text messages — only IDs and page context.

type EventName = "view_package" | "click_whatsapp" | "click_phone" | "submit_enquiry" | "fare_estimate" | "begin_payment" | "payment_success";
type Params = Record<string, string | number | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: EventName, params: Params = {}) {
  if (typeof window === "undefined") return;
  const payload = { page_path: window.location.pathname, ...params };
  if (window.gtag) window.gtag("event", event, payload);
  else (window.dataLayer ||= []).push({ event, ...payload });
  if (process.env.NODE_ENV !== "production") console.debug("[track]", event, payload);
}
