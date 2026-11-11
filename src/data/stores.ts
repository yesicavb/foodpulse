import type { CategoryId, Store } from "@/lib/types";

/**
 * Supermarkets in 20 Italian cities, 4 per city.
 *
 * REAL: chain, street address and distance from the city centre (collected from the public
 * store listings on PromoQui, November 2026).
 * SIMULATED: opening hours, prices, stock, promotions and pickup/locker/delivery services.
 * Chain names are used for illustration only: there is no official integration with any chain.
 *
 * To add a store: add a row to REAL_STORES. To add a city: add 4 rows with the new city name.
 */
type Row = [id: string, city: string, chain: string, label: string, address: string, distanceKm: number];

const REAL_STORES: Row[] = [
  ["st-milano-carrefour-italia", "Milano", "Carrefour", "Carrefour Market", "Corso Italia, 13", 1.3],
  ["st-milano-sigma-di-porta-romana", "Milano", "Sigma", "Sigma", "Corso di Porta Romana, 96", 1.3],
  ["st-ess-piave", "Milano", "Esselunga", "Esselunga", "Viale Piave, 38/B", 1.5],
  ["st-milano-coop-umbria", "Milano", "Coop", "Ipercoop", "Viale Umbria / Via P. Colletta", 2.7],
  ["st-roma-coop-in-arcione", "Roma", "Coop", "Coop", "Via in Arcione, 70", 0.6],
  ["st-roma-carrefour-benedetto-cairoli", "Roma", "Carrefour", "Carrefour Express", "Piazza Benedetto Cairoli, 13", 0.6],
  ["st-roma-conad-buonarroti", "Roma", "Conad", "Conad", "Via Buonarroti, 8B-14A", 1.8],
  ["st-roma-lidl-della-lega-lombard", "Roma", "Lidl", "Lidl", "Via della Lega Lombarda, 32", 2.8],
  ["st-napoli-deco-cavour", "Napoli", "Decò", "Decò", "Piazza Cavour, 117", 0.2],
  ["st-napoli-conad-cavour", "Napoli", "Conad", "Conad City", "Piazza Cavour, 156", 0.4],
  ["st-napoli-crai-fuori-porta-san-ge", "Napoli", "Crai", "Crai", "Via Fuori Porta San Gennaro, 17", 0.4],
  ["st-napoli-carrefour-foria", "Napoli", "Carrefour", "Carrefour Express", "Via Foria, 32", 0.6],
  ["st-torino-lidl-carlo-alberto", "Torino", "Lidl", "Lidl", "Via Carlo Alberto, 22", 0.2],
  ["st-torino-coop-galleria-san-feder", "Torino", "Coop", "Coop", "Galleria San Federico, 26", 0.3],
  ["st-torino-esselunga-sacchi-stazione-po", "Torino", "Esselunga", "Esselunga", "Via Sacchi (stazione Porta Nuova)", 0.5],
  ["st-torino-carrefour-filippo-turati", "Torino", "Carrefour", "Carrefour", "Corso Filippo Turati, 75", 2.6],
  ["st-palermo-lidl-roma", "Palermo", "Lidl", "Lidl", "Via Roma, 59", 0.6],
  ["st-palermo-coop-bagnasco", "Palermo", "Coop", "Coop", "Piazzetta Bagnasco, 15", 0.9],
  ["st-palermo-sisa-michele-cipolla", "Palermo", "Sisa", "Sisa", "Via Michele Cipolla, 50", 1.0],
  ["st-palermo-conad-dei-mille", "Palermo", "Conad", "Conad City", "Corso dei Mille, 166", 1.1],
  ["st-genova-coop-galeazzo-alessi", "Genova", "Coop", "Coop", "Via Galeazzo Alessi, 1A r", 0.3],
  ["st-genova-conad-corsica", "Genova", "Conad", "Conad", "Via Corsica, 1/A", 0.3],
  ["st-genova-carrefour-cesarea", "Genova", "Carrefour", "Carrefour Market", "Via Cesarea, 10/12R", 0.5],
  ["st-genova-esselunga-piave", "Genova", "Esselunga", "Esselunga", "Via Piave, 5", 1.9],
  ["st-bologna-coop-oberdan", "Bologna", "Coop", "Coop", "Via Oberdan, 24", 0.1],
  ["st-bologna-carrefour-strada-maggiore", "Bologna", "Carrefour", "Carrefour Express", "Strada Maggiore, 31", 0.5],
  ["st-bologna-conad-antonio-silvani", "Bologna", "Conad", "Conad", "Viale Antonio Silvani, 3/7", 1.5],
  ["st-bologna-esselunga-emilia-ponente", "Bologna", "Esselunga", "Esselunga", "Via Emilia Ponente, 72", 3.4],
  ["st-firenze-conad-dei-servi", "Firenze", "Conad", "Conad City", "Via dei Servi, 56 R", 0.1],
  ["st-firenze-carrefour-dell-oriuolo", "Firenze", "Carrefour", "Carrefour Express", "Via dell'Oriuolo, 66R", 0.2],
  ["st-firenze-coop-cimabue", "Firenze", "Coop", "Coop", "Via Cimabue, 47R", 1.3],
  ["st-firenze-esselunga-masaccio", "Firenze", "Esselunga", "Esselunga", "Via Masaccio, 274/276", 1.4],
  ["st-bari-carrefour-piccinni", "Bari", "Carrefour", "Carrefour Market", "Via Piccinni, 134/138", 0.5],
  ["st-bari-deco-abate-gimma", "Bari", "Decò", "Decò", "Via Abate Gimma, 143/A", 0.6],
  ["st-bari-coop-piccinni", "Bari", "Coop", "Coop", "Via Piccinni, 180", 0.8],
  ["st-bari-famila-camillo-rosalba", "Bari", "Famila", "Famila", "Via Camillo Rosalba, 41/C", 3.2],
  ["st-catania-despar-gioeni-ardizzone", "Catania", "Despar", "Despar", "Via Gioeni Ardizzone, 9/A", 0.5],
  ["st-catania-lidl-luigi-rizzo", "Catania", "Lidl", "Lidl", "Corso Sicilia – Via Luigi Rizzo, 64", 0.7],
  ["st-catania-conad-verona", "Catania", "Conad", "Conad City", "Via Verona, 17/A", 1.2],
  ["st-catania-carrefour-scarabelli", "Catania", "Carrefour", "Carrefour Express", "Via Scarabelli, 2/4", 2.0],
  ["st-venezia-despar-de-le-beccarie", "Venezia", "Despar", "Despar", "Campo de le Beccarie, 365", 0.2],
  ["st-venezia-coop-santa-croce", "Venezia", "Coop", "Coop", "Santa Croce, 499", 0.3],
  ["st-venezia-conad-dorsoduro", "Venezia", "Conad", "Conad City", "Dorsoduro, 3017", 0.5],
  ["st-venezia-coop-cannaregio", "Venezia", "Coop", "Coop", "Cannaregio, 1976", 1.0],
  ["st-verona-a-o-abba", "Verona", "A&O", "A&O", "Via Abba, 21", 0.9],
  ["st-verona-conad-vicolo-fossetto", "Verona", "Conad", "Conad", "Vicolo Fossetto, 2", 1.7],
  ["st-verona-lidl-venezia", "Verona", "Lidl", "Lidl", "Corso Venezia, 131", 2.1],
  ["st-verona-esselunga-colonnello-fincato", "Verona", "Esselunga", "Esselunga", "Via Colonnello Fincato, 296", 2.2],
  ["st-padova-despar-della-frutta", "Padova", "Despar", "Despar", "Piazza della Frutta, 22/24", 0.2],
  ["st-padova-ali-sotto-il-salone", "Padova", "Alì", "Alì", "Sotto il Salone, 32", 0.3],
  ["st-padova-pam-garzeria", "Padova", "Pam", "Pam", "Piazzetta Garzeria, 3", 0.4],
  ["st-padova-coop-degli-zabarella", "Padova", "Coop", "Coop", "Via degli Zabarella, 15", 0.6],
  ["st-trieste-despar-del-teatro-romano", "Trieste", "Despar", "Despar", "Via del Teatro Romano, 2", 0.1],
  ["st-trieste-coop-cavana", "Trieste", "Coop", "Coop", "Via Cavana, 13", 0.5],
  ["st-trieste-in-s-del-ponzianino", "Trieste", "IN'S", "IN'S Mercato", "Via del Ponzianino, 18", 1.1],
  ["st-trieste-lidl-fabio-severo", "Trieste", "Lidl", "Lidl", "Via Fabio Severo, 28/30", 1.2],
  ["st-bergamo-carrefour-masone", "Bergamo", "Carrefour", "Carrefour Express", "Via Masone, 1", 0.2],
  ["st-bergamo-conad-garibaldi", "Bergamo", "Conad", "Conad", "Via Garibaldi, 7", 0.6],
  ["st-bergamo-coop-broseta", "Bergamo", "Coop", "Coop", "Via Broseta, 68", 1.3],
  ["st-bergamo-esselunga-san-bernardino", "Bergamo", "Esselunga", "Esselunga", "Via San Bernardino, 78/F", 1.7],
  ["st-trento-coop-manci", "Trento", "Coop", "Coop", "Piazza Manci, 8", 0.1],
  ["st-trento-conad-torre-verde", "Trento", "Conad", "Conad City", "Via Torre Verde, 26", 0.2],
  ["st-trento-despar-nazario-sauro", "Trento", "Despar", "Despar", "Largo Nazario Sauro, 27", 0.7],
  ["st-trento-poli-giovanelli", "Trento", "Poli", "Poli", "Via Giovanelli, 25", 0.8],
  ["st-perugia-coop-matteotti", "Perugia", "Coop", "Coop", "Piazza Matteotti, 15", 0.3],
  ["st-perugia-conad-eugubina", "Perugia", "Conad", "Conad", "Via Eugubina, 87", 1.0],
  ["st-perugia-coop-vittorio-veneto", "Perugia", "Coop", "Coop", "Piazza Vittorio Veneto, 3/5", 1.5],
  ["st-perugia-conad-giovanni-perari", "Perugia", "Conad", "Conad Superstore", "Viale Giovanni Perari", 2.3],
  ["st-ancona-conad-tiziano", "Ancona", "Conad", "Conad", "Via Tiziano, 23", 1.4],
  ["st-ancona-conad-carlo-alberto", "Ancona", "Conad", "Conad", "Corso Carlo Alberto, 2", 1.7],
  ["st-ancona-lidl-amos-luchetti-gent", "Ancona", "Lidl", "Lidl", "Via Amos Luchetti Gentiloni, 7", 2.7],
  ["st-ancona-coop-della-montagnola", "Ancona", "Coop", "Superstore Coop", "Via della Montagnola, 66/C", 2.7],
  ["st-pisa-conad-del-cottolengo", "Pisa", "Conad", "Conad City", "Via del Cottolengo, 5/9", 0.2],
  ["st-pisa-conad-emanuele-filiberto", "Pisa", "Conad", "Conad", "Via Emanuele Filiberto, 9", 1.1],
  ["st-pisa-coop-ponte-a-piglieri", "Pisa", "Coop", "Coop", "Via Ponte a Piglieri, 4", 1.4],
  ["st-pisa-esselunga-cisanello", "Pisa", "Esselunga", "Esselunga", "Via Cisanello", 2.5],
  ["st-cagliari-conad-sebastiano-satta", "Cagliari", "Conad", "Conad City", "Via Sebastiano Satta, 9A", 0.4],
  ["st-cagliari-crai-giacomo-leopardi", "Cagliari", "Crai", "Crai", "Via Giacomo Leopardi, 11", 0.5],
  ["st-cagliari-despar-dante", "Cagliari", "Despar", "Despar", "Via Dante, 27", 0.6],
  ["st-cagliari-carrefour-manno", "Cagliari", "Carrefour", "Carrefour Express", "Via Manno, 10", 0.6],
];

