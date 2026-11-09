"use client";

import { Check, Info, ListPlus, MapPin, ShieldCheck, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { SectionTitle, Sheet } from "@/components/ui/Controls";
import { ProductIcon } from "@/components/ui/ProductThumb";
import { rankAds, type RankedAd } from "@/lib/ads";
import { useApp } from "@/store/AppStore";

/** AREA D – products sponsored by CPG brands (retail media) */
export function Sponsored() {
  const { data, store, addToList, notify, setTab, setProfileView } = useApp();
  const [open, setOpen] = useState<RankedAd | null>(null);
  const ranked = useMemo(() => (data && store ? rankAds(data.profile, data.history, store.id) : null), [data, store]);
  if (!data || !store || !ranked) return null;
  const inList = new Set(data.list.map((l) => l.id));

  return (
    <section aria-labelledby="sponsored-title" className="space-y-3">
      <SectionTitle eyebrow="Dal tuo supermercato" title="Scopri altri prodotti per te" subtitle="Prodotti che potrebbero interessarti, disponibili nel tuo supermercato." />

      {!ranked.personalized && (
        <button
          type="button"
          onClick={() => {
            setTab("profile");
            setProfileView("notifications");
          }}
          className="flex w-full items-start gap-2 rounded-2xl bg-white p-3 text-left text-[12.5px] leading-snug text-ink-600 ring-1 ring-ink-200"
        >
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand-600" />
          <span>
            Stai vedendo promozioni <strong>non personalizzate</strong> perché non hai dato il consenso alla pubblicità personalizzata.{" "}
            <span className="font-semibold text-brand-700 underline">Gestisci il consenso</span>
          </span>
        </button>
      )}

      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
        {ranked.items.map((ad) => {
          const c = ad.campaign;
          return (
            <article key={c.id} className="flex w-[232px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-amber-200 bg-white">
              <div className="relative grid h-28 place-items-center bg-amber-50 text-amber-800">
                <ProductIcon icon={c.icon} size={44} />
                <span className="badge absolute left-2.5 top-2.5 bg-ink-900 text-white">SPONSORIZZATO</span>
                {c.promo && <span className="badge absolute bottom-2.5 left-2.5 bg-white text-amber-800 ring-1 ring-amber-200"><Tag size={10} /> {c.promo}</span>}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-500">{c.brand}</p>
                <h3 className="text-[14.5px] font-bold leading-tight text-ink-900">{c.product}</h3>
                <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-ink-500">{c.desc}</p>
                <button type="button" className="btn-secondary btn-sm mt-3" onClick={() => setOpen(ad)}>
                  Scopri il prodotto
                </button>
              </div>
            </article>
          );
        })}
        {ranked.items.length === 0 && (
          <p className="card w-full p-5 text-center text-[13.5px] text-ink-500">Nessuna proposta pertinente in questo punto vendita al momento.</p>
        )}
      </div>
      <p className="flex items-start gap-1.5 text-[11.5px] leading-snug text-ink-500">
        <Info size={13} className="mt-0.5 shrink-0" /> Contenuti sponsorizzati simulati. Non sono prenotabili: li trovi sugli scaffali quando passi a ritirare i freschi.
      </p>

      <Sheet
        open={!!open}
        onClose={() => setOpen(null)}
        title="Prodotto sponsorizzato"
        footer={
          open && (
            <button
              type="button"
              className="btn-primary w-full"
              disabled={inList.has(open.campaign.id)}
              onClick={() => {
                addToList({ id: open.campaign.id, kind: "sponsored", name: open.campaign.product, detail: `${open.campaign.brand} · ${open.campaign.aisle}` });
                notify("Aggiunto alla lista per il negozio");
                setOpen(null);
              }}
            >
              {inList.has(open.campaign.id) ? <><Check size={16} /> Già nella lista per il negozio</> : <><ListPlus size={16} /> Ricordamelo in negozio</>}
            </button>
          )
        }
      >
        {open && (
          <div className="space-y-4">
            <div className="relative grid h-40 place-items-center rounded-2xl bg-amber-50 text-amber-800">
              <ProductIcon icon={open.campaign.icon} size={64} />
              <span className="badge absolute left-3 top-3 bg-ink-900 text-white">SPONSORIZZATO</span>
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-ink-500">{open.campaign.brand} · {open.campaign.packCategory}</p>
              <h3 className="text-[20px] font-extrabold leading-tight text-ink-900">{open.campaign.product}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-600">{open.campaign.desc}</p>
              {open.campaign.promo && <p className="mt-2 inline-flex rounded-lg bg-amber-50 px-2.5 py-1 text-[13px] font-bold text-amber-800">{open.campaign.promo}</p>}
            </div>
            <p className="flex items-center gap-2 rounded-xl bg-white p-3 text-[13.5px] text-ink-700 ring-1 ring-ink-100">
              <MapPin size={16} className="shrink-0 text-brand-600" /> {store.name} · {open.campaign.aisle}
            </p>
            <div className="rounded-xl bg-white p-3 ring-1 ring-ink-100">
              <p className="text-[13px] font-bold text-ink-900">Perché vedo questo prodotto?</p>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-[13px] text-ink-600">
                {open.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
                <li>Disponibile nel punto vendita che hai scelto</li>
                <li>Contenuto sponsorizzato da {open.campaign.brand}</li>
              </ul>
              <p className="mt-2 text-[12px] leading-snug text-ink-500">
                L&apos;abbinamento lo fa FOODPULSE: il brand non riceve il tuo nome, il tuo storico acquisti né i dati sulla salute.
              </p>
            </div>
          </div>
        )}
      </Sheet>
    </section>
  );
}
