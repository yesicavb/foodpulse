"use client";

import { CalendarClock, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ADVANCE_TIERS, MAX_ADVANCE_DAYS } from "@/data/config";
import { formatDayLong } from "@/lib/format";
import { tierPct } from "@/lib/pricing";
import { pickupDateFor, useApp } from "@/store/AppStore";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MONTHS = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000);

/**
 * "Quando ritiri?": a calendar to pick the pickup date (tomorrow up to MAX_ADVANCE_DAYS ahead).
 * Demo: the advance-booking discount applies. Pilot: the levels are shown, marked as coming soon.
 */
export function AdvanceSelector() {
  const { data, setAdvance, store, pilot } = useApp();
  const today = startOfToday();
  const closed = store?.closedDays ?? [];
  const isOpen = (d: Date) => !closed.includes(d.getDay());
  const selected = pickupDateFor(data?.advance ?? 1);
  const [month, setMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));

  // a date on a closing day (or out of range) moves to the next day the shop is open
  useEffect(() => {
    if (!data) return;
    let a = Math.min(Math.max(1, data.advance), MAX_ADVANCE_DAYS);
    for (let i = 0; i < 7 && !isOpen(pickupDateFor(a)); i++) a = a + 1 > MAX_ADVANCE_DAYS ? 1 : a + 1;
    if (a !== data.advance) setAdvance(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.advance, store?.id, closed.join(",")]);

  const cells = useMemo(() => {
    const first = new Date(month);
    const offset = (first.getDay() + 6) % 7; // Monday first
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))] as (Date | null)[];
  }, [month]);

  if (!data) return null;
  const advance = data.advance;
  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const last = new Date(today);
  last.setDate(last.getDate() + MAX_ADVANCE_DAYS);
  const maxMonth = new Date(last.getFullYear(), last.getMonth(), 1);
  const active = tierPct(advance);

  return (
    <div className="card p-3.5">
      <p className="mb-1 flex items-center gap-1.5 text-[13.5px] font-bold text-ink-900">
        <CalendarClock size={16} className="text-brand-600" aria-hidden="true" /> Quando ritiri?
      </p>
      <p className="mb-3 text-[12.5px] text-ink-600">
        Ritiro <strong className="capitalize text-ink-900">{formatDayLong(selected)}</strong>
        {advance > 1 && <span className="text-ink-500"> · tra {advance} giorni</span>}
      </p>

      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink-50 disabled:opacity-30"
          disabled={month <= minMonth}
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          aria-label="Mese precedente"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-[14px] font-bold text-ink-900">
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </span>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink-50 disabled:opacity-30"
          disabled={month >= maxMonth}
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          aria-label="Mese successivo"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label="Scegli il giorno del ritiro">
        {WEEKDAYS.map((w) => (
          <span key={w} className="pb-1 text-[11px] font-semibold text-ink-500">
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const n = daysBetween(today, d);
          const inRange = n >= 1 && n <= MAX_ADVANCE_DAYS;
          const can = inRange && isOpen(d);
          const on = can && n === advance;
          const pct = tierPct(n);
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={!can}
              aria-pressed={on}
              aria-label={`${d.getDate()} ${MONTHS[d.getMonth()]}${can ? "" : ", non disponibile"}`}
              onClick={() => setAdvance(n)}
              className={`relative grid h-10 place-items-center rounded-xl text-[14px] font-semibold tabular-nums transition ${
                on ? "bg-brand-600 text-white" : can ? "text-ink-800 hover:bg-brand-50" : inRange ? "text-ink-300 line-through decoration-ink-300" : "text-ink-200"
              }`}
            >
              {d.getDate()}
              {can && !on && !pilot && pct > 0 && (
                <span className={`absolute bottom-1 h-1 w-1 rounded-full ${pct >= 15 ? "bg-brand-600" : pct >= 10 ? "bg-brand-400" : "bg-brand-200"}`} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
      {store?.catalog === "tipici-sud" ? <p className="mt-1.5 text-[11.5px] text-ink-500">Ritiro disponibile solo martedì e venerdì. Giorni barrati: ritiro non disponibile.</p> : closed.length > 0 && <p className="mt-1.5 text-[11.5px] text-ink-500">Giorni barrati: il negozio è chiuso.</p>}

      <div className={`mt-3 rounded-2xl p-3 ${pilot ? "bg-orange-50" : "bg-brand-50"}`}>
        <p className={`mb-2 flex items-center gap-1.5 text-[12.5px] font-bold ${pilot ? "text-orange-800" : "text-brand-800"}`}>
          <Sparkles size={14} aria-hidden="true" /> {pilot ? "Sconti per chi prenota in anticipo · prossimamente" : "Più anticipo, più sconto"}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {ADVANCE_TIERS.map((t) => {
            const now = !pilot && active === t.pct;
            return (
              <div key={t.label} className={`rounded-xl border-2 bg-white px-1 py-2 text-center ${now ? "border-brand-400" : "border-transparent"} ${pilot ? "opacity-75" : ""}`}>
                <span className={`block text-[17px] font-bold tabular-nums ${now ? "text-brand-600" : "text-ink-800"}`}>−{t.pct}%</span>
                <span className="block text-[11.5px] font-semibold text-ink-600">{t.label}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[12px] leading-snug text-ink-600">
          {pilot
            ? "Prossimamente: quando FoodPulse crescerà, gli utenti registrati avranno uno sconto quando prenotano in anticipo."
            : active > 0
              ? `Con questa data hai il ${active}% di sconto sui prodotti freschi.`
              : "Scegli una data per vedere il tuo sconto."}
        </p>
      </div>
    </div>
  );
}
