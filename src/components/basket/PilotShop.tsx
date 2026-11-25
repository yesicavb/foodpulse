"use client";

import { ArrowRight, Check, Info, ListPlus, ShoppingCart, Sparkles, Store as StoreIcon } from "lucide-react";
import { useState } from "react";
import { QtyStepper } from "@/components/ui/Controls";
import { ProductArt } from "@/components/ui/FoodArt";
import { MAX_WEIGHT_UNITS, kgLabel, shopItemsOf, type ShopItem } from "@/data/pilot";
import { money } from "@/lib/format";
import { availableFresh, priceInfo } from "@/lib/pricing";
import type { FreshProduct } from "@/lib/types";
import { useApp } from "@/store/AppStore";

/** PILOT: the partner shop's own catalogue, sold by weight in steps of 100 g */
export function PilotShop() {
  const { data, store, setTab } = useApp();
  if (!data || !store) return null;
  const products = availableFresh(store);
  const inStore = shopItemsOf(store.catalog);
  return (
    <section aria-labelledby="pilot-title" className="space-y-3">
      <div>
        <p className="eyebrow">{store.name}</p>
        <h2 id="pilot-title" className="text-[20px] font-bold leading-tight text-ink-900">Prenota i prodotti del negozio</h2>
        <p className="mt-1 text-[13.5px] leading-snug text-ink-600">Scegli quanto ne vuoi, a partire da 100 g, e ritira quando preferisci.</p>
        <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-[12.5px] font-semibold text-orange-800">
          <Sparkles size={14} className="shrink-0" aria-hidden="true" /> Sconti per chi prenota in anticipo: prossimamente
        </p>
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
      {inStore.length > 0 && (
        <div className="space-y-2.5 pt-3">
          <h3 className="flex items-center gap-1.5 px-1 text-[17px] font-bold text-ink-900">
            <StoreIcon size={17} className="text-ink-500" aria-hidden="true" /> Disponibili in negozio
          </h3>
          <ul className="grid gap-2.5">
            {inStore.map((i) => (
              <li key={i.id}>
                <InStoreItem item={i} />
              </li>
            ))}
          </ul>
        </div>
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

/** A product sold only in the shop: weight (or packs) goes on the shopping list, not in the cart */
function InStoreItem({ item: i }: { item: ShopItem }) {
  const { data, addToList, notify } = useApp();
  const byKg = i.unit === "kg";
  const [n, setN] = useState(byKg ? 3 : 1);
  if (!data) return null;
  const onList = data.list.some((l) => l.id === i.id);
  const amount = byKg ? kgLabel(n) : `${n} ${n === 1 ? "confezione" : "confezioni"}`;
  const estimate = byKg ? (i.price * n) / 10 : i.price * n;
  return (
    <article className="card animate-rise border-dashed border-ink-200 bg-cream/60 p-3.5">
      <div className="flex gap-3">
        <ProductArt id={i.id} size={76} label={i.name} />
        <div className="min-w-0 flex-1">
          <span className="badge bg-ink-100 text-ink-700">Da scaffale · non prenotabile</span>
          <h3 className="mt-1 text-[15.5px] font-bold leading-tight text-ink-900">{i.name}</h3>
          <p className="text-[12.5px] text-ink-500">{byKg ? `${i.desc} · al kg` : `${i.desc} · a confezione`}</p>
        </div>
      </div>
      <p className="mt-2.5 text-[14px] tabular-nums text-ink-500">
        <strong className="text-[16px] text-ink-900">{byKg ? `${money(i.price)}/kg` : money(i.price)}</strong> prezzo in negozio
      </p>
      <div className="mt-2.5">
        {onList ? (
          <span className="flex h-11 items-center justify-center gap-1.5 text-[13.5px] font-semibold text-brand-700">
            <Check size={17} aria-hidden="true" /> Nella tua lista
          </span>
        ) : (
          <div className="grid grid-cols-2 items-center gap-2">
            <QtyStepper value={n} min={1} max={byKg ? MAX_WEIGHT_UNITS : 10} label={i.name} wide onChange={(v) => setN(Math.max(1, v))} {...(byKg ? { format: kgLabel } : {})} />
            <button
              type="button"
              className="btn-secondary h-11 w-full justify-center px-3.5"
              onClick={() => {
                addToList({ id: i.id, kind: "shelf", name: i.name, detail: `${amount} · circa ${money(estimate)} · da prendere in negozio` });
                notify(`${i.name} aggiunto alla lista`);
              }}
            >
              <ListPlus size={17} aria-hidden="true" /> Alla lista
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
