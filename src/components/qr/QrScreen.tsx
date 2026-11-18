"use client";

import { CheckCircle2, ChefHat, History, PackageCheck, QrCode, ScanLine, Store as StoreIcon, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { type DeskStatus } from "@/lib/desk";
import { CUSTOMER_STATUS, useOrderStatus } from "./OrderStatus";
import { NotifyCard } from "@/components/ui/NotifyCard";
import { track } from "@/lib/analytics";
import { EmptyState, SectionTitle } from "@/components/ui/Controls";
import { formatDayShort } from "@/lib/format";
import { useApp } from "@/store/AppStore";
import { OrderTicket } from "./OrderTicket";

export function QrScreen() {
  const { data, account, qrOrderId, setQrOrderId, completeOrder, cancelOrder, setTab, setProfileView, notify } = useApp();
  const cloud = !!account?.cloud;
  const { atStore } = useOrderStatus();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [validating, setValidating] = useState(false);
  // one qr_view per booking shown (the QR code is what the customer shows in the shop)
  const shownId = data?.orders.find((o) => o.status === "attivo" && (o.id === qrOrderId || !qrOrderId))?.id;
  useEffect(() => {
    if (shownId) track("qr_view");
  }, [shownId]);
  if (!data) return null;
  const active = data.orders.filter((o) => o.status === "attivo");
  const current = active.find((o) => o.id === qrOrderId) ?? active[0] ?? null;

  const history = (
    <button
      type="button"
      className="btn-ghost w-full"
      onClick={() => {
        setTab("profile");
        setProfileView("orders");
      }}
    >
      <History size={16} /> Storico ordini
    </button>
  );

  if (!current) {
    return (
      <div className="space-y-4">
        <SectionTitle title="Il mio QR Code" subtitle="Qui trovi il codice per ritirare le tue prenotazioni." />
        <EmptyState
          icon={<QrCode size={26} />}
          title="Nessuna prenotazione attiva"
          text="Conferma una prenotazione dal carrello: il QR code comparirà qui."
          action={
            <button type="button" className="btn-primary" onClick={() => setTab("basket")}>
              Vai allo Smart Basket
            </button>
          }
        />
        {history}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionTitle title="Il mio QR Code" subtitle={active.length > 1 ? `Hai ${active.length} prenotazioni attive.` : "La tua prenotazione attiva."} />

      {active.length > 1 && (
        <div role="tablist" aria-label="Prenotazioni attive" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {active.map((o) => (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={o.id === current.id}
              onClick={() => {
                setQrOrderId(o.id);
                setConfirmCancel(false);
              }}
              className={`chip shrink-0 ${o.id === current.id ? "chip-on" : ""}`}
            >
              {o.id} · {formatDayShort(o.pickupDate)}
            </button>
          ))}
        </div>
      )}

      <StoreProgress status={atStore[current.id]} />

      {current.status === "attivo" && <NotifyCard where="customer" text="Ricevi una notifica quando il supermercato prepara il tuo ordine e quando è pronto." />}

      <OrderTicket order={current} />

      <div className="card space-y-2 p-4">
        {cloud ? (
          <p className="flex items-start gap-2 text-[13px] leading-snug text-ink-600">
            <ScanLine size={17} className="mt-0.5 shrink-0 text-brand-600" /> Al ritiro il supermercato scansiona il tuo QR: l&apos;ordine risulterà ritirato e ti chiederemo un feedback.
          </p>
        ) : (
          <>
        <p className="flex items-center gap-2 text-[13.5px] font-bold text-ink-900">
          <ScanLine size={17} className="text-brand-600" /> Simulazione del ritiro
        </p>
        <p className="text-[12.5px] leading-snug text-ink-500">
          Nella demo puoi simulare il ritiro con questo pulsante, oppure aprire la demo supermercato su questo dispositivo e scansionare il QR.
        </p>
        <button
          type="button"
          className="btn-primary w-full"
          disabled={validating}
          onClick={() => {
            setValidating(true);
            setTimeout(() => {
              completeOrder(current.id);
              setValidating(false);
              notify("QR validato: ordine ritirato");
            }, 700);
          }}
        >
          <CheckCircle2 size={17} /> {validating ? "Verifica in corso…" : "Simula validazione al ritiro"}
        </button>
          </>
        )}
        {confirmCancel ? (
          <div className="rounded-xl bg-rose-50 p-3 text-[13px] text-rose-800">
            <p>Annullare la prenotazione {current.id}? I punti assegnati verranno tolti e un eventuale voucher torna disponibile.</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" className="btn-secondary btn-sm" onClick={() => setConfirmCancel(false)}>
                No, mantieni
              </button>
              <button
                type="button"
                className="btn btn-sm bg-rose-600 text-white hover:bg-rose-700"
                onClick={() => {
                  cancelOrder(current.id);
                  setConfirmCancel(false);
                  notify("Prenotazione annullata");
                }}
              >
                Sì, annulla
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn w-full text-rose-700 hover:bg-rose-50" onClick={() => setConfirmCancel(true)}>
            <XCircle size={16} /> Annulla prenotazione
          </button>
        )}
      </div>
      {history}
    </div>
  );
}

const STEPS: { id: DeskStatus; label: string; icon: typeof StoreIcon }[] = [
  { id: "da_preparare", label: "Ricevuto", icon: StoreIcon },
  { id: "in_preparazione", label: "In preparazione", icon: ChefHat },
  { id: "pronto", label: "Pronto", icon: PackageCheck },
];

/** Where the booking is at the supermarket: big coloured status card + received -> being prepared -> ready */
function StoreProgress({ status }: { status?: DeskStatus }) {
  const at = status ? STEPS.findIndex((s) => s.id === status) : -1;
  const look = status ? CUSTOMER_STATUS[status] : undefined;
  return (
    <section className={`overflow-hidden rounded-3xl shadow-card ${look ? look.tone : "bg-white"}`} aria-label="Stato al supermercato" aria-live="polite">
      {!look ? (
        <p className="p-4 text-[13px] text-ink-500">Invio al supermercato in corso…</p>
      ) : (
        <>
          <div className="flex items-center gap-3 p-4">
            <span className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white ${look.ring}`}>
              {status !== "da_preparare" && <span className={`absolute inset-0 animate-ping rounded-2xl opacity-25 ${look.ring}`} aria-hidden="true" />}
              <look.icon size={24} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11.5px] font-bold uppercase tracking-wider opacity-70">Stato al supermercato</p>
              <p className="text-[17px] font-extrabold leading-tight">{look.title}</p>
              <p className="mt-0.5 text-[12.5px] leading-snug opacity-80">{look.text}</p>
            </div>
          </div>
          <ol className="flex items-start bg-white/70 px-4 py-3">
            {STEPS.map((s, i) => {
              const done = i <= at;
              const now = i === at;
              const Icon = s.icon;
              return (
                <li key={s.id} className="relative flex flex-1 flex-col items-center gap-1 text-center">
                  {i > 0 && <span className={`absolute right-1/2 top-[16px] h-1 w-full rounded-full ${i <= at ? look.ring : "bg-ink-200"}`} aria-hidden="true" />}
                  <span className={`relative z-10 grid h-9 w-9 place-items-center rounded-full ${done ? `${look.ring} text-white` : "bg-ink-100 text-ink-400"} ${now ? "ring-4 ring-white" : ""}`}>
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <span className={`text-[12px] ${now ? "font-extrabold text-ink-900" : done ? "font-semibold text-ink-700" : "font-semibold text-ink-400"}`}>{s.label}</span>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}
