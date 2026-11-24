/**
 * The supermarket side ("desk"): orders as the store sees them.
 *
 * Two places to keep them, with the same functions:
 * - Supabase (table `orders`, see supabase/store-dashboard.sql) for real accounts;
 * - this browser's localStorage for the demo, so the customer demo and the supermarket
 *   demo on the same device see each other's orders.
 */
import type { Order } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { FRESH, SHELF } from "@/data/products";

export type DeskStatus = "da_preparare" | "in_preparazione" | "pronto" | "completato" | "annullato";

export interface DeskLine {
  name: string;
  qty: number;
  /** sold by weight: kg booked (qty is then in units of 100 g) */
  kg?: number;
}

/** "3×" or "0,3 kg" */
export const lineQty = (l: DeskLine) => (l.kg ? `${l.kg.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg` : `${l.qty}×`);
/** number of products in an order (a product by weight counts once) */
export const lineCount = (lines: DeskLine[]) => lines.reduce((a, l) => a + (l.kg ? 1 : l.qty), 0);

export interface DeskOrder {
  id: string;
  code: string;
  storeId: string;
  customerName: string;
  lines: DeskLine[];
  total: number;
  pickupDate: string; // yyyy-mm-dd
  slot: string;
  method: Order["method"];
  pickupDetail: string;
  notes: string;
  status: DeskStatus;
  seen: boolean;
  createdAt: string;
}

export const DESK_STATUS: Record<DeskStatus, { label: string; cls: string; next?: DeskStatus; action?: string }> = {
  da_preparare: { label: "Da preparare", cls: "bg-amber-100 text-amber-800", next: "in_preparazione", action: "Inizia preparazione" },
  in_preparazione: { label: "In preparazione", cls: "bg-sky-100 text-sky-800", next: "pronto", action: "Segna come pronto" },
  pronto: { label: "Pronto per il ritiro", cls: "bg-brand-100 text-brand-800" },
  completato: { label: "Ritirato", cls: "bg-ink-100 text-ink-700" },
  annullato: { label: "Annullato", cls: "bg-rose-100 text-rose-700" },
};

/** Store of the supermarket demo */
export const DEMO_STORE_ID = "st-ess-piave";

const LOCAL_KEY = "foodpulse-desk-v1";
/** yyyy-mm-dd in the device's own time zone (toISOString would shift it to the day before in Italy) */
export const localDay = (d: string | Date = new Date()) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
const day = localDay;

/** Order as the customer created it -> order as the store sees it */
export function toDeskOrder(o: Order, customerName: string): DeskOrder {
  return {
    id: o.id,
    code: o.code,
    storeId: o.storeId,
    customerName,
    lines: o.lines.map((l) => (l.byWeight ? { name: l.name, qty: l.qty, kg: Math.round(l.qty) / 10 } : { name: l.name, qty: l.qty })),
    total: o.total,
    pickupDate: day(o.pickupDate),
    slot: o.slot,
    method: o.method,
    pickupDetail: o.method === "delivery" ? o.deliveryAddress ?? "" : o.pickupDetail,
    notes: o.notes ?? "",
    status: o.status === "completato" ? "completato" : o.status === "annullato" ? "annullato" : "da_preparare",
    seen: false,
    createdAt: o.createdAt,
  };
}

/** Reads the code from a scanned QR (the app's QR holds JSON) or from typed text */
export function codeFromText(text: string): string {
  const t = text.trim();
  try {
    const j = JSON.parse(t) as { app?: string; code?: string };
    if (j && j.app === "foodpulse" && typeof j.code === "string") return j.code.toUpperCase();
  } catch {
    /* not JSON: typed code */
  }
  return t.replace(/[\s-]/g, "").toUpperCase();
}

/* ---------------- local (demo) ---------------- */

function readLocal(): DeskOrder[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as DeskOrder[]) : [];
  } catch {
    return [];
  }
}
function writeLocal(list: DeskOrder[]) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* memory only */
  }
}

