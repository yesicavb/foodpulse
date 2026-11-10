"use client";

import { ChevronLeft, ChevronRight, Clock, Percent, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { FavoriteButton, QtyStepper, SectionTitle } from "@/components/ui/Controls";
import { FoodArt, ProductArt } from "@/components/ui/FoodArt";
import { CATEGORIES, CATEGORY_ORDER, MAX_DISCOUNT_PCT } from "@/data/config";
import { formatDayShort, money } from "@/lib/format";
import { availableFresh, priceInfo, stockFor } from "@/lib/pricing";
import type { CategoryId } from "@/lib/types";
import { pickupDateFor, useApp } from "@/store/AppStore";
import { AdvanceSelector } from "./AdvanceSelector";

/**
 * AREA C – browse and book more fresh products from the selected store.
 * Departments are shown as picture tiles; tapping one (or searching) lists its products.
 */
export function FreshCatalog() {
  const { data, store, addToCart, setCartQty, notify } = useApp();
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [q, setQ] = useState("");

  const products = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s && !cat) return [];
    return availableFresh(store).filter((p) => (s ? `${p.name} ${p.desc}`.toLowerCase().includes(s) : p.category === cat));
  }, [store, cat, q]);

  if (!data || !store) return null;
  const qtyOf = (id: string) => data.cart.find((l) => l.productId === id)?.qty ?? 0;
  const countIn = (c: CategoryId) => availableFresh(store).filter((p) => p.category === c).length;
  const showList = !!q.trim() || !!cat;

  return (
    <section id="aggiungi-freschi" aria-labelledby="fresh-title" className="scroll-mt-20 space-y-3">
      <SectionTitle title="Aggiungi altri freschi" subtitle={`Prodotti freschi e freschissimi di ${store.name}. Prenoti solo quello che vuoi.`} />

      <label htmlFor="fresh-search" className="relative block">
        <span className="sr-only">Cerca tra i freschi</span>
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        <input id="fresh-search" className="input rounded-full border-brand-100 pl-11" placeholder="Cerca pane, salmone, mozzarella…" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>

      {!showList && (
        <div role="group" aria-label="Reparti" className="grid grid-cols-2 gap-3">
          {CATEGORY_ORDER.filter((c) => countIn(c) > 0).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`group flex min-h-[124px] flex-col justify-between rounded-3xl p-3 text-left transition hover:brightness-[0.98] active:scale-[0.98] ${CATEGORIES[c].tile}`}
            >
              <FoodArt id={c} size={74} className="mx-auto transition group-hover:scale-105" />
              <span className="flex items-center justify-between gap-1 text-[14.5px] font-semibold leading-tight text-ink-900">
                {CATEGORIES[c].label}
                <ChevronRight size={18} className="shrink-0" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      )}

      {showList && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-[16px] font-bold text-ink-900">
              {cat && !q.trim() && <FoodArt id={cat} size={34} />}
              {q.trim() ? `“${q.trim()}”` : cat ? CATEGORIES[cat].label : ""}
            </h3>
            <button
              type="button"
              onClick={() => {
                setCat(null);
                setQ("");
              }}
              className="btn btn-sm rounded-full text-brand-600 hover:bg-brand-50"
            >
              <ChevronLeft size={16} /> Tutti i reparti
            </button>
          </div>

          {products.map((p) => {
            const pi = priceInfo(p, store, data.advance);
            const qty = qtyOf(p.id);
            const stock = stockFor(p, store);
            return (
              <article key={p.id} className="card animate-rise p-3.5">
                <div className="flex gap-3">
                  <ProductArt id={p.id} size={80} label={p.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <span className="badge mt-1 bg-brand-400 px-2.5 py-1 text-white">Prenotabile −{pi.pct}%</span>
                      <FavoriteButton id={p.id} className="-mr-1.5 -mt-1" />
                    </div>
                    <h4 className="mt-1 text-[15px] font-bold leading-tight text-ink-900">{p.name}</h4>
                    <p className="text-[12px] text-ink-500">
                      {p.unit} · {stock} disponibili
                    </p>
                    <p suppressHydrationWarning className="mt-0.5 flex items-center gap-1 text-[11.5px] font-medium text-brand-500">
                      <Clock size={11} aria-hidden="true" /> Ritiro {formatDayShort(pickupDateFor(data.advance))}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
                  <p className="leading-tight">
                    <span className="text-[19px] font-bold tabular-nums text-ink-900">{money(pi.final)}</span>
                    <span className="ml-1.5 text-[13px] tabular-nums text-ink-400 line-through">{money(pi.price)}</span>
                  </p>
                  {qty > 0 ? (
                    <QtyStepper value={qty} max={stock} onChange={(n) => setCartQty(p.id, n)} label={p.name} />
                  ) : (
                    <button
                      type="button"
                      className="btn-primary btn-sm px-4"
                      onClick={() => {
                        addToCart(p.id);
                        notify(`${p.name} aggiunto al carrello`);
                      }}
                      aria-label={`Prenota ${p.name}`}
                    >
                      <Plus size={15} /> Prenota
                    </button>
                  )}
                </div>
              </article>
            );
          })}
          {products.length === 0 && <p className="card p-5 text-center text-sm text-ink-500">Nessun prodotto trovato in questo reparto.</p>}
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl bg-accent p-4 text-white shadow-card">
        <p className="max-w-[16ch] text-[18px] font-semibold leading-snug">
          Prenota in anticipo e risparmia fino al {MAX_DISCOUNT_PCT}%
        </p>
        <span className="absolute right-4 top-1/2 grid h-14 w-14 -translate-y-1/2 rotate-12 place-items-center rounded-2xl bg-white text-accent shadow-card" aria-hidden="true">
          <Percent size={28} strokeWidth={2.6} />
        </span>
      </div>
      <AdvanceSelector />
    </section>
  );
}
