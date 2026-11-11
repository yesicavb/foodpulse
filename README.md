# FOODPULSE · consumer MVP

**Produce better, sell sooner, waste less.**

A mobile-first app for booking fresh products from your own supermarket in advance, getting discounts, receiving a personalized shopping list, and tracking your savings and impact. Consumer side only: there is no dashboard for supermarkets or brands.

The app's on-screen text is in Italian, because it targets Italian shoppers. The code and this documentation are in English.

## Getting started

You need Node.js LTS (https://nodejs.org). On Windows, use the "Windows Installer (.msi)" rather than the command-line instructions.

- **Double-click**: `avvia-windows.bat` (Windows) or `avvia-mac.command` (Mac: right-click → Open)
- **From a terminal**, inside the project folder:

```bash
npm install        # first time only: downloads the libraries into node_modules
npm run dev        # starts the app at http://localhost:3000
```

Other commands:

```bash
npm run build              # Next.js production build
npm run start              # runs the production build
npm run build:standalone   # creates standalone/foodpulse.html: the whole app in a single file
```

To try it straight away: on the welcome screen, tap **Prova la demo senza registrarti** ("Try the demo without signing up"). This loads an example profile: a family of 4, interested in fitness and healthy eating, with a purchase history and 3 past orders.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · Lucide React · Recharts · qrcode.react · Supabase (optional).
A PWA manifest is included.

## Database (Supabase, optional)

With Supabase configured, accounts are real (email + password, confirmation email, password reset) and each user's data (profile, cart, orders, points, vouchers) is stored online, so the same account works on any device. Without it, everything is saved in the browser, as before. The demo account is always saved in the browser only.

**How it works:** one table, `user_data`, holds one row per user with that user's whole app state as JSON. Row Level Security lets each user read and write only their own row. The app loads the row at login and saves it about half a second after every change (`src/store/AppStore.tsx`). If the same account is used on two devices at the same time, the last change saved wins.

**Setup (once):**

1. Create a free project at supabase.com. Choose a region in Europe, e.g. Frankfurt.
2. In the dashboard, open **SQL Editor → New query**, paste the contents of `supabase/schema.sql` and click **Run**.
3. Under **Authentication → URL Configuration**, set **Site URL** to the app's address (e.g. `https://foodpulse-xyz.vercel.app`) and add `http://localhost:3000` under **Redirect URLs**. Confirmation and password-reset emails link back to these addresses.
4. Copy the **Project URL** and the **publishable key** (or the legacy `anon` key) from **Project Settings → API**.
5. Locally: copy `.env.example` to `.env.local` and paste the two values. On Vercel: add the same two variables under **Project → Settings → Environment Variables**, then redeploy.

The publishable key is meant to be public: it can only do what the Row Level Security rules allow. Never put the `service_role` / secret key in the app.

Supabase's built-in email service only sends a few emails per hour and is meant for testing. For a pilot with outside users, connect your own email provider (Authentication → Emails → SMTP settings).

`npm run build:standalone` reads the same variables from the environment at build time; without them, the single-file version runs browser-only.

## Design

Look and feel follow the team's design (Nov 2026): Poppins font, cream background and the palette below, set in `tailwind.config.ts`.

| Colour | Hex | Tailwind name |
|---|---|---|
| Verde Bosco | `#1B5E20` | `brand-600` (buttons, dark cards) |
| Verde Fresh | `#7CB342` | `brand-400` (discount pills) |
| Verde Chiaro | `#EAF6E5` | `brand-50` (active tab, soft backgrounds) |
| Crema | `#FFF8EE` | `cream` (page background) |
| Arancione Accento | `#FF8A3D` | `accent` (banner, favourites, badges) |

**Food pictures:** fresh and shelf products and the department tiles use real photos from Unsplash, listed in `src/data/photos.ts` (photo id, photographer, link). They are free under the [Unsplash License](https://unsplash.com/license): commercial use is allowed and no permission or credit is needed. Only free photos were chosen (no Unsplash+), without logos, brands or people. Sponsored products keep drawn illustrations, because their brands are fictional. If a photo can't load, the drawn illustration from `src/components/ui/FoodArt.tsx` is shown instead. To give a new product a picture, add a free Unsplash photo to `photos.ts`, and/or point its id at a drawing in `ART_FOR` in `FoodArt.tsx`.

**Favourites:** the heart on product cards saves a product in the profile (`favoriteProducts`), shown under Food preferences; the Smart Basket ranks saved products higher.

## Languages (Italian / English)

The **IT | EN** switch in the header (and on the welcome and login screens) changes the whole app, including products, stores and messages. The choice is remembered per device.

**How it works:** all texts stay written in Italian in the code. In English mode, `src/i18n/translator.ts` replaces every text on screen with its English version from `src/i18n/en.ts`. Dates and prices switch format too (`src/lib/format.ts`).

**When you add or change an Italian text,** add its English in `src/i18n/en.ts`:

```ts
"Il tuo nuovo testo": "Your new text",
```

The key must be the Italian text exactly as it appears on screen. Texts with a changing part (a number or a name) go in `EN_PATTERNS` at the bottom of the same file. A text without an English entry simply stays in Italian, so nothing breaks.

Saved data (profile choices, feedback answers in Supabase) always stays in Italian, whatever language the user picks, so the admin queries keep working.

## Navigation

There is no separate Home screen: after logging in, the **Smart Basket** opens. The profile is the round button with your initials at the top right, next to the IT | EN switch. The bottom bar has 4 sections, always visible and freely accessible:

1. **Smart Basket**: A) choose the supermarket · B) your smart shopping list · C) add more fresh products · D) discover more products for you (sponsored)
2. **My cart** (Il mio carrello): booking, discounts, a "pick up in store" list, choice of pickup method
3. **My QR code** (Il mio QR Code): active bookings with QR code, pickup simulation, cancellation
4. **Feedback**: five questions about the app (see `APP_FEEDBACK_QUESTIONS` in `src/data/options.ts`)

