import { LEVELS, VOUCHER } from "@/data/config";
import { uid } from "./format";
import type { UserData } from "./types";

export function levelOf(lifetime: number) {
  let idx = 0;
  LEVELS.forEach((l, i) => {
    if (lifetime >= l.min) idx = i;
  });
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1] ?? null;
  const progress = next ? (lifetime - current.min) / (next.min - current.min) : 1;
  return { current, next, progress: Math.min(1, Math.max(0, progress)) };
}

const voucherCode = () => `FP${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/**
 * Adds (or removes) points and automatically generates a voucher
 * every time the balance reaches the threshold.
 */
export function applyPoints(d: UserData, points: number, label: string, at = new Date()): UserData {
  const date = at.toISOString();
  let balance = d.points.balance + points;
  const lifetime = Math.max(0, d.points.lifetime + Math.max(points, 0) + (points < 0 ? points : 0));
  const events = [{ id: uid("pt"), date, label, points }, ...d.points.events];
  const vouchers = [...d.vouchers];
  while (balance >= VOUCHER.threshold) {
    balance -= VOUCHER.threshold;
    const v = { id: uid("vc"), code: voucherCode(), value: VOUCHER.value, createdAt: date };
    vouchers.unshift(v);
    events.unshift({ id: uid("pt"), date, label: `Voucher da ${VOUCHER.value} € generato`, points: -VOUCHER.threshold });
  }
  return { ...d, points: { balance: Math.max(0, balance), lifetime, events }, vouchers };
}
