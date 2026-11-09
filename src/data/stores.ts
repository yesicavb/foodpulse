import type { Store } from "@/lib/types";

/**
 * DEMO stores. Chain names are used for illustration only:
 * there is no official integration with Esselunga, Coop, Conad or Despar.
 * Addresses, prices, availability and services are simulated.
 */
export const STORES: Store[] = [
  {
    id: "st-ess-piave",
    chain: "Esselunga",
    name: "Esselunga · Viale Piave",
    address: "Viale Piave 38",
    city: "Milano",
    distanceKm: 1.2,
    hours: "7:30 – 22:00",
    priceIndex: 1.04,
    stockFactor: 1.2,
    categoryPromos: { ortofrutta: 5 },
    unavailable: [],
    services: {
      instore: { desk: "Banco prenotazioni · accanto alla gastronomia", slots: ["8:30 – 10:30", "12:00 – 14:00", "17:00 – 19:00", "19:00 – 21:00"] },
      locker: {
        slots: ["Dalle 8:00", "Dalle 12:00", "Dalle 17:00"],
        points: [
          { id: "lk-ess-1", name: "Locker Ingresso principale", address: "Viale Piave 38 · parcheggio", distanceKm: 1.2, types: ["ambiente", "refrigerato", "surgelato"] },
          { id: "lk-ess-2", name: "Locker Porta Venezia", address: "Corso Buenos Aires 3 · galleria", distanceKm: 0.6, types: ["ambiente", "refrigerato"] },
        ],
      },
      delivery: { fee: 4.9, freeOver: 60, slots: ["9:00 – 11:00", "14:00 – 16:00", "18:00 – 20:00"], provider: "servizio di consegna del punto vendita" },
    },
  },
  {
    id: "st-coop-lodi",
    chain: "Coop",
    name: "Coop · Piazzale Lodi",
    address: "Piazzale Lodi 12",
    city: "Milano",
    distanceKm: 2.1,
    hours: "8:00 – 21:30",
    priceIndex: 0.98,
    stockFactor: 1,
    categoryPromos: { latticini: 5 },
    unavailable: ["gamberi"],
    services: {
      instore: { desk: "Punto ritiro · area casse", slots: ["9:00 – 11:00", "12:00 – 14:00", "17:30 – 20:00"] },
      delivery: { fee: 3.9, freeOver: 50, slots: ["10:00 – 12:00", "18:00 – 20:00"], provider: "servizio di consegna del punto vendita" },
    },
  },
  {
    id: "st-conad-solari",
    chain: "Conad",
    name: "Conad · Via Solari",
    address: "Via Andrea Solari 21",
    city: "Milano",
    distanceKm: 2.8,
    hours: "8:00 – 21:00",
    priceIndex: 0.96,
    stockFactor: 0.9,
    categoryPromos: { carne: 5 },
    unavailable: ["tofu", "polpette-lenticchie"],
    services: {
      instore: { desk: "Banco gastronomia · ritiro prenotazioni", slots: ["8:30 – 12:30", "16:00 – 20:00"] },
    },
  },
  {
    id: "st-despar-isola",
    chain: "Despar",
    name: "Despar · Isola",
    address: "Via Carmagnola 9",
    city: "Milano",
    distanceKm: 3.4,
    hours: "7:00 – 21:00",
    priceIndex: 1.02,
    stockFactor: 0.8,
    categoryPromos: { panetteria: 5 },
    unavailable: ["orata", "parmigiano"],
    services: {
      instore: { desk: "Cassa 1 · ritiro prenotazioni", slots: ["8:00 – 11:00", "17:00 – 20:00"] },
      locker: {
        slots: ["Dalle 9:00", "Dalle 16:00"],
        points: [
          { id: "lk-desp-1", name: "Locker Isola", address: "Via Carmagnola 9 · esterno", distanceKm: 3.4, types: ["ambiente", "refrigerato"] },
        ],
      },
    },
  },
];

export const storeById = (id: string | null | undefined) => STORES.find((s) => s.id === id) ?? null;
