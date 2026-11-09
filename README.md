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

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · Lucide React · Recharts · qrcode.react.
Mock data is stored in the browser (localStorage), structured so it can later move to Supabase. A PWA manifest is included.

## Navigation

There is no separate Home screen: after logging in, the **Smart Basket** opens. The bottom bar has 4 sections, always visible and freely accessible:

1. **Smart Basket**: A) choose the supermarket · B) your smart shopping list · C) add more fresh products · D) discover more products for you (sponsored)
2. **My cart** (Il mio carrello): booking, discounts, a "pick up in store" list, choice of pickup method
3. **My QR code** (Il mio QR Code): active bookings with QR code, pickup simulation, cancellation
4. **My profile** (Il mio profilo): 7 profile sections, orders, points and vouchers, impact, feedback

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
| Sign-up and login | accounts saved in the browser, password hashed with SHA-256 | Supabase Auth (or similar), verification email and password recovery |
| User data | the device's localStorage | a database (Supabase/Postgres) with Row Level Security |
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
