"use client";

import { AlertCircle, ArrowRight, CheckSquare, ChevronRight, Leaf, ListChecks, Plus, Square, Trash2 } from "lucide-react";
import { useState } from "react";
import { QtyStepper, SectionTitle } from "@/components/ui/Controls";
import { BasketHero, FoodArt, ProductArt } from "@/components/ui/FoodArt";
import { freshById } from "@/data/products";
import { money } from "@/lib/format";
import { cartTotals, isAvailable } from "@/lib/pricing";
import { useApp } from "@/store/AppStore";
import { AdvanceSelector } from "@/components/basket/AdvanceSelector";
import { CheckoutSheet } from "./CheckoutSheet";

export function CartScreen() {
  const { data, store, setCartQty, setTab, toggleListItem, removeListItem } = useApp();
  const [checkout, setCheckout] = useState(false);
  if (!data) return null;
  const t = cartTotals(data.cart, store, data.advance);
  const unavailable = data.cart.filter((l) => !isAvailable(l.productId, store));

  const goAdd = () => {
    setTab("basket");
    setTimeout(() => document.getElementById("aggiungi-freschi")?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  return (
    <div className="space-y-5">
      {t.lines.length === 0 ? (
        <div className="flex animate-rise flex-col items-center pt-4 text-center">
          <BasketHero size={190} />
          <h1 className="mt-4 max-w-[14ch] text-[26px] font-bold leading-tight tracking-tight text-ink-900">Il tuo carrello è ancora vuoto</h1>
          <p className="mt-2 max-w-[30ch] text-[14.5px] leading-relaxed text-ink-600">
            {store ? "Aggiungi i tuoi prodotti preferiti o scopri la tua spesa intelligente generata dall'AI." : "Scegli un supermercato nello Smart Basket per iniziare."}
          </p>
          <button type="button" className="btn-primary mt-5 h-12 w-full max-w-[320px] text-[15px]" onClick={() => setTab("basket")}>
            Vai allo Smart Basket <ArrowRight size={18} />
          </button>
          {store && (
            <button
              type="button"
              onClick={goAdd}
              className="mt-6 flex w-full items-center gap-3 overflow-hidden rounded-3xl bg-[#FFF1DC] py-2 pl-4 pr-2 text-left transition hover:brightness-[0.98]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-brand-500">
                <Leaf size={18} aria-hidden="true" />
              </span>
              <span className="flex-1 text-[14px] font-semibold leading-snug text-ink-900">Dai uno sguardo ai freschi in promo</span>
              <ChevronRight size={18} className="shrink-0 text-ink-700" aria-hidden="true" />
              <FoodArt id="pomodori" size={62} />
            </button>
          )}
        </div>
      ) : (
        <>
          <SectionTitle eyebrow={store ? store.name : "Nessun supermercato"} title="Il mio carrello" subtitle="Prodotti freschi da prenotare. Lo sconto dipende da quanto in anticipo prenoti." />
          <AdvanceSelector />
          <section aria-label="Prodotti da prenotare" className="grid gap-2.5">
            {t.lines.map((l) => {
              return (
                <article key={l.product.id} className="card flex gap-3 p-3">
                  <ProductArt id={l.product.id} size={64} label={l.product.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-[14.5px] font-bold leading-tight text-ink-900">{l.product.name}</h3>
                        <p className="text-[12px] text-ink-500">
                          {l.product.unit} · {money(l.final)} cad. invece di {money(l.price)}
                        </p>
                      </div>
                      <button type="button" onClick={() => setCartQty(l.product.id, 0)} aria-label={`Elimina ${l.product.name}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-400 hover:bg-ink-100">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <QtyStepper value={l.qty} onChange={(n) => setCartQty(l.product.id, n)} label={l.product.name} />
                      <div className="text-right leading-tight">
                        <span className="badge bg-brand-400 text-white">−{l.pct}%</span>
                        <p className="mt-0.5">
                          <span className="text-[12px] tabular-nums text-ink-400 line-through">{money(l.price * l.qty)}</span>{" "}
                          <span className="text-[17px] font-bold tabular-nums text-ink-900">{money(l.final * l.qty)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <button type="button" onClick={goAdd} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 py-3 text-[14px] font-semibold text-ink-600 hover:border-brand-300 hover:text-brand-700">
            <Plus size={16} /> Aggiungi altri freschi
          </button>

          <section aria-label="Riepilogo" className="card space-y-2 p-4 text-[14px]">
            <div className="flex justify-between text-ink-600">
              <span>Prezzo originale ({t.items} prodotti)</span>
              <span className="tabular-nums">{money(t.subtotal)}</span>
            </div>
            <div className="flex justify-between font-semibold text-brand-700">
              <span>Sconti di prenotazione</span>
              <span className="tabular-nums">−{money(t.discount)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-dashed border-ink-200 pt-2">
              <span className="font-bold text-ink-900">Totale prenotazione</span>
              <span key={t.afterDiscount} className="animate-pop text-[22px] font-extrabold tabular-nums text-ink-900">{money(t.afterDiscount)}</span>
            </div>
            <p className="rounded-xl bg-brand-50 px-3 py-2 text-[13px] font-semibold text-brand-800">Risparmi {money(t.discount)} prenotando in anticipo.</p>
          </section>
        </>
      )}

      {unavailable.length > 0 && store && (
        <p className="flex gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-[13px] text-amber-900">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>
            Non disponibili da {store.name}: <strong>{unavailable.map((l) => freshById(l.productId)?.name).join(", ")}</strong>. Non sono nel totale.{" "}
            <button type="button" className="font-semibold underline" onClick={() => unavailable.forEach((l) => setCartQty(l.productId, 0))}>
              Rimuovi
            </button>
          </span>
        </p>
      )}

      <section aria-labelledby="list-title" className="space-y-2">
        <h2 id="list-title" className="flex items-center gap-2 text-[15px] font-bold text-ink-900">
          <ListChecks size={18} className="text-ink-500" /> Da prendere in negozio
        </h2>
        <p className="text-[12.5px] leading-snug text-ink-500">Prodotti da scaffale e sponsorizzati: non fanno parte della prenotazione e si pagano in cassa.</p>
        {data.list.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-[13px] text-ink-500 ring-1 ring-ink-100">Nessun promemoria. Aggiungili dallo Smart Basket.</p>
        ) : (
          <ul className="card divide-y divide-ink-100">
            {data.list.map((i) => (
              <li key={i.id} className="flex items-center gap-2 px-2 py-1">
                <button type="button" role="checkbox" aria-checked={i.checked} onClick={() => toggleListItem(i.id)} className="flex min-h-[48px] flex-1 items-center gap-3 px-1 text-left">
                  {i.checked ? <CheckSquare size={20} className="shrink-0 text-brand-600" /> : <Square size={20} className="shrink-0 text-ink-400" />}
                  <span className="min-w-0">
                    <span className={`block text-[14px] font-semibold ${i.checked ? "text-ink-400 line-through" : "text-ink-900"}`}>{i.name}</span>
                    <span className="block text-[12px] text-ink-500">
                      {i.kind === "sponsored" && <span className="mr-1 font-bold text-amber-700">Sponsorizzato ·</span>}
                      {i.detail}
                    </span>
                  </span>
                </button>
                <button type="button" onClick={() => removeListItem(i.id)} aria-label={`Rimuovi ${i.name}`} className="grid h-9 w-9 place-items-center rounded-full text-ink-400 hover:bg-ink-100">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {t.lines.length > 0 && (
        <div className="fixed bottom-[76px] left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 pb-2">
          <div className="gutter">
            <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-2.5 pl-4 shadow-float">
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-[18px] font-extrabold tabular-nums text-ink-900">{money(t.afterDiscount)}</p>
                <p className="text-[11.5px] font-semibold text-brand-700">Risparmi {money(t.discount)}</p>
              </div>
              <button type="button" className="btn-primary" onClick={() => setCheckout(true)} disabled={!store}>
                Scegli il ritiro <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      {t.lines.length > 0 && <div className="h-16" aria-hidden="true" />}

      <CheckoutSheet open={checkout} onClose={() => setCheckout(false)} />
    </div>
  );
}
