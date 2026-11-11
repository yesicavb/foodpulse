"use client";

import { CheckCircle2, ShieldAlert } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { getConsent, setConsent } from "@/lib/analytics";
import { ChipGroup, FavoriteButton, Toggle } from "@/components/ui/Controls";
import { FoodArt } from "@/components/ui/FoodArt";
import { CAMPAIGNS } from "@/data/campaigns";
import { freshById } from "@/data/products";
import { CATEGORIES, CATEGORY_ORDER, INTEREST_LABEL } from "@/data/config";
import { AGE_RANGES, ALLERGENS, DAYS, DIETS, FAVORITES, FREQUENCIES, GOALS, INTERESTS, KIDS_AGES, PETS, PRIORITIES, SHOPPING_FOR, WEEKLY_SPEND } from "@/data/options";
import type { Allergen, CategoryId, Interest, Profile } from "@/lib/types";
import { useApp } from "@/store/AppStore";

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
const opts = (xs: string[]) => xs.map((x) => ({ id: x, label: x }));

function Block({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="card space-y-3 p-4">
      <div>
        <h3 className="text-[15px] font-bold text-ink-900">{title}</h3>
        {hint && <p className="mt-0.5 text-[12.5px] leading-snug text-ink-500">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Single({ options, value, onChange, label }: { options: string[]; value: string; onChange: (v: string) => void; label: string }) {
  return <ChipGroup options={opts(options)} value={value ? [value] : []} onToggle={(v) => onChange(v === value ? "" : v)} label={label} />;
}

export function Saved() {
  return (
    <p className="flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-brand-700">
      <CheckCircle2 size={14} /> Le modifiche vengono salvate automaticamente e aggiornano lo Smart Basket
    </p>
  );
}

function useProfile(): [Profile, (patch: Partial<Profile>) => void] {
  const { data, updateProfile } = useApp();
  return [data!.profile, updateProfile];
}

export function PersonalSection() {
  const [p, set] = useProfile();
  return (
    <div className="space-y-3">
      <Block title="Chi sei">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="pf-first" className="field-label">Nome</label>
            <input id="pf-first" className="input" value={p.firstName} onChange={(e) => set({ firstName: e.target.value })} autoComplete="given-name" />
          </div>
          <div>
            <label htmlFor="pf-last" className="field-label">Cognome</label>
            <input id="pf-last" className="input" value={p.lastName} onChange={(e) => set({ lastName: e.target.value })} autoComplete="family-name" />
          </div>
        </div>
        <p className="field-label mb-0">Fascia d&apos;età</p>
        <Single options={AGE_RANGES} value={p.ageRange} onChange={(v) => set({ ageRange: v })} label="Fascia d'età" />
        <div>
          <label htmlFor="pf-address" className="field-label">Indirizzo (per la consegna a domicilio)</label>
          <input id="pf-address" className="input" value={p.address} onChange={(e) => set({ address: e.target.value })} autoComplete="street-address" placeholder="Via, numero civico, città" />
        </div>
      </Block>
      <Block title="Famiglia" hint="Serve a suggerire quantità adatte a quante persone mangiano a casa.">
        <p className="field-label mb-0">Per chi fai normalmente la spesa?</p>
        <Single options={SHOPPING_FOR} value={p.shoppingFor} onChange={(v) => set({ shoppingFor: v })} label="Per chi fai la spesa" />
        <div>
          <p className="field-label">Componenti del nucleo familiare</p>
          <div role="radiogroup" aria-label="Componenti del nucleo familiare" className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={p.householdSize === n} onClick={() => set({ householdSize: p.householdSize === n ? null : n })} className={`chip w-12 justify-center ${p.householdSize === n ? "chip-on" : ""}`}>
                {n === 6 ? "6+" : n}
              </button>
            ))}
          </div>
        </div>
        <p className="field-label mb-0">Ci sono bambini?</p>
        <Single options={["Sì", "No"]} value={p.hasKids === "si" ? "Sì" : p.hasKids === "no" ? "No" : ""} onChange={(v) => set({ hasKids: v === "Sì" ? "si" : v === "No" ? "no" : "", kidsAges: v === "Sì" ? p.kidsAges : [] })} label="Presenza di bambini" />
        {p.hasKids === "si" && (
          <>
            <p className="field-label mb-0">Fascia d&apos;età dei bambini</p>
            <ChipGroup options={opts(KIDS_AGES)} value={p.kidsAges} onToggle={(v) => set({ kidsAges: toggle(p.kidsAges, v) })} label="Età dei bambini" />
          </>
        )}
        <p className="field-label mb-0">Animali domestici</p>
        <ChipGroup options={opts(PETS)} value={p.pets} onToggle={(v) => set({ pets: toggle(p.pets, v) })} label="Animali domestici" />
      </Block>
      <Saved />
    </div>
  );
}

