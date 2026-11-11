import type { FreshProduct, ShelfProduct } from "@/lib/types";

/** Bookable fresh and ultra-fresh products (base price list, before the store's price index) */
export const FRESH: FreshProduct[] = [
  // Bakery
  { id: "pane-integrale", name: "Pane integrale", desc: "Lievitazione naturale, sfornato al mattino", category: "panetteria", unit: "500 g", basePrice: 2.9, weightKg: 0.5, tags: ["sano"], allergens: ["glutine"], stock: 60, icon: "wheat" },
  { id: "pane-segale", name: "Pane di segale", desc: "Con semi di girasole e lino", category: "panetteria", unit: "400 g", basePrice: 3.4, weightKg: 0.4, tags: ["sano", "leggero"], allergens: ["glutine", "sesamo"], stock: 25, icon: "wheat" },
  { id: "focaccia", name: "Focaccia", desc: "All'olio extravergine, cotta in negozio", category: "panetteria", unit: "300 g", basePrice: 3.5, weightKg: 0.3, tags: ["veloce"], allergens: ["glutine"], stock: 35, icon: "pizza" },
  { id: "cornetti", name: "Cornetti", desc: "Sfogliati a mano, per la colazione", category: "panetteria", unit: "4 pz · 240 g", basePrice: 4.2, weightKg: 0.24, tags: ["colazione", "bambini"], allergens: ["glutine", "uova", "lattosio"], animal: ["uova", "latte"], stock: 30, icon: "croissant" },
  { id: "piadine", name: "Piadine", desc: "Impasto all'olio, pronte in 2 minuti", category: "panetteria", unit: "4 pz · 360 g", basePrice: 2.8, weightKg: 0.36, tags: ["veloce", "famiglia"], allergens: ["glutine"], stock: 30, icon: "sandwich" },
  // Deli
  { id: "lasagne", name: "Lasagne", desc: "Ricetta della gastronomia, 4 porzioni", category: "gastronomia", unit: "1 kg", basePrice: 9.9, weightKg: 1, tags: ["famiglia", "veloce"], allergens: ["glutine", "lattosio", "uova"], animal: ["carne", "latte", "uova"], stock: 20, icon: "soup" },
  { id: "pollo-arrosto", name: "Pollo arrosto", desc: "Allevato a terra, cotto allo spiedo", category: "gastronomia", unit: "1 pz · 1 kg", basePrice: 8.5, weightKg: 1, tags: ["proteico", "famiglia", "veloce"], allergens: [], animal: ["carne"], stock: 26, icon: "drumstick" },
  { id: "insalata-riso", name: "Insalata di riso", desc: "Con verdure e tonno", category: "gastronomia", unit: "500 g", basePrice: 6.4, weightKg: 0.5, tags: ["veloce", "leggero"], allergens: ["pesce", "uova"], animal: ["pesce", "uova"], stock: 18, icon: "salad" },
  { id: "hummus", name: "Hummus", desc: "Preparato fresco ogni giorno", category: "gastronomia", unit: "200 g", basePrice: 2.6, weightKg: 0.2, tags: ["vegetale", "leggero", "sano"], allergens: ["sesamo"], stock: 22, icon: "bean" },
  { id: "polpette-lenticchie", name: "Polpette di lenticchie", desc: "Vegetali, ricche di proteine", category: "gastronomia", unit: "320 g", basePrice: 4.9, weightKg: 0.32, tags: ["vegetale", "proteico"], allergens: ["glutine"], stock: 16, icon: "bean" },
  { id: "tofu", name: "Tofu", desc: "Da soia italiana, al naturale", category: "gastronomia", unit: "250 g", basePrice: 2.5, weightKg: 0.25, tags: ["vegetale", "proteico"], allergens: ["soia"], stock: 14, icon: "package" },
  // Meat
  { id: "petto-pollo", name: "Petto di pollo", desc: "Filiera italiana, allevato a terra", category: "carne", unit: "600 g", basePrice: 7.9, weightKg: 0.6, tags: ["proteico", "leggero"], allergens: [], animal: ["carne"], stock: 24, icon: "drumstick" },
  { id: "tacchino", name: "Fesa di tacchino", desc: "Magra, a fette sottili", category: "carne", unit: "400 g", basePrice: 6.2, weightKg: 0.4, tags: ["proteico", "leggero"], allergens: [], animal: ["carne"], stock: 18, icon: "drumstick" },
  { id: "macinato", name: "Macinato", desc: "Tagliato al banco macelleria", category: "carne", unit: "500 g", basePrice: 6.5, weightKg: 0.5, tags: ["famiglia"], allergens: [], animal: ["carne"], stock: 28, icon: "beef" },
  { id: "hamburger", name: "Hamburger", desc: "Pronti per la piastra", category: "carne", unit: "360 g", basePrice: 5.9, weightKg: 0.36, tags: ["veloce", "proteico"], allergens: [], animal: ["carne"], stock: 20, icon: "beef" },
  { id: "salsiccia", name: "Salsiccia", desc: "Preparata dalla macelleria", category: "carne", unit: "400 g", basePrice: 5.2, weightKg: 0.4, tags: ["famiglia"], allergens: [], animal: ["carne"], stock: 20, icon: "beef" },
  // Fish
  { id: "salmone", name: "Salmone", desc: "Norvegese, già porzionato", category: "pesce", unit: "300 g", basePrice: 8.9, weightKg: 0.3, tags: ["proteico", "sano"], allergens: ["pesce"], animal: ["pesce"], stock: 14, icon: "fish" },
  { id: "orata", name: "Orata", desc: "Pescata in Mediterraneo, eviscerata", category: "pesce", unit: "1 pz · 400 g", basePrice: 7.5, weightKg: 0.4, tags: ["leggero", "sano"], allergens: ["pesce"], animal: ["pesce"], stock: 10, icon: "fish" },
  { id: "merluzzo", name: "Merluzzo", desc: "Senza spine, adatti ai bambini", category: "pesce", unit: "400 g", basePrice: 6.9, weightKg: 0.4, tags: ["famiglia", "leggero", "bambini"], allergens: ["pesce"], animal: ["pesce"], stock: 12, icon: "fish" },
  { id: "gamberi", name: "Gamberi", desc: "Freschi, pronti da cuocere", category: "pesce", unit: "250 g", basePrice: 7.9, weightKg: 0.25, tags: ["proteico", "veloce"], allergens: ["crostacei"], animal: ["pesce"], stock: 10, icon: "fish" },
  // Fruit and vegetables
  { id: "insalata-mista", name: "Insalata mista", desc: "Lavata e pronta da condire", category: "ortofrutta", unit: "250 g", basePrice: 1.99, weightKg: 0.25, tags: ["bio", "vegetale", "leggero", "veloce"], allergens: [], stock: 40, icon: "salad" },
  { id: "pomodori", name: "Pomodori", desc: "Dolci, coltivati in Emilia", category: "ortofrutta", unit: "500 g", basePrice: 2.99, weightKg: 0.5, tags: ["vegetale"], allergens: [], stock: 40, icon: "cherry" },
  { id: "spinaci", name: "Spinaci", desc: "In foglia, già lavati", category: "ortofrutta", unit: "300 g", basePrice: 2.3, weightKg: 0.3, tags: ["vegetale", "sano"], allergens: [], stock: 25, icon: "leaf" },
  { id: "zucchine", name: "Zucchine", desc: "Tenere, raccolte ieri", category: "ortofrutta", unit: "1 kg", basePrice: 2.49, weightKg: 1, tags: ["vegetale", "famiglia"], allergens: [], stock: 30, icon: "carrot" },
  { id: "mele", name: "Mele", desc: "Croccanti e profumate", category: "ortofrutta", unit: "1 kg", basePrice: 2.79, weightKg: 1, tags: ["vegetale", "colazione", "bambini"], allergens: [], stock: 40, icon: "apple" },
  { id: "banane", name: "Banane", desc: "Commercio equo, mature al punto giusto", category: "ortofrutta", unit: "1 kg", basePrice: 2.2, weightKg: 1, tags: ["bio", "vegetale", "energia", "colazione"], allergens: [], stock: 40, icon: "banana" },
  { id: "frutti-bosco", name: "Frutti di bosco", desc: "Mirtilli e lamponi freschi", category: "ortofrutta", unit: "250 g", basePrice: 3.9, weightKg: 0.25, tags: ["colazione", "sano"], allergens: [], stock: 16, icon: "grape" },
  // Dairy and cheese
  { id: "mozzarella", name: "Mozzarella", desc: "Latte 100% italiano", category: "latticini", unit: "250 g", basePrice: 2.4, weightKg: 0.25, tags: ["famiglia"], allergens: ["lattosio"], animal: ["latte"], stock: 45, icon: "milk" },
  { id: "yogurt-greco", name: "Yogurt greco", desc: "Colato, 10 g di proteine a vasetto", category: "latticini", unit: "4 × 150 g", basePrice: 3.2, weightKg: 0.6, tags: ["proteico", "colazione", "leggero"], allergens: ["lattosio"], animal: ["latte"], stock: 40, icon: "milk" },
  { id: "latte-fresco", name: "Latte fresco", desc: "Intero, dalla stalla in 48 ore", category: "latticini", unit: "1 L", basePrice: 1.69, weightKg: 1.03, tags: ["colazione", "famiglia", "bambini"], allergens: ["lattosio"], animal: ["latte"], stock: 50, icon: "milk" },
  { id: "ricotta", name: "Ricotta", desc: "Fresca, delicata", category: "latticini", unit: "250 g", basePrice: 2.1, weightKg: 0.25, tags: ["leggero"], allergens: ["lattosio"], animal: ["latte"], stock: 25, icon: "milk" },
  { id: "fiocchi-latte", name: "Fiocchi di latte", desc: "Magri, fonte di proteine", category: "latticini", unit: "200 g", basePrice: 1.9, weightKg: 0.2, tags: ["proteico", "leggero"], allergens: ["lattosio"], animal: ["latte"], stock: 20, icon: "milk" },
  { id: "parmigiano", name: "Parmigiano", desc: "Tagliato al banco formaggi", category: "latticini", unit: "300 g", basePrice: 6.8, weightKg: 0.3, tags: ["famiglia"], allergens: ["lattosio"], animal: ["latte"], stock: 18, icon: "package" },
];