/** A few example orders, so the supermarket demo is never empty */
function demoSeed(): DeskOrder[] {
  const today = new Date();
  const plus = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return day(d);
  };
  const ago = (min: number) => new Date(Date.now() - min * 60000).toISOString();
  const base = { storeId: DEMO_STORE_ID, method: "instore" as const, pickupDetail: "Banco prenotazioni · accanto alla gastronomia" };
  return [
    { ...base, id: "FP-482113", code: "K7QW2MNA", customerName: "Marco Rossi", lines: [{ name: "Yogurt greco", qty: 2 }, { name: "Petto di pollo", qty: 1 }, { name: "Insalata mista", qty: 2 }, { name: "Mele", qty: 1 }], total: 28.4, pickupDate: plus(0), slot: "17:00 – 19:00", notes: "Pollo tagliato a fette, per favore", status: "da_preparare", seen: false, createdAt: ago(12) },
    { ...base, id: "FP-377920", code: "P3XH8RTE", customerName: "Sara Bianchi", lines: [{ name: "Latte fresco", qty: 2 }, { name: "Pane integrale", qty: 1 }, { name: "Mozzarella", qty: 3 }], total: 15.9, pickupDate: plus(0), slot: "12:00 – 14:00", notes: "", status: "in_preparazione", seen: true, createdAt: ago(95) },
    { ...base, id: "FP-551204", code: "D9LMV4CS", customerName: "Luca Ferrari", lines: [{ name: "Orata", qty: 2 }, { name: "Insalata mista", qty: 1 }, { name: "Banane", qty: 1 }], total: 31.2, pickupDate: plus(0), slot: "8:30 – 10:30", notes: "", status: "pronto", seen: true, createdAt: ago(60 * 20) },
    { ...base, id: "FP-693318", code: "R2TNB7YK", customerName: "Elena Conti", lines: [{ name: "Parmigiano", qty: 1 }, { name: "Uova", qty: 2 }, { name: "Pomodori", qty: 1 }], total: 19.6, pickupDate: plus(1), slot: "17:00 – 19:00", notes: "Vengo con mia figlia a ritirare", status: "da_preparare", seen: false, createdAt: ago(30) },
    { ...base, id: "FP-208457", code: "W5CJ3HQZ", customerName: "Andrea Russo", lines: [{ name: "Latte fresco", qty: 1 }, { name: "Mele", qty: 2 }], total: 7.8, pickupDate: plus(-1), slot: "19:00 – 21:00", notes: "", status: "completato", seen: true, createdAt: ago(60 * 30) },
  ];
}

/** Four weeks of past orders for the demo, so the statistics tab has something to show */
function demoHistory(): DeskOrder[] {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
  const names = ["Giulia M.", "Paolo R.", "Chiara L.", "Davide B.", "Francesca T.", "Matteo G.", "Laura P.", "Simone V.", "Alessia C.", "Roberto F.", "Marta S.", "Giorgio N."];
  const slots = ["8:30 – 10:30", "12:00 – 14:00", "17:00 – 19:00", "17:00 – 19:00", "19:00 – 21:00"];
  // fresh products are booked more often than shelf ones, and a few favourites stand out
  const pool = [...FRESH.map((p) => p.name), ...FRESH.slice(0, 12).map((p) => p.name), ...SHELF.map((p) => p.name)];
  const price = new Map<string, number>([...FRESH, ...SHELF].map((p) => [p.name, p.basePrice]));
  const out: DeskOrder[] = [];
  for (let d = 28; d >= 1; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const n = Math.floor(rnd() * 3) + (d < 10 ? 2 : 1); // more orders in recent weeks
    for (let k = 0; k < n; k++) {
      const lines: DeskLine[] = [];
      const count = 2 + Math.floor(rnd() * 4);
      while (lines.length < count) {
        const name = pick(pool);
        if (!lines.some((l) => l.name === name)) lines.push({ name, qty: 1 + Math.floor(rnd() * 3) });
      }
      const i = out.length;
      out.push({
        id: `FP-H${String(i).padStart(4, "0")}`,
        code: `H${String(i).padStart(3, "0")}DEMO`,
        storeId: DEMO_STORE_ID,
        customerName: pick(names),
        lines,
        total: Math.round(lines.reduce((a, l) => a + (price.get(l.name) ?? 2) * l.qty, 0) * 0.85 * 100) / 100,
        pickupDate: day(date),
        slot: pick(slots),
        method: rnd() < 0.8 ? "instore" : "locker",
        pickupDetail: "",
        notes: "",
        status: rnd() < 0.08 ? "annullato" : "completato",
        seen: true,
        createdAt: new Date(date.getTime() - 20 * 3600000).toISOString(),
      });
    }
  }
  return out;
}

