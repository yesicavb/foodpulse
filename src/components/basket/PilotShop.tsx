"use client";

import { ArrowRight, Check, Info, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { QtyStepper } from "@/components/ui/Controls";
import { ProductArt } from "@/components/ui/FoodArt";
import { MAX_WEIGHT_UNITS, kgLabel } from "@/data/pilot";
import { money } from "@/lib/format";
import { availableFresh, priceInfo } from "@/lib/pricing";
import type { FreshProduct } from "@/lib/types";
import { useApp } from "@/store/AppStore";

/** PILOT: the partner shop's own catalogue, sold by weight in steps of 100 g */
export function PilotShop() {
  const { data, store, setTab } = useApp();
  if (!data || !store) return null;
  const products = availableFresh(store);
  return (
    <section aria-labelledby="pilot-title" className="space-y-3">
      <div>
        <p className="eyebrow">{store.name}</p>
        <h2 id="pilot-title" className="text-[20px] font-bold leading-tight text-ink-900">Prenota i prodotti del negozio</h2>
        <p className="mt-1 text-[13.5px] leading-snug text-ink-600">Scegli quanto ne vuoi, a partire da 100 g. Prenotando prima risparmi fino al 15%.</p>
      </div>
      {products.length === 0 ? (
        <p className="card p-5 text-center text-[14px] text-ink-500">Il catalogo di questo negozio arriva a breve.</p>
      ) : (
        <ul className="grid gap-2.5">
          {products.map((p) => (
            <li key={p.id}>
              <PilotProduct product={p} />
            </li>
          ))}
        </ul>
      )}
      {products.length > 0 && (
        <button type="button" className="btn-secondary h-11 w-full" onClick={() => setTab("cart")}>
          Vai al carrello <ArrowRight size={16} aria-hidden="true" />
        </button>
      )}
      <p className="flex items-start gap-1.5 text-[11.5px] leading-snug text-ink-500">
        <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" /> Prezzi del negozio al kg. Il peso finale può variare leggermente: paghi al ritiro.
      </p>
    </section>
  );
}

function PilotProduct({ product: p }: { product: FreshProduct }) {
  const { data, store, addToCart, setCartQty, notify } = useApp();
  const [units, setUnits] = useState(3);
  if (!data || !store) return null;
  const pi = priceInfo(p, store, data.advance);
  const inCart = data.cart.find((l) => l.productId === p.id);
  const qty = inCart?.qty ?? units;
  return (
    <article className="card p-3.5">
      <div className="flex gap-3">
        <ProductArt id={p.id} size={76} label={p.name} />
        <div className="min-w-0 flex-1">
          {pi.pct > 0 && <span className="badge bg-brand-400 text-white">Prenotabile −{pi.pct}%</span>}
          <h3 className="mt-1 text-[15.5px] font-bold leading-tight text-ink-900">{p.name}</h3>
          <p className="text-[12.5px] text-ink-500">{p.desc}</p>
          <p className="mt-1 text-[13px] tabular-nums text-ink-700">
            <strong className="text-ink-900">{money(pi.final * 10)}/kg</strong>
            {pi.pct > 0 && <span className="ml-1.5 text-ink-400 line-through">{money(pi.price * 10)}/kg</span>}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[18px] font-bold tabular-nums text-ink-900">{money(pi.final * qty)}</span>
        <div className="flex items-center gap-2">
          <QtyStepper
            value={qty}
            min={inCart ? 0 : 1}
            max={MAX_WEIGHT_UNITS}
            format={kgLabel}
            label={p.name}
            onChange={(n) => (inCart ? setCartQty(p.id, n) : setUnits(Math.max(1, n)))}
          />
          {inCart ? (
            <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600" aria-label="Nel carrello">
              <Check size={20} />
            </span>
          ) : (
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white hover:bg-brand-700"
              aria-label={`Aggiungi ${p.name} al carrello`}
              onClick={() => {
                addToCart(p.id, units);
                notify(`${p.name} · ${kgLabel(units)} aggiunto al carrello`);
              }}
            >
              <ShoppingCart size={19} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
