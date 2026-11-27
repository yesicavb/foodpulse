"use client";

import { ArrowLeft, Award, ChevronRight, CircleCheck, CircleDashed, Leaf, LogOut, MessageSquareText, Package, RotateCcw, Store as StoreIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet } from "@/components/ui/Controls";
import { initials, formatInt } from "@/lib/format";
import { levelOf } from "@/lib/loyalty";
import { PROFILE_SECTIONS, completion } from "@/lib/profile";
import { useApp, type ProfileView } from "@/store/AppStore";

/** pilot: sections shown without opening "Altro" */
const PILOT_SECTIONS = ["personal", "health", "notifications"];
import { FeedbacksView, ImpactView, LoyaltyView, OrdersView } from "./Activity";
import { DietSection, GoalsSection, HabitsSection, HealthSection, InterestsSection, NotificationsSection, PersonalSection } from "./ProfileSections";

const TITLES: Record<Exclude<ProfileView, "home">, string> = {
  personal: "Informazioni personali e famiglia",
  interests: "Interessi e stile di vita",
  diet: "Preferenze alimentari",
  habits: "Abitudini di spesa",
  goals: "Budget e obiettivi",
  health: "Esigenze alimentari",
  notifications: "Notifiche e privacy",
  orders: "Ordini e prenotazioni",
  loyalty: "Punti e voucher",
  impact: "Il mio impatto",
  feedbacks: "I miei feedback",
};

export function ProfileScreen() {
  const { profileView, setProfileView } = useApp();
  if (profileView === "home") return <ProfileHome />;
  const VIEWS: Record<Exclude<ProfileView, "home">, ReactNode> = {
    personal: <PersonalSection />,
    interests: <InterestsSection />,
    diet: <DietSection />,
    habits: <HabitsSection />,
    goals: <GoalsSection />,
    health: <HealthSection />,
    notifications: <NotificationsSection />,
    orders: <OrdersView />,
    loyalty: <LoyaltyView />,
    impact: <ImpactView />,
    feedbacks: <FeedbacksView />,
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setProfileView("home")} aria-label="Torna al profilo" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-ink-700 shadow-card">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[20px] font-extrabold leading-tight tracking-tight text-ink-900">{TITLES[profileView]}</h1>
      </div>
      {VIEWS[profileView]}
    </div>
  );
}

function Row({ icon, label, detail, onClick }: { icon: ReactNode; label: string; detail?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-ink-50">
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold text-ink-900">{label}</span>
        {detail && <span className="block text-[12.5px] text-ink-500">{detail}</span>}
      </span>
      <ChevronRight size={18} className="shrink-0 text-ink-400" />
    </button>
  );
}

