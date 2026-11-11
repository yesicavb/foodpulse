"use client";

import { CheckCircle2, History, QrCode, ScanLine, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { EmptyState, SectionTitle } from "@/components/ui/Controls";
import { formatDayShort } from "@/lib/format";
import { useApp } from "@/store/AppStore";
import { OrderTicket } from "./OrderTicket";

export function QrScreen() {
  const { data, qrOrderId, setQrOrderId, completeOrder, cancelOrder, setTab, setProfileView, notify } = useApp();
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

      <div className="card space-y-2 p-4">
        <p className="flex items-center gap-2 text-[13.5px] font-bold text-ink-900">
          <ScanLine size={17} className="text-brand-600" /> Simulazione del ritiro
        </p>
        <p className="text-[12.5px] leading-snug text-ink-500">
          Nel prototipo il personale (o il locker) che legge il QR viene simulato da questo pulsante. Dopo il ritiro ti chiederemo un feedback.
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
