"use client";

import {
  AlertTriangle,
  BarChart3,
  Bell,
  BellOff,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Inbox,
  Keyboard,
  Lock,
  LogOut,
  PackageCheck,
  ScanLine,
  Store as StoreIcon,
  Truck,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sheet } from "@/components/ui/Controls";
import { Logo } from "@/components/ui/Logo";
import { storeById } from "@/data/stores";
import { LanguageSwitch } from "@/i18n/LanguageProvider";
import { track } from "@/lib/analytics";
import { playChime, unlockChime } from "@/lib/chime";
import { NotifyCard } from "@/components/ui/NotifyCard";
import { systemNotify } from "@/lib/systemNotify";
import {
  codeFromText,
  DESK_STATUS,
  localDay,
  storeOrders,
  updateAtStore,
  type DeskOrder,
  type DeskStatus,
  lineCount,
  lineQty,
} from "@/lib/desk";
import { formatDayShort, money } from "@/lib/format";
import { useApp } from "@/store/AppStore";
import { QrScanner } from "./QrScanner";
import { StoreStats } from "./StoreStats";
import { DemoBar } from "@/components/ui/DemoBar";
import { PickupRating, WeeklyFeedbackCard } from "./StoreFeedback";

type Filter = "nuovi" | "attivi" | DeskStatus;
const ACTIVE: DeskStatus[] = ["da_preparare", "in_preparazione", "pronto"];
const POLL_MS = 8000;

function dayLabel(d: string) {
  const today = localDay();
  const t = new Date();
  t.setDate(t.getDate() + 1);
  if (d === today) return "Oggi";
  if (d === localDay(t)) return "Domani";
  return formatDayShort(`${d}T12:00:00`);
}

const MethodIcon = ({ m }: { m: DeskOrder["method"] }) => {
  const I = m === "locker" ? Lock : m === "delivery" ? Truck : StoreIcon;
  return <I size={14} aria-hidden="true" />;
};
const METHOD: Record<DeskOrder["method"], string> = {
  instore: "Ritiro in negozio",
  locker: "Locker",
  delivery: "Consegna",
};

