import { CO2_FACTORS, AVOIDED_WASTE_SHARE } from "@/data/config";
import { addDays, round2, startOfToday } from "./format";
import { cartTotals, pointsFor } from "./pricing";
import type { CartLine, LockerType, Order, PickupMethod, Store, Voucher } from "./types";

export interface OrderInput {
  cart: CartLine[];
  store: Store;
  advance: number;
  method: PickupMethod;
  slot: string;
  pickupDetail: string;
  lockerType?: LockerType;
  deliveryAddress?: string;
  voucher?: Voucher | null;
  createdAt?: Date;
}

const rand = (n: number) => Math.floor(Math.random() * n);
const code = () => Array.from({ length: 8 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[rand(32)]).join("");

export function deliveryFee(store: Store, afterDiscount: number) {
  const d = store.services.delivery;
  if (!d) return 0;
  return afterDiscount >= d.freeOver ? 0 : d.fee;
}

/** Creates the order with recalculated prices: the only place where a booking is created */
export function buildOrder(input: OrderInput): Order {
  const created = input.createdAt ?? new Date();
  const base = new Date(created);
  base.setHours(0, 0, 0, 0);
  const t = cartTotals(input.cart, input.store, input.advance);
  const fee = input.method === "delivery" ? deliveryFee(input.store, t.afterDiscount) : 0;
  const voucherValue = input.voucher ? Math.min(input.voucher.value, t.afterDiscount) : 0;
  const total = round2(t.afterDiscount - voucherValue + fee);
  const cell = `${"ABCD"[rand(4)]}-${String(1 + rand(24)).padStart(2, "0")}`;
  return {
    id: `FP-${String(100000 + rand(899999))}`,
    code: code(),
    storeId: input.store.id,
    storeName: input.store.name,
    storeAddress: `${input.store.address}, ${input.store.city}`,
    createdAt: created.toISOString(),
    pickupDate: addDays(base, input.advance).toISOString(),
    advance: input.advance,
    method: input.method,
    slot: input.slot,
    pickupDetail: input.pickupDetail,
    lockerType: input.lockerType,
    lockerCell: input.method === "locker" ? cell : undefined,
    deliveryAddress: input.deliveryAddress,
    lines: t.lines.map((l) => ({
      productId: l.product.id,
      name: l.product.name,
      category: l.product.category,
      qty: l.qty,
      unitPrice: l.price,
      unitFinal: l.final,
      pct: l.pct,
      weightKg: l.product.weightKg,
    })),
    subtotal: t.subtotal,
    discount: t.discount,
    voucherValue,
    voucherId: input.voucher && voucherValue > 0 ? input.voucher.id : undefined,
    fee,
    total,
    kgFood: t.kg,
    points: pointsFor(total, input.advance),
    status: "attivo",
    feedbackDone: false,
  };
}

/** Estimated impact of an order (see the method in data/config.ts) */
export function orderImpact(o: Order) {
  const kgSaved = o.lines.reduce((a, l) => a + l.weightKg * l.qty * AVOIDED_WASTE_SHARE, 0);
  const co2 = o.lines.reduce((a, l) => a + l.weightKg * l.qty * AVOIDED_WASTE_SHARE * CO2_FACTORS[l.category], 0);
  const products = o.lines.reduce((a, l) => a + l.qty, 0);
  return { kgSaved: round2(kgSaved), co2: round2(co2), products, saved: round2(o.discount + o.voucherValue) };
}

export function impactSummary(orders: Order[]) {
  const valid = orders.filter((o) => o.status !== "annullato");
  const sum = valid.reduce(
    (a, o) => {
      const i = orderImpact(o);
      return { saved: a.saved + i.saved, kg: a.kg + i.kgSaved, co2: a.co2 + i.co2, products: a.products + i.products };
    },
    { saved: 0, kg: 0, co2: 0, products: 0 }
  );
  // weekly series for the last 8 weeks
  const today = startOfToday();
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = addDays(today, -7 * (7 - i) + 1);
    const start = addDays(end, -7);
    const inWeek = valid.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= start && d < end;
    });
    const s = inWeek.reduce((a, o) => a + orderImpact(o).saved, 0);
    const k = inWeek.reduce((a, o) => a + orderImpact(o).kgSaved, 0);
    return { label: i === 7 ? "Questa" : `-${7 - i}`, saved: round2(s), kg: round2(k) };
  });
  return { ...sum, saved: round2(sum.saved), kg: round2(sum.kg), co2: round2(sum.co2), weeks, count: valid.length };
}