**My profile** (top right): points, 7 profile sections, orders, points and vouchers, impact, feedback

Cart, profile, bookings and points stay saved when switching sections and reloading the page.

## How the features are connected

| Event | Effect |
|---|---|
| Changing supermarket | available products, prices (the store's price index), department promotions, pickup methods, sponsored products |
| Editing the profile | Smart Basket list (products, quantities per household size, budget, diet, allergens, dislikes) and sponsored campaigns (only with consent) |
| Confirming a booking | order added to the history, QR code, points, voucher used, voucher generated if a threshold is reached |
| Pickup (QR validated) | order completed, purchase history updated (used by the Smart Basket), feedback request shown once |
| Feedback submitted | +30 points, saved in the feedback history |
| Cancellation | points removed, voucher available again |

## Algorithms (in `src/lib/`)

- **`smartBasket.ts`**: a rule-based algorithm, **not** a trained AI model. Score = frequency in the history + interests + favourites + family/children + goals + promotions (if the customer cares about saving). Excludes products that don't fit the diet, allergens or disliked foods. Quantities depend on household size; the fresh-product list stays within about 60% of the weekly budget. "Rigenera" (Regenerate) changes the seed, and therefore some of the suggestions.
- **`ads.ts`** (retail media): filters on active campaign, availability in the store and diet → **relevance** (interests, related purchases, shopping for several people) with a minimum threshold → among relevant campaigns, score = 40% relevance + 60% commercial value (the brand's priority and bid). A product that isn't relevant is never shown, whatever the budget. Without consent to personalized advertising, only generic promotions are shown. Health data is never used; brands receive no individual data.
- **`pricing.ts`**: progressive discounts for booking ahead (1 day −5%, 3 days −10%, 5 days −15%) + store promotion, capped at 25%.
- **`orders.ts`**: creates the order (prices are always recalculated) and estimates its impact.
- **`loyalty.ts`**: 1 point per €, advance-booking bonus (+10 at 3 days, +20 at 5), +30 for feedback, a €5 voucher generated automatically every 300 points; levels Seme, Germoglio, Albero (Seed, Sprout, Tree).

All parameters are in `src/data/config.ts`; supermarkets, products and campaigns are in `src/data/`.

## What is simulated, and what real use would need

| Feature | In the prototype | For real use |
|---|---|---|
| Sign-up and login | Supabase Auth when configured (confirmation email, password reset); otherwise accounts saved in the browser | own email provider (SMTP) for reliable delivery |
| User data | Supabase: one JSON row per user, with Row Level Security; otherwise the device's localStorage | separate tables for orders, points and stock, with points and stock checked on the server |
| Supermarkets, prices, availability | demo data. Esselunga, Coop, Conad and Despar are used for illustration only, **with no official integration** | integration with the ERP/catalogue and stock levels of participating chains |
| Smart Basket | rules based on history and profile | real history from loyalty cards (with consent), possibly a recommendation model |
| Sponsored products | fictional campaigns and brands | a retail media platform, contracts with brands, impression measurement |
| Payment | not included (simulated) | a payment gateway, or payment at pickup depending on the store |
| Lockers | simulated locations and compartments | integration with the locker operator |
| Delivery | simulated costs and time slots | the supermarket's existing delivery services |
| QR validation | "Simula validazione al ritiro" (simulate pickup validation) button | a QR reader at the checkout, counter or locker |
| Notifications | preferences saved only | push notifications (PWA/app) and email |
| Product images | illustrations made with icons | photos supplied by stores and brands |
| Environmental impact | estimate: 25% of booked kg × CO₂e factors per department | a method validated in the pilot with real unsold-stock data |

## Structure

```
src/
├── app/                      layout, single page, PWA manifest, icon, global styles
├── components/
│   ├── FoodPulseApp.tsx      root: login → shell with 4 sections → post-shopping feedback
│   ├── auth/                 welcome, login, sign-up, password recovery
│   ├── shell/                header and bottom navigation bar
│   ├── basket/               Smart Basket: StorePicker, SmartList, FreshCatalog, Sponsored, AdvanceSelector
│   ├── cart/                 cart and checkout (store, locker, delivery, voucher)
│   ├── qr/                   QR code and order card
│   ├── profile/              sectioned profile, orders, loyalty, impact, feedback
│   ├── feedback/             post-shopping survey
│   └── ui/                   logo, product images, reusable controls
├── data/                     config, supermarkets, products, campaigns, profile options
├── lib/                      types, pricing, Smart Basket, sponsored ranking, orders, loyalty, demo seed
├── store/AppStore.tsx        app state and actions (the single place to connect to Supabase)
└── standalone/main.tsx       entry point of the single-file version
```
