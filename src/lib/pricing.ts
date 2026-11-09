import { ADVANCE_TIERS, MAX_DISCOUNT_PCT, POINTS } from "@/data/config";
import { FRESH, freshById } from "@/data/products";
import type { CartLine, FreshProduct, ShelfProduct, Store } from "./types";
import { hashCode, round2 } from "./format";

export const tierPct = (advance: number) => ADVANCE_TIERS.find((t) => t.days === advance)?.pct ?? 0;

/** Price of a fresh product in a store, with the discount for the chosen advance */
export function priceInfo(p: FreshProduct, store: Store, advance: number) {
  const price = round2(p.basePrice * store.priceIndex);
  const promo = store.categoryPromos[p.category] ?? 0;
  const pct = Math.min(MAX_DISCOUNT_PCT, tierPct(advance) + promo);
  const final = round2(price * (1 - pct / 100));
  return { price, final, pct, promo };
}

export const shelfPrice = (p: ShelfProduct, store: Store) => round2(p.basePrice * store.priceIndex);

/** Units still available to book (simulated, fixed per product and store) */
export function stockFor(p: FreshProduct, store: Store) {
  const variation = 0.7 + (hashCode(p.id + store.id) % 60) / 100;
  return Math.max(3, Math.round(p.stock * store.stockFactor * variation));
}

export const isAvailable = (productId: string, store: Store | null) =>
  !!store && !store.unavailable.includes(productId) && !!freshById(productId);

export const availableFresh = (store: Store | null) => (store ? FRESH.filter((p) => isAvailable(p.id, store)) : []);

export function cartTotals(cart: CartLine[], store: Store | null, advance: number) {
  let subtotal = 0;
  let final = 0;
  let items = 0;
  let kg = 0;
  const lines: { product: FreshProduct; qty: number; price: number; final: number; pct: number }[] = [];
  if (store) {
    for (const line of cart) {
      const product = freshById(line.productId);
      if (!product || !isAvailable(product.id, store) || line.qty <= 0) continue;
      const info = priceInfo(product, store, advance);
      subtotal += info.price * line.qty;
      final += info.final * line.qty;
      items += line.qty;
      kg += product.weightKg * line.qty;
      lines.push({ product, qty: line.qty, price: info.price, final: info.final, pct: info.pct });
    }
  }
  return {
    lines,
    items,
    kg: round2(kg),
    subtotal: round2(subtotal),
    discount: round2(subtotal - final),
    afterDiscount: round2(final),
  };
}

export const pointsFor = (total: number, advance: number) =>
  Math.floor(total * POINTS.perEuro) + (advance >= 5 ? POINTS.bonusAdvance5 : advance >= 3 ? POINTS.bonusAdvance3 : 0);
