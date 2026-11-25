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
    ["pt-zuppa-imperiale", "Zuppa imperiale", "Da cuocere in brodo", "gastronomia", 28, "soup"],
    ["pt-passatelli", "Passatelli", "Da cuocere in brodo", "gastronomia", 28, "soup"],
    ["pt-quadrucci", "Quadrucci", "Pasta fresca all'uovo", "gastronomia", 23, "soup"],
    ["pt-maltagliati", "Maltagliati", "Pasta fresca all'uovo", "gastronomia", 23, "soup"],
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

/** Products the shop sells only in the store: not bookable, but customers can put them on their shopping list */
export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  catalog: string;
  /** price per kg, or per pack */
  price: number;
  unit: "kg" | "pacco";
}
type ShopRow = [id: string, name: string, desc: string, price: number, unit: "kg" | "pacco"];
const SHOP_ROWS: Record<string, ShopRow[]> = {
  "tipici-sud": [
    ["pt-taralli-pugliesi", "Taralli scaldatelli pugliesi", "Tipici pugliesi", 3.5, "pacco"],
    ["pt-taralli-napoletani", "Taralli napoletani sugna e pepe", "Tipici napoletani", 6.5, "pacco"],
    ["pt-salame-napoli", "Salame Napoli", "Salume stagionato", 18.5, "kg"],
    ["pt-salsiccia-secca", "Salsiccia secca Napoli", "Salume stagionato", 18.5, "kg"],
  ],
  "regno-pasta": [
    ["pt-lasagne", "Lasagne", "Pasta fresca da forno", 23, "kg"],
    ["pt-rosette", "Rosette", "Pasta fresca da forno", 23, "kg"],
    ["pt-biscotti", "Biscotti", "Dolci della casa", 25, "kg"],
    ["pt-raviole", "Raviole", "Dolci della casa", 25, "kg"],
  ],
  prova: [["pt-prova-biscotti", "Biscotti (prova)", "Prodotto di prova", 25, "kg"]],
};
export const PILOT_SHOP_ITEMS: ShopItem[] = Object.entries(SHOP_ROWS).flatMap(([catalog, rows]) =>
  rows.map(([id, name, desc, price, unit]) => ({ id, name, desc, catalog, price, unit }))
);
export const shopItemsOf = (catalog?: string) => PILOT_SHOP_ITEMS.filter((i) => i.catalog === catalog);


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

export const catalogSize = (catalog?: string) => (catalog ? (CATALOGS[catalog]?.length ?? 0) + (SHOP_ROWS[catalog]?.length ?? 0) : 0);

/** 3 units of 100 g → "0,3 kg" */
export const kgLabel = (units: number) => `${(units / 10).toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`;

/** Real opening hours of the partner shops (given by the shops, 25 Nov 2026). 0 = Sunday … 6 = Saturday */
interface ShopHours {
  name?: string;
  hours: string;
  slots: Record<number, string[]>;
}
const AM = (a: string) => [a];
export const SHOP_HOURS: Record<string, ShopHours> = {
  "tipici-sud": {
    name: "Prodotti Tipici del Sud",
    hours: "Lun–Sab · Dom chiuso",
    slots: {
      1: ["10:00 – 13:00", "16:00 – 19:00"],
      2: ["9:00 – 13:00", "16:00 – 19:00"],
      3: ["9:00 – 13:00", "16:00 – 19:00"],
      4: AM("11:00 – 13:00"),
      5: ["9:00 – 13:00", "13:00 – 16:00", "16:00 – 19:00"],
      6: ["9:00 – 13:00", "17:00 – 19:00"],
    },
  },
  "regno-pasta": {
    hours: "Lun–Sab dalle 7:00 · Dom chiuso",
    slots: {
      1: ["7:00 – 13:00", "16:00 – 19:00"],
      2: AM("7:00 – 13:00"),
      3: ["7:00 – 13:00", "16:00 – 19:00"],
      4: AM("7:00 – 13:00"),
      5: ["7:00 – 13:00", "16:00 – 19:00"],
      6: AM("7:00 – 13:00"),
    },
  },
};
SHOP_HOURS.prova = { hours: SHOP_HOURS["tipici-sud"].hours, slots: SHOP_HOURS["tipici-sud"].slots };

/** closed weekdays = days without slots */
export const closedDaysOf = (h?: ShopHours) => (h ? [0, 1, 2, 3, 4, 5, 6].filter((d) => !h.slots[d]?.length) : [0]);
