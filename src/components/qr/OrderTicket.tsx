"use client";

import { QRCodeSVG } from "qrcode.react";
import { Lock, Store as StoreIcon, Truck } from "lucide-react";
import { LOCKER_LABEL, METHOD_LABEL } from "@/data/config";
import { formatDayLong, money } from "@/lib/format";
import type { Order } from "@/lib/types";

const STATUS = {
  attivo: { label: "Da ritirare", cls: "bg-brand-600 text-white" },
  completato: { label: "Ritirato", cls: "bg-ink-200 text-ink-700" },
  annullato: { label: "Annullato", cls: "bg-rose-100 text-rose-700" },
};

export function OrderTicket({ order, showQr = true }: { order: Order; showQr?: boolean }) {
  const Icon = order.method === "locker" ? Lock : order.method === "delivery" ? Truck : StoreIcon;
  const payload = JSON.stringify({ app: "foodpulse", v: 1, order: order.id, code: order.code, store: order.storeId, date: order.pickupDate.slice(0, 10) });
  const st = STATUS[order.status];
  return (
    <section className="card overflow-hidden" aria-label={`Ordine ${order.id}`}>
      <div className="flex items-center justify-between gap-2 bg-brand-900 px-4 py-3 text-white">
        <span className="flex items-center gap-2 text-[14px] font-bold">
          <Icon size={16} className="text-leaf" /> {METHOD_LABEL[order.method]}
        </span>
        <span className={`badge ${st.cls}`}>{st.label}</span>
      </div>

      {showQr && order.status === "attivo" && (
        <div className="flex flex-col items-center px-5 pb-4 pt-5">
          <div className="rounded-2xl border border-ink-100 bg-white p-3">
            <QRCodeSVG value={payload} size={196} level="M" fgColor="#0E3A22" bgColor="#FFFFFF" role="img" aria-label={`QR code dell'ordine ${order.id}`} />
          </div>
          <p className="mt-2 font-mono text-[15px] font-bold tracking-[0.18em] text-ink-900">{order.code}</p>
          <p className="mt-1 text-center text-[12.5px] text-ink-500">
            {order.method === "locker"
              ? "Inquadra il QR sul display del locker per aprire lo scomparto"
              : order.method === "delivery"
                ? "Mostra il QR al momento della consegna"
                : "Mostra il QR al banco ritiri del supermercato"}
          </p>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-dashed border-ink-200 px-4 py-4 text-[13.5px]">
        <div>
          <dt className="text-[11.5px] text-ink-500">Numero ordine</dt>
          <dd className="font-bold tabular-nums text-ink-900">{order.id}</dd>
        </div>
        <div>
          <dt className="text-[11.5px] text-ink-500">{order.method === "delivery" ? "Consegna" : "Ritiro"}</dt>
          <dd className="font-bold capitalize text-ink-900">{formatDayLong(order.pickupDate)}</dd>
          <dd className="text-[12.5px] tabular-nums text-ink-600">{order.slot}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[11.5px] text-ink-500">Supermercato</dt>
          <dd className="font-bold text-ink-900">{order.storeName}</dd>
          <dd className="text-[12.5px] text-ink-600">{order.method === "delivery" ? order.deliveryAddress : order.pickupDetail}</dd>
        </div>
        {order.method === "locker" && (
          <div className="col-span-2 rounded-xl bg-brand-50 p-3">
            <dt className="text-[11.5px] text-brand-800">Scomparto</dt>
            <dd className="font-bold text-brand-900">
              {order.lockerCell} · {order.lockerType ? LOCKER_LABEL[order.lockerType] : ""}
            </dd>
            <dd className="text-[12px] text-brand-800">Codice di apertura: {order.code.slice(0, 6)}</dd>
          </div>
        )}
      </dl>

      <div className="border-t border-ink-100 px-4 py-3">
        <table className="w-full text-[13px]">
          <caption className="sr-only">Prodotti prenotati</caption>
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-ink-500">
              <th className="pb-1 font-bold">Prodotto</th>
              <th className="pb-1 text-right font-bold">Prezzo</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((l) => (
              <tr key={l.productId} className="border-t border-ink-100">
                <td className="py-1.5 pr-2 text-ink-800">
                  {l.qty}× {l.name} <span className="text-[11.5px] font-bold text-brand-700">−{l.pct}%</span>
                </td>
                <td className="py-1.5 text-right tabular-nums">
                  <span className="mr-1 text-[11.5px] text-ink-400 line-through">{money(l.unitPrice * l.qty)}</span>
                  <span className="font-semibold text-ink-900">{money(l.unitFinal * l.qty)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 space-y-1 border-t border-ink-100 pt-2 text-[13.5px]">
          <div className="flex justify-between text-ink-600"><span>Prezzo originale</span><span className="tabular-nums">{money(order.subtotal)}</span></div>
          <div className="flex justify-between font-semibold text-brand-700"><span>Risparmio</span><span className="tabular-nums">−{money(order.discount + order.voucherValue)}</span></div>
          {order.fee > 0 && <div className="flex justify-between text-ink-600"><span>Consegna</span><span className="tabular-nums">{money(order.fee)}</span></div>}
          <div className="flex justify-between font-extrabold text-ink-900"><span>Totale</span><span className="tabular-nums">{money(order.total)}</span></div>
        </div>
      </div>
    </section>
  );
}
