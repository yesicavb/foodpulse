/**
 * PILOT: real catalogues of the partner shops that said yes (Nov 2026).
 * Prices are the shops' own prices per kg. Products are sold in steps of 100 g:
 * in the cart, 1 unit = 100 g, so qty 3 = 0.3 kg (min 0.1 kg, max 5 kg).
 * A shop gets its catalogue through the `catalog` column of partner_stores (see supabase/pilot-catalog.sql).
 */
import type { CategoryId, FreshProduct, IconKey } from "@/lib/types";

/** max units of 100 g per product (= 5 kg) */
export const MAX_WEIGHT_UNITS = 50;

type Item = [id: string, name: string, desc: string, category: CategoryId, perKg: number, icon: IconKey];

const CATALOGS: Record<string, Item[]> = {
  // Prodotti tipici del sud · San Lazzaro di Savena
  "tipici-sud": [
    ["pt-mozzarella-bufala", "Mozzarella di bufala", "Fresca, del giorno", "latticini", 16, "salad"],
    ["pt-olive", "Olive", "Olive del sud", "ortofrutta", 10, "salad"],
    ["pt-scamorza", "Scamorze fresche", "Scamorza fresca", "latticini", 14.5, "salad"],
    ["pt-salsiccia", "Salsiccia fresca", "Salsiccia fresca di maiale", "carne", 9.9, "drumstick"],
  ],
  // Il regno della pasta
  "regno-pasta": [
    ["pt-tortelloni", "Tortelloni", "Pasta fresca ripiena", "gastronomia", 28, "soup"],
    ["pt-tagliatelle", "Tagliatelle", "Pasta fresca all'uovo", "gastronomia", 23, "soup"],
    ["pt-passatelli", "Zuppa imperiale e passatelli", "Da cuocere in brodo", "gastronomia", 28, "soup"],
    ["pt-lasagne", "Lasagne e rosette", "Pasta fresca da forno", "gastronomia", 23, "soup"],
    ["pt-biscotti", "Biscotti e raviole", "Dolci della casa", "panetteria", 25, "croissant"],
    ["pt-quadrucci", "Quadrucci e maltagliati", "Pasta fresca all'uovo", "gastronomia", 23, "soup"],
  ],
  // La bottega della carne: catalogue still to come
  "bottega-carne": [],
  // FoodPulse test store: a few products to try the pilot without disturbing the real shops
  prova: [
    ["pt-prova-mozzarella", "Mozzarella di bufala (prova)", "Prodotto di prova", "latticini", 16, "salad"],
    ["pt-prova-tortelloni", "Tortelloni (prova)", "Prodotto di prova", "gastronomia", 28, "soup"],
    ["pt-prova-tagliatelle", "Tagliatelle (prova)", "Prodotto di prova", "gastronomia", 23, "soup"],
  ],
};

/** (kept for reference) photo or drawing used for each pilot product */
export const PILOT_ART: Record<string, string> = {
  "pt-mozzarella-bufala": "pt-mozzarella-bufala",
  "pt-olive": "pt-olive",
  "pt-scamorza": "cheese",
  "pt-salsiccia": "pt-salsiccia",
  "pt-tortelloni": "pt-tortelloni",
  "pt-tagliatelle": "pt-tagliatelle",
  "pt-passatelli": "pasta",
  "pt-lasagne": "lasagne",
  "pt-biscotti": "pt-biscotti",
  "pt-quadrucci": "pasta",
  "pt-prova-mozzarella": "pt-mozzarella-bufala",
  "pt-prova-tortelloni": "pt-tortelloni",
  "pt-prova-tagliatelle": "pt-tagliatelle",
};

export const PILOT_PRODUCTS: FreshProduct[] = Object.entries(CATALOGS).flatMap(([catalog, items]) =>
  items.map(([id, name, desc, category, perKg, icon]) => ({
    id,
    name,
    desc,
    category,
    unit: "100 g",
    basePrice: Math.round(perKg * 10) / 100, // price of 100 g
    weightKg: 0.1,
    tags: [],
    allergens: [],
    stock: 200,
    icon,
    byWeight: true,
    perKg,
    catalog,
  }))
);

export const catalogSize = (catalog?: string) => (catalog ? (CATALOGS[catalog]?.length ?? 0) : 0);

/** 3 units of 100 g → "0,3 kg" */
export const kgLabel = (units: number) => `${(units / 10).toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`;
