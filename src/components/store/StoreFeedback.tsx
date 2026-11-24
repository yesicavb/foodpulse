"use client";

import { CheckCircle2, MessageSquareHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, Stars } from "@/components/ui/Controls";
import { track } from "@/lib/analytics";
import { lastWeeklyFeedback, sendStoreFeedback } from "@/lib/desk";

const WEEK_MS = 7 * 24 * 3600 * 1000;

/** The 5 weekly questions for shops (stored with these keys in store_feedback.answers) */
const CHOICES = {
  orders_clear: ["Sì", "In parte", "No"],
  prep_time: ["Meno di 5 min", "5–15 min", "Più di 15 min"],
  helped: ["Sì", "Un po'", "Non ancora"],
} as const;

/** Weekly feedback card for the shop dashboard: shows when the last answers are more than a week old */
export function WeeklyFeedbackCard({ storeId, cloud }: { storeId: string; cloud: boolean }) {
  const [due, setDue] = useState(false);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [a, setA] = useState({ ease: 0, orders_clear: "", prep_time: "", helped: "", improve: "" });

  useEffect(() => {
    let alive = true;
    void lastWeeklyFeedback(storeId, cloud).then((d) => alive && setDue(!d || Date.now() - d.getTime() > WEEK_MS));
    return () => {
      alive = false;
    };
  }, [storeId, cloud]);

  if (!due && !open) return null;

  const submit = async () => {
    if (!a.ease || !a.orders_clear || !a.prep_time || !a.helped) return setError("Rispondi alle domande 1–4.");
    setBusy(true);
    const ok = await sendStoreFeedback({ storeId, kind: "weekly", rating: a.ease, answers: { ...a, improve: a.improve.trim() } }, cloud);
    setBusy(false);
    if (!ok) return setError("Non salvato. Controlla la connessione e riprova.");
    track("store_feedback_weekly", { ease: a.ease });
    setDone(true);
    setDue(false);
  };

  const Choice = ({ k, label, n }: { k: keyof typeof CHOICES; label: string; n: number }) => (
    <fieldset>
      <legend className="mb-2 text-[14px] font-bold text-ink-900">
        {n}. {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {CHOICES[k].map((c) => (
          <button key={c} type="button" onClick={() => setA((x) => ({ ...x, [k]: c }))} className={`chip ${a[k] === c ? "chip-on" : ""}`} aria-pressed={a[k] === c}>
            {c}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="card flex w-full items-center gap-3 p-3 text-left">
        <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
          <MessageSquareHeart size={19} aria-hidden="true" />
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-orange-500 ring-2 ring-white" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-bold text-ink-900">Feedback della settimana</span>
          <span className="block text-[12.5px] text-ink-500">5 domande, 1 minuto. Ci aiuta a migliorare FoodPulse.</span>
        </span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Feedback della settimana">
        {done ? (
          <div className="grid gap-3 py-4 text-center">
            <CheckCircle2 size={44} className="mx-auto text-brand-600" aria-hidden="true" />
            <p className="text-[17px] font-bold text-ink-900">Grazie!</p>
            <p className="text-[13.5px] text-ink-600">Le vostre risposte ci aiutano a migliorare FoodPulse. Ve lo richiediamo tra una settimana.</p>
            <button type="button" className="btn-primary h-12" onClick={() => setOpen(false)}>
              Chiudi
            </button>
          </div>
        ) : (
          <div className="grid gap-5">
            <div>
              <p className="mb-2 text-[14px] font-bold text-ink-900">1. Quanto è facile usare la dashboard?</p>
              <Stars value={a.ease} onChange={(v) => setA((x) => ({ ...x, ease: v }))} label="Facilità della dashboard" />
            </div>
            <Choice n={2} k="orders_clear" label="Gli ordini sono arrivati in modo chiaro e puntuale?" />
            <Choice n={3} k="prep_time" label="Quanto tempo vi costa preparare un ordine FoodPulse?" />
            <Choice n={4} k="helped" label="FoodPulse vi ha aiutato a vendere di più o a sprecare meno?" />
            <div>
              <label htmlFor="sf-improve" className="mb-2 block text-[14px] font-bold text-ink-900">
                5. Cosa migliorereste? <span className="font-normal text-ink-500">(facoltativo)</span>
              </label>
              <textarea id="sf-improve" className="input min-h-[84px] py-2.5" maxLength={500} value={a.improve} onChange={(e) => setA((x) => ({ ...x, improve: e.target.value }))} />
            </div>
            {error && (
              <p role="alert" className="text-[13px] font-semibold text-rose-700">
                {error}
              </p>
            )}
            <button type="button" className="btn-primary h-12" disabled={busy} onClick={submit}>
              Invia
            </button>
          </div>
        )}
      </Sheet>
    </>
  );
}

/** "Com'è andato questo ritiro?" right after the shop confirms a pickup */
export function PickupRating({ storeId, orderId, cloud }: { storeId: string; orderId: string; cloud: boolean }) {
  const [rating, setRating] = useState(0);
  const [saved, setSaved] = useState(false);
  return (
    <div className="rounded-2xl bg-ink-50 p-3">
      {saved ? (
        <p className="text-[13.5px] font-semibold text-brand-700">Grazie per la valutazione!</p>
      ) : (
        <>
          <p className="mb-1.5 text-[14px] font-bold text-ink-900">Com&apos;è andato questo ritiro?</p>
          <div className="flex justify-center">
            <Stars
              value={rating}
              label="Valutazione del ritiro"
              onChange={async (v) => {
                setRating(v);
                const ok = await sendStoreFeedback({ storeId, kind: "pickup", orderId, rating: v }, cloud);
                if (ok) {
                  setSaved(true);
                  track("store_pickup_rating", { rating: v });
                }
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
