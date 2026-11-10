import { INTEREST_LABEL } from "@/data/config";
import { FRESH, POPULAR, SHELF } from "@/data/products";
import { hashCode } from "./format";
import { householdOf, weeklyBudgetOf } from "./profile";
import { isAvailable, priceInfo, shelfPrice } from "./pricing";
import type { FreshProduct, Interest, Profile, ShelfProduct, Store, Tag } from "./types";

/**
 * SMART BASKET – rule-based demo algorithm (not a trained AI model).
 * Combines purchase history, profile, household size, budget and availability
 * in the selected store to suggest an editable list.
 */

export interface Suggestion {
  id: string;
  kind: "fresh" | "shelf";
  qty: number;
  reason: string;
  score: number;
}

const INTEREST_TAGS: Record<Interest, Tag[]> = {
  fitness: ["proteico", "energia"],
  bodybuilding: ["proteico"],
  sano: ["sano", "leggero", "bio"],
  cucina: [],
  risparmio: [],
  vegetale: ["vegetale"],
  sport: ["energia", "proteico"],
  famiglia: ["famiglia", "bambini"],
  veloce: ["veloce"],
  bio: ["bio"],
};

const FRUIT = ["mele", "banane", "frutti-bosco"];
const CHEESE = ["mozzarella", "ricotta", "parmigiano", "fiocchi-latte"];
const LEGUMES = ["hummus", "polpette-lenticchie", "ceci", "tofu"];
const CEREALS = ["avena", "pasta-integrale"];

type AnyProduct = (FreshProduct & { kind: "fresh" }) | (ShelfProduct & { kind: "shelf" });

function matchesFavorite(p: AnyProduct, fav: string) {
  const cat = p.kind === "fresh" ? p.category : null;
  switch (fav) {
    case "Carne":
      return cat === "carne";
    case "Pesce":
      return cat === "pesce";
    case "Frutta":
      return FRUIT.includes(p.id);
    case "Verdura":
      return cat === "ortofrutta" && !FRUIT.includes(p.id);
    case "Latticini":
      return cat === "latticini";
    case "Formaggi":
      return CHEESE.includes(p.id);
    case "Pane e prodotti da forno":
      return cat === "panetteria";
    case "Cereali":
      return CEREALS.includes(p.id);
    case "Legumi":
      return LEGUMES.includes(p.id);
    case "Prodotti proteici":
      return p.tags.includes("proteico");
    default:
      return false;
  }
}

/** Exclusions: diet, declared allergens, disliked foods */
export function isExcluded(p: { name: string; allergens: string[]; animal?: string[] }, profile: Profile) {
  const animal = p.animal ?? [];
  if (profile.diet === "vegana" && animal.length) return true;
  if (profile.diet === "vegetariana" && (animal.includes("carne") || animal.includes("pesce"))) return true;
  if (profile.diet === "pescetariana" && animal.includes("carne")) return true;
  if (profile.health.allergens.some((a) => p.allergens.includes(a))) return true;
  const words = profile.disliked
    .toLowerCase()
    .split(/[,;\n]+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3);
  const name = p.name.toLowerCase();
  return words.some((w) => name.includes(w));
}

const TRIPS: Record<string, number> = {
  "Ogni giorno": 5,
  "2–3 volte a settimana": 2.5,
  "1 volta a settimana": 1,
  "Ogni 2 settimane": 0.5,
};