/** Packaged shelf products: they go on the shopping list, not in the booking */
export const SHELF: ShelfProduct[] = [
  { id: "uova", name: "Uova", unit: "6 pz", desc: "Da galline allevate all'aperto", aisle: "Corsia 2 · uova e latticini", basePrice: 2.6, tags: ["proteico", "bio", "colazione"], allergens: ["uova"], animal: ["uova"], icon: "egg" },
  { id: "pasta-integrale", name: "Pasta integrale", unit: "500 g", desc: "Grano duro italiano", aisle: "Corsia 5 · pasta e riso", basePrice: 1.2, tags: ["sano"], allergens: ["glutine"], icon: "wheat" },
  { id: "avena", name: "Fiocchi d'avena", unit: "500 g", desc: "Integrali, per la colazione", aisle: "Corsia 7 · colazione", basePrice: 1.8, tags: ["colazione", "sano", "energia"], allergens: ["glutine"], icon: "wheat" },
  { id: "ceci", name: "Ceci", unit: "350 g · in vetro", desc: "Già cotti, pronti all'uso", aisle: "Corsia 4 · legumi e conserve", basePrice: 1.1, tags: ["vegetale", "proteico"], allergens: [], icon: "bean" },
  { id: "caffe", name: "Caffè", unit: "250 g · macinato", desc: "Miscela per moka", aisle: "Corsia 7 · colazione", basePrice: 3.5, tags: ["colazione"], allergens: [], icon: "coffee" },
  { id: "acqua", name: "Acqua", unit: "6 × 1,5 L", desc: "Oligominerale", aisle: "Corsia 9 · bevande", basePrice: 2.4, tags: ["famiglia"], allergens: [], icon: "droplet" },
  { id: "biscotti", name: "Biscotti", unit: "350 g", desc: "Senza olio di palma", aisle: "Corsia 7 · colazione", basePrice: 2.3, tags: ["colazione", "bambini"], allergens: ["glutine", "uova"], animal: ["uova"], icon: "cookie" },
];

export const freshById = (id: string) => FRESH.find((p) => p.id === id);
export const shelfById = (id: string) => SHELF.find((p) => p.id === id);

/** Most-booked products (used when the customer has no history yet) */
export const POPULAR = ["pane-integrale", "mozzarella", "insalata-mista", "pollo-arrosto", "mele", "yogurt-greco", "lasagne", "pomodori"];
