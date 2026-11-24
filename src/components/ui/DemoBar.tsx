"use client";

import { LogOut } from "lucide-react";

/** Orange bar on every screen of the demos, so nobody mistakes them for the real pilot */
export function DemoBar({ onExit }: { onExit: () => void }) {
  return (
    <div className="gutter flex items-center justify-between gap-2 bg-accent py-1.5 pt-[max(6px,env(safe-area-inset-top))] text-white">
      <p className="min-w-0 truncate text-[12px] font-semibold">
        <span className="mr-1.5 rounded-md bg-white/25 px-1.5 py-0.5 text-[11px] font-extrabold tracking-wider">DEMO</span>
        Prodotti e negozi simulati
      </p>
      <button type="button" onClick={onExit} className="flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-bold hover:bg-white/30">
        <LogOut size={13} aria-hidden="true" /> Esci dalla demo
      </button>
    </div>
  );
}
