/**
 * Current language of the interface (Italian or English), remembered per device.
 * The app's texts are written in Italian in the code; English comes from the
 * dictionary in ./en.ts (see ./translator.ts).
 */
export type Lang = "it" | "en";

const STORAGE_KEY = "foodpulse-lang";

function initialLang(): Lang {
  try {
    if (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) === "en") return "en";
  } catch {
    /* storage not available */
  }
  return "it";
}

let current: Lang = initialLang();

export const getLang = (): Lang => current;

/** Locale for dates and numbers: Italian formats, or English with euro amounts like €6.00 */
export const locale = (): string => (current === "en" ? "en-GB" : "it-IT");

export function saveLang(l: Lang) {
  current = l;
  try {
    window.localStorage.setItem(STORAGE_KEY, l);
  } catch {
    /* keep it for this visit only */
  }
}
