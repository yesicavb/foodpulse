"use client";

import { locale } from "@/i18n/lang";
import { ArrowLeft, Check, ChevronDown, ChevronRight, Lock, MapPin, Search, Store as StoreIcon, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { Sheet } from "@/components/ui/Controls";
import { CATEGORIES } from "@/data/config";
import { CITIES, STORES } from "@/data/stores";
import { track } from "@/lib/analytics";
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
  // step 1: choose the city; step 2: choose one of its supermarkets
  const [city, setCity] = useState<string | null>(null);

  const openPicker = () => {
    setCity(store?.city ?? null);
    setQ("");
    setOpen(true);
  };

  const cities = useMemo(() => {
    const s = q.trim().toLowerCase();
    return CITIES.filter((c) => !s || c.toLowerCase().includes(s));
  }, [q]);

  const list = useMemo(() => (city ? STORES.filter((x) => x.city === city).sort((a, b) => a.distanceKm - b.distanceKm) : []), [city]);

  return (
    <section aria-labelledby="store-title" className="overflow-hidden rounded-3xl bg-brand-600 text-white shadow-card">
      <div className="p-4">
        <p id="store-title" className="max-w-[24ch] text-[13px] font-bold uppercase leading-snug tracking-[0.04em] text-brand-300">
          In quale supermercato vuoi fare la spesa?
        </p>
        {store ? (
          <button type="button" onClick={openPicker} className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left text-ink-900 transition hover:bg-brand-50">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
              <StoreIcon size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold leading-snug">{store.name}</span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-500">
                {store.address}, {store.city}
              </span>
            </span>
            <ChevronDown size={20} className="shrink-0 text-ink-700" aria-hidden="true" />
            <span className="sr-only">Cambia</span>
          </button>
        ) : (
          <button type="button" onClick={openPicker} className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl bg-white p-4 text-left text-brand-900">
            <span>
              <span className="block text-[16px] font-bold">Scegli il tuo supermercato</span>
              <span className="text-[13px] text-ink-500">Prodotti, prezzi e servizi dipendono dal punto vendita</span>
            </span>
            <ChevronRight size={20} className="shrink-0" />
          </button>
        )}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={city ? `Supermercati a ${city}` : "In quale città fai la spesa?"}>
        {!city ? (
          <>
            <label htmlFor="city-search" className="relative block">
              <span className="sr-only">Cerca una città</span>
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <input id="city-search" className="input pl-10" placeholder="Cerca la tua città" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
            <div role="list" aria-label="Città" className="mt-4 grid grid-cols-2 gap-2">
              {cities.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="listitem"
                  onClick={() => {
                    setCity(c);
                    setQ("");
                  }}
                  className="card flex items-center gap-2 px-3 py-3 text-left text-[14.5px] font-bold text-ink-900 transition hover:border-ink-200"
                >
                  <MapPin size={16} className="shrink-0 text-brand-600" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{c}</span>
                  <ChevronRight size={16} className="shrink-0 text-ink-400" aria-hidden="true" />
                </button>
              ))}
            </div>
            {cities.length === 0 && (
              <p className="py-8 text-center text-sm text-ink-500">
                La tua città non c&apos;è ancora. Scegli quella più vicina: stiamo aggiungendo nuove città.
              </p>
            )}
          </>
        ) : (
          <>
            <button type="button" onClick={() => setCity(null)} className="mb-3 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-brand-700">
              <ArrowLeft size={16} aria-hidden="true" /> Cambia città
            </button>
            <div role="radiogroup" aria-label="Punti vendita" className="grid gap-3">
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
                      track("store_select", { city: s.city, chain: s.chain });
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
            </div>
          </>
        )}
        <p className="mt-4 text-[11.5px] leading-snug text-ink-500">
          Indirizzi reali dei punti vendita. Nomi delle catene usati a scopo illustrativo, senza integrazioni ufficiali. Orari, prezzi, disponibilità e servizi sono simulati.
        </p>
      </Sheet>
    </section>
  );
}
