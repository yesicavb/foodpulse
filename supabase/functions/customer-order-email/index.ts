import nodemailer from "npm:nodemailer@6.9.16";
import { createClient } from "npm:@supabase/supabase-js@2";
const APP = "https://yesicavb.github.io/foodpulse/";
const TITLES: Record<string,string> = {
  da_preparare: "Ordine ricevuto",
  in_preparazione: "Il tuo ordine è in preparazione",
  pronto: "Il tuo ordine è pronto!",
  reminder: "Promemoria: ritiro tra un'ora",
};
const MESSAGES: Record<string,string> = {
  da_preparare: "Il negozio ha ricevuto la tua prenotazione. Ti avviseremo quando sarà in preparazione e quando sarà pronta.",
  in_preparazione: "Il negozio sta preparando la tua spesa.",
  pronto: "La tua spesa è pronta. Rispetta la fascia di ritiro selezionata e mostra il QR code al banco.",
  reminder: "La fascia di ritiro della tua prenotazione inizia tra circa un'ora. Ricordati di portare il QR code.",
};
type Job = {order_id:string;customer_id:string;event:string;due_at:string;claimed_at:string;attempts:number};
function render(event: string, o: {id:string;customer_name:string;pickup_date:string;slot:string;code:string;total:number}, storeName:string) {
  const when = new Date(o.pickup_date + "T12:00:00Z").toLocaleDateString("it-IT", {timeZone:"Europe/Rome",weekday:"long",day:"numeric",month:"long",year:"numeric"});
  return {
    subject: `FoodPulse - ${TITLES[event]} (${o.id})`,
    text: [o.customer_name ? `Ciao ${o.customer_name},` : "Ciao,", "", MESSAGES[event], "", `Ordine: ${o.id}`, `Negozio: ${storeName}`, `Data: ${when}`, `Orario: ${o.slot}`, `Codice: ${o.code}`, `Totale: ${new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR"}).format(o.total)}`, "", `Apri FoodPulse e vai al tuo QR Code: ${APP}`, "", "FoodPulse"].join("\n"),
  };
}

Deno.serve(async (req) => {
  const bearer = req.headers.get("authorization");
  if (req.method !== "POST" || !bearer || !/^Bearer [a-f0-9]{64}$/.test(bearer)) return new Response("Unauthorized",{status:401});
  const db = createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(bearer.slice(7)));
  const token_hash = Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2,"0")).join("");
  const {data:authorized,error:authError} = await db.rpc("customer_order_mail_authorized",{token_hash});
  if (authError) return new Response("Authorization unavailable",{status:503});
  if (!authorized) return new Response("Unauthorized",{status:401});
  const gmail = Deno.env.get("GMAIL_USER");
  const pass = Deno.env.get("GMAIL_APP_PASSWORD")?.replace(/\s+/g,"");
  if (!gmail || !pass) return new Response("Mail configuration missing",{status:503});
  const mail = nodemailer.createTransport({host:"smtp.gmail.com",port:465,secure:true,auth:{user:gmail,pass},connectionTimeout:5000,greetingTimeout:5000,socketTimeout:9000});
  const {data,error} = await db.rpc("claim_customer_order_mail");
  if (error) return new Response("Queue unavailable",{status:500});
  let sent=0, failed=0;
  // Limit concurrency while processing claimed messages.
  for (const job of (data ?? []) as Job[]) {
    const key = (column: "sent_at" | "skipped_at") => db.from("customer_order_mail").update({[column]:new Date().toISOString()}).eq("order_id",job.order_id).eq("event",job.event).eq("claimed_at",job.claimed_at);
    try {
      const {data:o,error:oe} = await db.from("orders").select("id,user_id,store_id,customer_name,pickup_date,slot,method,status,code,total").eq("id",job.order_id).maybeSingle();
      if (oe) throw oe;
      if (!o || o.user_id !== job.customer_id) { await key("skipped_at").throwOnError(); continue; }
      if (job.event==="reminder") {
        const {data:pickup,error:pe}=await db.rpc("customer_pickup_time",{p_date:o.pickup_date,p_slot:o.slot});
        if(pe) throw pe;
        if (!pickup || o.method !== "instore" || ["annullato","completato"].includes(o.status) || Date.parse(pickup) <= Date.now()) { await key("skipped_at").throwOnError(); continue; }
        if (Date.parse(pickup) - 3600000 !== Date.parse(job.due_at)) continue;
      }
      const {data:user,error:ue} = await db.auth.admin.getUserById(o.user_id);
      if (ue) throw ue;
      const email=user.user?.email;
      if (!email) {await key("skipped_at").throwOnError();continue;}
      const {data:profile,error:pre}=await db.from("user_data").select("data").eq("user_id",o.user_id).maybeSingle();
      if(pre) throw pre;
      const prefs=profile?.data?.profile?.notifications;
      if(prefs?.orders===false) {await key("skipped_at").throwOnError();continue;}
      const {data:store,error:storeError} = await db.from("partner_stores").select("name").eq("id",o.store_id).maybeSingle();
      if (storeError) throw storeError;
      let storeName = store?.name;
      if (!storeName) {
        const {data:catalog,error:catalogError} = await db.from("partner_stores").select("name").eq("catalog",o.store_id).order("id").limit(2);
        if (catalogError) throw catalogError;
        if (catalog?.length === 1) storeName = catalog[0].name;
      }
      storeName ??= o.store_id.replace(/^st-/,"").split("-").map((word:string) => word.charAt(0).toUpperCase()+word.slice(1)).join(" ");
      if (job.event === "reminder") {
        const {data:pending,error:pendingError} = await db.from("customer_order_mail").select("due_at").eq("order_id",job.order_id).eq("event",job.event).eq("claimed_at",job.claimed_at).is("skipped_at",null).is("sent_at",null).maybeSingle();
        if (pendingError) throw pendingError;
        if (!pending || pending.due_at !== job.due_at) continue;
      }
      const message = render(job.event,o,storeName);
      const info = await mail.sendMail({from:{name:"FoodPulse",address:gmail},replyTo:gmail,to:email,...message,disableFileAccess:true,disableUrlAccess:true});
      if (!info.accepted.length) throw new Error("SMTP recipient rejected");
      await key("sent_at").throwOnError();
      sent++;
    } catch {
      failed++;
      // A retry is possible after the claim expires. Do not log personal data.
      console.error("Customer order email failed",job.event);
    }
  }
  return Response.json({sent,failed});
});
