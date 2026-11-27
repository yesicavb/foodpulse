/**
 * PILOT: real catalogues of the partner shops that said yes (Nov 2026).
 * Prices are the shops' own prices per kg. Products are sold in steps of 100 g:
 * in the cart, 1 unit = 100 g, so qty 3 = 0.3 kg (min 0.1 kg, max 5 kg).
 * A shop gets its catalogue through the `catalog` column of partner_stores (see supabase/pilot-catalog.sql).
 */
import type { CategoryId, FreshProduct, IconKey } from "@/lib/types";

/** max units of 100 g per product (= 5 kg) */
export const MAX_WEIGHT_UNITS = 50;

type Item = [id: string, name: string, desc: string, category: CategoryId, price: number, icon: IconKey, perPiece?: boolean];

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
    ["pt-lasagne", "Lasagne", "Pasta fresca da forno", "gastronomia", 23, "soup"],
    ["pt-rosette", "Rosette", "Pasta fresca da forno", "gastronomia", 23, "soup"],
    ["pt-biscotti", "Biscotti", "Dolci della casa", "panetteria", 25, "croissant"],
    ["pt-raviole", "Raviole", "Dolci della casa", "panetteria", 25, "croissant"],
  ],
  // La Bottega della Carne · San Lazzaro di Savena
  "bottega-carne": [
    ["pt-bc-salsiccia", "Salsiccia Bologna", "Salsiccia fresca", "carne", 12.90, "drumstick"],
    ["pt-bc-pollo", "Petto di pollo", "Carne fresca", "carne", 18.90, "drumstick"],
    ["pt-bc-scamone", "Scamone di scottona", "Carne bovina", "carne", 31.90, "beef"],
    ["pt-bc-svizzere", "Svizzere speck scamorza e rucola", "Preparazione di macelleria", "carne", 18.90, "beef"],
    ["pt-bc-vitello", "Braciole di vitello", "Carne fresca", "carne", 31.90, "beef"],
    ["pt-bc-maiale", "Braciole di maiale", "Carne fresca", "carne", 12.90, "beef"],
    ["pt-bc-pane", "Pane fresco", "Pane", "panetteria", 8.90, "wheat"],
    ["pt-bc-filoncini", "Filoncini", "Pane", "panetteria", 1, "wheat", true],
    ["pt-bc-barilini", "Barilini", "Pane", "panetteria", 0.45, "wheat", true],
    ["pt-bc-mozzarella", "Nodi di mozzarella", "Formaggio fresco", "latticini", 20.90, "milk"],
    ["pt-bc-stracciatella", "Stracciatella", "Formaggio fresco", "latticini", 20.90, "milk"],
    ["pt-bc-parmigiano", "Parmigiano Reggiano 30 mesi", "Formaggio stagionato", "latticini", 35.90, "milk"],
  ],
  // Benvenuti al Sud · Bologna (prices read from the shop's own labels, 27 Nov 2026; "all'etto" x 10 = per kg)
  "benvenuti-sud": [
    // salumi (deli counter)
    ["pt-bs-spianata", "Spianata", "Salume piccante", "gastronomia", 18.90, "beef"],
    ["pt-bs-mortadella", "Mortadella", "Salume", "gastronomia", 14.90, "beef"],
    ["pt-bs-cotto", "Prosciutto cotto", "Salume", "gastronomia", 16.90, "beef"],
    ["pt-bs-salame-piccante", "Salame piccante", "Salume piccante", "gastronomia", 18.90, "beef"],
    ["pt-bs-soppressata", "Soppressata", "Salume del sud", "gastronomia", 19.90, "beef"],
    ["pt-bs-nduja", "'Nduja", "Salume piccante calabrese", "gastronomia", 19.90, "beef"],
    ["pt-bs-salsiccia-calabrese", "Salsiccia calabrese (dolce o piccante)", "Salume stagionato", "gastronomia", 19.90, "beef"],
    ["pt-bs-salsiccia-appassita", "Salsiccia appassita", "Salume stagionato", "gastronomia", 19.90, "beef"],
    ["pt-bs-filino", "Salame filino", "Salume stagionato", "gastronomia", 16.90, "beef"],
    // cheese counter
    ["pt-bs-caciocavallo", "Caciocavallo pugliese", "Formaggio stagionato", "latticini", 16.90, "milk"],
    ["pt-bs-scamorza", "Scamorza (bianca o affumicata)", "Formaggio fresco", "latticini", 16.90, "milk"],
    ["pt-bs-cacioricotta", "Cacio ricotta", "Formaggio fresco", "latticini", 16.90, "milk"],
    ["pt-bs-nodini", "Nodini e treccine fiordilatte", "Formaggio fresco", "latticini", 15.90, "milk"],
    ["pt-bs-pecorino-nero", "Pecorino nero di Sicilia", "Formaggio stagionato", "latticini", 22.90, "milk"],
    ["pt-bs-pecorino-pepato", "Pecorino pepato", "Formaggio stagionato", "latticini", 22.90, "milk"],
    ["pt-bs-pecorino-calabrese", "Pecorino calabrese", "Formaggio stagionato", "latticini", 22.90, "milk"],
    ["pt-bs-pecorino-siciliano", "Pecorino siciliano", "Formaggio stagionato", "latticini", 22.90, "milk"],
    ["pt-bs-pecorino-misto", "Pecorino misto", "Formaggio stagionato", "latticini", 16.90, "milk"],
    ["pt-bs-provolone", "Provolone del Monaco", "Formaggio stagionato", "latticini", 22.90, "milk"],
    ["pt-bs-capra", "Formaggio di capra", "Formaggio stagionato", "latticini", 23.90, "milk"],
    ["pt-bs-bufala", "Mozzarella di bufala campana 250 g", "Formaggio fresco", "latticini", 4.50, "milk", true],
    ["pt-bs-zizzona", "Zizzona di Battipaglia 500 g", "Mozzarella di bufala", "latticini", 9.99, "milk", true],
    ["pt-bs-ricotta-pecora", "Ricotta di pecora 500 g", "Formaggio fresco", "latticini", 5.00, "milk", true],
    ["pt-bs-ricotta-capra", "Ricotta di capra 300 g", "Formaggio fresco", "latticini", 4.50, "milk", true],
    ["pt-bs-ricotta-mucca", "Ricotta di mucca 400 g", "Formaggio fresco", "latticini", 3.50, "milk", true],
    // butcher's counter
    ["pt-bs-coppa", "Coppa di maiale", "Carne di maiale", "carne", 8.99, "beef"],
    ["pt-bs-costate", "Costate di maiale", "Carne di maiale", "carne", 8.99, "beef"],
    ["pt-bs-pancetta", "Pancetta di maiale", "Carne di maiale", "carne", 8.99, "beef"],
    ["pt-bs-lonza", "Lonza di maiale", "Carne di maiale", "carne", 9.99, "beef"],
    ["pt-bs-prosciutto-fresco", "Prosciutto fresco", "Carne di maiale", "carne", 9.99, "beef"],
    ["pt-bs-salsiccia-siciliana", "Salsiccia siciliana", "Salsiccia fresca", "carne", 9.99, "drumstick"],
    ["pt-bs-salsiccia-pizzaiola", "Salsiccia alla pizzaiola", "Salsiccia fresca", "carne", 9.99, "drumstick"],
    ["pt-bs-salsiccia-sale-pepe", "Salsiccia sale e pepe", "Salsiccia fresca", "carne", 9.99, "drumstick"],
    ["pt-bs-salsiccia-alla-calabrese", "Salsiccia alla calabrese", "Salsiccia fresca", "carne", 9.99, "drumstick"],
    ["pt-bs-macinato", "Macinato misto suino e bovino", "Carne fresca", "carne", 11.90, "beef"],
    ["pt-bs-bollito", "Bollito e spezzatino", "Carne bovina", "carne", 13.99, "beef"],
    ["pt-bs-spezzatino", "Spezzatino scelto", "Carne bovina", "carne", 15.99, "beef"],
    ["pt-bs-spezzatino-vitello", "Spezzatino di vitello", "Carne di vitello", "carne", 16.99, "beef"],
    ["pt-bs-agnello", "Spalla di agnello", "Carne di agnello", "carne", 18.99, "beef"],
    ["pt-bs-scottona", "Fettine di scottona", "Carne bovina", "carne", 18.99, "beef"],
    ["pt-bs-fettine-vitello", "Fettine di vitello", "Carne di vitello", "carne", 18.90, "beef"],
  ],
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
  "bottega-carne": [
    ["pt-bc-giardiniera", "Giardiniera in olio", "I Contadini", 15.90, "pacco"],
    ["pt-bc-passata", "Passata di pomodoro Pera d'Abruzzo 550 g", "Rustichella d'Abruzzo", 6, "pacco"],
    ["pt-bc-tigelle", "Tigelle classiche/rustiche", "Tigelle", 5.95, "pacco"],
    ["pt-bc-penne", "Penne di semola di grano duro", "Filotea", 3.20, "pacco"],
    ["pt-bc-spaghetti", "Spaghetti integrali trafilati al bronzo", "Rustichella d'Abruzzo", 4.10, "pacco"],
    ["pt-bc-gnocchi", "Gnocchi di patate", "Rustichella d'Abruzzo", 3.90, "pacco"],
  ],
  "benvenuti-sud": [
    ["pt-bs-melanzane-fette", "Melanzane a fette in olio, vaso grande", "Delizie di Nonno Franco", 8.90, "pacco"],
    ["pt-bs-melanzane-filetti", "Melanzane a filetti, vaso grande", "Delizie di Nonno Franco", 8.90, "pacco"],
    ["pt-bs-peperoni-filetti", "Peperoni a filetti, vaso grande", "Delizie di Nonno Franco", 8.90, "pacco"],
    ["pt-bs-antipasto", "Antipasto fantasia, vaso grande", "Delizie di Nonno Franco", 8.90, "pacco"],
    ["pt-bs-friarielli", "Friarielli saltati", "In olio di semi di girasole", 8.90, "pacco"],
    ["pt-bs-chiodini", "Funghi chiodini in olio, vaso piccolo", "Delizie di Nonno Franco", 5.50, "pacco"],
    ["pt-bs-peperoni-piccolo", "Peperoni a filetti, vaso piccolo", "Delizie di Nonno Franco", 5.50, "pacco"],
    ["pt-bs-melanzane-piccolo", "Melanzane a filetti, vaso piccolo", "Delizie di Nonno Franco", 5.50, "pacco"],
    ["pt-bs-pomodori-vaso", "Pomodori secchi, vaso piccolo", "Delizie di Nonno Franco", 5.50, "pacco"],
    ["pt-bs-tris-funghi", "Tris di funghi", "Sott'olio", 6.00, "pacco"],
    ["pt-bs-ciliegino", "Pomodoro secco ciliegino", "Facciponte", 5.90, "pacco"],
    ["pt-bs-pomodori-secchi", "Pomodori secchi non conditi", "Facciponte", 4.90, "pacco"],
    ["pt-bs-scaldatelli", "Taralli scaldatelli 300 g (peperoncino, pizza, cacio e pepe, rosmarino)", "Ortodipuglia", 2.00, "pacco"],
    ["pt-bs-panatura-pistacchiosa", "Panatura pistacchiosa 180 g", "Lana Spezie", 2.00, "pacco"],
    ["pt-bs-panatura-american", "Panatura American taste", "Lana Spezie", 4.00, "pacco"],
  ],
  prova: [["pt-prova-biscotti", "Biscotti (prova)", "Prodotto di prova", 25, "kg"]],
};
export const PILOT_SHOP_ITEMS: ShopItem[] = Object.entries(SHOP_ROWS).flatMap(([catalog, rows]) =>
  rows.map(([id, name, desc, price, unit]) => ({ id, name, desc, catalog, price, unit }))
);
export const shopItemsOf = (catalog?: string) => PILOT_SHOP_ITEMS.filter((i) => i.catalog === catalog);


