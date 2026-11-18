"use client";

import { CheckCircle2, ChefHat, History, PackageCheck, QrCode, ScanLine, Store as StoreIcon, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { sendToStore, statusesAtStore, type DeskStatus } from "@/lib/desk";
import { track } from "@/lib/analytics";
import { EmptyState, SectionTitle } from "@/components/ui/Controls";
import { formatDayShort } from "@/lib/format";
import { useApp } from "@/store/AppStore";
import { OrderTicket } from "./OrderTicket";

export function QrScreen() {
  const { data, account, qrOrderId, setQrOrderId, completeOrder, cancelOrder, setTab, setProfileView, notify } = useApp();
  const cloud = !!account?.cloud;
  const [atStore, setAtStore] = useState<Record<string, DeskStatus>>({});
  const activeIds = (data?.orders ?? []).filter((o) => o.status === "attivo").map((o) => o.id).join(",");

  // what the supermarket is doing with each booking (checked every 10 seconds while this tab is open)
  useEffect(() => {
    if (!activeIds || !data) return;
    let alive = true;
    const ids = activeIds.split(",");
    const who = `${data.profile.firstName ?? ""} ${data.profile.lastName ?? ""}`.trim() || "Cliente";
    const check = async () => {
      const st = await statusesAtStore(ids, cloud);
      if (!alive) return;
      setAtStore(st);
      for (const id of ids) {
        const o = data.orders.find((x) => x.id === id);
        if (!o) continue;
        if (st[id] === "completato") {
          completeOrder(id);
          notify("Ritiro confermato dal supermercato");
        } else if (!st[id]) void sendToStore(o, who, cloud); // older booking the store never received
      }
    };
    void check();
    const t = setInterval(check, 10000);
    return () => {
      alive = false;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIds, cloud]);
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

      <OrderTicket order={current} />

      <StoreProgress status={atStore[current.id]} />

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

/** Where the booking is at the supermarket: received -> being prepared -> ready */
function StoreProgress({ status }: { status?: DeskStatus }) {
  const at = status ? STEPS.findIndex((s) => s.id === status) : -1;
  return (
    <section className="card p-4" aria-label="Stato al supermercato">
      <p className="eyebrow mb-3">Stato al supermercato</p>
      {at < 0 ? (
        <p className="text-[13px] text-ink-500">Invio al supermercato in corso…</p>
      ) : (
        <ol className="grid grid-cols-3 gap-2">
          {STEPS.map((s, i) => {
            const done = i <= at;
            const Icon = s.icon;
            return (
              <li key={s.id} className="flex flex-col items-center gap-1.5 text-center">
                <span className={`grid h-10 w-10 place-items-center rounded-full ${done ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-400"}`}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className={`text-[12px] font-semibold ${done ? "text-ink-900" : "text-ink-400"}`}>{s.label}</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
