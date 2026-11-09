"use client";

import { ArrowLeft, Eye, EyeOff, Leaf, Loader2, ShoppingBasket, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { useApp } from "@/store/AppStore";

type View = "welcome" | "login" | "register" | "forgot";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthScreen() {
  const [view, setView] = useState<View>("welcome");
  return (
    <div className="min-h-screen bg-white">
      {view === "welcome" && <Welcome go={setView} />}
      {view === "login" && <Login go={setView} />}
      {view === "register" && <Register go={setView} />}
      {view === "forgot" && <Forgot go={setView} />}
    </div>
  );
}

function Welcome({ go }: { go: (v: View) => void }) {
  const { startDemo } = useApp();
  return (
    <div className="gutter flex min-h-screen flex-col pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(40px,env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col items-center justify-center text-center animate-rise">
        <div className="grid h-28 w-28 place-items-center rounded-[32px] bg-brand-50">
          <LogoMark size={76} />
        </div>
        <div className="mt-6">
          <Wordmark size={34} />
        </div>
        <p className="mt-3 max-w-[30ch] text-[15px] leading-relaxed text-ink-500">
          Prenota in anticipo pane, carne, pesce e freschi nel tuo supermercato. Risparmi tu, si spreca meno.
        </p>
        <ul className="mt-8 grid w-full max-w-sm gap-2.5 text-left">
          {[
            { icon: Sparkles, t: "Una lista della spesa pensata per te" },
            { icon: ShoppingBasket, t: "Fino al 15% di sconto prenotando prima" },
            { icon: Leaf, t: "Punti, voucher e il tuo impatto sullo spreco" },
          ].map(({ icon: Icon, t }) => (
            <li key={t} className="flex items-center gap-3 rounded-2xl bg-ink-50 px-4 py-3 text-[14px] font-semibold text-ink-700">
              <Icon size={18} className="shrink-0 text-brand-600" /> {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto mt-8 grid w-full max-w-sm gap-2.5">
        <button type="button" className="btn-primary h-12 text-[15px]" onClick={() => go("register")}>
          Registrati
        </button>
        <button type="button" className="btn-secondary h-12 text-[15px]" onClick={() => go("login")}>
          Accedi
        </button>
        <button type="button" className="btn-ghost h-12 text-[15px]" onClick={startDemo}>
          Prova la demo senza registrarti
        </button>
        <p className="mt-1 text-center text-[11.5px] leading-snug text-ink-500">
          Prototipo dimostrativo: supermercati, prezzi e campagne sono simulati.
        </p>
      </div>
    </div>
  );
}

function AuthLayout({ title, subtitle, back, children }: { title: string; subtitle: string; back: () => void; children: React.ReactNode }) {
  return (
    <div className="gutter mx-auto flex min-h-screen max-w-md flex-col pb-10 pt-[max(20px,env(safe-area-inset-top))]">
      <button type="button" onClick={back} aria-label="Indietro" className="grid h-10 w-10 place-items-center rounded-full bg-ink-100 text-ink-700">
        <ArrowLeft size={18} />
      </button>
      <div className="mt-6 flex items-center gap-2">
        <LogoMark size={30} />
        <Wordmark size={16} />
      </div>
      <h1 className="mt-5 text-[26px] font-extrabold tracking-tight text-ink-900">{title}</h1>
      <p className="mt-1 text-[15px] text-ink-500">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function PasswordInput({ id, value, onChange, autoComplete }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} className="input pr-12" type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Nascondi password" : "Mostra password"} className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-ink-500">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function Login({ go }: { go: (v: View) => void }) {
  const { login, startDemo } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) return setError("Inserisci un indirizzo email valido.");
    if (!password) return setError("Inserisci la password.");
    setBusy(true);
    const r = await login(email, password);
    setBusy(false);
    if (!r.ok) setError(r.error);
  }

  return (
    <AuthLayout title="Bentornato" subtitle="Accedi per ritrovare la tua spesa e le tue prenotazioni." back={() => go("welcome")}>
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <div>
          <label htmlFor="login-email" className="field-label">Email</label>
          <input id="login-email" className="input" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="login-password" className="field-label">Password</label>
          <PasswordInput id="login-password" value={password} onChange={setPassword} autoComplete="current-password" />
        </div>
        <button type="button" onClick={() => go("forgot")} className="justify-self-start text-[13px] font-semibold text-brand-700 underline underline-offset-2">
          Password dimenticata?
        </button>
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13.5px] text-rose-700">{error}</p>}
        <button type="submit" className="btn-primary h-12" disabled={busy}>
          {busy && <Loader2 size={16} className="animate-spin" />} Accedi
        </button>
      </form>
      <div className="mt-6 grid gap-2 text-center text-[14px] text-ink-500">
        <p>
          Non hai un account?{" "}
          <button type="button" className="font-semibold text-brand-700 underline underline-offset-2" onClick={() => go("register")}>
            Registrati
          </button>
        </p>
        <button type="button" className="btn-ghost" onClick={startDemo}>Entra in modalità demo</button>
      </div>
    </AuthLayout>
  );
}

function Register({ go }: { go: (v: View) => void }) {
  const { register } = useApp();
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!f.firstName.trim() || !f.lastName.trim()) return setError("Inserisci nome e cognome.");
    if (!EMAIL_RE.test(f.email)) return setError("Inserisci un indirizzo email valido.");
    if (f.password.length < 8) return setError("La password deve avere almeno 8 caratteri.");
    if (f.password !== f.confirm) return setError("Le due password non coincidono.");
    if (!terms) return setError("Per creare l'account accetta le condizioni d'uso e l'informativa privacy.");
    setBusy(true);
    setError(null);
    const r = await register(f);
    setBusy(false);
    if (!r.ok) setError(r.error);
    else if (r.info) setInfo(r.info);
  }

  if (info) {
    return (
      <AuthLayout title="Controlla la tua email" subtitle="Manca solo un passaggio." back={() => go("welcome")}>
        <div className="grid gap-4">
          <p className="rounded-xl bg-brand-50 px-4 py-3 text-[14px] leading-relaxed text-brand-800">{info}</p>
          <button type="button" className="btn-primary h-12" onClick={() => go("login")}>Vai all&apos;accesso</button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Crea il tuo account" subtitle="Bastano pochi dati. Il profilo potrai completarlo quando vuoi." back={() => go("welcome")}>
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-first" className="field-label">Nome</label>
            <input id="reg-first" className="input" autoComplete="given-name" value={f.firstName} onChange={(e) => set("firstName")(e.target.value)} />
          </div>
          <div>
            <label htmlFor="reg-last" className="field-label">Cognome</label>
            <input id="reg-last" className="input" autoComplete="family-name" value={f.lastName} onChange={(e) => set("lastName")(e.target.value)} />
          </div>
        </div>
        <div>
          <label htmlFor="reg-email" className="field-label">Email</label>
          <input id="reg-email" className="input" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={(e) => set("email")(e.target.value)} />
        </div>
        <div>
          <label htmlFor="reg-pass" className="field-label">Password</label>
          <PasswordInput id="reg-pass" value={f.password} onChange={set("password")} autoComplete="new-password" />
          <p className="mt-1 text-[12px] text-ink-500">Almeno 8 caratteri.</p>
        </div>
        <div>
          <label htmlFor="reg-confirm" className="field-label">Conferma password</label>
          <PasswordInput id="reg-confirm" value={f.confirm} onChange={set("confirm")} autoComplete="new-password" />
        </div>
        <label htmlFor="reg-terms" className="flex items-start gap-3 rounded-xl bg-ink-50 p-3 text-[13.5px] leading-snug text-ink-700">
          <input id="reg-terms" type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600" />
          <span>
            Accetto le <span className="font-semibold">condizioni d&apos;uso</span> e ho letto l&apos;<span className="font-semibold">informativa privacy</span>. I consensi per
            promozioni e pubblicità personalizzata si scelgono a parte nel profilo.
          </span>
        </label>
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13.5px] text-rose-700">{error}</p>}
        <button type="submit" className="btn-primary h-12" disabled={busy}>
          {busy && <Loader2 size={16} className="animate-spin" />} Crea account
        </button>
        <p className="text-center text-[14px] text-ink-500">
          Hai già un account?{" "}
          <button type="button" className="font-semibold text-brand-700 underline underline-offset-2" onClick={() => go("login")}>
            Accedi
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

function Forgot({ go }: { go: (v: View) => void }) {
  const { cloud, requestPasswordReset } = useApp();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <AuthLayout title="Recupera la password" subtitle="Inserisci l'email con cui ti sei registrato." back={() => go("login")}>
      {sent ? (
        <div className="grid gap-4">
          <p className="rounded-xl bg-brand-50 px-4 py-3 text-[14px] leading-relaxed text-brand-800">
            {cloud ? (
              <>
                Se esiste un account con <strong>{email}</strong>, ti abbiamo inviato un link per scegliere una nuova password. Controlla anche la cartella
                spam.
              </>
            ) : (
              <>
                Funzione simulata: nella versione reale riceveresti a <strong>{email}</strong> un link per scegliere una nuova password. In questa demo
                nessuna email viene inviata.
              </>
            )}
          </p>
          <button type="button" className="btn-primary h-12" onClick={() => go("login")}>Torna all&apos;accesso</button>
        </div>
      ) : (
        <form
          className="grid gap-4"
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            if (!EMAIL_RE.test(email)) return setError("Inserisci un indirizzo email valido.");
            setBusy(true);
            setError(null);
            const r = await requestPasswordReset(email);
            setBusy(false);
            if (!r.ok) return setError(r.error);
            setSent(true);
          }}
        >
          <div>
            <label htmlFor="forgot-email" className="field-label">Email</label>
            <input id="forgot-email" className="input" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13.5px] text-rose-700">{error}</p>}
          <button type="submit" className="btn-primary h-12" disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" />} Invia link di recupero
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

/** Shown after opening a password-reset link from the email (Supabase accounts only) */
export function NewPasswordScreen() {
  const { setNewPassword, notify } = useApp();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError("La password deve avere almeno 8 caratteri.");
    if (password !== confirm) return setError("Le due password non coincidono.");
    setBusy(true);
    setError(null);
    const r = await setNewPassword(password);
    setBusy(false);
    if (!r.ok) return setError(r.error);
    notify("Password aggiornata");
  }

  return (
    <div className="min-h-screen bg-white">
      <AuthLayout title="Scegli una nuova password" subtitle="La userai da ora in poi per accedere." back={() => window.location.assign(window.location.pathname)}>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div>
            <label htmlFor="new-pass" className="field-label">Nuova password</label>
            <PasswordInput id="new-pass" value={password} onChange={setPassword} autoComplete="new-password" />
            <p className="mt-1 text-[12px] text-ink-500">Almeno 8 caratteri.</p>
          </div>
          <div>
            <label htmlFor="new-confirm" className="field-label">Conferma password</label>
            <PasswordInput id="new-confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" />
          </div>
          {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13.5px] text-rose-700">{error}</p>}
          <button type="submit" className="btn-primary h-12" disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" />} Salva password
          </button>
        </form>
      </AuthLayout>
    </div>
  );
}