export const PILOT_PRODUCTS: FreshProduct[] = Object.entries(CATALOGS).flatMap(([catalog, items]) =>
  items.map(([id, name, desc, category, price, icon, perPiece]) => ({
    id,
    name,
    desc,
    category,
    unit: perPiece ? "pezzo" : "100 g",
    basePrice: perPiece ? price : Math.round(price * 10) / 100,
    weightKg: perPiece ? 0 : 0.1, // piece weights not supplied; exclude from weight-based estimates
    tags: [],
    allergens: [],
    stock: 200,
    icon,
    byWeight: !perPiece,
    ...(perPiece ? {} : { perKg: price }),
    catalog,
  }))
);

export const catalogSize = (catalog?: string) => (catalog ? (CATALOGS[catalog]?.length ?? 0) + (SHOP_ROWS[catalog]?.length ?? 0) : 0);

/** 3 units of 100 g → "0,3 kg" */
export const kgLabel = (units: number) => `${(units / 10).toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`;

/** Real opening hours of the partner shops (given by the shops, 25 Nov 2026). 0 = Sunday … 6 = Saturday */
interface ShopHours {
  name?: string;
  /** town shown to customers (overrides what the shop typed when signing up) */
  city?: string;
  hours: string;
  slots: Record<number, string[]>;
}
/** 7:00 – 13:00 split into 2-hour slots */
const AM7 = ["7:00 – 9:00", "9:00 – 11:00", "11:00 – 13:00"];

