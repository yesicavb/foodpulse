import { POINTS } from "@/data/config";
import { storeById } from "@/data/stores";
import { addDays, startOfToday } from "./format";
import { applyPoints } from "./loyalty";
import { buildOrder } from "./orders";
import { emptyProfile } from "./profile";
import type { Profile, UserData } from "./types";

export function newUserData(firstName: string, lastName: string): UserData {
  const base: UserData = {
    profile: emptyProfile(firstName, lastName),
    storeId: null,
    advance: 3,
    cart: [],
    list: [],
    basket: { seed: 0, dismissed: [], qty: {} },
    history: {},
    orders: [],
    points: { balance: 0, lifetime: 0, events: [] },
    vouchers: [],
    feedbacks: [],
    pendingFeedback: null,
    onboarded: false,
  };
  return applyPoints(base, POINTS.welcome, "Bonus di benvenuto");
}

/** Demo profile: family of 4, interested in fitness and healthy eating */
function demoProfile(): Profile {
  const p = emptyProfile("Giulia", "Rossi");
  return {
    ...p,
    ageRange: "35–44",
    householdSize: 4,
    shoppingFor: "Per la mia famiglia",
    hasKids: "si",
    kidsAges: ["6–10 anni"],
    pets: ["Gatto"],
    address: "Via Giovanni Battista Morgagni 14, Milano",
    interests: ["fitness", "sano", "famiglia"],
    diet: "onnivora",
    favorites: ["Carne", "Latticini", "Pane e prodotti da forno", "Prodotti proteici"],
    disliked: "",
    frequency: "1 volta a settimana",
    days: ["Sab"],
    weeklySpend: "100–150 €",
    departments: ["latticini", "carne", "ortofrutta", "panetteria"],
    offersInterest: 4,
    priority: "Qualità",
    budget: 100,
    goals: ["risparmiare", "spreco"],
    notifications: { orders: true, reminders: true, suggestions: true, promos: true, adsPersonalized: true, marketing: false },
  };
}

export function demoUserData(): UserData {
  const today = startOfToday();
  const ess = storeById("st-ess-piave")!;
  const coop = storeById("st-milano-coop-umbria")!;
  let d: UserData = {
    ...newUserData("Giulia", "Rossi"),
    profile: demoProfile(),
    storeId: ess.id,
    onboarded: true,
    history: {
      "pane-integrale": 8,
      "yogurt-greco": 8,
      mozzarella: 7,
      "latte-fresco": 7,
      "petto-pollo": 6,
      "insalata-mista": 6,
      uova: 6,
      mele: 5,
      "pasta-integrale": 5,
      pomodori: 4,
      banane: 4,
      avena: 4,
      salmone: 3,
      caffe: 3,
      lasagne: 2,
    },
  };

  // Three bookings already picked up in previous weeks
  const past = [
    { daysAgo: 20, store: ess, advance: 3, cart: [["pane-integrale", 2], ["mozzarella", 2], ["petto-pollo", 2], ["insalata-mista", 2], ["yogurt-greco", 2]] },
    { daysAgo: 13, store: coop, advance: 5, cart: [["lasagne", 1], ["latte-fresco", 2], ["mele", 1], ["salmone", 2], ["pane-integrale", 2]] },
    { daysAgo: 6, store: ess, advance: 5, cart: [["pollo-arrosto", 1], ["yogurt-greco", 2], ["mozzarella", 2], ["pomodori", 2], ["banane", 1], ["pane-integrale", 2]] },
  ] as const;

  for (const o of past) {
    const created = addDays(today, -o.daysAgo);
    created.setHours(10, 30);
    const order = buildOrder({
      cart: o.cart.map(([productId, qty]) => ({ productId, qty })),
      store: o.store,
      advance: o.advance,
      method: "instore",
      slot: o.store.services.instore?.slots[1] ?? "",
      pickupDetail: o.store.services.instore?.desk ?? "",
      createdAt: created,
    });
    const completedAt = addDays(created, o.advance).toISOString();
    d = { ...d, orders: [{ ...order, status: "completato", completedAt, feedbackDone: true }, ...d.orders] };
    d = applyPoints(d, order.points, `Prenotazione ${order.id}`, created);
    d = applyPoints(d, POINTS.feedback, `Feedback ordine ${order.id}`, new Date(completedAt));
    d = {
      ...d,
      feedbacks: [
        {
          orderId: order.id,
          date: completedAt,
          ratings: { overall: 5, easy: 5, complete: o.daysAgo === 13 ? 4 : 5, quality: 5, staff: 4, timing: 5, recommend: 5 },
          comment: o.daysAgo === 13 ? "Mancava una confezione di mele, sostituita subito al banco." : "",
          points: POINTS.feedback,
        },
        ...d.feedbacks,
      ],
    };
  }
  return d;
}
