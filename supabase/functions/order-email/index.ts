// FOODPULSE · Supabase Edge Function "order-email"
// Sends an email to the supermarket for every new order (called by a Database Webhook on INSERT into public.orders).
//
// Secrets (Supabase -> Edge Functions -> Secrets): GMAIL_USER, GMAIL_APP_PASSWORD
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.
// Gmail is reached on port 465: Supabase blocks the other SMTP ports.

import nodemailer from "npm:nodemailer@6.9.16";
import { createClient } from "npm:@supabase/supabase-js@2";

const APP_URL = "https://yesicavb.github.io/foodpulse/";
const METHOD: Record<string, string> = { instore: "Ritiro in negozio", locker: "Locker", delivery: "Consegna" };

type Line = { name: string; qty: number };
type Order = {
  id: string;
  store_id: string;
  code: string;
  customer_name: string;
  lines: Line[];
  total: number;
  pickup_date: string;
  slot: string;
  method: string;
  pickup_detail: string;
  notes: string | null;
  status: string;
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function dayLabel(d: string) {
  const rome = (x: Date) => x.toLocaleDateString("en-CA", { timeZone: "Europe/Rome" });
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);
  if (d === rome(now)) return "oggi";
  if (d === rome(tomorrow)) return "domani";
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const o = body?.record as Order | undefined;
    if (body?.type !== "INSERT" || body?.table !== "orders" || !o) return new Response("ignored", { status: 200 });
    if (o.status !== "da_preparare") return new Response("not new", { status: 200 });

    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPass = Deno.env.get("GMAIL_APP_PASSWORD")?.replace(/\s+/g, "");
    if (!gmailUser || !gmailPass) throw new Error("Secret GMAIL_USER of GMAIL_APP_PASSWORD ontbreekt (Edge Functions -> Secrets)");

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // everyone who works for this store
    const { data: staff, error } = await db.from("store_staff").select("user_id").eq("store_id", o.store_id);
    if (error) throw error;
    const emails: string[] = [];
    for (const s of staff ?? []) {
      const { data } = await db.auth.admin.getUserById(s.user_id);
      if (data?.user?.email) emails.push(data.user.email);
    }
    if (!emails.length) return new Response("no staff for this store", { status: 200 });

    const lines = (o.lines ?? []) as Line[];
    const pieces = lines.reduce((a, l) => a + (Number(l.qty) || 0), 0);
    const when = `${dayLabel(o.pickup_date)}, ${o.slot}`;
    const total = `€ ${Number(o.total).toFixed(2).replace(".", ",")}`;
    const subject = `Nuovo ordine da ${o.customer_name} · ritiro ${when}`;

    const text = [
      `Nuovo ordine FoodPulse ${o.id}`,
      ``,
      `Cliente: ${o.customer_name}`,
      `Codice di ritiro: ${o.code}`,
      `Ritiro: ${when} · ${METHOD[o.method] ?? o.method}${o.pickup_detail ? ` (${o.pickup_detail})` : ""}`,
      ``,
      `Prodotti (${pieces}):`,
      ...lines.map((l) => `  ${l.qty}× ${l.name}`),
      ``,
      `Totale: ${total}`,
      ...(o.notes ? [``, `Note del cliente: ${o.notes}`] : []),
      ``,
      `Apri la dashboard: ${APP_URL}`,
    ].join("\n");

    const html = `<div style="font-family:Arial,sans-serif;max-width:520px;color:#1f2a1f">
  <p style="margin:0 0 4px;color:#2e7d32;font-weight:bold;font-size:12px;letter-spacing:1px">FOODPULSE · NUOVO ORDINE</p>
  <h2 style="margin:0 0 12px">${esc(o.customer_name)} · ritiro ${esc(when)}</h2>
  <p style="margin:0 0 12px">Codice di ritiro: <b style="font-family:monospace;font-size:16px;letter-spacing:2px">${esc(o.code)}</b><br>
  ${esc(METHOD[o.method] ?? o.method)}${o.pickup_detail ? ` · ${esc(o.pickup_detail)}` : ""}</p>
  <table style="border-collapse:collapse;width:100%;margin-bottom:12px">
    ${lines.map((l) => `<tr><td style="padding:6px 8px;border-bottom:1px solid #e6ebe3;width:40px;font-weight:bold;color:#1b5e20">${Number(l.qty)}×</td><td style="padding:6px 8px;border-bottom:1px solid #e6ebe3">${esc(String(l.name))}</td></tr>`).join("")}
  </table>
  <p style="margin:0 0 12px">Totale: <b>${esc(total)}</b> (${pieces} prodotti)</p>
  ${o.notes ? `<p style="background:#fff8e1;padding:10px 12px;border-radius:8px;margin:0 0 12px"><b>Note del cliente:</b> ${esc(o.notes)}</p>` : ""}
  <p><a href="${APP_URL}" style="display:inline-block;background:#1b5e20;color:#fff;padding:10px 16px;border-radius:20px;text-decoration:none;font-weight:bold">Apri la dashboard</a></p>
  <p style="color:#8a948a;font-size:12px">Ordine ${esc(o.id)}. Ricevi questa email perché il tuo account è collegato a questo punto vendita su FoodPulse.</p>
</div>`;

    const mail = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass },
    });
    await mail.sendMail({ from: `FoodPulse Ordini <${gmailUser}>`, to: emails.join(", "), subject, text, html });
    return new Response(`sent to ${emails.length}`, { status: 200 });
  } catch (e) {
    // the message is also returned, so it can be read in SQL: select * from net._http_response
    const msg = e instanceof Error ? e.message : String(e);
    console.error("order-email failed", msg);
    return new Response(`order-email failed: ${msg}`, { status: 500 });
  }
});
