"use client";

import { CalendarClock } from "lucide-react";
import { ADVANCE_TIERS } from "@/data/config";
import { formatDayShort } from "@/lib/format";
import { pickupDateFor, useApp } from "@/store/AppStore";

/** Progressive discount based on how far ahead the booking is made */
export function AdvanceSelector({ compact = false }: { compact?: boolean }) {
  const { data, setAdvance } = useApp();
  if (!data) return null;
  return (
    <div className={compact ? "" : "card p-3.5"}>
      {!compact && (
        <p className="mb-2.5 flex items-center gap-1.5 text-[13.5px] font-bold text-ink-900">
          <CalendarClock size={16} className="text-brand-600" /> Quando ritiri? Più anticipo, più sconto
        </p>
      )}
      <div role="radiogroup" aria-label="Anticipo della prenotazione" className="grid grid-cols-3 gap-2">
        {ADVANCE_TIERS.map((t) => {
          const on = data.advance === t.days;
          return (
            <button
              key={t.days}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setAdvance(t.days)}
              className={`rounded-2xl border-2 px-1 py-2.5 text-center transition ${on ? "border-brand-400 bg-brand-50" : "border-brand-50 bg-white hover:border-brand-100"}`}
            >
              <span className={`block text-[19px] font-bold tabular-nums ${on ? "text-brand-600" : "text-ink-800"}`}>−{t.pct}%</span>
              <span className="block text-[12px] font-bold text-ink-700">{t.label}</span>
              <span suppressHydrationWarning className="block text-[11px] capitalize text-ink-500">
                {formatDayShort(pickupDateFor(t.days))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
