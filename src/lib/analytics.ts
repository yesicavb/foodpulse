/**
 * Google Analytics 4 (web stream of the FOODPULSE property).
 *
 * Nothing is loaded and nothing is sent until the visitor taps "Accetta" in the cookie banner
 * (EU rules). The choice is kept in this browser and can be changed in Profilo > Notifiche e privacy.
 *
 * Only anonymous events are sent: which step of the app was reached, plus numbers such as
 * days booked in advance. Never names, emails, addresses or account ids.
 *
 * Events (one per step of the funnel; read them in GA4 > Explore > Funnel exploration):
 *   sign_up / login / demo_start   account created, logged in, demo started
 *   view_fresh                     opened a department or searched the fresh products
 *   add_to_cart                    added a fresh product to the cart
 *   pre_order                      confirmed a booking (advance_days, discount_pct, items, value)
 *   qr_view                        opened the QR code of a booking
 *   order_completed                booking picked up in the shop
 *   order_rating                   post-shopping survey sent (rating 1-5)
 *   app_feedback                   Feedback tab sent (visual_rating 1-5)
 *   sponsored_click                opened a sponsored product
 *   tab_view                       opened a tab of the bottom bar
 *   store_select                   chose a supermarket (city, chain)
 */

export const GA_ID = "G-BQ2BDPLSTZ";
const CONSENT_KEY = "foodpulse-analytics-consent";

export type Consent = "granted" | "denied";
type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loaded = false;
/** "demo" or "registered": sent with every event so the demo can be filtered out in GA4 */
let accountType: string | undefined;

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(c: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, c);
  } catch {
    /* private mode: the choice lasts until the page is closed */
  }
  if (c === "granted") loadAnalytics();
  else if (loaded) window.gtag?.("consent", "update", { analytics_storage: "denied" });
}

/** Loads Google's script (once) after consent */
export function loadAnalytics() {
  if (typeof window === "undefined") return;
  if (loaded) {
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
    return;
  }
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag needs the real `arguments` object
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  if (accountType) window.gtag("set", "user_properties", { account_type: accountType });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

/** Call once at start-up: loads GA if this browser already accepted */
export function initAnalytics() {
  if (getConsent() === "granted") loadAnalytics();
}

export function setAccountType(t: "demo" | "registered" | undefined) {
  accountType = t;
  if (loaded && getConsent() === "granted") window.gtag?.("set", "user_properties", { account_type: t ?? "none" });
}

/** Sends one event, only if the visitor accepted analytics */
export function track(name: string, params: Params = {}) {
  if (typeof window === "undefined" || !loaded || getConsent() !== "granted") return;
  window.gtag?.("event", name, { ...params, account_type: accountType });
}
