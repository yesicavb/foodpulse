# Email ordini consumer

Questa estensione non modifica la funzione order-email dei negozi né i KPI.

1. Eseguire `supabase/customer-order-email.sql` nel SQL Editor del progetto esistente.
2. Distribuire `supabase/functions/customer-order-email/index.ts` come Edge Function `customer-order-email`. La funzione verifica un segreto dedicato CUSTOMER_MAIL_TOKEN; disabilitare la verifica JWT della piattaforma per questa funzione soltanto (il token dedicato rimane obbligatorio).
3. Impostare CUSTOMER_MAIL_TOKEN con un valore casuale robusto nei segreti Edge Functions. Riutilizzare GMAIL_USER e GMAIL_APP_PASSWORD già configurati.
4. Abilitare pg_cron e pg_net; creare in Vault customer_mail_url (URL completo della funzione) e customer_mail_token (stesso segreto). Eseguire il comando cron commentato in fondo al file SQL.
5. Testare con un account consumer e un ordine reale controllato: ricevuto, in preparazione, pronto e promemoria. Verificare anche opt-out e ordine annullato.

Le email sono accodate dal database e processate ogni minuto, anche con app chiusa. Il promemoria è calcolato un'ora prima dell'inizio della fascia di ritiro in negozio, fuso Europe/Rome. Se la prenotazione è effettuata a meno di un'ora, il promemoria è accodato subito. Nessun promemoria dopo l'inizio della fascia o per ordini annullati/completati. Le preferenze Prenotazioni del profilo sono rispettate. La chiave primaria impedisce duplicati in coda; SMTP non garantisce esattamente una consegna in caso di crash dopo l'invio. I tentativi falliti sono riprovati fino a 10 volte. La pianificazione va attivata sul progetto Supabase: il push GitHub da solo non la attiva.