const local = {
  list(storeId: string): DeskOrder[] {
    let all = readLocal();
    if (storeId === DEMO_STORE_ID && !all.some((o) => o.storeId === DEMO_STORE_ID && o.id.startsWith("FP-482113"))) {
      all = [...all, ...demoSeed()];
      writeLocal(all);
    }
    if (storeId === DEMO_STORE_ID && !all.some((o) => o.id === "FP-H0000")) {
      all = [...all, ...demoHistory()];
      writeLocal(all);
    }
    return all.filter((o) => o.storeId === storeId);
  },
  upsert(o: DeskOrder) {
    const all = readLocal();
    const i = all.findIndex((x) => x.id === o.id);
    if (i >= 0) all[i] = { ...all[i], ...o };
    else all.unshift(o);
    writeLocal(all);
  },
  patch(id: string, p: Partial<DeskOrder>) {
    writeLocal(readLocal().map((o) => (o.id === id ? { ...o, ...p } : o)));
  },
  statuses(ids: string[]): Record<string, DeskStatus> {
    const out: Record<string, DeskStatus> = {};
    readLocal().forEach((o) => {
      if (ids.includes(o.id)) out[o.id] = o.status;
    });
    return out;
  },
};

/* ---------------- Supabase ---------------- */

type Row = {
  id: string;
  code: string;
  store_id: string;
  customer_name: string;
  lines: DeskLine[];
  total: number;
  pickup_date: string;
  slot: string;
  method: Order["method"];
  pickup_detail: string;
  notes: string | null;
  status: DeskStatus;
  seen_by_store: boolean;
  created_at: string;
};
const fromRow = (r: Row): DeskOrder => ({
  id: r.id,
  code: r.code,
  storeId: r.store_id,
  customerName: r.customer_name,
  lines: r.lines ?? [],
  total: Number(r.total),
  pickupDate: r.pickup_date,
  slot: r.slot,
  method: r.method,
  pickupDetail: r.pickup_detail,
  notes: r.notes ?? "",
  status: r.status,
  seen: r.seen_by_store,
  createdAt: r.created_at,
});

/* ---------------- what the app uses ---------------- */

/** Customer side: sends a new booking to the store */
export async function sendToStore(o: Order, customerName: string, cloud: boolean): Promise<boolean> {
  const d = toDeskOrder(o, customerName);
  if (!cloud || !supabase) {
    local.upsert(d);
    return true;
  }
  const { error } = await supabase.from("orders").upsert(
    {
      id: d.id,
      store_id: d.storeId,
      code: d.code,
      customer_name: d.customerName,
      lines: d.lines,
      total: d.total,
      pickup_date: d.pickupDate,
      slot: d.slot,
      method: d.method,
      pickup_detail: d.pickupDetail,
      notes: d.notes || null,
      status: "da_preparare",
    },
    { onConflict: "id", ignoreDuplicates: true }
  );
  if (error) console.error("FoodPulse: order not sent to the store", error);
  return !error;
}

/** Customer side: cancels a booking at the store */
export async function cancelAtStore(id: string, cloud: boolean) {
  if (!cloud || !supabase) return local.patch(id, { status: "annullato" });
  const { error } = await supabase.from("orders").update({ status: "annullato", updated_at: new Date().toISOString() }).eq("id", id);
  if (error) console.error("FoodPulse: cancel not sent to the store", error);
}

/** Customer side: status the store gave to each booking (missing = store hasn't got it yet) */
export async function statusesAtStore(ids: string[], cloud: boolean): Promise<Record<string, DeskStatus>> {
  if (!ids.length) return {};
  if (!cloud || !supabase) return local.statuses(ids);
  const { data, error } = await supabase.from("orders").select("id,status").in("id", ids);
  if (error || !data) return {};
  return Object.fromEntries((data as { id: string; status: DeskStatus }[]).map((r) => [r.id, r.status]));
}

/** Store side: all orders of the store, newest first */
export async function storeOrders(storeId: string, cloud: boolean): Promise<DeskOrder[]> {
  const sort = (l: DeskOrder[]) => [...l].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (!cloud || !supabase) return sort(local.list(storeId));
  const { data, error } = await supabase.from("orders").select("*").eq("store_id", storeId).order("created_at", { ascending: false }).limit(300);
  if (error) throw error;
  return (data as Row[]).map(fromRow);
}

/** Store side: changes the status and/or marks orders as read */
export async function updateAtStore(id: string, p: { status?: DeskStatus; seen?: boolean }, cloud: boolean) {
  if (!cloud || !supabase) return local.patch(id, p);
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (p.status) row.status = p.status;
  if (p.seen !== undefined) row.seen_by_store = p.seen;
  const { error } = await supabase.from("orders").update(row).eq("id", id);
  if (error) throw error;
}

/** Supermarket account: which store this logged-in account works for (null = customer) */
export async function staffStoreOf(userId: string): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.from("store_staff").select("store_id").eq("user_id", userId).maybeSingle();
  return (data as { store_id: string } | null)?.store_id ?? null;
}