// Bottega della Carne: conservative pickup windows based on public opening listings,
// pending direct confirmation from the shop (26 Nov 2026).
const BC_AM = [...AM7, "13:00 – 13:30"];
const BC_PM = ["16:30 – 18:30", "18:30 – 20:00"];
/** 8:00 – 20:00 split into 2-hour slots */
const DAY8 = ["8:00 – 10:00", "10:00 – 12:00", "12:00 – 14:00", "14:00 – 16:00", "16:00 – 18:00", "18:00 – 20:00"];
export const SHOP_HOURS: Record<string, ShopHours> = {
  // Benvenuti al Sud: hours confirmed by the team on 27 Nov 2026 (open every day, Sunday mornings only)
  "benvenuti-sud": {
    name: "Benvenuti al Sud",
    city: "Bologna",
    hours: "Lun–Sab 8:00–20:00 · Dom 8:00–14:00",
    slots: { 0: DAY8.slice(0, 3), 1: DAY8, 2: DAY8, 3: DAY8, 4: DAY8, 5: DAY8, 6: DAY8 },
  },
  "bottega-carne": {
    name: "La Bottega della Carne",
    city: "San Lazzaro di Savena",
    hours: "Lun–Sab dalle 7:00 · Mar pomeriggio e Dom chiuso",
    slots: {
      1: [...BC_AM, ...BC_PM],
      2: BC_AM,
      3: [...BC_AM, ...BC_PM],
      4: [...BC_AM, ...BC_PM],
      5: [...BC_AM, ...BC_PM],
      6: [...BC_AM, "16:30 – 18:30", "18:30 – 19:30"],
    },
  },
  "tipici-sud": {
    name: "Prodotti Tipici del Sud",
    city: "San Lazzaro di Savena",
    hours: "Lun–Sab · Dom chiuso",
    slots: {
      1: ["10:00 – 13:00", "16:00 – 19:00"],
      2: ["9:00 – 13:00", "16:00 – 19:00"],
      3: ["9:00 – 13:00", "16:00 – 19:00"],
      4: ["11:00 – 13:00"],
      5: ["9:00 – 11:00", "11:00 – 13:00", "13:00 – 15:00", "15:00 – 17:00", "17:00 – 19:00"],
      6: ["9:00 – 13:00", "17:00 – 19:00"],
    },
  },
  "regno-pasta": {
    city: "San Lazzaro di Savena",
    hours: "Lun–Sab dalle 7:00 · Dom chiuso",
    slots: {
      1: [...AM7, "16:00 – 19:00"],
      2: AM7,
      3: [...AM7, "16:00 – 19:00"],
      4: AM7,
      5: [...AM7, "16:00 – 19:00"],
      6: AM7,
    },
  },
};
SHOP_HOURS.prova = { hours: SHOP_HOURS["tipici-sud"].hours, slots: SHOP_HOURS["tipici-sud"].slots };

/** closed weekdays = days without slots */
export const closedDaysOf = (h?: ShopHours) => (h ? [0, 1, 2, 3, 4, 5, 6].filter((d) => !h.slots[d]?.length) : [0]);