export function InterestsSection() {
  const [p, set] = useProfile();
  return (
    <div className="space-y-3">
      <Block title="Interessi e stile di vita" hint="Scegli tutto ciò che ti rappresenta. Influenza i suggerimenti e, solo con il tuo consenso, i prodotti sponsorizzati.">
        <div role="group" aria-label="Interessi" className="grid grid-cols-2 gap-2">
          {INTERESTS.map((i: Interest) => {
            const on = p.interests.includes(i);
            return (
              <button key={i} type="button" aria-pressed={on} onClick={() => set({ interests: toggle(p.interests, i) })} className={`flex min-h-[56px] items-center gap-2 rounded-2xl border-2 px-3 text-left text-[13.5px] font-bold transition ${on ? "border-brand-600 bg-brand-50 text-brand-900" : "border-ink-100 bg-white text-ink-700 hover:border-ink-200"}`}>
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-brand-600 bg-brand-600" : "border-ink-300"}`}>
                  {on && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
                {INTEREST_LABEL[i]}
              </button>
            );
          })}
        </div>
      </Block>
      <Saved />
    </div>
  );
}

export function DietSection() {
  const [p, set] = useProfile();
  return (
    <div className="space-y-3">
      <Block title="Alimentazione">
        <ChipGroup options={DIETS} value={p.diet ? [p.diet] : []} onToggle={(v) => set({ diet: v === p.diet ? "" : v })} label="Regime alimentare" />
        {(p.diet === "vegetariana" || p.diet === "vegana" || p.diet === "pescetariana") && (
          <p className="text-[12.5px] text-brand-800">Lo Smart Basket escluderà i prodotti non adatti alla tua alimentazione.</p>
        )}
      </Block>
      <Block title="Prodotti preferiti">
        <ChipGroup options={opts(FAVORITES)} value={p.favorites} onToggle={(v) => set({ favorites: toggle(p.favorites, v) })} label="Prodotti preferiti" />
      </Block>
      <SavedProducts />
      <Block title="Alimenti non graditi" hint="Separali con una virgola, ad esempio: zucchine, salsiccia.">
        <label htmlFor="pf-disliked" className="sr-only">Alimenti non graditi</label>
        <textarea id="pf-disliked" className="input min-h-[80px]" value={p.disliked} onChange={(e) => set({ disliked: e.target.value })} />
      </Block>
      <Saved />
    </div>
  );
}

export function HabitsSection() {
  const [p, set] = useProfile();
  return (
    <div className="space-y-3">
      <Block title="Quanto spesso fai la spesa?">
        <Single options={FREQUENCIES} value={p.frequency} onChange={(v) => set({ frequency: v })} label="Frequenza della spesa" />
      </Block>
      <Block title="Quali giorni preferisci?">
        <ChipGroup options={opts(DAYS)} value={p.days} onToggle={(v) => set({ days: toggle(p.days, v) })} label="Giorni preferiti" />
      </Block>
      <Block title="Quanto spendi mediamente a settimana?">
        <Single options={WEEKLY_SPEND} value={p.weeklySpend} onChange={(v) => set({ weeklySpend: v })} label="Spesa settimanale" />
      </Block>
      <Block title="Quali reparti acquisti di più?">
        <ChipGroup
          options={CATEGORY_ORDER.map((c) => ({ id: c, label: CATEGORIES[c].label }))}
          value={p.departments}
          onToggle={(v: CategoryId) => set({ departments: toggle(p.departments, v) })}
          label="Reparti più acquistati"
        />
      </Block>
      <Block title="Quanto ti interessano le offerte?">
        <div role="radiogroup" aria-label="Interesse per le offerte" className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={p.offersInterest === n} onClick={() => set({ offersInterest: n })} className={`chip justify-center ${p.offersInterest === n ? "chip-on" : ""}`}>
              {n}
            </button>
          ))}
        </div>
        <p className="flex justify-between text-[12px] text-ink-500"><span>Poco</span><span>Moltissimo</span></p>
      </Block>
      <Block title="Cosa cerchi principalmente?">
        <Single options={PRIORITIES} value={p.priority} onChange={(v) => set({ priority: v })} label="Priorità" />
      </Block>
      <Saved />
    </div>
  );
}

export function GoalsSection() {
  const [p, set] = useProfile();
  return (
    <div className="space-y-3">
      <Block title="Budget medio settimanale" hint="Lo Smart Basket tiene la lista dei freschi entro circa il 60% del budget.">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={20}
            max={300}
            step={5}
            value={p.budget ?? 80}
            onChange={(e) => set({ budget: Number(e.target.value) })}
            aria-label="Budget settimanale in euro"
            className="flex-1 accent-brand-600"
          />
          <span className="w-20 text-right text-[18px] font-extrabold tabular-nums text-ink-900">{p.budget ? `${p.budget} €` : "—"}</span>
        </div>
        {!p.budget && <p className="text-[12.5px] text-ink-500">Sposta il cursore per impostare il budget.</p>}
      </Block>
      <Block title="I tuoi obiettivi">
        <div className="grid gap-1">
          {GOALS.map((g) => (
            <Toggle key={g.id} checked={p.goals.includes(g.id)} onChange={() => set({ goals: toggle(p.goals, g.id) })} label={g.label} />
          ))}
        </div>
      </Block>
      <Saved />
    </div>
  );
}