/** Supermarket dashboard: inbox of new orders, statuses, and the QR scanner */
export function StoreApp({
  storeId,
  cloud,
  demo,
  onExit,
}: {
  storeId: string;
  cloud: boolean;
  demo: boolean;
  onExit: () => void;
}) {
  const { toast, notify } = useApp();
  const store = storeById(storeId);
  const [orders, setOrders] = useState<DeskOrder[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<Filter>("attivi");
  const [view, setView] = useState<"ordini" | "statistiche">("ordini");
  const [openId, setOpenId] = useState<string | null>(null);
  const [scan, setScan] = useState<null | "camera" | "manual">(null);
  const knownIds = useRef<Set<string> | null>(null);
  // sound for new orders, on by default; the choice is remembered on this device
  const [sound, setSound] = useState(() => {
    try {
      return localStorage.getItem("foodpulse-desk-sound") !== "off";
    } catch {
      return true;
    }
  });
  const soundRef = useRef(sound);
  soundRef.current = sound;
  useEffect(() => {
    // browsers only allow sound after the first tap on the page
    const unlock = () => unlockChime();
    window.addEventListener("pointerdown", unlock);
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);
  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    try {
      localStorage.setItem("foodpulse-desk-sound", next ? "on" : "off");
    } catch {
      /* ignore */
    }
    if (next) playChime();
    notify(next ? "Suono per i nuovi ordini attivo" : "Suono per i nuovi ordini disattivato");
  };

  const load = useCallback(async () => {
    try {
      const list = await storeOrders(storeId, cloud);
      setLoadError(false);
      // tell the staff when a new order arrives while the dashboard is open
      if (knownIds.current) {
        const fresh = list.filter(
          (o) => !knownIds.current!.has(o.id) && o.status === "da_preparare",
        );
        if (fresh.length && soundRef.current) playChime();
        if (fresh.length)
          void systemNotify(
            fresh.length === 1 ? `Nuovo ordine da ${fresh[0].customerName}` : `${fresh.length} nuovi ordini`,
            fresh.length === 1 ? (() => { const n = lineCount(fresh[0].lines); return `Ritiro ${fresh[0].slot} · ${n} ${n === 1 ? "prodotto" : "prodotti"}`; })() : "Apri FoodPulse per vederli",
            "foodpulse-new-order",
          );
        if (fresh.length)
          notify(
            fresh.length === 1
              ? `Nuovo ordine da ${fresh[0].customerName}`
              : `${fresh.length} nuovi ordini`,
          );
      }
      knownIds.current = new Set(list.map((o) => o.id));
      setOrders(list);
      return list;
    } catch (e) {
      console.error("FoodPulse: store orders", e);
      setLoadError(true);
      return null;
    }
  }, [storeId, cloud, notify]);

  useEffect(() => {
    void load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  const change = useCallback(
    async (id: string, p: { status?: DeskStatus; seen?: boolean }) => {
      setOrders(
        (l) =>
          l?.map((o) =>
            o.id === id
              ? {
                  ...o,
                  ...(p.status ? { status: p.status } : {}),
                  ...(p.seen !== undefined ? { seen: p.seen } : {}),
                }
              : o,
          ) ?? l,
      );
      try {
        await updateAtStore(id, p, cloud);
        if (p.status) track("store_order_status", { status: p.status });
      } catch {
        notify("Modifica non salvata. Controlla la connessione.");
        void load();
      }
    },
    [cloud, notify, load],
  );

  const list = orders ?? [];
  const today = localDay();
  const counts = {
    nuovi: list.filter((o) => !o.seen && ACTIVE.includes(o.status)).length,
    da_preparare: list.filter((o) => o.status === "da_preparare").length,
    in_preparazione: list.filter((o) => o.status === "in_preparazione").length,
    pronto: list.filter((o) => o.status === "pronto").length,
    oggi: list.filter(
      (o) => ACTIVE.includes(o.status) && o.pickupDate === today,
    ).length,
  };

  // new orders also show in the browser tab title, e.g. "(2) Nuovi ordini · FOODPULSE"
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\) Nuovi ordini · /, "");
    document.title = counts.nuovi ? `(${counts.nuovi}) Nuovi ordini · ${base}` : base;
    return () => {
      document.title = base;
    };
  }, [counts.nuovi]);

  const shown = useMemo(() => {
    const l = orders ?? [];
    const f =
      filter === "nuovi"
        ? l.filter((o) => !o.seen && ACTIVE.includes(o.status))
        : filter === "attivi"
          ? l.filter((o) => ACTIVE.includes(o.status))
          : l.filter((o) => o.status === filter);
    // active orders: soonest pickup first; history: newest first
    return filter === "completato" || filter === "annullato"
      ? f
      : [...f].sort((a, b) =>
          (a.pickupDate + a.slot).localeCompare(b.pickupDate + b.slot),
        );
  }, [orders, filter]);

  const open = list.find((o) => o.id === openId) ?? null;
  useEffect(() => {
    if (open && !open.seen) void change(open.id, { seen: true });
  }, [open, change]);

  const chips: { id: Filter; label: string; n?: number }[] = [
    { id: "nuovi", label: "Nuovi", n: counts.nuovi },
    { id: "attivi", label: "Tutti gli attivi" },
    { id: "da_preparare", label: "Da preparare", n: counts.da_preparare },
    {
      id: "in_preparazione",
      label: "In preparazione",
      n: counts.in_preparazione,
    },
    { id: "pronto", label: "Pronti", n: counts.pronto },
    { id: "completato", label: "Ritirati" },
    { id: "annullato", label: "Annullati" },
  ];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-cream sm:shadow-2xl">
      <div className="sticky top-0 z-40">
      {demo && <DemoBar onExit={onExit} />}
      <header className="gutter bg-cream/95 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Logo size={30} wordSize={17} />
          <div className="flex items-center gap-2">
            <LanguageSwitch />
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={sound}
              className={`grid h-9 w-9 place-items-center rounded-full border ${sound ? "border-brand-200 bg-brand-50 text-brand-700" : "border-ink-200 bg-white text-ink-400"}`}
              aria-label={sound ? "Disattiva il suono per i nuovi ordini" : "Attiva il suono per i nuovi ordini"}
            >
              {sound ? <Bell size={17} /> : <BellOff size={17} />}
            </button>
            <button
              type="button"
              onClick={onExit}
              className="grid h-9 w-9 place-items-center rounded-full border border-brand-100 bg-white text-ink-600 hover:bg-brand-50"
              aria-label={demo ? "Esci dalla demo supermercato" : "Esci"}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>
      </div>

      <main className="gutter flex-1 space-y-4 pb-44 pt-2">
        <section
          className="rounded-3xl bg-brand-900 p-4 text-white"
          aria-labelledby="desk-store"
        >
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-leaf">
            Area supermercato{demo ? " · demo" : ""}
          </p>
          <h1
            id="desk-store"
            className="mt-1 text-[19px] font-bold leading-tight"
          >
            {store?.name ?? "Punto vendita"}
          </h1>
          {store && (
            <p className="text-[13px] text-white/75">
              {store.address}, {store.city}
            </p>
          )}
          <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[
              {
                k: "Nuovi",
                v: counts.nuovi,
                icon: Inbox,
                f: "nuovi" as Filter,
              },
              {
                k: "Da preparare",
                v: counts.da_preparare,
                icon: ClipboardList,
                f: "da_preparare" as Filter,
              },
              {
                k: "In prep.",
                v: counts.in_preparazione,
                icon: ChefHat,
                f: "in_preparazione" as Filter,
              },
              {
                k: "Pronti",
                v: counts.pronto,
                icon: PackageCheck,
                f: "pronto" as Filter,
              },
            ].map(({ k, v, icon: I, f }) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setFilter(f);
                  setView("ordini");
                }}
                className={`rounded-2xl px-1 py-2 transition ${view === "ordini" && filter === f ? "bg-white text-brand-900" : "bg-white/10 hover:bg-white/15"}`}
              >
                <I
                  size={16}
                  className="mx-auto mb-1 opacity-80"
                  aria-hidden="true"
                />
                <dd className="text-[20px] font-bold tabular-nums leading-none">
                  {orders ? v : "–"}
                </dd>
                <dt className="mt-1 text-[11px] font-semibold leading-tight">
                  {k}
                </dt>
              </button>
            ))}
          </dl>
          <p className="mt-3 text-[12.5px] text-white/80">{`${counts.oggi} ritiri previsti oggi`}</p>
        </section>

        <NotifyCard where="store" text="Ricevi una notifica per ogni nuovo ordine, anche quando stai usando un'altra app o scheda." />

        <WeeklyFeedbackCard storeId={storeId} cloud={cloud} />

        {demo && (
          <p className="rounded-2xl bg-amber-50 px-3 py-2.5 text-[12.5px] leading-snug text-amber-900">
            Demo: ordini di esempio di questo punto vendita, più quelli fatti
            con la demo cliente su questo dispositivo. Prova a scansionare il QR
            di una prenotazione.
          </p>
        )}
        {loadError && (
          <p
            role="alert"
            className="rounded-2xl bg-rose-50 px-3 py-2.5 text-[13px] text-rose-700"
          >
            Non riusciamo a caricare gli ordini. Controlla la connessione:
            riproviamo da soli tra pochi secondi.
          </p>
        )}

        <div
          role="tablist"
          aria-label="Sezioni"
          className="grid grid-cols-2 gap-1 rounded-2xl bg-ink-100 p-1"
        >
          {(
            [
              ["ordini", "Ordini", Inbox],
              ["statistiche", "Statistiche", BarChart3],
            ] as const
          ).map(([id, label, I]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              onClick={() => {
                setView(id);
                if (id === "statistiche") track("store_stats_view");
              }}
              className={`flex h-10 items-center justify-center gap-2 rounded-xl text-[14px] font-bold transition ${view === id ? "bg-white text-ink-900 shadow-sm" : "text-ink-600"}`}
            >
              <I size={16} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>

        {view === "statistiche" ? (
          <StoreStats orders={list} />
        ) : (
          <>
            <div
              role="tablist"
              aria-label="Filtra gli ordini"
              className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4"
            >
              {chips.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === c.id}
                  onClick={() => setFilter(c.id)}
                  className={`chip shrink-0 ${filter === c.id ? "chip-on" : ""}`}
                >
                  {c.label}
                  {!!c.n && (
                    <span
                      className={`ml-1.5 rounded-full px-1.5 text-[11px] font-bold ${c.id === "nuovi" ? "bg-orange-500 text-white" : "bg-ink-100 text-ink-700"}`}
                    >
                      {c.n}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {!orders ? (
              <p className="py-10 text-center text-[14px] text-ink-500">
                Caricamento degli ordini…
              </p>
            ) : shown.length === 0 ? (
              <div className="card px-5 py-10 text-center">
                <Inbox
                  size={26}
                  className="mx-auto mb-2 text-ink-300"
                  aria-hidden="true"
                />
                <p className="text-[15px] font-bold text-ink-900">
                  {filter === "nuovi"
                    ? "Nessun ordine nuovo"
                    : "Nessun ordine qui"}
                </p>
                <p className="mt-1 text-[13px] text-ink-500">
                  I nuovi ordini dei clienti arrivano qui da soli.
                </p>
              </div>
            ) : (
              <ul className="grid gap-3">
                {shown.map((o) => (
                  <li key={o.id}>
                    <OrderCard
                      order={o}
                      onOpen={() => setOpenId(o.id)}
                      onNext={(s) =>
                        void change(o.id, { status: s, seen: true })
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center">
        <div className="pointer-events-auto flex w-full max-w-[480px] flex-col items-center gap-1.5 rounded-t-3xl bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-float backdrop-blur">
          <button
            type="button"
            onClick={() => setScan("camera")}
            className="btn-primary h-14 w-full max-w-xs rounded-full text-[16px] shadow-card"
          >
            <ScanLine size={22} aria-hidden="true" /> Scansiona QR
          </button>
          <button
            type="button"
            onClick={() => setScan("manual")}
            className="flex items-center gap-1.5 py-1 text-[13px] font-semibold text-brand-700 underline underline-offset-2"
          >
            <Keyboard size={15} aria-hidden="true" /> Inserisci il codice a mano
          </button>
        </div>
      </div>

      {toast && (
        <div className="gutter pointer-events-none fixed inset-x-0 bottom-[118px] z-[70] flex justify-center">
          <div
            role="status"
            className="flex w-full max-w-[448px] animate-rise items-center gap-2 rounded-2xl bg-ink-900 px-4 py-3 text-[14px] font-semibold text-white shadow-lg"
          >
            <CheckCircle2 size={18} className="shrink-0 text-leaf" /> {toast}
          </div>
        </div>
      )}

      <Sheet
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open ? `Ordine ${open.id}` : "Ordine"}
      >
        {open && (
          <OrderDetail
            order={open}
            onStatus={(s) => void change(open.id, { status: s })}
          />
        )}
      </Sheet>

      <ScanSheet
        storeId={storeId}
        cloud={cloud}
        mode={scan}
        setMode={setScan}
        find={async (code) => {
          const l = (await load()) ?? list;
          return l.find((o) => o.code.toUpperCase() === code) ?? null;
        }}
        confirm={async (o) => {
          await change(o.id, { status: "completato", seen: true });
          track("store_pickup_confirmed", {
            via: scan === "manual" ? "manual" : "camera",
          });
        }}
      />
    </div>
  );
}

function StatusBadge({ s }: { s: DeskStatus }) {
  return (
    <span className={`badge ${DESK_STATUS[s].cls}`}>
      {DESK_STATUS[s].label}
    </span>
  );
}

function OrderCard({
  order: o,
  onOpen,
  onNext,
}: {
  order: DeskOrder;
  onOpen: () => void;
  onNext: (s: DeskStatus) => void;
}) {
  const st = DESK_STATUS[o.status];
  const items = lineCount(o.lines);
  const isNew = !o.seen && ACTIVE.includes(o.status);
  return (
    <article
      className={`card overflow-hidden ${isNew ? "border-2 border-orange-400" : ""}`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="block w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[15.5px] font-bold text-ink-900">
              {isNew && (
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500"
                  aria-label="Nuovo"
                />
              )}
              <span className="truncate">{o.customerName}</span>
            </p>
            <p className="font-mono text-[12.5px] font-bold tracking-wider text-ink-500">
              {o.code}
            </p>
          </div>
          <StatusBadge s={o.status} />
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-600">
          <span className="font-bold text-ink-900">
            {dayLabel(o.pickupDate)} · {o.slot}
          </span>
          <span className="flex items-center gap-1">
            <MethodIcon m={o.method} /> {METHOD[o.method]}
          </span>
        </p>
        <p className="mt-1.5 line-clamp-2 text-[13px] text-ink-500">
          {`${items} prodotti: ${o.lines.map((l) => `${lineQty(l)} ${l.name}`).join(", ")}`}
        </p>
        {o.notes && (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
            📝 {o.notes}
          </p>
        )}
      </button>
      {st.next && (
        <div className="border-t border-ink-100 p-3">
          <button
            type="button"
            className="btn-secondary h-10 w-full"
            onClick={() => onNext(st.next!)}
          >
            {st.action}
          </button>
        </div>
      )}
    </article>
  );
}

function OrderDetail({
  order: o,
  onStatus,
}: {
  order: DeskOrder;
  onStatus: (s: DeskStatus) => void;
}) {
  const st = DESK_STATUS[o.status];
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[17px] font-bold text-ink-900">{o.customerName}</p>
          <p className="font-mono text-[14px] font-bold tracking-[0.18em] text-ink-700">
            {o.code}
          </p>
        </div>
        <StatusBadge s={o.status} />
      </div>
      <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-ink-50 p-3 text-[13.5px]">
        <div>
          <dt className="text-[11.5px] text-ink-500">Ritiro</dt>
          <dd className="font-bold text-ink-900">
            {dayLabel(o.pickupDate)} · {o.slot}
          </dd>
        </div>
        <div>
          <dt className="text-[11.5px] text-ink-500">Modalità</dt>
          <dd className="font-bold text-ink-900">{METHOD[o.method]}</dd>
        </div>
        {o.pickupDetail && (
          <div className="col-span-2">
            <dt className="text-[11.5px] text-ink-500">
              {o.method === "delivery" ? "Indirizzo" : "Dove"}
            </dt>
            <dd className="text-ink-800">{o.pickupDetail}</dd>
          </div>
        )}
      </dl>
      {o.notes && (
        <div className="rounded-2xl bg-amber-50 p-3">
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-amber-800">
            Note del cliente
          </p>
          <p className="mt-1 text-[14px] text-amber-950">{o.notes}</p>
        </div>
      )}
      <section>
        <h3 className="eyebrow mb-2">Lista della spesa</h3>
        <ul className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
          {o.lines.map((l, i) => (
            <li
              key={i}
              className="flex items-center gap-3 px-3 py-2.5 text-[14px]"
            >
              <span className="grid h-7 min-w-7 place-items-center rounded-lg bg-brand-50 px-1.5 text-[13px] font-bold tabular-nums text-brand-800">
                {lineQty(l)}
              </span>
              <span className="text-ink-900">{l.name}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-right text-[13.5px] text-ink-600">
          Totale{" "}
          <strong className="tabular-nums text-ink-900">
            {money(o.total)}
          </strong>
        </p>
      </section>
      {st.next && (
        <button
          type="button"
          className="btn-primary h-12"
          onClick={() => onStatus(st.next!)}
        >
          {st.action}
        </button>
      )}
      {o.status === "pronto" && (
        <p className="text-center text-[13px] text-ink-500">
          Il ritiro si conferma scansionando il QR del cliente.
        </p>
      )}
    </div>
  );
}

type Found =
  | { kind: "none"; code: string }
  | { kind: "order"; order: DeskOrder }
  | { kind: "done"; order: DeskOrder };

function ScanSheet({
  storeId,
  cloud,
  mode,
  setMode,
  find,
  confirm,
}: {
  storeId: string;
  cloud: boolean;
  mode: null | "camera" | "manual";
  setMode: (m: null | "camera" | "manual") => void;
  find: (code: string) => Promise<DeskOrder | null>;
  confirm: (o: DeskOrder) => Promise<void>;
}) {
  const [typed, setTyped] = useState("");
  const [found, setFound] = useState<Found | null>(null);
  const [busy, setBusy] = useState(false);
  const [round, setRound] = useState(0);

  const reset = () => {
    setFound(null);
    setTyped("");
    setRound((r) => r + 1);
  };
  const close = () => {
    reset();
    setMode(null);
  };
  const lookup = async (raw: string) => {
    const code = codeFromText(raw);
    if (!code) return;
    setBusy(true);
    const o = await find(code);
    setBusy(false);
    setFound(o ? { kind: "order", order: o } : { kind: "none", code });
  };

  return (
    <Sheet
      open={!!mode}
      onClose={close}
      title={
        found
          ? "Risultato"
          : mode === "manual"
            ? "Inserisci il codice"
            : "Scansiona il QR del cliente"
      }
    >
      {!found ? (
        mode === "camera" ? (
          <div className="grid gap-3">
            <QrScanner key={round} onResult={(t) => void lookup(t)} />
            <p className="text-center text-[13px] text-ink-500">
              {busy
                ? "Verifica del codice…"
                : "Inquadra il QR mostrato dal cliente nell'app FoodPulse."}
            </p>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setMode("manual")}
            >
              <Keyboard size={16} /> Inserisci il codice a mano
            </button>
          </div>
        ) : (
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              void lookup(typed);
            }}
          >
            <label htmlFor="desk-code" className="field-label">
              Codice dell&apos;ordine (8 caratteri, sotto il QR del cliente)
            </label>
            <input
              id="desk-code"
              className="input text-center font-mono text-[20px] uppercase tracking-[0.25em]"
              maxLength={12}
              autoComplete="off"
              autoFocus
              placeholder="K7QW2MNA"
              value={typed}
              onChange={(e) => setTyped(e.target.value.toUpperCase())}
            />
            <button
              type="submit"
              className="btn-primary h-12"
              disabled={busy || typed.trim().length < 4}
            >
              Cerca ordine
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setMode("camera")}
            >
              <ScanLine size={16} /> Usa la fotocamera
            </button>
          </form>
        )
      ) : found.kind === "none" ? (
        <div className="grid gap-3 text-center">
          <XCircle
            size={40}
            className="mx-auto text-rose-500"
            aria-hidden="true"
          />
          <p className="text-[16px] font-bold text-ink-900">
            Ordine non trovato
          </p>
          <p className="text-[13.5px] text-ink-600">
            Nessun ordine con codice{" "}
            <strong className="font-mono">{found.code}</strong> in questo punto
            vendita. Controlla che il cliente abbia scelto questo supermercato.
          </p>
          <button type="button" className="btn-primary h-12" onClick={reset}>
            Riprova
          </button>
        </div>
      ) : found.kind === "done" ? (
        <div className="grid gap-3 text-center">
          <CheckCircle2
            size={44}
            className="mx-auto text-brand-600"
            aria-hidden="true"
          />
          <p className="text-[17px] font-bold text-ink-900">
            Ritiro registrato
          </p>
          <p className="text-[13.5px] text-ink-600">
            {found.order.customerName} · {found.order.code}. Il cliente riceve
            la conferma nell&apos;app.
          </p>
          <PickupRating storeId={storeId} orderId={found.order.id} cloud={cloud} />
          <button type="button" className="btn-primary h-12" onClick={reset}>
            Scansiona il prossimo
          </button>
          <button type="button" className="btn-ghost" onClick={close}>
            Chiudi
          </button>
        </div>
      ) : (
        <ScanResult
          order={found.order}
          onConfirm={async () => {
            setBusy(true);
            await confirm(found.order);
            setBusy(false);
            setFound({ kind: "done", order: found.order });
          }}
          busy={busy}
          onCancel={reset}
        />
      )}
    </Sheet>
  );
}

function ScanResult({
  order: o,
  onConfirm,
  busy,
  onCancel,
}: {
  order: DeskOrder;
  onConfirm: () => void;
  busy: boolean;
  onCancel: () => void;
}) {
  const today = localDay();
  const blocked = o.status === "completato" || o.status === "annullato";
  const warnings: string[] = [];
  if (!blocked && o.status !== "pronto")
    warnings.push("L'ordine non è ancora segnato come pronto.");
  if (!blocked && o.pickupDate !== today)
    warnings.push(
      `Il ritiro era previsto per ${dayLabel(o.pickupDate).toLowerCase()} (${o.slot}).`,
    );
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[17px] font-bold text-ink-900">{o.customerName}</p>
          <p className="font-mono text-[14px] font-bold tracking-[0.18em] text-ink-700">
            {o.code}
          </p>
        </div>
        <StatusBadge s={o.status} />
      </div>
      {blocked ? (
        <p className="rounded-2xl bg-rose-50 p-3 text-[14px] text-rose-800">
          {o.status === "completato"
            ? "Questo ordine è già stato ritirato. Non consegnarlo di nuovo."
            : "Questo ordine è stato annullato dal cliente."}
        </p>
      ) : (
        warnings.map((w) => (
          <p
            key={w}
            className="flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-[13.5px] text-amber-900"
          >
            <AlertTriangle
              size={17}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />{" "}
            {w}
          </p>
        ))
      )}
      {o.notes && (
        <p className="rounded-2xl bg-amber-50 p-3 text-[13.5px] text-amber-950">
          📝 {o.notes}
        </p>
      )}
      <ul className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
        {o.lines.map((l, i) => (
          <li key={i} className="flex items-center gap-3 px-3 py-2 text-[14px]">
            <span className="font-bold tabular-nums text-brand-800">
              {lineQty(l)}
            </span>{" "}
            {l.name}
          </li>
        ))}
      </ul>
      {!blocked && (
        <button
          type="button"
          className="btn-primary h-12"
          disabled={busy}
          onClick={onConfirm}
        >
          <CheckCircle2 size={18} /> Conferma ritiro
        </button>
      )}
      <button type="button" className="btn-ghost" onClick={onCancel}>
        {blocked ? "Scansiona un altro" : "Annulla"}
      </button>
    </div>
  );
}
