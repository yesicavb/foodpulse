"use client";

import { useMemo, useState } from "react";
import { CATEGORIES } from "@/data/config";
import { FRESH, SHELF } from "@/data/products";
import { localDay, type DeskOrder } from "@/lib/desk";
import { money } from "@/lib/format";

type Period = 7 | 30 | 0;
const DAY_NAMES = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

const CATEGORY_OF = new Map<string, string>([
  ...FRESH.map((p) => [p.name, CATEGORIES[p.category].label] as [string, string]),
  ...SHELF.map((p) => [p.name, "Dispensa e scaffale"] as [string, string]),
]);

/** Simple horizontal bar, value in % of the largest one */
function Bar({ label, value, max, right }: { label: string; value: number; max: number; right: string }) {
  return (
    <li className="grid gap-1">
      <div className="flex items-baseline justify-between gap-2 text-[13.5px]">
        <span className="truncate text-ink-800">{label}</span>
        <span className="shrink-0 font-bold tabular-nums text-ink-900">{right}</span>
      </div>
      <div className="h-2 rounded-full bg-ink-100">
        <div className="h-2 rounded-full bg-brand-500" style={{ width: `${max ? Math.max(3, (value / max) * 100) : 0}%` }} />
      </div>
    </li>
  );
}

function Card({ title, children, sub }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="card p-4">
      <h2 className="text-[15px] font-bold text-ink-900">{title}</h2>
      {sub && <p className="mb-3 text-[12.5px] text-ink-500">{sub}</p>}
      {!sub && <div className="mb-3" />}
      {children}
    </section>
  );
}

