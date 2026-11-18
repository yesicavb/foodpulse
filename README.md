# FOODPULSE · MVP

**Produce better, sell sooner, waste less.**

A mobile-first app for booking fresh products from your own supermarket in advance, getting discounts, receiving a personalized shopping list, and tracking your savings and impact. Supermarkets get their own area in the same app: an inbox of incoming orders, a QR scanner to confirm pickups, and statistics.

The app's on-screen text is in Italian, because it targets Italian shoppers. The code and this documentation are in English.

**Live app:** https://yesicavb.github.io/foodpulse/ — every push to `main` rebuilds and republishes it (GitHub Actions → "Deploy to GitHub Pages").

## Getting started

To try it: on the welcome screen, tap **Prova la demo senza registrarti** ("Try the demo without signing up"). This loads an example profile: a family of 4, interested in fitness and healthy eating, with a purchase history and 3 past orders. For the supermarket side, tap **Sei un supermercato?** → **Prova la demo supermercato**. Both demos work without an account.

To run it on your own computer you need Node.js LTS (https://nodejs.org):

```bash
npm install                # first time only
npm run dev                # starts the app at http://localhost:3000
npm run build:standalone   # creates standalone/foodpulse.html: the whole app in a single file
```

The website is built with `npm run build:standalone` (see `.github/workflows/deploy-pages.yml`); everything in `site/` (privacy page, service worker, notification icon) is published next to it.

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS 3 · Lucide React · Recharts · qrcode.react · jsQR (QR scanner) · Supabase (accounts, data, Edge Function) · Google Analytics 4 · GitHub Pages.

## Accounts and data (Supabase)

With Supabase configured, accounts are real: email + password or **Continua con Google**, with a confirmation email and password reset. Without it, everything is saved in the browser. The demo accounts are always saved in the browser only.

The repo needs two Actions variables (Settings → Secrets and variables → Actions → Variables): `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The deploy log says "Supabase connected" or "NOT connected". The publishable key is meant to be public: it can only do what the Row Level Security rules allow. Never put the `service_role` / secret key in the app.

**Tables** (every table has Row Level Security):

| Table | What it holds | Who can see it |
|---|---|---|
| `user_data` | one row per user with the whole customer app state as JSON (profile, cart, orders, points, vouchers) | only that user |
| `app_feedback` | answers to the Feedback tab | written by users, read by the team in the dashboard |
| `orders` | every booking, shared between customer and store | the customer who booked it and the staff of that store |
| `store_codes` | store codes (also "free" codes with no store yet) | nobody from the app; checked through functions only |
| `store_staff` | which account works for which store | only that account |
| `partner_stores` | shops that joined with a free code | everyone (so customers see them) |

**SQL setup**, run once in the SQL Editor, in this order:

1. `supabase/schema.sql` (user data) and `supabase/app-feedback.sql` (Feedback tab)
2. `supabase/store-dashboard.sql` (orders, store codes, store staff)
3. the private store-codes file (not in this repo)
4. `supabase/partner-stores.sql` (free codes and partner shops)
5. the private free-codes file (not in this repo)

**Store codes are never put in this repo**, because it is public. The team keeps them in private files.

Ready-made queries for the team: `supabase/kpi-queries.sql` and `supabase/dashboard-queries.sql` (query 17: written feedback).

Supabase free plan: the project pauses after a week without use. Unpause it on supabase.com before a demo.

## Supermarket area

- **Access:** a supermarket account is linked to one store with a **store code**: at sign-up ("Sei un supermercato?" → "Registra il tuo negozio") or later in the profile. Each of the 80 listed stores has its own code. A **free code** lets a new shop register itself: the app then asks for the shop's name, address and city, and the shop appears for customers straight away, first in its city, with a "Partner FoodPulse" badge. More staff of the same shop can use the same code.
- **Dashboard:** counters (Nuovi / Da preparare / In preparazione / Pronti), an inbox of new orders that refreshes every 8 seconds, filters, order details with customer notes, and the status flow Da preparare → In preparazione → Pronto per il ritiro → Ritirato (+ Annullato).
- **Pickup:** the central **Scansiona QR** button opens the camera and reads the customer's QR code; "Inserisci il codice a mano" is the backup. An order that was already collected or cancelled is blocked.
- **Statistiche:** bookings, booked value, average basket, top products, departments, pickup days and slots, pickup method (last 7 days / 30 days / all). Aggregated, no personal data.
- **Test store:** "Negozio di prova FoodPulse" (city "Negozio di prova", last in the list), with its own code, for showing the app to shop owners on two phones.
- **Demo:** example orders plus four weeks of example history, saved in the browser only. Real accounts never see examples.

The shared logic is in `src/lib/desk.ts`; the screens in `src/components/store/`.

## Notifications and email

| For | In the app | Browser notification | Email |
|---|---|---|---|
| Customer | pop-up when the store starts preparing the order and when it is ready; pulsing dot on the QR tab; big status card | yes, after "Attiva notifiche" | no |
| Store | toast, sound ("ding-dong", bell button to mute), count in the tab title | yes, after "Attiva notifiche" | yes, for every new order |

- **Browser notifications** (`src/lib/systemNotify.ts`, `site/sw.js`) only work while FoodPulse is open in the background. On iPhone only from the home-screen app. Push notifications with the app closed are not built.
- **Order emails:** the Edge Function `supabase/functions/order-email/index.ts` (deployed in Supabase as `hyper-action`) is called by a Database Webhook on INSERT into `orders`. It sends the order to the email addresses of that store's staff, from foodpulse.ordini@gmail.com through Gmail (port 465). The function needs the Supabase secrets `GMAIL_USER` and `GMAIL_APP_PASSWORD` (a Gmail app password). Each call's result can be read in SQL: `select created, status_code, content from net._http_response order by created desc;`. University mail filters tend to block these emails.

## Analytics

Google Analytics 4 (`G-BQ2BDPLSTZ`) only loads after the visitor taps "Accetta" in the cookie banner. It records anonymous funnel events, among others sign_up, login, demo_start, add_to_cart, pre_order, qr_view, order_completed, store_select, store_demo_start, store_order_status, store_pickup_confirmed, partner_store_created and notifications_answer. Read them in GA4 → Reports → Realtime or Explore → Funnel exploration.

## Design

Look and feel follow the team's design (Nov 2026): Poppins font, cream background and the palette below, set in `tailwind.config.ts`.

| Colour | Hex | Tailwind name |
|---|---|---|
| Verde Bosco | `#1B5E20` | `brand-600` (buttons, dark cards) |
| Verde Fresh | `#7CB342` | `brand-400` (discount pills) |
| Verde Chiaro | `#EAF6E5` | `brand-50` (active tab, soft backgrounds) |
| Crema | `#FFF8EE` | `cream` (page background) |
| Arancione Accento | `#FF8A3D` | `accent` (banner, favourites, badges) |

**Food pictures:** products, department tiles and sponsored campaigns use free photos from Unsplash, listed in `src/data/photos.ts` (photo id, photographer, link), under the [Unsplash License](https://unsplash.com/license). If a photo can't load, a drawn illustration from `src/components/ui/FoodArt.tsx` is shown instead.

## Languages (Italian / English)

The **IT | EN** switch changes the whole app, including products, stores, messages and browser notifications. The choice is remembered per device.

All texts stay written in Italian in the code. In English mode, `src/i18n/translator.ts` replaces every text on screen with its English version from `src/i18n/en.ts`. **When you add or change an Italian text,** add its English there:

```ts
"Il tuo nuovo testo": "Your new text",
```

The key must be the Italian text exactly as it appears on screen. Texts with a changing part (a number or a name) go in `EN_PATTERNS` at the bottom of the same file. A text without an English entry simply stays in Italian.

Saved data (profile choices, feedback answers) always stays in Italian, so the team's queries keep working.

## Navigation

**Welcome screen:** for shoppers, Continua con Google, Registrati, Accedi and the demo link. At the bottom, **Sei un supermercato?** leads to the supermarket area (demo, register a store with a code, log in).

**Customer app:** after logging in, the **Smart Basket** opens. The profile is the round button with your initials at the top right. The bottom bar has 4 sections:

1. **Smart Basket**: A) choose your city, then a supermarket · B) your smart shopping list · C) more fresh products · D) products for you (sponsored)
2. **My cart** (Il mio carrello): booking, discounts, pickup method, a note for the supermarket
3. **My QR code** (Il mio QR Code): active bookings with QR code and live status at the store, cancellation
4. **Feedback**: five questions about the app (`APP_FEEDBACK_QUESTIONS` in `src/data/options.ts`)

