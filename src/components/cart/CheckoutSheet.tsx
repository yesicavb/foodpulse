"use client";

import { locale } from "@/i18n/lang";
import { CalendarDays, Check, Lock, MapPin, Snowflake, Store as StoreIcon, Ticket, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Sheet } from "@/components/ui/Controls";
import { LOCKER_LABEL, METHOD_LABEL } from "@/data/config";
import { formatDayLong, money, round2 } from "@/lib/format";
import { deliveryFee } from "@/lib/orders";
import { cartTotals, pointsFor } from "@/lib/pricing";
import type { CategoryId, LockerType, PickupMethod } from "@/lib/types";
import { pickupDateFor, useApp } from "@/store/AppStore";

const COLD: CategoryId[] = ["carne", "pesce", "latticini", "gastronomia"];

export function CheckoutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, store, placeOrder, setTab, notify } = useApp();
  const methods = useMemo(() => {
    if (!store) return [] as PickupMethod[];
    return (["instore", "locker", "delivery"] as PickupMethod[]).filter((m) => !!store.services[m]);
  }, [store]);

  const [method, setMethod] = useState<PickupMethod>("instore");
  const [slot, setSlot] = useState("");
  const [lockerId, setLockerId] = useState("");
  const [lockerType, setLockerType] = useState<LockerType>("refrigerato");
  const [address, setAddress] = useState("");
  const [voucherId, setVoucherId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setMethod(methods[0] ?? "instore");
    setSlot("");
    setError(null);
    setAddress(data?.profile.address ?? "");
    setLockerId(store?.services.locker?.points[0]?.id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!data || !store) return null;
  const t = cartTotals(data.cart, store, data.advance);
  const needsCold = t.lines.some((l) => COLD.includes(l.product.category));
  const lockerPoint = store.services.locker?.points.find((p) => p.id === lockerId) ?? null;
  const slots =
    method === "instore" ? store.services.instore?.slots ?? [] : method === "locker" ? store.services.locker?.slots ?? [] : store.services.delivery?.slots ?? [];
  const fee = method === "delivery" ? deliveryFee(store, t.afterDiscount) : 0;
  const vouchers = data.vouchers.filter((v) => !v.usedAt);
  const voucher = vouchers.find((v) => v.id === voucherId) ?? null;
  const voucherValue = voucher ? Math.min(voucher.value, t.afterDiscount) : 0;
  const total = round2(t.afterDiscount - voucherValue + fee);

  function confirm() {
    if (!store) return;
    if (!slot) return setError("Scegli una fascia oraria.");
    if (method === "locker") {
      if (!lockerPoint) return setError("Scegli un locker.");
      if (!lockerPoint.types.includes(lockerType)) return setError("Questo locker non ha lo scomparto scelto.");
      if (needsCold && lockerType === "ambiente") return setError("Nel carrello ci sono prodotti da frigo: scegli uno scomparto refrigerato.");
    }
    if (method === "delivery" && address.trim().length < 8) return setError("Inserisci l'indirizzo completo di consegna.");
    const pickupDetail =
      method === "instore"
        ? store.services.instore?.desk ?? ""
        : method === "locker"
          ? `${lockerPoint?.name} · ${lockerPoint?.address}`
          : `Consegna con il ${store.services.delivery?.provider}`;
    const order = placeOrder({
      method,
      slot,
      pickupDetail,
      lockerType: method === "locker" ? lockerType : undefined,
      deliveryAddress: method === "delivery" ? address.trim() : undefined,
      voucherId: voucherId || undefined,
    });
    if (!order) return setError("Non è stato possibile creare la prenotazione. Controlla il carrello e riprova.");
    onClose();
    setTab("qr");
    notify(`Prenotazione confermata: +${order.points} punti`);
  }

  const ICON = { instore: StoreIcon, locker: Lock, delivery: Truck };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Ritiro e conferma"
      footer={
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-[19px] font-extrabold tabular-nums text-ink-900">{money(total)}</p>
            <p className="text-[11.5px] font-semibold text-brand-700">+{pointsFor(total, data.advance)} punti FOODPULSE</p>
          </div>
          <button type="button" className="btn-primary h-12 px-5" onClick={confirm}>
            <Check size={17} /> Conferma prenotazione
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <p className="flex items-center gap-2 rounded-xl bg-white p-3 text-[13.5px] text-ink-700 ring-1 ring-ink-100">
          <CalendarDays size={17} className="shrink-0 text-brand-600" />
          <span suppressHydrationWarning>
            Ritiro <strong className="capitalize">{formatDayLong(pickupDateFor(data.advance))}</strong> da {store.name}
          </span>
        </p>

        <fieldset>
          <legend className="eyebrow mb-2">Modalità di ritiro</legend>
          <div role="radiogroup" className="grid gap-2">
            {(["instore", "locker", "delivery"] as PickupMethod[]).map((m) => {
              const Icon = ICON[m];
              const available = methods.includes(m);
              const on = method === m;
              const sub =
                m === "instore"
                  ? store.services.instore?.desk ?? ""
                  : m === "locker"
                    ? store.services.locker
                      ? `${store.services.locker.points.length} locker vicino a te`
                      : ""
                    : store.services.delivery
                      ? `${money(store.services.delivery.fee)} · gratis sopra ${money(store.services.delivery.freeOver)}`
                      : "";
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={!available}
                  onClick={() => {
                    setMethod(m);
                    setSlot("");
                    setError(null);
                  }}
                  className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${on ? "border-brand-600" : "border-ink-100"}`}
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${on ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600"}`}>
                    <Icon size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-bold text-ink-900">{METHOD_LABEL[m]}</span>
                    <span className="block text-[12.5px] text-ink-500">{available ? sub : `Non offerto da ${store.chain} in questo punto vendita`}</span>
                  </span>
                  {on && <Check size={18} className="text-brand-600" />}
                </button>
              );
            })}
          </div>
        </fieldset>

        {method === "locker" && store.services.locker && (
          <fieldset className="space-y-2">
            <legend className="eyebrow mb-2">Locker</legend>
            <div role="radiogroup" className="grid gap-2">
              {store.services.locker.points.map((p) => {
                const on = lockerId === p.id;
                return (
                  <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => setLockerId(p.id)} className={`rounded-2xl border-2 bg-white p-3 text-left ${on ? "border-brand-600" : "border-ink-100"}`}>
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-bold text-ink-900">{p.name}</span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-[12.5px] text-ink-500">
                      <MapPin size={12} /> {p.address}
                    </span>
                    <span className="mt-1.5 flex flex-wrap gap-1">
                      {p.types.map((t) => (
                        <span key={t} className="badge bg-ink-100 text-ink-700">{LOCKER_LABEL[t]}</span>
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
            {lockerPoint && (
              <div>
                <p className="eyebrow mb-2 mt-3">Tipo di scomparto</p>
                <div role="radiogroup" className="grid grid-cols-3 gap-2">
                  {(["ambiente", "refrigerato", "surgelato"] as LockerType[]).map((lt) => {
                    const ok = lockerPoint.types.includes(lt);
                    const on = lockerType === lt;
                    return (
                      <button key={lt} type="button" role="radio" aria-checked={on} disabled={!ok} onClick={() => setLockerType(lt)} className={`rounded-xl border-2 bg-white px-2 py-2.5 text-center text-[12px] font-bold disabled:opacity-40 ${on ? "border-brand-600 text-brand-800" : "border-ink-100 text-ink-700"}`}>
                        {lt === "surgelato" ? <Snowflake size={16} className="mx-auto mb-1" /> : null}
                        {LOCKER_LABEL[lt].split(" (")[0]}
                      </button>
                    );
                  })}
                </div>
                {needsCold && <p className="mt-2 text-[12.5px] text-ink-600">Hai prodotti da frigo: consigliamo lo scomparto refrigerato.</p>}
              </div>
            )}
          </fieldset>
        )}

        {method === "delivery" && store.services.delivery && (
          <div className="space-y-2">
            <label htmlFor="delivery-address" className="field-label">Indirizzo di consegna</label>
            <input id="delivery-address" className="input" autoComplete="street-address" placeholder="Via, numero civico, città" value={address} onChange={(e) => setAddress(e.target.value)} />
            <p className="text-[12.5px] leading-snug text-ink-500">
              Consegna effettuata dal {store.services.delivery.provider}: FOODPULSE non gestisce corrieri propri.
            </p>
          </div>
        )}

        <fieldset>
          <legend className="eyebrow mb-2">{method === "delivery" ? "Fascia di consegna" : "Fascia oraria di ritiro"}</legend>
          <div role="radiogroup" className="grid grid-cols-2 gap-2">
            {slots.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={slot === s} onClick={() => setSlot(s)} className={`rounded-xl border-2 bg-white px-2 py-2.5 text-[13.5px] font-bold tabular-nums ${slot === s ? "border-brand-600 text-brand-800" : "border-ink-100 text-ink-700"}`}>
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        {vouchers.length > 0 && (
          <fieldset>
            <legend className="eyebrow mb-2">Voucher</legend>
            <div className="grid gap-2">
              {vouchers.map((v) => {
                const on = voucherId === v.id;
                return (
                  <button key={v.id} type="button" aria-pressed={on} onClick={() => setVoucherId(on ? "" : v.id)} className={`flex items-center gap-3 rounded-2xl border-2 border-dashed bg-white p-3 text-left ${on ? "border-brand-600" : "border-ink-200"}`}>
                    <Ticket size={18} className="text-brand-600" />
                    <span className="flex-1 text-[14px] font-semibold text-ink-900">Voucher {money(v.value)} · {v.code}</span>
                    <span className="text-[12px] font-bold text-brand-700">{on ? "Applicato" : "Usa"}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <section className="card space-y-1.5 p-4 text-[14px]">
          <div className="flex justify-between text-ink-600"><span>Prezzo originale</span><span className="tabular-nums">{money(t.subtotal)}</span></div>
          <div className="flex justify-between font-semibold text-brand-700"><span>Sconti di prenotazione</span><span className="tabular-nums">−{money(t.discount)}</span></div>
          {voucherValue > 0 && <div className="flex justify-between font-semibold text-brand-700"><span>Voucher</span><span className="tabular-nums">−{money(voucherValue)}</span></div>}
          {method === "delivery" && <div className="flex justify-between text-ink-600"><span>Consegna</span><span className="tabular-nums">{fee ? money(fee) : "Gratis"}</span></div>}
          <div className="flex justify-between border-t border-dashed border-ink-200 pt-2 font-extrabold text-ink-900"><span>Totale</span><span className="tabular-nums">{money(total)}</span></div>
          <p className="text-[12px] text-ink-500">Pagamento simulato: nella versione reale si paga in app o al ritiro, secondo le regole del punto vendita.</p>
        </section>

        {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13.5px] text-rose-700">{error}</p>}
      </div>
    </Sheet>
  );
}