/** Statistics tab of the supermarket dashboard: what was booked, when and how */
export function StoreStats({ orders }: { orders: DeskOrder[] }) {
  const [period, setPeriod] = useState<Period>(30);

  const s = useMemo(() => {
    const from = new Date();
    from.setDate(from.getDate() - (period || 3650));
    const fromDay = localDay(from);
    const inPeriod = orders.filter((o) => localDay(o.createdAt) >= fromDay);
    const valid = inPeriod.filter((o) => o.status !== "annullato");
    const revenue = valid.reduce((a, o) => a + o.total, 0);
    const collected = inPeriod.filter((o) => o.status === "completato").length;
    const cancelled = inPeriod.length - valid.length;

    const products = new Map<string, number>();
    const cats = new Map<string, number>();
    for (const o of valid)
      for (const l of o.lines) {
        products.set(l.name, (products.get(l.name) ?? 0) + l.qty);
        const c = CATEGORY_OF.get(l.name) ?? "Altro";
        cats.set(c, (cats.get(c) ?? 0) + l.qty);
      }
    const units = [...products.values()].reduce((a, b) => a + b, 0);

    const slots = new Map<string, number>();
    const weekdays = new Array(7).fill(0) as number[];
    const methods = new Map<string, number>();
    for (const o of valid) {
      slots.set(o.slot, (slots.get(o.slot) ?? 0) + 1);
      weekdays[new Date(`${o.pickupDate}T12:00:00`).getDay()]++;
      methods.set(o.method, (methods.get(o.method) ?? 0) + 1);
    }

    // orders per day for the last 14 days
    const days: { d: string; label: string; n: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const x = new Date();
      x.setDate(x.getDate() - i);
      const d = localDay(x);
      days.push({ d, label: i === 0 ? "oggi" : String(x.getDate()), n: valid.filter((o) => localDay(o.createdAt) === d).length });
    }

    const sorted = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);
    return {
      count: valid.length,
      revenue,
      avg: valid.length ? revenue / valid.length : 0,
      units,
      collectedPct: inPeriod.length ? Math.round((collected / inPeriod.length) * 100) : 0,
      cancelled,
      products: sorted(products).slice(0, 8),
      cats: sorted(cats),
      slots: sorted(slots),
      weekdays,
      methods: sorted(methods),
      days,
    };
  }, [orders, period]);

  const maxDay = Math.max(1, ...s.days.map((d) => d.n));
  const maxWeek = Math.max(1, ...s.weekdays);
  const order = [1, 2, 3, 4, 5, 6, 0];
  const METHOD: Record<string, string> = { instore: "Ritiro in negozio", locker: "Locker", delivery: "Consegna" };

  return (
    <div className="grid gap-3">
      <div role="tablist" aria-label="Periodo" className="flex gap-2">
        {([
          [7, "Ultimi 7 giorni"],
          [30, "Ultimi 30 giorni"],
          [0, "Sempre"],
        ] as [Period, string][]).map(([p, l]) => (
          <button key={p} type="button" role="tab" aria-selected={period === p} onClick={() => setPeriod(p)} className={`chip ${period === p ? "chip-on" : ""}`}>
            {l}
          </button>
        ))}
      </div>

      {s.count === 0 ? (
        <div className="card px-5 py-10 text-center">
          <p className="text-[15px] font-bold text-ink-900">Ancora nessun dato</p>
          <p className="mt-1 text-[13px] text-ink-500">Le statistiche si riempiono man mano che arrivano le prenotazioni.</p>
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-2">
            {[
              ["Prenotazioni", String(s.count)],
              ["Valore prenotato", money(s.revenue)],
              ["Scontrino medio", money(s.avg)],
              ["Prodotti prenotati", String(s.units)],
              ["Ritirate", `${s.collectedPct}%`],
              ["Annullate", String(s.cancelled)],
            ].map(([k, v]) => (
              <div key={k} className="card px-3 py-3">
                <dt className="text-[12px] font-semibold text-ink-500">{k}</dt>
                <dd className="mt-0.5 text-[20px] font-bold tabular-nums text-ink-900">{v}</dd>
              </div>
            ))}
          </dl>

          <Card title="Prenotazioni al giorno" sub="Ultime due settimane, per giorno in cui è arrivata la prenotazione">
            <div className="flex h-28 items-end gap-1" aria-hidden="true">
              {s.days.map((d) => (
                <div key={d.d} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-bold tabular-nums text-ink-600">{d.n || ""}</span>
                  <div className="w-full rounded-t-md bg-brand-500" style={{ height: `${(d.n / maxDay) * 72}px`, minHeight: d.n ? 4 : 1, opacity: d.n ? 1 : 0.25 }} />
                  <span className="text-[10px] text-ink-500">{d.label}</span>
                </div>
              ))}
            </div>
            <p className="sr-only">{s.days.map((d) => `${d.d}: ${d.n}`).join(", ")}</p>
          </Card>

          <Card title="Prodotti più prenotati" sub="Pezzi prenotati: utile per ordinare la merce e ridurre lo spreco">
            <ul className="grid gap-2.5">
              {s.products.map(([n, q]) => (
                <Bar key={n} label={n} value={q} max={s.products[0][1]} right={`${q} pz`} />
              ))}
            </ul>
          </Card>

          <Card title="Reparti" sub="Quota dei pezzi prenotati per reparto">
            <ul className="grid gap-2.5">
              {s.cats.map(([n, q]) => (
                <Bar key={n} label={n} value={q} max={s.cats[0][1]} right={`${Math.round((q / s.units) * 100)}%`} />
              ))}
            </ul>
          </Card>

          <Card title="Quando ritirano" sub="Giorni e fasce orarie scelti dai clienti: utile per organizzare il personale">
            <div className="mb-4 flex h-20 items-end gap-1.5" aria-hidden="true">
              {order.map((i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t-md bg-sky-500" style={{ height: `${(s.weekdays[i] / maxWeek) * 52}px`, minHeight: 2 }} />
                  <span className="text-[11px] font-semibold text-ink-600">{DAY_NAMES[i]}</span>
                </div>
              ))}
            </div>
            <ul className="grid gap-2.5">
              {s.slots.map(([n, q]) => (
                <Bar key={n} label={n} value={q} max={s.slots[0][1]} right={`${q}`} />
              ))}
            </ul>
          </Card>

          <Card title="Modalità di ritiro">
            <ul className="grid gap-2.5">
              {s.methods.map(([n, q]) => (
                <Bar key={n} label={METHOD[n] ?? n} value={q} max={s.count} right={`${Math.round((q / s.count) * 100)}%`} />
              ))}
            </ul>
          </Card>

          <p className="px-1 text-[12px] leading-snug text-ink-500">
            Dati aggregati delle prenotazioni di questo punto vendita (ultime 300). Nessun dato personale dei clienti.
          </p>
        </>
      )}
    </div>
  );
}