function ProfileHome() {
  const { data, account, setProfileView, logout, resetDemo, notify, linkStoreCode, pilot } = useApp();
  const [storeSheet, setStoreSheet] = useState(false);
  const [showMore, setShowMore] = useState(false);
  if (!data || !account) return null;
  const p = data.profile;
  const comp = completion(p);
  const lvl = levelOf(data.points.lifetime);
  const active = data.orders.filter((o) => o.status === "attivo").length;
  const toFeedback = data.orders.filter((o) => o.status === "completato" && !o.feedbackDone).length;

  return (
    <div className="space-y-5">
      <section className="card p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-600 text-[19px] font-extrabold text-white">{initials(p.firstName, p.lastName)}</span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[19px] font-extrabold text-ink-900">{[p.firstName, p.lastName].filter(Boolean).join(" ") || "Il mio profilo"}</h1>
            <p className="truncate text-[13px] text-ink-500">{account.demo ? "Account demo" : account.email}</p>
          </div>
          <span className="badge bg-brand-50 text-brand-800">
            <Award size={12} /> {lvl.current.name}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setProfileView("loyalty")}
          className="mt-3 flex w-full items-center justify-between rounded-xl bg-brand-50 px-3.5 py-2.5 text-left transition hover:bg-brand-100"
        >
          <span className="flex items-center gap-2 text-[14px] font-bold text-brand-800">
            <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden="true" />
            {formatInt(data.points.balance)} punti
          </span>
          <span className="text-[12.5px] font-semibold text-brand-700">Punti e voucher</span>
        </button>
        {!pilot && <div className="mt-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-semibold text-ink-700">Profilo completo al {comp.pct}%</span>
            {comp.pct < 100 && <span className="text-ink-500">Più completo = suggerimenti migliori</span>}
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ink-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={comp.pct} aria-label="Completamento del profilo">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${comp.pct}%` }} />
          </div>
        </div>}
      </section>

      <section aria-labelledby="pf-activity">
        <h2 id="pf-activity" className="eyebrow mb-2 px-1">La tua attività</h2>
        <div className="card divide-y divide-ink-100 overflow-hidden">
          <Row icon={<Package size={20} className="text-brand-600" />} label="Ordini e prenotazioni" detail={`${active} attive · ${data.orders.length} in totale`} onClick={() => setProfileView("orders")} />
          <Row icon={<Award size={20} className="text-brand-600" />} label="Punti e voucher" detail={`${formatInt(data.points.balance)} punti · ${data.vouchers.filter((v) => !v.usedAt).length} voucher`} onClick={() => setProfileView("loyalty")} />
          <Row icon={<Leaf size={20} className="text-brand-600" />} label="Il mio impatto" detail="Risparmio, cibo non sprecato e CO₂" onClick={() => setProfileView("impact")} />
          <Row icon={<MessageSquareText size={20} className="text-brand-600" />} label="I miei feedback" detail={toFeedback ? `${toFeedback} ordine da valutare` : `${data.feedbacks.length} inviati`} onClick={() => setProfileView("feedbacks")} />
        </div>
      </section>

      <section aria-labelledby="pf-info">
        <h2 id="pf-info" className="eyebrow mb-2 px-1">Il tuo profilo</h2>
        <div className="card divide-y divide-ink-100 overflow-hidden">
          {/* pilot: the questions that only feed the Smart Basket sit under "Altro (facoltativo)" */}
          {PROFILE_SECTIONS.filter((s) => !pilot || showMore || PILOT_SECTIONS.includes(s.id)).map((s) => {
            const missing = comp.missing.includes(s.id);
            const optional = s.id === "health" || s.id === "notifications";
            return (
              <Row
                key={s.id}
                icon={optional ? <CircleDashed size={20} className="text-ink-400" /> : missing ? <CircleDashed size={20} className="text-amber-500" /> : <CircleCheck size={20} className="text-brand-600" />}
                label={s.label}
                detail={optional ? "Facoltativo" : missing ? "Da completare" : "Completato"}
                onClick={() => setProfileView(s.id)}
              />
            );
          })}
          {pilot && (
            <button type="button" onClick={() => setShowMore((v) => !v)} aria-expanded={showMore} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-ink-50">
              <CircleDashed size={20} className="shrink-0 text-ink-400" />
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-semibold text-ink-900">{showMore ? "Mostra meno" : "Altro (facoltativo)"}</span>
                {!showMore && <span className="block text-[12.5px] text-ink-500">Interessi, abitudini, budget: non servono per prenotare</span>}
              </span>
              <ChevronRight size={18} className={`shrink-0 text-ink-400 transition ${showMore ? "-rotate-90" : "rotate-90"}`} />
            </button>
          )}
        </div>
      </section>

      <section aria-labelledby="pf-account">
        <h2 id="pf-account" className="eyebrow mb-2 px-1">Account</h2>
        <div className="card divide-y divide-ink-100 overflow-hidden">
          {account.demo && (
            <Row
              icon={<RotateCcw size={20} className="text-ink-500" />}
              label="Ripristina la demo"
              detail="Riporta dati, ordini e punti allo stato iniziale"
              onClick={() => {
                resetDemo();
                notify("Demo ripristinata");
              }}
            />
          )}
          {account.cloud && (
            <Row icon={<StoreIcon size={20} className="text-ink-500" />} label="Hai un negozio partner?" detail="Collega l'account al tuo punto vendita con il codice negozio" onClick={() => setStoreSheet(true)} />
          )}
          <Row icon={<LogOut size={20} className="text-ink-500" />} label="Esci" detail={account?.cloud ? "I tuoi dati restano salvati nel tuo account" : "I tuoi dati restano salvati su questo dispositivo"} onClick={logout} />
        </div>
      </section>
      <StoreCodeSheet open={storeSheet} onClose={() => setStoreSheet(false)} link={linkStoreCode} />
      {!account?.cloud && (
        <p className="px-1 text-center text-[11.5px] leading-snug text-ink-500">
          FOODPULSE · prototipo dimostrativo. Dati salvati solo su questo dispositivo.
        </p>
      )}
    </div>
  );
}

/** Supermarket staff: enter the store code to turn this account into a supermarket account */
function StoreCodeSheet({ open, onClose, link }: { open: boolean; onClose: () => void; link: (code: string) => Promise<{ ok: boolean; error?: string }> }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <Sheet open={open} onClose={onClose} title="Accesso negozio">
      <form
        className="grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!code.trim()) return setError("Inserisci il codice negozio.");
          setBusy(true);
          setError(null);
          const r = await link(code);
          setBusy(false);
          if (!r.ok) setError(r.error ?? "Codice negozio non valido.");
        }}
      >
        <p className="text-[13.5px] leading-snug text-ink-600">
          Inserisci il codice che il team FoodPulse ha dato al tuo punto vendita. L&apos;app si aprirà sulla dashboard del negozio, con gli ordini dei clienti e lo scanner dei QR.
        </p>
        <label htmlFor="pf-store-code" className="field-label">Codice negozio</label>
        <input id="pf-store-code" className="input font-mono uppercase tracking-wider" placeholder="ESS-MI-XXXXXX" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13.5px] text-rose-700">{error}</p>}
        <button type="submit" className="btn-primary h-12" disabled={busy}>
          Collega il punto vendita
        </button>
      </form>
    </Sheet>
  );
}
