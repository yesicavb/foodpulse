"use client";

import { Clock, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { QtyStepper, SectionTitle } from "@/components/ui/Controls";
import { ProductIcon } from "@/components/ui/ProductThumb";
import { CATEGORIES, CATEGORY_ORDER } from "@/data/config";
import { formatDayShort, money } from "@/lib/format";
import { availableFresh, priceInfo, stockFor } from "@/lib/pricing";
import type { CategoryId } from "@/lib/types";
import { pickupDateFor, useApp } from "@/store/AppStore";
import { AdvanceSelector } from "./AdvanceSelector";

/** AREA C – browse and book more fresh products from the selected store */
export function FreshCatalog() {
  const { data, store, addToCart, setCartQty, notify } = useApp();
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [q, setQ] = useState("");

  const products = useMemo(() => {
    const s = q.trim().toLowerCase();
    return availableFresh(store).filter((p) => (cat === "all" || p.category === cat) && (!s || `${p.name} ${p.desc}`.toLowerCase().includes(s)));
  }, [store, cat, q]);

  if (!data || !store) return null;
  const qtyOf = (id: string) => data.cart.find((l) => l.productId === id)?.qty ?? 0;

  return (
    <section id="aggiungi-freschi" aria-labelledby="fresh-title" className="scroll-mt-20 space-y-3">
      <SectionTitle eyebrow="Prenota in anticipo" title="Aggiungi altri freschi" subtitle={`Prodotti freschi e freschissimi di ${store.name}. Prenoti solo quello che vuoi.`} />
      <AdvanceSelector />

      <label htmlFor="fresh-search" className="relative block">
        <span className="sr-only">Cerca tra i freschi</span>
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        <input id="fresh-search" className="input pl-10" placeholder="Cerca pane, salmone, mozzarella…" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>

      <div role="group" aria-label="Reparti" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {(["all", ...CATEGORY_ORDER] as const).map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={`chip shrink-0 ${cat === c ? "chip-on" : ""}`}>
            {c === "all" ? "Tutti" : CATEGORIES[c].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {products.map((p) => {
          const pi = priceInfo(p, store, data.advance);
          const c = CATEGORIES[p.category];
          const qty = qtyOf(p.id);
          const stock = stockFor(p, store);
          return (
            <article key={p.id} className="card flex flex-col p-2.5">
              <div className="relative">
                <div role="img" aria-label={p.name} className={`relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-xl ${c.tile} ${c.text}`}>
                  <span className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/50" aria-hidden="true" />
                  <ProductIcon icon={p.icon} size={46} className="relative" />
                </div>
                <span className="badge absolute left-2 top-2 bg-brand-600 text-white">−{pi.pct}%</span>
              </div>
              <h3 className="mt-2 text-[14px] font-bold leading-tight text-ink-900">{p.name}</h3>
              <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-ink-500">{p.desc}</p>
              <p className="mt-1 text-[11.5px] text-ink-500">{p.unit} · {stock} disponibili</p>
              <p suppressHydrationWarning className="mt-0.5 flex items-center gap-1 text-[11.5px] font-semibold text-brand-700">
                <Clock size={11} /> Ritiro {formatDayShort(pickupDateFor(data.advance))}
              </p>
              <div className="mt-auto pt-2">
                <p className="leading-tight">
                  <span className="text-[16px] font-extrabold tabular-nums text-ink-900">{money(pi.final)}</span>
                  <span className="ml-1 text-[11.5px] tabular-nums text-ink-400 line-through">{money(pi.price)}</span>
                </p>
                <div className="mt-2">
                  {qty > 0 ? (
                    <QtyStepper value={qty} max={stock} onChange={(n) => setCartQty(p.id, n)} label={p.name} />
                  ) : (
                    <button
                      type="button"
                      className="btn-primary btn-sm w-full"
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
              </div>
            </article>
          );
        })}
      </div>
      {products.length === 0 && <p className="card p-5 text-center text-sm text-ink-500">Nessun prodotto trovato in questo reparto.</p>}
    </section>
  );
}
