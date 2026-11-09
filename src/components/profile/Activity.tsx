"use client";

import { Award, ChevronDown, Cloud, Gift, Info, Leaf, MessageSquareText, PiggyBank, Package, Star, Ticket } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "@/components/ui/Controls";
import { OrderTicket } from "@/components/qr/OrderTicket";
import { FeedbackSheet } from "@/components/feedback/FeedbackSheet";
import { AVOIDED_WASTE_SHARE, CO2_FACTORS, CATEGORIES, POINTS, VOUCHER } from "@/data/config";
import { FEEDBACK_QUESTIONS } from "@/data/options";
import { formatDate, formatDayShort, formatInt, formatKg, money } from "@/lib/format";
import { levelOf } from "@/lib/loyalty";
import { impactSummary } from "@/lib/orders";
import type { CategoryId, OrderStatus } from "@/lib/types";
import { useApp } from "@/store/AppStore";

/* ---------------- Orders and bookings ---------------- */
export function OrdersView() {
  const { data, setTab, setQrOrderId } = useApp();
  const [filter, setFilter] = useState<OrderStatus>("attivo");
  const [open, setOpen] = useState<string | null>(null);
  const [fb, setFb] = useState<string | null>(null);
  if (!data) return null;
  const list = data.orders.filter((o) => o.status === filter);
  const count = (s: OrderStatus) => data.orders.filter((o) => o.status === s).length;
  const LABEL: Record<OrderStatus, string> = { attivo: "Attive", completato: "Completati", annullato: "Annullati" };

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Stato ordini" className="grid grid-cols-3 gap-1 rounded-2xl bg-ink-100 p-1">
        {(["attivo", "completato", "annullato"] as OrderStatus[]).map((s) => (
          <button key={s} type="button" role="tab" aria-selected={filter === s} onClick={() => setFilter(s)} className={`min-h-[40px] rounded-xl text-[13px] font-bold ${filter === s ? "bg-white text-ink-900 shadow-sm" : "text-ink-600"}`}>
            {LABEL[s]} ({count(s)})
          </button>
        ))}
      </div>
      {list.length === 0 && <EmptyState icon={<Package size={26} />} title="Nessun ordine qui" text="Le prenotazioni compaiono qui appena le confermi." />}
      <div className="space-y-2.5">
        {list.map((o) => {
          const isOpen = open === o.id;
          return (
            <div key={o.id} className="card overflow-hidden">
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : o.id)} className="flex w-full items-center gap-3 p-4 text-left">
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-bold text-ink-900">{o.id} · {o.storeName}</span>
                  <span className="block text-[12.5px] text-ink-500">
                    {o.status === "attivo" ? "Ritiro" : o.status === "completato" ? "Ritirato" : "Annullato"} {formatDayShort(o.completedAt ?? o.cancelledAt ?? o.pickupDate)} · {o.lines.reduce((a, l) => a + l.qty, 0)} prodotti · {money(o.total)}
                  </span>
                </span>
                {o.status === "completato" && !o.feedbackDone && <span className="badge bg-amber-100 text-amber-800">Feedback</span>}
                <ChevronDown size={18} className={`shrink-0 text-ink-400 transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="space-y-2 border-t border-ink-100 bg-ink-50 p-3">
                  <OrderTicket order={o} showQr={false} />
                  {o.status === "attivo" && (
                    <button type="button" className="btn-primary w-full" onClick={() => { setQrOrderId(o.id); setTab("qr"); }}>
                      Mostra QR code
                    </button>
                  )}
                  {o.status === "completato" && !o.feedbackDone && (
                    <button type="button" className="btn-secondary w-full" onClick={() => setFb(o.id)}>
                      <Star size={16} /> Lascia un feedback · +{POINTS.feedback} punti
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {fb && <FeedbackSheet orderId={fb} onClose={() => setFb(null)} />}
    </div>
  );
}

/* ---------------- Loyalty, points and vouchers ---------------- */
export function LoyaltyView() {
  const { data } = useApp();
  if (!data) return null;
  const lvl = levelOf(data.points.lifetime);
  const toVoucher = VOUCHER.threshold - data.points.balance;
  const available = data.vouchers.filter((v) => !v.usedAt);
  const used = data.vouchers.filter((v) => v.usedAt);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-brand-800 p-5 text-white">
        <p className="text-[12.5px] text-white/75">Punti FOODPULSE</p>
        <p className="text-[38px] font-extrabold leading-none tabular-nums">{formatInt(data.points.balance)}</p>
        <div className="mt-4">
          <div className="flex justify-between text-[12.5px] text-white/80">
            <span>Prossimo voucher da {VOUCHER.value} €</span>
            <span className="tabular-nums">{formatInt(data.points.balance)}/{VOUCHER.threshold}</span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuemin={0} aria-valuemax={VOUCHER.threshold} aria-valuenow={data.points.balance} aria-label="Avanzamento verso il prossimo voucher">
            <div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${(data.points.balance / VOUCHER.threshold) * 100}%` }} />
          </div>
          <p className="mt-1.5 text-[12px] text-white/75">Mancano {formatInt(toVoucher)} punti: il voucher si genera da solo.</p>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/10 p-3">
          <Award size={22} className="text-leaf" />
          <div className="flex-1">
            <p className="text-[14px] font-bold">Livello {lvl.current.name}</p>
            <p className="text-[12px] text-white/75">{lvl.next ? `${formatInt(lvl.next.min - data.points.lifetime)} punti totali per diventare ${lvl.next.name}` : "Hai raggiunto il livello più alto"}</p>
          </div>
        </div>
      </section>

      <section className="card p-4">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-ink-900"><Info size={16} className="text-brand-600" /> Come funzionano i punti</h3>
        <ul className="mt-2 space-y-1.5 text-[13.5px] text-ink-700">
          <li>• {POINTS.perEuro} punto per ogni euro di prenotazione</li>
          <li>• +{POINTS.bonusAdvance3} punti se prenoti con 3 giorni di anticipo, +{POINTS.bonusAdvance5} con 5 giorni</li>
          <li>• +{POINTS.feedback} punti per ogni feedback dopo la spesa</li>
          <li>• Ogni {VOUCHER.threshold} punti ricevi un voucher da {VOUCHER.value} €, da usare nel carrello</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-ink-900"><Ticket size={16} /> Voucher disponibili</h3>
        {available.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-[13px] text-ink-500 ring-1 ring-ink-100">Nessun voucher disponibile per ora.</p>
        ) : (
          available.map((v) => (
            <div key={v.id} className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 p-4">
              <Gift size={22} className="text-brand-700" />
              <div className="flex-1">
                <p className="text-[16px] font-extrabold text-brand-900">{money(v.value)} di sconto</p>
                <p className="font-mono text-[12.5px] text-brand-800">{v.code} · dal {formatDate(v.createdAt)}</p>
              </div>
            </div>
          ))
        )}
        {used.length > 0 && <p className="text-[12.5px] text-ink-500">{used.length} voucher già utilizzati.</p>}
      </section>

      <section className="space-y-2">
        <h3 className="text-[15px] font-bold text-ink-900">Storico punti e premi</h3>
        <ul className="card divide-y divide-ink-100">
          {data.points.events.slice(0, 15).map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[13.5px]">
              <span className="min-w-0">
                <span className="block font-semibold text-ink-800">{e.label}</span>
                <span className="text-[12px] text-ink-500">{formatDate(e.date)}</span>
              </span>
              <span className={`shrink-0 font-bold tabular-nums ${e.points >= 0 ? "text-brand-700" : "text-ink-500"}`}>{e.points >= 0 ? "+" : ""}{e.points}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---------------- My impact ---------------- */
export function ImpactView() {
  const { data } = useApp();
  if (!data) return null;
  const s = impactSummary(data.orders);
  const tiles = [
    { icon: PiggyBank, label: "Risparmiato", value: money(s.saved), cls: "bg-brand-700 text-white", sub: "con le prenotazioni" },
    { icon: Leaf, label: "Cibo non sprecato", value: formatKg(s.kg), cls: "bg-white", sub: "stima" },
    { icon: Cloud, label: "CO₂e evitata", value: formatKg(s.co2), cls: "bg-white", sub: "stima" },
    { icon: Package, label: "Prodotti prenotati", value: formatInt(s.products), cls: "bg-white", sub: `${s.count} prenotazioni` },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        {tiles.map(({ icon: Icon, label, value, cls, sub }) => (
          <div key={label} className={`rounded-2xl border border-ink-100 p-4 ${cls}`}>
            <Icon size={20} className={cls.includes("text-white") ? "text-leaf" : "text-brand-600"} />
            <p className={`mt-2 text-[12px] font-semibold ${cls.includes("text-white") ? "text-white/80" : "text-ink-500"}`}>{label}</p>
            <p className="text-[22px] font-extrabold leading-tight tabular-nums">{value}</p>
            <p className={`text-[11.5px] ${cls.includes("text-white") ? "text-white/70" : "text-ink-500"}`}>{sub}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-ink-100">
        <span className="text-[13.5px] font-semibold text-ink-700">Punti accumulati in totale</span>
        <span className="text-[18px] font-extrabold tabular-nums text-brand-700">{formatInt(data.points.lifetime)}</span>
      </div>

      <section className="card p-4">
        <h3 className="text-[15px] font-bold text-ink-900">Risparmio per settimana</h3>
        <p className="text-[12.5px] text-ink-500">Ultime 8 settimane, in euro</p>
        <div className="mt-3 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={s.weeks} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#EDEEE8" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#646D63" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#646D63" }} axisLine={false} tickLine={false} width={44} tickFormatter={(v: number) => v.toLocaleString("it-IT", { maximumFractionDigits: 1 })} />
              <Tooltip formatter={(v: number) => [money(v), "Risparmio"]} labelFormatter={(l) => (l === "Questa" ? "Questa settimana" : `${String(l).replace("-", "")} settimane fa`)} cursor={{ fill: "#EEF7F0" }} />
              <Bar dataKey="saved" fill="#1F7A43" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card p-4">
        <h3 className="text-[15px] font-bold text-ink-900">Cibo non sprecato per settimana</h3>
        <p className="text-[12.5px] text-ink-500">Stima in kg</p>
        <div className="mt-3 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={s.weeks} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#EDEEE8" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#646D63" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#646D63" }} axisLine={false} tickLine={false} width={44} tickFormatter={(v: number) => v.toLocaleString("it-IT", { maximumFractionDigits: 1 })} />
              <Tooltip formatter={(v: number) => [formatKg(v), "Cibo non sprecato"]} cursor={{ fill: "#EEF7F0" }} />
              <Bar dataKey="kg" fill="#4FA96B" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl bg-sand p-4 text-[12.5px] leading-relaxed text-ink-700">
        <p className="font-bold text-ink-900">Come stimiamo l&apos;impatto</p>
        <p className="mt-1">
          Non tutto ciò che prenoti sarebbe stato sprecato. Per ogni kg prenotato e non annullato contiamo come &ldquo;non sprecato&rdquo; il {Math.round(AVOIDED_WASTE_SHARE * 100)}%, cioè la quota media
          di invenduto dei freschi. La CO₂e usa fattori indicativi per reparto (kg CO₂e per kg):{" "}
          {(Object.keys(CO2_FACTORS) as CategoryId[]).map((c) => `${CATEGORIES[c].label.toLowerCase()} ${CO2_FACTORS[c].toLocaleString("it-IT")}`).join(", ")}. Sono stime dimostrative, non
          certificazioni.
        </p>
      </section>
    </div>
  );
}

/* ---------------- Submitted feedback ---------------- */
export function FeedbacksView() {
  const { data } = useApp();
  if (!data) return null;
  if (data.feedbacks.length === 0) return <EmptyState icon={<MessageSquareText size={26} />} title="Nessun feedback" text="Dopo ogni ritiro ti chiederemo com'è andata." />;
  return (
    <div className="space-y-2.5">
      {data.feedbacks.map((f) => {
        const order = data.orders.find((o) => o.id === f.orderId);
        return (
          <div key={f.orderId} className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[14px] font-bold text-ink-900">{f.orderId}{order ? ` · ${order.storeName}` : ""}</p>
              <span className="badge bg-brand-50 text-brand-800">+{f.points} punti</span>
            </div>
            <p className="text-[12px] text-ink-500">{formatDate(f.date)}</p>
            <ul className="mt-2 grid gap-1 text-[12.5px] text-ink-700">
              {FEEDBACK_QUESTIONS.filter((q) => f.ratings[q.id]).map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0">{q.label}</span>
                  <span className="flex shrink-0" aria-label={`${f.ratings[q.id]} stelle su 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={13} className={n <= f.ratings[q.id] ? "fill-amber-400 text-amber-400" : "text-ink-200"} />
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            {f.comment && <p className="mt-2 rounded-xl bg-ink-50 p-2.5 text-[13px] italic text-ink-700">&ldquo;{f.comment}&rdquo;</p>}
          </div>
        );
      })}
    </div>
  );
}