/** Links the logged-in account to a store with its code; returns the store id or null */
export async function claimStoreCode(code: string): Promise<{ storeId: string | null; error?: string }> {
  if (!supabase) return { storeId: null, error: "Gli account supermercato funzionano solo nella versione online dell'app." };
  const { data, error } = await supabase.rpc("claim_store_code", { p_code: code.trim() });
  if (error) {
    console.error("FoodPulse: store code", error);
    return { storeId: null, error: "Non è stato possibile verificare il codice. Riprova tra poco." };
  }
  return data ? { storeId: data as string } : { storeId: null, error: "Codice negozio non valido. Controlla e riprova." };
}

/** 'free' = unused code for a new shop, 'store' = code of an existing store, null = wrong code */
export async function storeCodeKind(code: string): Promise<"free" | "store" | null | "error"> {
  if (!supabase) return "error";
  const { data, error } = await supabase.rpc("store_code_kind", { p_code: code.trim() });
  if (error) {
    console.error("FoodPulse: store code kind", error);
    return "error";
  }
  return (data as "free" | "store" | null) ?? null;
}

export interface NewShop {
  name: string;
  address: string;
  city: string;
}

/** Creates the shop for a free code and links the logged-in account to it */
export async function claimNewStore(code: string, shop: NewShop): Promise<{ storeId: string | null; error?: string }> {
  if (!supabase) return { storeId: null, error: "Gli account supermercato funzionano solo nella versione online dell'app." };
  const { data, error } = await supabase.rpc("claim_new_store", { p_code: code.trim(), p_name: shop.name, p_address: shop.address, p_city: shop.city });
  if (error) {
    console.error("FoodPulse: new store", error);
    return { storeId: null, error: "Non è stato possibile registrare il negozio. Riprova tra poco." };
  }
  return data ? { storeId: data as string } : { storeId: null, error: "Codice negozio non valido. Controlla e riprova." };
}

/** Partner shops for the store list (everyone can read them) */
export async function loadPartnerStores(): Promise<{ id: string; name: string; address: string; city: string; catalog?: string | null }[]> {
  if (!supabase) return [];
  type Row = { id: string; name: string; address: string; city: string; catalog?: string | null };
  const full = await supabase.from("partner_stores").select("id,name,address,city,catalog").order("created_at");
  if (!full.error) return (full.data ?? []) as Row[];
  // before supabase/pilot-catalog.sql is run, the catalog column does not exist yet
  const basic = await supabase.from("partner_stores").select("id,name,address,city").order("created_at");
  return basic.error ? [] : ((basic.data ?? []) as Row[]);
}

/* ---------------- shop feedback (pilot) ---------------- */

export interface StoreFeedback {
  storeId: string;
  kind: "pickup" | "weekly";
  orderId?: string;
  rating?: number;
  answers?: Record<string, string | number>;
}
const FB_KEY = "foodpulse-store-feedback-v1";

/** Saves a shop's rating of a pickup, or its weekly answers */
export async function sendStoreFeedback(f: StoreFeedback, cloud: boolean): Promise<boolean> {
  if (!cloud || !supabase) {
    try {
      const all = JSON.parse(localStorage.getItem(FB_KEY) ?? "[]") as (StoreFeedback & { at: string })[];
      all.push({ ...f, at: new Date().toISOString() });
      localStorage.setItem(FB_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
    return true;
  }
  const { error } = await supabase.from("store_feedback").insert({
    store_id: f.storeId,
    kind: f.kind,
    order_id: f.orderId ?? null,
    rating: f.rating ?? null,
    answers: f.answers ?? null,
  });
  if (error) console.error("FoodPulse: store feedback", error);
  return !error;
}

/** When this shop last filled in the weekly feedback (null = never) */
export async function lastWeeklyFeedback(storeId: string, cloud: boolean): Promise<Date | null> {
  if (!cloud || !supabase) {
    try {
      const all = JSON.parse(localStorage.getItem(FB_KEY) ?? "[]") as (StoreFeedback & { at: string })[];
      const mine = all.filter((x) => x.storeId === storeId && x.kind === "weekly").map((x) => x.at).sort();
      return mine.length ? new Date(mine[mine.length - 1]) : null;
    } catch {
      return null;
    }
  }
  const { data, error } = await supabase
    .from("store_feedback")
    .select("created_at")
    .eq("store_id", storeId)
    .eq("kind", "weekly")
    .order("created_at", { ascending: false })
    .limit(1);
  if (error || !data?.length) return null;
  return new Date(data[0].created_at as string);
}
