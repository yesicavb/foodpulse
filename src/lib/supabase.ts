import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase connection, used only when both environment variables are set
 * (see .env.example). Without them the app runs fully in the browser, as before.
 */
// trimmed, because values pasted into GitHub or .env files often carry a stray space or line break
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;

/** Name of the table holding each user's app data (see supabase/schema.sql) */
export const USER_DATA_TABLE = "user_data";

/** Translates Supabase error messages into the app's Italian UI copy */
export function cloudError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email o password non corretta. Riprova o recupera la password.";
  if (m.includes("email not confirmed")) return "Conferma prima la tua email: apri il link che ti abbiamo inviato.";
  if (m.includes("already registered") || m.includes("already exists")) return "Esiste già un account con questa email. Accedi oppure usa un'altra email.";
  if (m.includes("password")) return "La password non rispetta i requisiti minimi. Usa almeno 8 caratteri.";
  if (m.includes("rate limit") || m.includes("too many")) return "Troppi tentativi in poco tempo. Riprova tra qualche minuto.";
  // Unknown problem: show the technical reason too, so it can be diagnosed
  return `Non riusciamo a collegarci al server. Controlla la connessione e riprova. (Dettaglio: ${message || "nessuna risposta"})`;
}

/** Message text of any error, including Supabase errors that are plain objects */
export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e) return String((e as { message: unknown }).message);
  return String(e);
}
