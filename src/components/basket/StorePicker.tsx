"use client";

import { locale } from "@/i18n/lang";
import { Check, ChevronRight, Lock, MapPin, Search, Store as StoreIcon, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { Sheet } from "@/components/ui/Controls";
import { CATEGORIES } from "@/data/config";
import { STORES } from "@/data/stores";
import type { CategoryId, Store } from "@/lib/types";
import { useApp } from "@/store/AppStore";

export function ServiceBadges({ store }: { store: Store }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {store.services.instore && (
        <span className="badge bg-brand-50 text-brand-800">
          <StoreIcon size={11} /> Ritiro in negozio
        </span>
      )}
      {store.services.locker && (
        <span className="badge bg-brand-50 text-brand-800">
          <Lock size={11} /> Locker
        </span>
      )}
      {store.services.delivery && (
        <span className="badge bg-brand-50 text-brand-800">
          <Truck size={11} /> Consegna
        </span>
      )}
    </span>
  );
}

/** AREA A – supermarket selection */
export function StorePicker() {
  const { store, setStore, notify } = useApp();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return [...STORES]
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .filter((x) => !s || `${x.name} ${x.address} ${x.city}`.toLowerCase().includes(s));
  }, [q]);

  return (
    <section aria-labelledby="store-title" className="overflow-hidden rounded-3xl bg-brand-800 text-white">
      <div className="p-4">
        <p id="store-title" className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-leaf">
          In quale supermercato vuoi fare la spesa?
        </p>
        {store ? (
          <button type="button" onClick={() => setOpen(true)} className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-white/10 p-3 text-left transition hover:bg-white/15">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-brand-700">
              <StoreIcon size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-bold leading-snug">{store.name}</span>
              <span className="mt-0.5 flex items-start gap-1 text-[12.5px] leading-snug text-white/75">
                <MapPin size={12} className="mt-0.5 shrink-0" /> {store.address}, {store.city} · {store.distanceKm.toLocaleString(locale())} km
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-leaf px-3 py-1.5 text-[12px] font-bold text-brand-900">Cambia</span>
          </button>
        ) : (
          <button type="button" onClick={() => setOpen(true)} className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl bg-white p-4 text-left text-brand-900">
            <span>
              <span className="block text-[16px] font-bold">Scegli il tuo supermercato</span>
              <span className="text-[13px] text-ink-500">Prodotti, prezzi e servizi dipendono dal punto vendita</span>
            </span>
            <ChevronRight size={20} className="shrink-0" />
          </button>
        )}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Scegli il supermercato">
        <label htmlFor="store-search" className="relative block">
          <span className="sr-only">Cerca un punto vendita</span>
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input id="store-search" className="input pl-10" placeholder="Cerca per catena, via o città" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div role="radiogroup" aria-label="Punti vendita" className="mt-4 grid gap-3">
          {list.map((s) => {
            const selected = store?.id === s.id;
            const promos = Object.entries(s.categoryPromos) as [CategoryId, number][];
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setStore(s.id);
                  setOpen(false);
                  notify(`Ora fai la spesa da ${s.name}`);
                }}
                className={`card flex gap-3 p-4 text-left transition ${selected ? "border-2 border-brand-600" : "hover:border-ink-200"}`}
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${selected ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600"}`}>
                  {selected ? <Check size={20} /> : <StoreIcon size={20} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-[15px] font-bold text-ink-900">{s.name}</span>
                    <span className="shrink-0 text-[12px] font-bold tabular-nums text-ink-500">{s.distanceKm.toLocaleString(locale())} km</span>
                  </span>
                  <span className="mt-0.5 block text-[13px] text-ink-500">
                    {s.address}, {s.city} · {s.hours}
                  </span>
                  <span className="mt-2 block">
                    <ServiceBadges store={s} />
                  </span>
                  {promos.length > 0 && (
                    <span className="mt-2 block text-[12px] font-semibold text-brand-700">
                      Promozione: {promos.map(([c, p]) => `−${p}% extra su ${CATEGORIES[c].label.toLowerCase()}`).join(" · ")}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
          {list.length === 0 && <p className="py-8 text-center text-sm text-ink-500">Nessun punto vendita trovato per &ldquo;{q}&rdquo;.</p>}
        </div>
        <p className="mt-4 text-[11.5px] leading-snug text-ink-500">
          Punti vendita dimostrativi: nomi delle catene usati a scopo illustrativo, senza integrazioni ufficiali. Distanze, prezzi e servizi sono simulati.
        </p>
      </Sheet>
    </section>
  );
}