export function buildSmartList(profile: Profile, history: Record<string, number>, store: Store, seed: number): Suggestion[] {
  const hh = householdOf(profile);
  const trips = TRIPS[profile.frequency] ?? 1;
  const hasHistory = Object.values(history).some((n) => n > 0);
  const savingsMinded =
    profile.interests.includes("risparmio") || profile.offersInterest >= 4 || profile.priority === "Risparmio" || profile.goals.includes("risparmiare");

  const candidates: AnyProduct[] = [
    ...FRESH.filter((p) => isAvailable(p.id, store)).map((p) => ({ ...p, kind: "fresh" as const })),
    ...SHELF.map((p) => ({ ...p, kind: "shelf" as const })),
  ].filter((p) => !isExcluded(p, profile));

  const scored = candidates.map((p) => {
    const freq = history[p.id] ?? 0;
    const reasons: { w: number; text: string }[] = [];
    let score = 0;

    if (freq > 0) {
      score += freq * 1.3;
      reasons.push({ w: freq * 1.3, text: freq >= 6 ? "Lo acquisti quasi ogni settimana" : freq >= 3 ? "Lo acquisti spesso" : "L'hai già acquistato" });
    }
    let interestHits = 0;
    for (const i of profile.interests) {
      if (INTEREST_TAGS[i].some((t) => p.tags.includes(t)) && interestHits < 2) {
        interestHits++;
        score += 1.6;
        reasons.push({ w: 1.6, text: `Coerente con il tuo interesse: ${INTEREST_LABEL[i].toLowerCase()}` });
      }
    }
    if (profile.interests.includes("cucina") && p.kind === "fresh" && ["carne", "pesce", "ortofrutta"].includes(p.category)) {
      score += 0.6;
      reasons.push({ w: 0.6, text: "Ottimo da cucinare" });
    }
    if ((profile.diet === "vegetariana" || profile.diet === "vegana") && p.tags.includes("vegetale")) {
      score += 1.2;
      reasons.push({ w: 1.2, text: `Adatto alla tua alimentazione ${profile.diet}` });
    }
    if ((profile.favoriteProducts ?? []).includes(p.id)) {
      score += 2.5;
      reasons.push({ w: 2.5, text: "L'hai salvato tra i preferiti" });
    } else if (profile.favorites.some((f) => matchesFavorite(p, f))) {
      score += 1.2;
      reasons.push({ w: 1.2, text: "Tra i prodotti che preferisci" });
    }
    if (hh >= 3 && p.tags.includes("famiglia")) {
      score += 1;
      reasons.push({ w: 1, text: `Pensato per una spesa da ${hh} persone` });
    }
    if (profile.hasKids === "si" && p.tags.includes("bambini")) {
      score += 1;
      reasons.push({ w: 1, text: "Adatto ai bambini" });
    }
    if (profile.goals.includes("equilibrato") && (p.tags.includes("sano") || p.tags.includes("leggero"))) {
      score += 0.6;
      reasons.push({ w: 0.6, text: "Ti aiuta a mangiare in modo più equilibrato" });
    }
    if (p.kind === "fresh") {
      const promo = store.categoryPromos[p.category] ?? 0;
      if (promo && savingsMinded) {
        score += 1.2;
        reasons.push({ w: 1.2, text: `In offerta da ${store.chain}: −${promo}% extra sul reparto` });
      }
    }
    if (!hasHistory && POPULAR.includes(p.id)) {
      score += 1.5;
      reasons.push({ w: 1.5, text: "Tra i più prenotati in questo punto vendita" });
    }
    // deterministic variation: "Rigenera" (Regenerate) changes the seed and therefore some suggestions
    score += (hashCode(`${p.id}:${seed}`) % 100) / 100 * (seed === 0 ? 0.3 : 1.4);

    reasons.sort((a, b) => b.w - a.w);
    return { p, score, reason: reasons[0]?.text ?? "Potrebbe interessarti" };
  });

  const budget = weeklyBudgetOf(profile) * 0.6;
  const fresh = scored.filter((s) => s.p.kind === "fresh" && s.score >= 1).sort((a, b) => b.score - a.score);
  const shelf = scored.filter((s) => s.p.kind === "shelf" && s.score >= 1.5).sort((a, b) => b.score - a.score);

  const out: Suggestion[] = [];
  let cost = 0;
  for (const s of fresh) {
    if (out.length >= 8) break;
    const p = s.p as FreshProduct;
    const heavy = p.weightKg >= 0.9;
    let qty = heavy ? Math.ceil(hh / 4) : Math.ceil(hh / 2);
    if ((history[p.id] ?? 0) >= 6 && trips <= 1 && (p.category === "panetteria" || p.id === "latte-fresco")) qty += 1;
    qty = Math.max(1, Math.min(5, qty));
    const lineCost = priceInfo(p, store, 1).final * qty;
    if (out.length >= 4 && cost + lineCost > budget) continue;
    cost += lineCost;
    out.push({ id: p.id, kind: "fresh", qty, reason: s.reason, score: s.score });
  }
  for (const s of shelf.slice(0, 3)) {
    const p = s.p as ShelfProduct;
    const qty = hh >= 4 && p.tags.includes("famiglia") ? 2 : 1;
    if (cost + shelfPrice(p, store) * qty > budget * 1.4) continue;
    cost += shelfPrice(p, store) * qty;
    out.push({ id: p.id, kind: "shelf", qty, reason: s.reason, score: s.score });
  }
  return out;
}
