/**
 * System notifications (level 1): shown by the browser while FoodPulse is open in a background tab or minimised.
 * Needs one "Consenti" from the user. No push server: nothing arrives when the app is fully closed.
 */
import { getLang } from "@/i18n/lang";
import { translate } from "@/i18n/translator";

let reg: Promise<ServiceWorkerRegistration | null> | null = null;

function registration(): Promise<ServiceWorkerRegistration | null> {
  if (reg) return reg;
  reg = (async () => {
    try {
      if (!("serviceWorker" in navigator) || location.protocol !== "https:") return null;
      return await navigator.serviceWorker.register("./sw.js");
    } catch {
      return null;
    }
  })();
  return reg;
}

export type NotifyState = "unsupported" | "default" | "granted" | "denied";

export function notifyState(): NotifyState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as NotifyState;
}

/** Ask permission (must run from a tap). Returns the new state. */
export async function enableNotifications(): Promise<NotifyState> {
  if (notifyState() === "unsupported") return "unsupported";
  void registration();
  try {
    const p = await Notification.requestPermission();
    return p as NotifyState;
  } catch {
    return notifyState();
  }
}

/** Show a system notification, only when the page is not in front (otherwise the in-app pop-up is enough). */
export async function systemNotify(title: string, body: string, tag: string) {
  if (notifyState() !== "granted" || document.visibilityState === "visible") return;
  if (getLang() === "en") {
    title = translate(title);
    body = translate(body);
  }
  const opts: NotificationOptions = { body, tag, icon: "./icon-192.png", badge: "./icon-192.png" };
  try {
    const r = await registration();
    if (r) return void (await r.showNotification(title, opts));
    const n = new Notification(title, opts);
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    /* some browsers only allow notifications from a service worker */
  }
}
