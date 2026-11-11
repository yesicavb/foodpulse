"use client";

import { CheckCircle2, Gift, Loader2, MessageSquareHeart, Send } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Stars } from "@/components/ui/Controls";
import { POINTS } from "@/data/config";
import { APP_FEEDBACK_QUESTIONS as Q } from "@/data/options";
import { formatDate } from "@/lib/format";
import type { AppFeedbackAnswers } from "@/lib/types";
import { useApp } from "@/store/AppStore";

const MAX_LENGTH = 2000;
const EMPTY: AppFeedbackAnswers = { visual_rating: 0, preorder: "", profile_banners: "", discounts: "", improvements: "" };

/**
 * Feedback tab: five questions about the app itself (questions in data/options.ts),
 * separate from the post-pickup survey of each order.
 */
export function AppFeedbackScreen() {
  const { data, sendAppFeedback, markFeedbackSeen } = useApp();
  const [answers, setAnswers] = useState<AppFeedbackAnswers>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [earned, setEarned] = useState<number | null>(null);

  // opening the tab removes the orange dot from the bottom bar
  const seen = data?.feedbackTabSeen;
  useEffect(() => {
    if (data && !seen) markFeedbackSeen();
  }, [data, seen, markFeedbackSeen]);

  if (!data) return null;
  const history = data.appFeedbacks ?? [];
  const pointsAvailable = !history.some((f) => f.points > 0);
  const set = <K extends keyof AppFeedbackAnswers>(k: K, v: AppFeedbackAnswers[K]) => {
    setAnswers((a) => ({ ...a, [k]: v }));
    setError(null);
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!answers.visual_rating || !answers.preorder || !answers.profile_banners || !answers.discounts) {
      return setError("Rispondi alle domande da 1 a 4 prima di inviare. La 5 è facoltativa.");
    }
    setBusy(true);
    setError(null);
    const r = await sendAppFeedback(answers);
    setBusy(false);
    if (!r.ok) return setError(r.error);
    setEarned(r.points ?? 0);
    setAnswers(EMPTY);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (earned !== null) {
    return (
      <div className="card flex flex-col items-center px-6 py-10 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <CheckCircle2 size={28} />
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink-900">Grazie per il tuo feedback!</h2>
        <p className="mt-1 max-w-[32ch] text-sm text-ink-500">Lo useremo per migliorare FOODPULSE.</p>
        {earned > 0 && (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-bold text-brand-700">
            <Gift size={16} /> +{earned} punti aggiunti
          </p>
        )}
        <button type="button" className="btn-secondary mt-6" onClick={() => setEarned(null)}>
          Invia un altro feedback
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl bg-accent p-4 pr-24 text-white shadow-card">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-white/85">Feedback</p>
        <h1 className="mt-1 text-[19px] font-semibold leading-snug">Aiutaci a migliorare FOODPULSE</h1>
        <p className="mt-1 text-[13.5px] leading-snug text-white/90">Lasciaci la tua recensione: bastano due minuti e ogni risposta conta.</p>
        <span className="absolute right-4 top-1/2 grid h-14 w-14 -translate-y-1/2 rotate-12 place-items-center rounded-2xl bg-white text-accent shadow-card" aria-hidden="true">
          <MessageSquareHeart size={28} strokeWidth={2.4} />
        </span>
      </div>

      {pointsAvailable ? (
        <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5 text-[13.5px] font-semibold text-brand-800">
          <Gift size={17} className="shrink-0" /> Ricevi +{POINTS.appFeedback} punti per il tuo primo feedback
        </p>
      ) : (
        history[0] && <p className="px-1 text-[13px] text-ink-500">Ultimo feedback inviato il {formatDate(history[0].date)}. Puoi inviarne un altro quando vuoi.</p>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Question n={1} label={Q.visual_rating.label}>
          <Stars value={answers.visual_rating} onChange={(v) => set("visual_rating", v)} label={Q.visual_rating.label} />
        </Question>

        <Question n={2} label={Q.preorder.label}>
          <Options name="preorder" options={Q.preorder.options} value={answers.preorder} onChange={(v) => set("preorder", v)} />
        </Question>

        <Question n={3} label={Q.profile_banners.label}>
          <Options name="profile_banners" options={Q.profile_banners.options} value={answers.profile_banners} onChange={(v) => set("profile_banners", v)} />
        </Question>

        <Question n={4} label={Q.discounts.label}>
          <Options name="discounts" options={Q.discounts.options} value={answers.discounts} onChange={(v) => set("discounts", v)} />
        </Question>

        <Question n={5} label={Q.improvements.label} optional>
          <textarea
            id="app-fb-improvements"
            aria-label={Q.improvements.label}
            className="input min-h-[110px] resize-y"
            value={answers.improvements}
            maxLength={MAX_LENGTH}
            onChange={(e) => set("improvements", e.target.value)}
            placeholder="Scrivi qui le tue idee"
          />
          <p className="mt-1 text-right text-[12px] tabular-nums text-ink-500">
            {answers.improvements.length}/{MAX_LENGTH}
          </p>
        </Question>

        {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13.5px] text-rose-700">{error}</p>}

        <button type="submit" className="btn-primary h-12 w-full" disabled={busy}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Invia feedback
        </button>
      </form>
    </div>
  );
}

function Question({ n, label, optional, children }: { n: number; label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <fieldset className="card p-4">
      <legend className="sr-only">{label}</legend>
      <p aria-hidden="true" className="mb-3 flex gap-2.5 text-[14.5px] font-semibold leading-snug text-ink-900">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-[12px] font-bold text-white">{n}</span>
        <span>
          {label}
          {optional && <span className="ml-1 font-normal text-ink-500">(facoltativa)</span>}
        </span>
      </p>
      {children}
    </fieldset>
  );
}

function Options({ name, options, value, onChange }: { name: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="radiogroup" className="grid gap-2">
      {options.map((o) => {
        const on = value === o;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={on}
            data-group={name}
            onClick={() => onChange(o)}
            className={`flex min-h-[44px] items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[14px] font-semibold transition ${on ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-200 bg-white text-ink-700 hover:border-ink-300"}`}
          >
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-brand-600" : "border-ink-300"}`}>
              {on && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
            </span>
            {o}
          </button>
        );
      })}
    </div>
  );
}
