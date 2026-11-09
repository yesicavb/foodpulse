const eur = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const dayLong = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long" });
const dayShort = new Intl.DateTimeFormat("it-IT", { weekday: "short", day: "numeric", month: "short" });
const dateShort = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", year: "numeric" });

export const money = (n: number) => eur.format(n);
export const formatDayLong = (d: Date | string) => dayLong.format(new Date(d));
export const formatDayShort = (d: Date | string) => dayShort.format(new Date(d));
export const formatDate = (d: Date | string) => dateShort.format(new Date(d));
export const formatKg = (n: number) =>
  n < 1 ? `${Math.round(n * 1000)} g` : `${n.toLocaleString("it-IT", { maximumFractionDigits: 1 })} kg`;
export const formatInt = (n: number) => Math.round(n).toLocaleString("it-IT");

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
