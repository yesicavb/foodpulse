"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { POINTS } from "@/data/config";
import { storeById } from "@/data/stores";
import { addDays } from "@/lib/format";
import { hashPassword } from "@/lib/hash";
import { applyPoints } from "@/lib/loyalty";
import { buildOrder, type OrderInput } from "@/lib/orders";
import type { SectionId } from "@/lib/profile";
import { demoUserData, newUserData } from "@/lib/seed";
import type { Account, AppState, ListItem, Order, Profile, Store, UserData } from "@/lib/types";

/**
 * App state saved on the device (localStorage).
 * Can be replaced with Supabase while keeping the same actions interface.
 */
const KEY = "foodpulse-app-v2";
const DEMO_EMAIL = "demo@foodpulse.app";

export type Tab = "basket" | "cart" | "qr" | "profile";
export type ProfileView = "home" | SectionId | "orders" | "loyalty" | "impact" | "feedbacks";

const emptyState = (): AppState => ({ v: 2, accounts: [], data: {}, session: null });

function load(): AppState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && parsed.v === 2) return parsed;
    }
  } catch {
    /* storage not available */
  }
  return emptyState();
}

type Result = { ok: true } | { ok: false; error: string };

interface Ctx {
  ready: boolean;
  account: Account | null;
  data: UserData | null;
  store: Store | null;
  tab: Tab;
  setTab: (t: Tab) => void;
  profileView: ProfileView;
  setProfileView: (v: ProfileView) => void;
  qrOrderId: string | null;
  setQrOrderId: (id: string | null) => void;
  toast: string | null;
  notify: (msg: string) => void;
  register: (f: { firstName: string; lastName: string; email: string; password: string }) => Promise<Result>;
  login: (email: string, password: string) => Promise<Result>;
  startDemo: () => void;
  resetDemo: () => void;
  logout: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  setOnboarded: () => void;
  setStore: (id: string) => void;
  setAdvance: (days: number) => void;
  addToCart: (productId: string, qty?: number) => void;
  setCartQty: (productId: string, qty: number) => void;
  addToList: (item: Omit<ListItem, "checked">) => void;
  toggleListItem: (id: string) => void;
  removeListItem: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  setSuggestionQty: (id: string, qty: number) => void;
  regenerate: () => void;
  placeOrder: (input: Omit<OrderInput, "cart" | "store" | "advance" | "voucher"> & { voucherId?: string }) => Order | null;
  completeOrder: (id: string) => void;
  cancelOrder: (id: string) => void;
  submitFeedback: (orderId: string, ratings: Record<string, number>, comment: string) => void;
  dismissFeedback: () => void;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [tab, setTabState] = useState<Tab>("basket");
  const [profileView, setProfileView] = useState<ProfileView>("home");
  const [qrOrderId, setQrOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setState(load()), []);
  useEffect(() => {
    if (!state) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* keep going in memory */
    }
  }, [state]);

  const account = state?.accounts.find((a) => a.id === state.session) ?? null;
  const data = account && state ? state.data[account.id] ?? null : null;
  const store = storeById(data?.storeId);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const setTab = useCallback((t: Tab) => {
    setTabState(t);
    if (t === "profile") setProfileView("home");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  /** Updates the logged-in user's data */
  const update = useCallback((fn: (d: UserData) => UserData) => {
    setState((s) => {
      if (!s || !s.session || !s.data[s.session]) return s;
      return { ...s, data: { ...s.data, [s.session]: fn(s.data[s.session]) } };
    });
  }, []);

  const register: Ctx["register"] = useCallback(async ({ firstName, lastName, email, password }) => {
    const e = email.trim().toLowerCase();
    if (state?.accounts.some((a) => a.email === e)) return { ok: false, error: "Esiste già un account con questa email. Accedi oppure usa un'altra email." };
    const acc: Account = { id: `u-${Date.now().toString(36)}`, email: e, passHash: await hashPassword(e, password), createdAt: new Date().toISOString() };
    setState((s) => {
      const base = s ?? emptyState();
      return { ...base, accounts: [...base.accounts, acc], data: { ...base.data, [acc.id]: newUserData(firstName.trim(), lastName.trim()) }, session: acc.id };
    });
    setTabState("basket");
    return { ok: true };
  }, [state]);

  const login: Ctx["login"] = useCallback(async (email, password) => {
    const e = email.trim().toLowerCase();
    const acc = state?.accounts.find((a) => a.email === e && !a.demo);
    if (!acc) return { ok: false, error: "Non troviamo un account con questa email su questo dispositivo. Registrati o prova la demo." };
    if (acc.passHash !== (await hashPassword(e, password))) return { ok: false, error: "Password non corretta. Riprova o recuperala." };
    setState((s) => (s ? { ...s, session: acc.id } : s));
    setTabState("basket");
    return { ok: true };
  }, [state]);

  const startDemo = useCallback(() => {
    setState((s) => {
      const base = s ?? emptyState();
      let acc = base.accounts.find((a) => a.demo);
      let accounts = base.accounts;
      let dataMap = base.data;
      if (!acc) {
        acc = { id: "u-demo", email: DEMO_EMAIL, passHash: "", createdAt: new Date().toISOString(), demo: true };
        accounts = [...accounts, acc];
      }
      if (!dataMap[acc.id]) dataMap = { ...dataMap, [acc.id]: demoUserData() };
      return { ...base, accounts, data: dataMap, session: acc.id };
    });
    setTabState("basket");
  }, []);

  const resetDemo = useCallback(() => {
    setState((s) => (s && s.session === "u-demo" ? { ...s, data: { ...s.data, "u-demo": demoUserData() } } : s));
    setTabState("basket");
    setQrOrderId(null);
  }, []);

  const logout = useCallback(() => {
    setState((s) => (s ? { ...s, session: null } : s));
    setTabState("basket");
    setProfileView("home");
    setQrOrderId(null);
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => update((d) => ({ ...d, profile: { ...d.profile, ...patch } })), [update]);
  const setOnboarded = useCallback(() => update((d) => ({ ...d, onboarded: true })), [update]);

  const setStore = useCallback(
    (id: string) => update((d) => ({ ...d, storeId: id, basket: { ...d.basket, dismissed: [], qty: {} } })),
    [update]
  );
  const setAdvance = useCallback((days: number) => update((d) => ({ ...d, advance: days })), [update]);

  const setCartQty = useCallback(
    (productId: string, qty: number) =>
      update((d) => {
        const rest = d.cart.filter((l) => l.productId !== productId);
        if (qty <= 0) return { ...d, cart: rest };
        const exists = d.cart.some((l) => l.productId === productId);
        return { ...d, cart: exists ? d.cart.map((l) => (l.productId === productId ? { ...l, qty: Math.min(20, qty) } : l)) : [...d.cart, { productId, qty: Math.min(20, qty) }] };
      }),
    [update]
  );
  const addToCart = useCallback(
    (productId: string, qty = 1) =>
      update((d) => {
        const ex = d.cart.find((l) => l.productId === productId);
        return {
          ...d,
          cart: ex ? d.cart.map((l) => (l.productId === productId ? { ...l, qty: Math.min(20, l.qty + qty) } : l)) : [...d.cart, { productId, qty }],
        };
      }),
    [update]
  );

  const addToList = useCallback(
    (item: Omit<ListItem, "checked">) => update((d) => (d.list.some((l) => l.id === item.id) ? d : { ...d, list: [...d.list, { ...item, checked: false }] })),
    [update]
  );
  const toggleListItem = useCallback(
    (id: string) => update((d) => ({ ...d, list: d.list.map((l) => (l.id === id ? { ...l, checked: !l.checked } : l)) })),
    [update]
  );
  const removeListItem = useCallback((id: string) => update((d) => ({ ...d, list: d.list.filter((l) => l.id !== id) })), [update]);

  const dismissSuggestion = useCallback(
    (id: string) => update((d) => ({ ...d, basket: { ...d.basket, dismissed: [...d.basket.dismissed, id] } })),
    [update]
  );
  const setSuggestionQty = useCallback(
    (id: string, qty: number) => update((d) => ({ ...d, basket: { ...d.basket, qty: { ...d.basket.qty, [id]: Math.max(1, Math.min(20, qty)) } } })),
    [update]
  );
  const regenerate = useCallback(
    () => update((d) => ({ ...d, basket: { seed: d.basket.seed + 1, dismissed: [], qty: {} } })),
    [update]
  );

  const placeOrder: Ctx["placeOrder"] = useCallback(
    (input) => {
      if (!data || !store) return null;
      const voucher = input.voucherId ? data.vouchers.find((v) => v.id === input.voucherId && !v.usedAt) ?? null : null;
      const order = buildOrder({ ...input, cart: data.cart, store, advance: data.advance, voucher });
      if (!order.lines.length) return null;
      update((d) => {
        let next: UserData = {
          ...d,
          cart: [],
          orders: [order, ...d.orders],
          vouchers: d.vouchers.map((v) => (v.id === order.voucherId ? { ...v, usedAt: order.createdAt, orderId: order.id } : v)),
        };
        next = applyPoints(next, order.points, `Prenotazione ${order.id}`);
        return next;
      });
      setQrOrderId(order.id);
      return order;
    },
    [data, store, update]
  );

  const completeOrder = useCallback(
    (id: string) =>
      update((d) => {
        const o = d.orders.find((x) => x.id === id);
        if (!o || o.status !== "attivo") return d;
        // a pickup feeds the history used by the Smart Basket
        const history = { ...d.history };
        o.lines.forEach((l) => (history[l.productId] = Math.min(8, (history[l.productId] ?? 0) + 1)));
        return {
          ...d,
          history,
          orders: d.orders.map((x) => (x.id === id ? { ...x, status: "completato", completedAt: new Date().toISOString() } : x)),
          pendingFeedback: o.feedbackDone ? d.pendingFeedback : id,
        };
      }),
    [update]
  );

  const cancelOrder = useCallback(
    (id: string) =>
      update((d) => {
        const o = d.orders.find((x) => x.id === id);
        if (!o || o.status !== "attivo") return d;
        let next: UserData = {
          ...d,
          orders: d.orders.map((x) => (x.id === id ? { ...x, status: "annullato", cancelledAt: new Date().toISOString() } : x)),
          vouchers: d.vouchers.map((v) => (v.id === o.voucherId ? { ...v, usedAt: undefined, orderId: undefined } : v)),
        };
        next = applyPoints(next, -o.points, `Annullamento ${o.id}`);
        return next;
      }),
    [update]
  );

  const submitFeedback = useCallback(
    (orderId: string, ratings: Record<string, number>, comment: string) =>
      update((d) => {
        if (d.feedbacks.some((f) => f.orderId === orderId)) return { ...d, pendingFeedback: null };
        let next: UserData = {
          ...d,
          pendingFeedback: null,
          orders: d.orders.map((o) => (o.id === orderId ? { ...o, feedbackDone: true } : o)),
          feedbacks: [{ orderId, date: new Date().toISOString(), ratings, comment, points: POINTS.feedback }, ...d.feedbacks],
        };
        next = applyPoints(next, POINTS.feedback, `Feedback ordine ${orderId}`);
        return next;
      }),
    [update]
  );
  const dismissFeedback = useCallback(() => update((d) => ({ ...d, pendingFeedback: null })), [update]);

  const value = useMemo<Ctx>(
    () => ({
      ready: state !== null,
      account,
      data,
      store,
      tab,
      setTab,
      profileView,
      setProfileView,
      qrOrderId,
      setQrOrderId,
      toast,
      notify,
      register,
      login,
      startDemo,
      resetDemo,
      logout,
      updateProfile,
      setOnboarded,
      setStore,
      setAdvance,
      addToCart,
      setCartQty,
      addToList,
      toggleListItem,
      removeListItem,
      dismissSuggestion,
      setSuggestionQty,
      regenerate,
      placeOrder,
      completeOrder,
      cancelOrder,
      submitFeedback,
      dismissFeedback,
    }),
    [state, account, data, store, tab, setTab, profileView, qrOrderId, toast, notify, register, login, startDemo, resetDemo, logout, updateProfile, setOnboarded, setStore, setAdvance, addToCart, setCartQty, addToList, toggleListItem, removeListItem, dismissSuggestion, setSuggestionQty, regenerate, placeOrder, completeOrder, cancelOrder, submitFeedback, dismissFeedback]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve essere usato dentro <AppProvider>");
  return ctx;
}

/** UI helper: pickup date based on the chosen advance */
export const pickupDateFor = (advance: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return addDays(d, advance);
};