/** Cities in the order shown in the picker (largest first) */
export const CITIES: string[] = Array.from(new Set(REAL_STORES.map((r) => r[1])));

/* ---------- simulated details per chain ---------- */

interface ChainProfile {
  hours: string;
  priceIndex: number;
  desk: string;
  delivery?: { fee: number; freeOver: number };
  locker?: boolean;
}

const DEFAULT_PROFILE: ChainProfile = { hours: "8:00 – 20:30", priceIndex: 1, desk: "Punto ritiro · area casse" };

const CHAINS: Record<string, ChainProfile> = {
  Esselunga: { hours: "7:30 – 21:00", priceIndex: 1.04, desk: "Banco prenotazioni · accanto alla gastronomia", delivery: { fee: 4.9, freeOver: 60 }, locker: true },
  Coop: { hours: "8:00 – 20:30", priceIndex: 0.98, desk: "Punto ritiro · area casse", delivery: { fee: 3.9, freeOver: 50 }, locker: true },
  Conad: { hours: "8:00 – 21:00", priceIndex: 0.97, desk: "Banco gastronomia · ritiro prenotazioni", delivery: { fee: 3.9, freeOver: 50 } },
  Carrefour: { hours: "7:30 – 22:00", priceIndex: 1.03, desk: "Cassa 1 · ritiro prenotazioni", delivery: { fee: 4.5, freeOver: 55 } },
  Lidl: { hours: "8:00 – 21:30", priceIndex: 0.92, desk: "Punto ritiro · uscita casse", locker: true },
  Despar: { hours: "8:00 – 20:00", priceIndex: 1.02, desk: "Cassa 1 · ritiro prenotazioni" },
  Decò: { hours: "7:30 – 21:00", priceIndex: 0.97, desk: "Banco salumeria · ritiro prenotazioni" },
  Crai: { hours: "8:00 – 20:30", priceIndex: 1.03, desk: "Cassa 1 · ritiro prenotazioni" },
  Sisa: { hours: "8:00 – 20:30", priceIndex: 0.99, desk: "Punto ritiro · area casse" },
  Sigma: { hours: "8:00 – 20:30", priceIndex: 1.01, desk: "Punto ritiro · area casse" },
  Pam: { hours: "8:00 – 21:00", priceIndex: 1.02, desk: "Punto ritiro · area casse", delivery: { fee: 4.9, freeOver: 60 } },
  Alì: { hours: "8:00 – 20:00", priceIndex: 1.0, desk: "Banco gastronomia · ritiro prenotazioni" },
  Poli: { hours: "8:30 – 19:30", priceIndex: 1.03, desk: "Punto ritiro · area casse" },
  Famila: { hours: "8:00 – 20:45", priceIndex: 0.98, desk: "Punto ritiro · area casse", delivery: { fee: 3.9, freeOver: 50 } },
  "A&O": { hours: "8:30 – 19:30", priceIndex: 0.99, desk: "Cassa 1 · ritiro prenotazioni" },
  "IN'S": { hours: "8:00 – 20:00", priceIndex: 0.9, desk: "Punto ritiro · uscita casse" },
};

