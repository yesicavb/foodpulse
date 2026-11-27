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
type Job = {order_id:string;event:string;due_at:string;claimed_at:string;attempts:number};
Deno.serve(async (req) => {
  const token = Deno.env.get("CUSTOMER_MAIL_TOKEN");
  if (req.method !== "POST" || !token || req.headers.get("authorization") !== "Bearer " + token)
    return new Response("Unauthorized", {status:401});
  const gmail = Deno.env.get("GMAIL_USER");
  const pass = Deno.env.get("GMAIL_APP_PASSWORD")?.replace(/\s+/g,"");
  if (!gmail || !pass) return new Response("Mail configuration missing",{status:503});
  const db = createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const mail = nodemailer.createTransport({host:"smtp.gmail.com",port:465,secure:true,auth:{user:gmail,pass},connectionTimeout:8000,socketTimeout:15000});
  const {data,error} = await db.rpc("claim_customer_order_mail");
  if (error) return new Response("Queue unavailable",{status:500});
  let sent=0, failed=0;
  // Limit concurrency while processing claimed messages.
  for (const job of (data ?? []) as Job[]) {
    const key = () => db.from("customer_order_mail").update({sent_at:new Date().toISOString()}).eq("order_id",job.order_id).eq("event",job.event).eq("claimed_at",job.claimed_at);
    try {
      const {data:o,error:oe} = await db.from("orders").select("id,user_id,store_id,customer_name,pickup_date,slot,method,status,code,total").eq("id",job.order_id).maybeSingle();
      if (oe) throw oe;
      if (!o || ["annullato","completato"].includes(o.status)) { await key(); continue; }
      if (job.event==="reminder") {
        const {data:pickup,error:pe}=await db.rpc("customer_pickup_time",{p_date:o.pickup_date,p_slot:o.slot});
        if(pe) throw pe;
        if(!pickup || o.method!=="instore" || Date.parse(pickup)<=Date.now()) {await key();continue;}
      }
      const {data:user,error:ue} = await db.auth.admin.getUserById(o.user_id);
      if (ue) throw ue;
      const email=user.user?.email;
      if (!email) {await key();continue;}
      const {data:profile,error:pre}=await db.from("user_data").select("data").eq("user_id",o.user_id).maybeSingle();
      if(pre) throw pre;
      const prefs=profile?.data?.profile?.notifications;
      if(prefs?.orders===false) {await key();continue;}
      const {data:store}=await db.from("partner_stores").select("name").eq("id",o.store_id).maybeSingle();
      const when=new Date(o.pickup_date+"T12:00:00Z").toLocaleDateString("it-IT",{timeZone:"Europe/Rome",weekday:"long",day:"numeric",month:"long",year:"numeric"});
      const title=TITLES[job.event];
      const text=[`Ciao ${o.customer_name || ""},`, "", MESSAGES[job.event], "", `Ordine: ${o.id}`, ...(store?.name?[`Negozio: ${store.name}`]:[]),`Data: ${when}`,`Orario: ${o.slot}`,`Codice: ${o.code}`,`Totale: € ${Number(o.total).toFixed(2).replace(".",",")}`,"",`Apri FoodPulse e vai al tuo QR Code: ${APP}`,"","FoodPulse"].join("\n");
      await mail.sendMail({from:`FoodPulse Ordini <${gmail}>`,to:email,subject:`${title} · ${o.id}`,text,messageId:`<${o.id.replace(/[^a-zA-Z0-9-]/g,"")}-${job.event}@foodpulse.app>`});
      const {error:se}=await key(); if(se) throw se;
      sent++;
    } catch {
      failed++;
      // A retry is possible after the claim expires. Do not log personal data.
      console.error("Customer order email failed",job.event);
    }
  }
  return Response.json({sent,failed});
});
