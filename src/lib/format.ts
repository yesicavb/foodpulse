import { locale } from "@/i18n/lang";

// Formats follow the chosen language (Italian: 6,00 € · lun 3 nov; English: €6.00 · Mon 3 Nov)
const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();
function fmt<T extends Intl.NumberFormat | Intl.DateTimeFormat>(kind: string, make: (loc: string) => T): T {
  const key = `${kind}:${locale()}`;
  if (!cache.has(key)) cache.set(key, make(locale()));
  return cache.get(key) as T;
}
const eur = () => fmt("eur", (l) => new Intl.NumberFormat(l, { style: "currency", currency: "EUR" }));
const dayLong = () => fmt("dayLong", (l) => new Intl.DateTimeFormat(l, { weekday: "long", day: "numeric", month: "long" }));
const dayShort = () => fmt("dayShort", (l) => new Intl.DateTimeFormat(l, { weekday: "short", day: "numeric", month: "short" }));
const dateShort = () => fmt("dateShort", (l) => new Intl.DateTimeFormat(l, { day: "numeric", month: "short", year: "numeric" }));

export const money = (n: number) => eur().format(n);
export const formatDayLong = (d: Date | string) => dayLong().format(new Date(d));
export const formatDayShort = (d: Date | string) => dayShort().format(new Date(d));
export const formatDate = (d: Date | string) => dateShort().format(new Date(d));
export const formatKg = (n: number) =>
  n < 1 ? `${Math.round(n * 1000)} g` : `${n.toLocaleString(locale(), { maximumFractionDigits: 1 })} kg`;
export const formatInt = (n: number) => Math.round(n).toLocaleString(locale());

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export const initials = (first: string, last: string) =>
  `${(first || "?").charAt(0)}${(last || "").charAt(0)}`.toUpperCase();

/** stable numeric hash, for deterministic variations of the demo data */
export function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