const PROMO_ROTATION: CategoryId[] = ["ortofrutta", "latticini", "carne", "panetteria", "pesce"];
const UNAVAILABLE_POOL = ["gamberi", "tofu", "polpette-lenticchie", "orata", "parmigiano", "hummus"];
const SLOTS_INSTORE = [
  ["8:30 – 10:30", "12:00 – 14:00", "17:00 – 19:00", "19:00 – 21:00"],
  ["9:00 – 11:00", "12:00 – 14:00", "17:30 – 20:00"],
  ["8:30 – 12:30", "16:00 – 20:00"],
];

/** small deterministic number from a string, so every store keeps the same simulated details */
function seedOf(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function buildStore([id, city, chain, label, address, distanceKm]: Row): Store {
  const p = CHAINS[chain] ?? DEFAULT_PROFILE;
  const h = seedOf(id);
  const street = address.split(",")[0];
  // small "Express"/"City" formats don't deliver
  const small = /express|city|sigma|crai/i.test(label);
  return {
    id,
    chain,
    name: `${label} · ${street}`,
    address,
    city,
    distanceKm,
    hours: p.hours,
    priceIndex: p.priceIndex,
    stockFactor: [0.8, 0.9, 1, 1.1, 1.2][h % 5],
    categoryPromos: h % 3 === 0 ? {} : { [PROMO_ROTATION[h % PROMO_ROTATION.length]]: 5 },
    unavailable: UNAVAILABLE_POOL.filter((_, i) => (h >> (i + 3)) % 4 === 0).slice(0, 2),
    services: {
      instore: { desk: p.desk, slots: SLOTS_INSTORE[h % SLOTS_INSTORE.length] },
      ...(p.locker && !small
        ? {
            locker: {
              slots: ["Dalle 8:00", "Dalle 12:00", "Dalle 17:00"],
              points: [{ id: `lk-${id}`, name: `Locker ${label}`, address: `${address} · ingresso`, distanceKm, types: chain === "Lidl" ? ["ambiente", "refrigerato"] : ["ambiente", "refrigerato", "surgelato"] }],
            },
          }
        : {}),
      ...(p.delivery && !small
        ? { delivery: { ...p.delivery, slots: ["9:00 – 11:00", "14:00 – 16:00", "18:00 – 20:00"], provider: "servizio di consegna del punto vendita" } }
        : {}),
    },
  };
}

export const STORES: Store[] = REAL_STORES.map(buildStore);

/** Ids of the four Milan demo stores used before November 2026, so saved accounts keep a store */
const LEGACY_IDS: Record<string, string> = {
  "st-coop-lodi": "st-milano-coop-umbria",
  "st-conad-solari": "st-milano-carrefour-italia",
  "st-despar-isola": "st-milano-sigma-di-porta-romana",
};

export const storeById = (id: string | null | undefined) => {
  if (!id) return null;
  const real = LEGACY_IDS[id] ?? id;
  return STORES.find((s) => s.id === real) ?? null;
};

/** Every store of the given chains (for sponsored campaigns) */
export const storesOfChains = (chains: string[]) => STORES.filter((s) => chains.includes(s.chain)).map((s) => s.id);
export const ALL_STORE_IDS = STORES.map((s) => s.id);