**Supermarket accounts** open the dashboard instead of the customer app.

## How the features are connected

| Event | Effect |
|---|---|
| Changing supermarket | available products, prices (the store's price index), department promotions, pickup methods, sponsored products |
| Editing the profile ("Salva") | Smart Basket list (products, quantities per household size, budget, diet, allergens, dislikes) and sponsored campaigns (only with consent) |
| Confirming a booking | order saved, sent to the store's inbox (+ email to the store), QR code, points, voucher used, voucher generated if a threshold is reached |
| Store changes the status | customer sees it within seconds (pop-up, dot, notification) |
| Store scans the QR | order completed, purchase history updated (used by the Smart Basket), feedback request shown once |
| Feedback submitted | +30 points, saved in the feedback history |
| Cancellation | points removed, voucher available again, order marked "Annullato" at the store |

## Algorithms (in `src/lib/`)

- **`smartBasket.ts`**: a rule-based algorithm, **not** a trained AI model. Score = frequency in the history + interests + favourites + family/children + goals + promotions (if the customer cares about saving). Excludes products that don't fit the diet, allergens or disliked foods. Quantities depend on household size; the fresh-product list stays within about 60% of the weekly budget. "Rigenera" changes some of the suggestions.
- **`ads.ts`** (retail media): filters on active campaign, availability in the store and diet → **relevance** with a minimum threshold → score = 40% relevance + 60% commercial value. A product that isn't relevant is never shown. Without consent to personalized advertising, only generic promotions are shown. Health data is never used; brands receive no individual data.
- **`pricing.ts`**: progressive discounts for booking ahead (1 day −5%, 3 days −10%, 5 days −15%) + store promotion, capped at 25%.
- **`orders.ts`**: creates the order (prices are always recalculated) and estimates its impact.
- **`loyalty.ts`**: 1 point per €, advance-booking bonus (+10 at 3 days, +20 at 5), +30 for feedback, a €5 voucher every 300 points; levels Seme, Germoglio, Albero.
- **`desk.ts`**: orders between customer and store (send, statuses, store inbox, store codes, partner shops).

All parameters are in `src/data/config.ts`; supermarkets, products and campaigns are in `src/data/`.

## What is simulated, and what real use would need

| Feature | In the prototype | For real use |
|---|---|---|
| Supermarkets, prices, availability | 80 real stores in 20 Italian cities (real chain and address, from PromoQui listings, Nov 2026) plus partner shops that registered themselves; hours, prices, stock and services are simulated. Chain names are used for illustration only, **with no official integration** | integration with the catalogue and stock levels of participating stores |
| Stock | bookings don't reduce stock | stock checked on the server |
| Points and vouchers | calculated in the app | checked on the server; points awarded at pickup |
| Smart Basket | rules based on history and profile | real history from loyalty cards (with consent), possibly a recommendation model |
| Sponsored products | fictional campaigns and brands | a retail media platform, contracts with brands, impression measurement |
| Payment | not included | a payment gateway, or payment at pickup |
| Lockers and delivery | simulated | integration with the locker operator and the store's delivery service |
| Notifications | in the app, browser notifications while open, email to the store | push notifications with the app closed |
| Environmental impact | estimate: 25% of booked kg × CO₂e factors per department | a method validated in the pilot with real unsold-stock data |

## Structure

```
src/
├── app/                      layout, single page, PWA manifest, icon, global styles
├── components/
│   ├── FoodPulseApp.tsx      root: welcome/login → customer app or supermarket dashboard
│   ├── auth/                 welcome, supermarket area, login, sign-up, password recovery
│   ├── shell/                header and bottom navigation bar
│   ├── basket/               Smart Basket: StorePicker, SmartList, FreshCatalog, Sponsored, AdvanceSelector
│   ├── cart/                 cart and checkout (store, locker, delivery, voucher, note)
│   ├── qr/                   QR code, order card, live status at the store (OrderStatus)
│   ├── store/                supermarket dashboard, statistics, QR scanner
│   ├── profile/              sectioned profile, orders, loyalty, impact, feedback, store code
│   ├── feedback/             post-shopping survey
│   └── ui/                   logo, product images, notification card, reusable controls
├── data/                     config, supermarkets, products, campaigns, photos, profile options
├── i18n/                     IT/EN switch and English texts
├── lib/                      types, pricing, Smart Basket, sponsored ranking, orders, loyalty, desk, notifications
├── store/AppStore.tsx        app state and actions (connects to Supabase)
└── standalone/main.tsx       entry point of the single-file version (the website)
site/                         privacy page, service worker, notification icon
supabase/                     SQL setup, team queries, Edge Function order-email
```
