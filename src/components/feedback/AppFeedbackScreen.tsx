"use client";

import { Bug, CheckCircle2, Lightbulb, Loader2, MessageSquare, Send, Star } from "lucide-react";
import { useState, type FormEvent } from "react";
import { SectionTitle, Stars, Toggle } from "@/components/ui/Controls";
import { formatDate } from "@/lib/format";
import type { AppFeedbackKind } from "@/lib/types";
import { useApp } from "@/store/AppStore";

const KINDS: { id: AppFeedbackKind; label: string; icon: typeof Lightbulb }[] = [
  { id: "idea", label: "Idea", icon: Lightbulb },
  { id: "problema", label: "Problema", icon: Bug },
  { id: "altro", label: "Altro", icon: MessageSquare },
];
const KIND_LABEL: Record<AppFeedbackKind, string> = { idea: "Idea", problema: "Problema", altro: "Altro" };
const MAX_LENGTH = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Feedback tab: general feedback about the app (ideas, problems, comments),
 * separate from the post-shopping survey of each order.
 */
export function AppFeedbackScreen() {
  const { data, account, sendAppFeedback, notify } = useApp();
  const [kind, setKind] = useState<AppFeedbackKind>("idea");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [canContact, setCanContact] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!data) return null;
  const history = data.appFeedbacks ?? [];
  const askEmail = canContact && !account?.cloud;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return setError("Scrivi il tuo messaggio prima di inviare.");
    if (askEmail && !EMAIL_RE.test(email.trim())) return setError("Inserisci un indirizzo email valido per essere ricontattato.");
    setBusy(true);
    setError(null);
    const r = await sendAppFeedback({ kind, rating, message, canContact, email });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    setSent(true);
    setMessage("");
    setRating(0);
    setCanContact(false);
    setEmail("");
    notify("Feedback inviato. Grazie!");
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        eyebrow="Feedback"
        title="Aiutaci a migliorare FOODPULSE"
        subtitle="Un'idea, un problema o un commento sull'app? Leggiamo ogni messaggio."
      />

      {sent ? (
        <div className="card flex flex-col items-center px-6 py-8 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <CheckCircle2 size={28} />
          </span>
          <h2 className="mt-4 text-base font-bold text-ink-900">Grazie per il tuo feedback!</h2>
          <p className="mt-1 max-w-[32ch] text-sm text-ink-500">Lo abbiamo ricevuto e lo useremo per migliorare l&apos;app.</p>
          <button type="button" className="btn-secondary mt-5" onClick={() => setSent(false)}>
            Scrivi un altro feedback
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="card space-y-5 p-4" noValidate>
          <div>
            <p className="field-label">Di cosa si tratta?</p>
            <div role="radiogroup" aria-label="Tipo di feedback" className="flex flex-wrap gap-2">
              {KINDS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={kind === id}
                  onClick={() => setKind(id)}
                  className={`chip ${kind === id ? "chip-on" : ""}`}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="field-label">Come valuti l&apos;app finora? <span className="font-normal text-ink-500">(facoltativo)</span></p>
            <Stars value={rating} onChange={setRating} label="Valutazione dell'app" />
          </div>

          <div>
            <label htmlFor="app-fb-message" className="field-label">Il tuo messaggio</label>
            <textarea
              id="app-fb-message"
              className="input min-h-[120px] resize-y"
              value={message}
              maxLength={MAX_LENGTH}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                kind === "problema"
                  ? "Cosa è successo? In quale schermata?"
                  : kind === "idea"
                    ? "Cosa ti piacerebbe trovare nell'app?"
                    : "Scrivi qui il tuo commento"
              }
            />
            <p className="mt-1 text-right text-[12px] tabular-nums text-ink-500">
              {message.length}/{MAX_LENGTH}
            </p>
          </div>

          <div className="border-t border-ink-100">
            <Toggle
              checked={canContact}
              onChange={setCanContact}
              label="Potete ricontattarmi"
              description={account?.cloud ? `Ti scriveremo a ${account.email} solo per questo feedback.` : "Ti scriveremo solo per questo feedback."}
            />
            {askEmail && (
              <div>
                <label htmlFor="app-fb-email" className="field-label">La tua email</label>
                <input
                  id="app-fb-email"
                  type="email"
                  autoComplete="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@esempio.it"
                />
              </div>
            )}
          </div>

          {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13.5px] text-rose-700">{error}</p>}

          <button type="submit" className="btn-primary h-12 w-full" disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Invia feedback
          </button>
        </form>
      )}

      {history.length > 0 && (
        <section aria-labelledby="app-fb-history">
          <h2 id="app-fb-history" className="eyebrow mb-2 px-1">I tuoi feedback inviati</h2>
          <ul className="card divide-y divide-ink-100">
            {history.map((f) => (
              <li key={f.id} className="px-4 py-3">
                <div className="flex items-center gap-2 text-[12px] text-ink-500">
                  <span className="badge bg-brand-50 text-brand-700">{KIND_LABEL[f.kind]}</span>
                  {f.rating > 0 && (
                    <span className="inline-flex items-center gap-0.5" aria-label={`${f.rating} stelle su 5`}>
                      <Star size={12} className="fill-amber-400 text-amber-400" /> {f.rating}/5
                    </span>
                  )}
                  <span className="ml-auto">{formatDate(f.date)}</span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[14px] leading-snug text-ink-800">{f.message}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
