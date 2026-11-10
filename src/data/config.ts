import type { CategoryId, Interest, LockerType, PickupMethod } from "@/lib/types";

/**
 * Demo parameters: change them here without touching the screens' code.
 */

/** Progressive discounts based on how far ahead the booking is made */
export const ADVANCE_TIERS = [
  { days: 1, pct: 5, label: "Domani" },
  { days: 3, pct: 10, label: "Tra 3 giorni" },
  { days: 5, pct: 15, label: "Tra 5 giorni" },
] as const;

/** Maximum combined discount (advance booking + store promotion) */
export const MAX_DISCOUNT_PCT = 25;

/** FOODPULSE points rules */
export const POINTS = {
  perEuro: 1,
  bonusAdvance3: 10,
  bonusAdvance5: 20,
  feedback: 30,
  /** first feedback about the app (Feedback tab), once per account */
  appFeedback: 30,
  welcome: 50,
};

/** A voucher is generated automatically when the threshold is reached */
export const VOUCHER = { threshold: 300, value: 5 };

export const LEVELS = [
  { name: "Seme", min: 0 },
  { name: "Germoglio", min: 500 },
  { name: "Albero", min: 1500 },
];

/**
 * Impact estimate: not every booked product is avoided waste.
 * Each booked, non-cancelled kg is credited with a share of avoided waste,
 * equal to the average unsold share of fresh products (assumption to validate in the pilot).
 */
export const AVOIDED_WASTE_SHARE = 0.25;

/** kg CO₂e per kg of product (indicative values, rounded from the literature) */
export const CO2_FACTORS: Record<CategoryId, number> = {
  panetteria: 1.3,
  gastronomia: 3.0,
  carne: 15,
  pesce: 6,
  ortofrutta: 0.7,
  latticini: 4,
};

export const CATEGORIES: Record<CategoryId, { label: string; tile: string; text: string }> = {
  panetteria: { label: "Panetteria", tile: "bg-amber-50", text: "text-amber-700" },
  gastronomia: { label: "Gastronomia", tile: "bg-red-50", text: "text-red-700" },
  carne: { label: "Carne", tile: "bg-rose-50", text: "text-rose-700" },
  pesce: { label: "Pesce", tile: "bg-sky-50", text: "text-sky-700" },
  ortofrutta: { label: "Ortofrutta", tile: "bg-brand-50", text: "text-brand-600" },
  latticini: { label: "Latticini e formaggi", tile: "bg-yellow-50", text: "text-yellow-800" },
};
export const CATEGORY_ORDER: CategoryId[] = ["panetteria", "gastronomia", "carne", "pesce", "ortofrutta", "latticini"];

export const METHOD_LABEL: Record<PickupMethod, string> = {
  instore: "Ritiro in supermercato",
  locker: "Ritiro presso locker",
  delivery: "Consegna a domicilio",
};

export const LOCKER_LABEL: Record<LockerType, string> = {
  ambiente: "A temperatura ambiente",
  refrigerato: "Refrigerato (0–4 °C)",
  surgelato: "Surgelati (−18 °C)",
};

export const INTEREST_LABEL: Record<Interest, string> = {
  fitness: "Fitness e palestra",
  bodybuilding: "Bodybuilding",
  sano: "Alimentazione sana",
  cucina: "Cucina e ricette",
  risparmio: "Risparmio e offerte",
  vegetale: "Alimentazione vegetale",
  sport: "Sport e benessere",
  famiglia: "Vita familiare",
  veloce: "Cucina veloce",
  bio: "Prodotti biologici",
};