export function HealthSection() {
  const [p, set] = useProfile();
  const h = p.health;
  return (
    <div className="space-y-3">
      <div className="flex gap-3 rounded-2xl bg-sand p-4 text-[13px] leading-relaxed text-ink-700">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-brand-700" />
        <p>
          Sezione facoltativa e separata. Queste informazioni servono solo a <strong>escludere</strong> prodotti dai tuoi suggerimenti. Non vengono mai usate per la
          pubblicità e non sono condivise con brand o supermercati.
        </p>
      </div>
      <Block title="Consenso al trattamento">
        <Toggle
          checked={h.consent}
          onChange={(v) => set({ health: v ? { ...h, consent: true } : { allergens: [], notes: "", consent: false } })}
          label="Autorizzo FOODPULSE a usare questi dati per filtrare i suggerimenti"
          description="Se lo disattivi, allergeni e note vengono cancellati."
        />
      </Block>
      {h.consent && (
        <>
          <Block title="Allergeni da evitare">
            <ChipGroup options={ALLERGENS} value={h.allergens} onToggle={(v: Allergen) => set({ health: { ...h, allergens: toggle(h.allergens, v) } })} label="Allergeni" />
          </Block>
          <Block title="Altre esigenze" hint="Ad esempio: poco sale, porzioni piccole.">
            <label htmlFor="pf-health-notes" className="sr-only">Altre esigenze</label>
            <textarea id="pf-health-notes" className="input min-h-[80px]" value={h.notes} onChange={(e) => set({ health: { ...h, notes: e.target.value } })} />
          </Block>
        </>
      )}
      <Saved />
    </div>
  );
}

export function NotificationsSection() {
  const [p, set] = useProfile();
  const n = p.notifications;
  const setN = (k: keyof Profile["notifications"]) => (v: boolean) => set({ notifications: { ...n, [k]: v } });
  return (
    <div className="space-y-3">
      <Block title="Notifiche">
        <div className="divide-y divide-ink-100">
          <Toggle checked={n.orders} onChange={setN("orders")} label="Prenotazioni" description="Conferme, promemoria del ritiro e QR code." />
          <Toggle checked={n.reminders} onChange={setN("reminders")} label="Promemoria della spesa" description="Nel giorno che preferisci." />
          <Toggle checked={n.suggestions} onChange={setN("suggestions")} label="Suggerimenti sui prodotti" />
          <Toggle checked={n.promos} onChange={setN("promos")} label="Promozioni del supermercato" />
        </div>
      </Block>
      <Block title="Privacy e consensi commerciali" hint="Consensi separati e revocabili in qualsiasi momento.">
        <div className="divide-y divide-ink-100">
          <Toggle
            checked={n.adsPersonalized}
            onChange={setN("adsPersonalized")}
            label="Pubblicità personalizzata"
            description="Prodotti sponsorizzati scelti in base a interessi e acquisti. I brand non ricevono i tuoi dati. Senza consenso vedi solo promozioni generiche."
          />
          <Toggle checked={n.marketing} onChange={setN("marketing")} label="Comunicazioni commerciali" description="Newsletter e offerte via email." />
          <AnalyticsToggle />
        </div>
      </Block>
      <Saved />
    </div>
  );
}

/** Consent for Google Analytics: kept in this browser, same choice as the cookie banner */
function AnalyticsToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(getConsent() === "granted"), []);
  return (
    <Toggle
      checked={on}
      onChange={(v) => {
        setConsent(v ? "granted" : "denied");
        setOn(v);
      }}
      label="Statistiche anonime di utilizzo"
      description="Google Analytics conta in forma anonima come viene usata l'app, per migliorarla. Nessun nome, email o indirizzo viene condiviso. Vale per questo dispositivo."
    />
  );
}

/** Products saved with the heart on the product cards */
function SavedProducts() {
  const [p] = useProfile();
  const ids = p.favoriteProducts ?? [];
  const items = ids
    .map((id) => {
      const f = freshById(id);
      if (f) return { id, name: f.name, detail: f.unit };
      const c = CAMPAIGNS.find((x) => x.id === id);
      return c ? { id, name: c.product, detail: c.brand } : null;
    })
    .filter((x): x is { id: string; name: string; detail: string } => !!x);
  return (
    <Block title="I tuoi preferiti" hint="Tocca il cuore su un prodotto per salvarlo qui. Lo Smart Basket te lo proporrà più spesso.">
      {items.length === 0 ? (
        <p className="text-[13px] text-ink-500">Nessun prodotto salvato.</p>
      ) : (
        <ul className="grid gap-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-3 rounded-2xl bg-cream p-2">
              <FoodArt id={it.id} size={44} />
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block text-[14px] font-semibold text-ink-900">{it.name}</span>
                <span className="text-[12px] text-ink-500">{it.detail}</span>
              </span>
              <FavoriteButton id={it.id} />
            </li>
          ))}
        </ul>
      )}
    </Block>
  );
}
