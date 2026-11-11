"use client";

import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { getConsent, initAnalytics, setConsent, type Consent } from "@/lib/analytics";

/**
 * Asked once per browser, before any statistics are collected.
 * "Rifiuta" is as easy as "Accetta" (EU rules); the choice can be changed in the profile.
 */
export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    initAnalytics();
    setOpen(getConsent() === null);
  }, []);

  if (!open) return null;
  const choose = (c: Consent) => {
    setConsent(c);
    setOpen(false);
  };

  return (
    <div className="gutter fixed inset-x-0 bottom-0 z-[80] flex justify-center pb-[max(12px,env(safe-area-inset-bottom))]">
      <div role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-text" className="w-full max-w-[448px] animate-rise rounded-3xl bg-white p-4 shadow-float ring-1 ring-ink-100">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600" aria-hidden="true">
            <BarChart3 size={20} />
          </span>
          <div className="min-w-0">
            <h2 id="cookie-title" className="text-[15px] font-bold text-ink-900">Ci aiuti a migliorare FOODPULSE?</h2>
            <p id="cookie-text" className="mt-1 text-[13px] leading-snug text-ink-600">
              Con il tuo consenso usiamo Google Analytics per contare in forma anonima come viene usata l&apos;app (per esempio quante prenotazioni vengono confermate). Non condividiamo mai nome, email o indirizzo. Puoi cambiare idea in Profilo › Notifiche e privacy.
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => choose("denied")} className="rounded-2xl border border-ink-200 bg-white py-2.5 text-[14px] font-semibold text-ink-800 hover:bg-ink-50">
            Rifiuta
          </button>
          <button type="button" onClick={() => choose("granted")} className="rounded-2xl bg-brand-600 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-700">
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}
