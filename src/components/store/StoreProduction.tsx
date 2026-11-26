"use client";

import { useState } from "react";
import { CalendarDays, ChefHat } from "lucide-react";
import { localDay, type DeskOrder } from "@/lib/desk";
import { money } from "@/lib/format";

type Demand = { name: string; unit: "kg" | "pcs"; quantity: number };

/** Confirmed demand, not a forecast of additional walk-in sales. */
export function productionPlan(orders: DeskOrder[], date: string) {
  const active = orders.filter(o => o.pickupDate === date && ["da_preparare", "in_preparazione", "pronto"].includes(o.status));
  const pending = active.filter(o => o.status !== "pronto");
  const grouped = new Map<string, Demand>();
  for (const order of pending) {
    for (const line of order.lines) {
      const unit = typeof line.kg === "number" && line.kg > 0 ? "kg" : "pcs";
      const quantity = unit === "kg" ? line.kg! : line.qty;
      if (!Number.isFinite(quantity) || quantity <= 0) continue;
      const key = JSON.stringify([line.name, unit]);
      const row = grouped.get(key) ?? { name: line.name, unit, quantity: 0 };
      row.quantity += quantity;
      grouped.set(key, row);
    }
  }
  const products = [...grouped.values()].sort((a,b) => a.unit.localeCompare(b.unit) || b.quantity - a.quantity || a.name.localeCompare(b.name));
  return { active: active.length, pending: pending.length, ready: active.length - pending.length,
    value: active.reduce((sum,o) => sum + o.total, 0), products,
    kg: products.filter(p => p.unit === "kg").reduce((sum,p) => sum + p.quantity,0),
    pieces: products.filter(p => p.unit === "pcs").reduce((sum,p) => sum + p.quantity,0) };
}

export function StoreProduction({ orders, stale }: { orders: DeskOrder[]; stale: boolean }) {
  const [offset,setOffset] = useState(1);
  const target = new Date();
  target.setDate(target.getDate() + offset);
  const date = localDay(target);
  const plan = productionPlan(orders,date);
  const kg = (n: number) => n.toLocaleString("it-IT", { maximumFractionDigits: 2 });
  return (
    <section className="card space-y-3 p-4" aria-labelledby="production-title">
      <div className="flex items-center gap-2 text-brand-700">
        <ChefHat size={20} aria-hidden="true" />
        <h2 id="production-title" className="text-[17px] font-bold">Pianificazione della produzione</h2>
      </div>
      <p className="text-[12.5px] text-ink-500">Domanda confermata dalle prenotazioni, non una previsione delle vendite in negozio.</p>
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-ink-100 p-1">
        {[{n:0,label:"Oggi"},{n:1,label:"Domani"},{n:2,label:"Dopodomani"}].map(d => (
          <button key={d.n} type="button" aria-pressed={offset===d.n} onClick={()=>setOffset(d.n)} className={`rounded-xl py-2 text-[12px] font-bold ${offset===d.n?"bg-white text-brand-800 shadow-sm":"text-ink-600"}`}>{d.label}</button>
        ))}
      </div>
      <p className="flex items-center gap-1 text-[13px] text-ink-600"><CalendarDays size={15} aria-hidden="true"/>{date.split("-").reverse().join("/")}</p>
      {stale && <p role="status" className="rounded-xl bg-amber-50 p-2 text-[12px] text-amber-900">Dati non aggiornati: verifica la connessione.</p>}
      <dl className="grid grid-cols-2 gap-2">
        {[{label:"Ordini da preparare",value:plan.pending},{label:"Valore prenotato",value:money(plan.value)},{label:"Ordini già pronti",value:plan.ready},{label:"Prenotazioni attive",value:plan.active}].map(m=>(
          <div key={m.label} className="rounded-2xl bg-brand-50 p-3">
            <dt className="text-[11.5px] text-brand-800">{m.label}</dt>
            <dd className="mt-1 text-[19px] font-bold tabular-nums text-brand-900">{m.value}</dd>
          </div>
        ))}
      </dl>
      <h3 className="text-[14px] font-bold text-ink-900">Quantità ancora da preparare</h3>
      <p className="text-[12px] text-ink-500">Include gli ordini in preparazione; esclude quelli pronti, ritirati e annullati.</p>
      {plan.products.length===0 ? <p className="rounded-2xl bg-ink-50 p-3 text-center text-[13px] text-ink-500">Nessun prodotto da preparare per questa data.</p> :
        <ul className="space-y-2.5">
          {plan.products.map(p=>{
            const max = Math.max(...plan.products.filter(x=>x.unit===p.unit).map(x=>x.quantity));
            return <li key={JSON.stringify([p.name,p.unit])}>
              <div className="flex justify-between gap-2 text-[13px]">
                <span className="text-ink-800">{p.name}</span>
                <span className="shrink-0 font-bold tabular-nums text-brand-800">{p.unit==="kg"?`${kg(p.quantity)} kg`:`${p.quantity}×`}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-brand-50" aria-hidden="true"><div className="h-full rounded-full bg-brand-400" style={{width:`${100*p.quantity/max}%`}}/></div>
            </li>;
          })}
        </ul>
      }
      <div className="rounded-2xl bg-brand-900 p-3 text-white">
        <p className="text-[12px] font-medium">Totale ancora da preparare</p>
        <p className="mt-1 text-[18px] font-bold tabular-nums">{kg(plan.kg)} kg · {plan.pieces}×</p>
        <p className="mt-1 text-[12px] text-white/80">Organizza la preparazione sulla base delle prenotazioni ricevute.</p>
      </div>
    </section>
  );
}
