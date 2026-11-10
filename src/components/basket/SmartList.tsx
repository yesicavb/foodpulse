"use client";

import { Check, Info, ListPlus, RefreshCw, ShoppingCart, Sparkles, X } from "lucide-react";
import { useMemo } from "react";
import { FavoriteButton, QtyStepper, SectionTitle } from "@/components/ui/Controls";
import { ProductArt } from "@/components/ui/FoodArt";
import { CATEGORIES, INTEREST_LABEL } from "@/data/config";
import { freshById, shelfById } from "@/data/products";
import { money } from "@/lib/format";
import { priceInfo, shelfPrice } from "@/lib/pricing";
import { completion, householdOf, weeklyBudgetOf } from "@/lib/profile";
import { buildSmartList } from "@/lib/smartBasket";
import { useApp } from "@/store/AppStore";

/** AREA B – the personalized shopping list */
export function SmartList() {
  const { data, store, addToCart, addToList, dismissSuggestion, setSuggestionQty, regenerate, setTab, setProfileView, notify } = useApp();

  const suggestions = useMemo(
    () => (data && store ? buildSmartList(data.profile, data.history, store, data.basket.seed) : []),
    [data, store]
  );
  if (!data || !store) return null;

  const visible = suggestions.filter((s) => !data.basket.dismissed.includes(s.id));
  const inCart = new Set(data.cart.map((l) => l.productId));
  const inList = new Set(data.list.map((l) => l.id));
  const p = data.profile;
  const hh = householdOf(p);
  const comp = completion(p).pct;
  const freshPending = visible.filter((s) => s.kind === "fresh" && !inCart.has(s.id));

  return (
    <section aria-labelledby="smart-title" className="space-y-3">
      <SectionTitle
        eyebrow="Smart Basket"
        title="La tua spesa intelligente"
        subtitle="Abbiamo preparato una lista per te sulla base dei tuoi acquisti e delle tue preferenze."
      />

      <div className="flex flex-wrap gap-2">
        <span className="chip min-h-[34px] cursor-default">{hh === 1 ? "Per 1 persona" : `Per ${hh} persone`}</span>
        <span className="chip min-h-[34px] cursor-default">Budget {money(weeklyBudgetOf(p)).replace(",00", "")}/sett.</span>
        {p.diet && <span className="chip min-h-[34px] cursor-default capitalize">{p.diet}</span>}
        {p.interests.slice(0, 2).map((i) => (
          <span key={i} className="chip min-h-[34px] cursor-default">
            {INTEREST_LABEL[i]}
          </span>
        ))}
      </div>

      {comp < 60 && (
        <button
          type="button"
          onClick={() => {
            setTab("profile");
            setProfileView("home");
          }}
          className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50 p-3 text-left"
        >
          <Sparkles size={18} className="shrink-0 text-brand-600" />
          <span className="flex-1 text-[13px] leading-snug text-brand-900">
            <strong>Profilo completo al {comp}%.</strong> Dicci per chi fai la spesa e cosa ti piace: la lista diventa più precisa.
          </span>
          <span className="text-[12px] font-bold text-brand-700">Completa</span>
        </button>
      )}

      <div className="grid gap-2.5">
        {visible.map((s) => {
          const qty = data.basket.qty[s.id] ?? s.qty;
          if (s.kind === "fresh") {
            const prod = freshById(s.id);
            if (!prod) return null;
            const pi = priceInfo(prod, store, data.advance);
            const cat = CATEGORIES[prod.category];
            const added = inCart.has(s.id);
            return (
              <article key={s.id} className="card animate-rise p-3.5">
                <div className="flex gap-3">
                  <ProductArt id={prod.id} size={84} label={prod.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <span className="badge mt-1 bg-brand-400 px-2.5 py-1 text-white">Prenotabile −{pi.pct}%</span>
                      <div className="-mr-1.5 -mt-1 flex">
                        <button type="button" onClick={() => dismissSuggestion(s.id)} aria-label={`Elimina ${prod.name} dalla lista`} className="grid h-9 w-9 place-items-center rounded-full text-ink-400 hover:bg-ink-100">
                          <X size={16} />
                        </button>
                        <FavoriteButton id={prod.id} />
                      </div>
                    </div>
                    <h3 className="mt-1 text-[15.5px] font-bold leading-tight text-ink-900">{prod.name}</h3>
                    <p className="text-[12.5px] text-ink-500">{prod.unit} · {cat.label}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11.5px] font-medium text-brand-500">
                      <Sparkles size={12} className="shrink-0" aria-hidden="true" /> {s.reason}
                    </p>
                  </div>
                </div>
                {/* wraps onto two lines on narrow phones (360 px) instead of overflowing the screen */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
                  <div className="min-w-0 leading-tight">
                    <span className="text-[19px] font-bold tabular-nums text-ink-900">{money(pi.final * qty)}</span>
                    <span className="ml-1.5 text-[13px] tabular-nums text-ink-400 line-through">{money(pi.price * qty)}</span>
                    <span className="block text-[11px] text-ink-500">Quantità suggerita: {s.qty}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {added ? (
                      <button type="button" onClick={() => setTab("cart")} className="btn btn-sm rounded-full bg-brand-50 text-brand-600">
                        <Check size={15} /> Nel carrello
                      </button>
                    ) : (
                      <>
                        <QtyStepper value={qty} min={1} onChange={(n) => setSuggestionQty(s.id, n)} label={prod.name} />
                        <button
                          type="button"
                          onClick={() => {
                            addToCart(s.id, qty);
                            notify(`${prod.name} aggiunto al carrello`);
                          }}
                          className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-white shadow-card transition hover:bg-brand-700 active:scale-95"
                          aria-label={`Aggiungi ${prod.name} al carrello`}
                          title="Aggiungi"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          }
          const prod = shelfById(s.id);
          if (!prod) return null;
          const added = inList.has(s.id);
          return (
            <article key={s.id} className="card animate-rise border-dashed border-ink-200 bg-cream/60 p-3.5">
              <div className="flex gap-3">
                <ProductArt id={prod.id} size={72} label={prod.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="badge bg-ink-100 text-ink-700">Da scaffale · non prenotabile</span>
                      <h3 className="mt-1 text-[15px] font-bold leading-tight text-ink-900">{prod.name}</h3>
                      <p className="text-[12px] text-ink-500">{prod.aisle}</p>
                    </div>
                    <button type="button" onClick={() => dismissSuggestion(s.id)} aria-label={`Elimina ${prod.name} dalla lista`} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-400 hover:bg-ink-100">
                      <X size={16} />
                    </button>
                  </div>
                  <p className="mt-1.5 flex items-center gap-1 text-[12px] font-semibold text-ink-600">
                    <Sparkles size={12} className="shrink-0" /> {s.reason}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-[14px] font-bold tabular-nums text-ink-800">
                  {money(shelfPrice(prod, store))} <span className="text-[11px] font-medium text-ink-500">prezzo a scaffale</span>
                </span>
                {added ? (
                  <span className="btn-sm btn bg-ink-100 text-ink-700">
                    <Check size={15} /> In lista
                  </span>
                ) : (
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => {
                      addToList({ id: prod.id, kind: "shelf", name: `${qty > 1 ? `${qty}× ` : ""}${prod.name}`, detail: prod.aisle });
                      notify("Aggiunto alla lista per il negozio");
                    }}
                  >
                    <ListPlus size={15} /> Alla lista
                  </button>
                )}
              </div>
            </article>
          );
        })}
        {visible.length === 0 && (
          <div className="card p-5 text-center text-[14px] text-ink-500">
            Hai eliminato tutti i suggerimenti. Rigenera la lista o scegli tra i freschi qui sotto.
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="btn-secondary" onClick={() => { regenerate(); notify("Lista rigenerata"); }}>
          <RefreshCw size={16} /> Rigenera lista
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={freshPending.length === 0}
          onClick={() => {
            freshPending.forEach((s) => addToCart(s.id, data.basket.qty[s.id] ?? s.qty));
            notify(`${freshPending.length} freschi aggiunti al carrello`);
          }}
        >
          <ShoppingCart size={16} /> Aggiungi i freschi
        </button>
      </div>
      <p className="flex items-start gap-1.5 text-[11.5px] leading-snug text-ink-500">
        <Info size={13} className="mt-0.5 shrink-0" /> Suggerimenti calcolati con regole su storico acquisti, profilo, budget e disponibilità del punto vendita. Nessun
        acquisto è automatico: aggiungi tu ciò che vuoi.
      </p>
    </section>
  );
}
