"use client";

import { Heart, Minus, Plus, Star, Trash2, X } from "lucide-react";
import { useApp } from "@/store/AppStore";
import { useEffect, type ReactNode } from "react";

export function QtyStepper({ value, onChange, min = 0, max = 20, label }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string }) {
  const removes = value - 1 < Math.max(min, 1) && min === 0;
  return (
    <div className="inline-flex items-center rounded-full border border-brand-100 bg-white" role="group" aria-label={`Quantità ${label}`}>
      <button
        type="button"
        aria-label={removes ? `Rimuovi ${label}` : `Diminuisci ${label}`}
        disabled={value <= min && min > 0}
        onClick={() => onChange(value - 1)}
        className="grid h-9 w-9 place-items-center rounded-full text-ink-800 transition hover:bg-brand-50 disabled:opacity-30"
      >
        {removes ? <Trash2 size={15} /> : <Minus size={16} strokeWidth={2.4} />}
      </button>
      <span className="w-6 text-center text-[15px] font-bold tabular-nums text-ink-900">{value}</span>
      <button
        type="button"
        aria-label={`Aumenta ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="grid h-9 w-9 place-items-center rounded-full text-brand-500 transition hover:bg-brand-50 disabled:opacity-30"
      >
        <Plus size={18} strokeWidth={2.8} />
      </button>
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center gap-3 py-3 text-left">
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink-900">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] leading-snug text-ink-500">{description}</span>}
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-brand-600" : "bg-ink-200"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}

export function ChipGroup<T extends string>({
  options,
  value,
  onToggle,
  label,
}: {
  options: { id: T; label: string }[];
  value: T[];
  onToggle: (id: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.id);
        return (
          <button key={o.id} type="button" aria-pressed={on} onClick={() => onToggle(o.id)} className={`chip ${on ? "chip-on" : ""}`}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Stars({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} stelle`} onClick={() => onChange(n)} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-amber-50">
          <Star size={26} className={n <= value ? "fill-amber-400 text-amber-400" : "text-ink-300"} />
        </button>
      ))}
    </div>
  );
}

/** Bottom sheet panel, used for checkout, product cards and feedback */
export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Chiudi" className="absolute inset-0 bg-ink-900/40" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-[480px] animate-sheet flex-col rounded-t-3xl bg-ink-50">
        <div className="gutter flex items-center justify-between gap-3 border-b border-ink-100 bg-white pb-3 pt-4 sm:rounded-t-3xl">
          <h2 className="text-[17px] font-bold text-ink-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Chiudi" className="grid h-10 w-10 place-items-center rounded-full bg-ink-100 text-ink-600 hover:bg-ink-200">
            <X size={18} />
          </button>
        </div>
        <div className="gutter flex-1 overflow-y-auto pb-6 pt-4">{children}</div>
        {footer && <div className="gutter border-t border-ink-100 bg-white pb-[max(12px,env(safe-area-inset-bottom))] pt-3">{footer}</div>}
      </div>
    </div>
  );
}

export function SectionTitle({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow text-brand-500">{eyebrow}</p>}
        <h2 className="mt-0.5 text-[20px] font-bold leading-tight tracking-tight text-ink-900">{title}</h2>
        {subtitle && <p className="mt-1 text-[13.5px] leading-snug text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">{icon}</span>
      <h2 className="mt-4 text-base font-bold text-ink-900">{title}</h2>
      <p className="mt-1 max-w-[30ch] text-sm text-ink-500">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Heart button on product cards: saves the product in the profile's favourites */
export function FavoriteButton({ id, className = "" }: { id: string; className?: string }) {
  const { data, toggleFavorite } = useApp();
  const on = (data?.profile.favoriteProducts ?? []).includes(id);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(id)}
      aria-pressed={on}
      aria-label={on ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:bg-brand-50 ${on ? "text-accent" : "text-ink-700"} ${className}`}
    >
      <Heart size={20} strokeWidth={2} fill={on ? "currentColor" : "none"} />
    </button>
  );
}
