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
import { cloudError, errorMessage, supabase, USER_DATA_TABLE } from "@/lib/supabase";
import type { Account, AppFeedback, AppFeedbackKind, AppState, ListItem, Order, Profile, Store, UserData } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

/**
 * App state.
 * - Demo account (and every account when Supabase is not configured): saved on the device (localStorage).
 * - Supabase accounts: loaded from the `user_data` table at login and saved back after every change,
 *   so the same account works on any device. They are never written to localStorage.
 */
const KEY = "foodpulse-app-v2";
const DEMO_EMAIL = "demo@foodpulse.app";
const CLOUD_SAVE_DELAY_MS = 600;

/** The part of the state that is kept on the device: everything except Supabase accounts */
function localPart(s: AppState): AppState {
  const cloudIds = new Set(s.accounts.filter((a) => a.cloud).map((a) => a.id));
  if (!cloudIds.size) return s;
  return {
    ...s,
    accounts: s.accounts.filter((a) => !a.cloud),
    data: Object.fromEntries(Object.entries(s.data).filter(([id]) => !cloudIds.has(id))),
    session: s.session && cloudIds.has(s.session) ? null : s.session,
  };
}

/** Loads the user's row from Supabase, creating it on first login */
async function loadCloudData(user: User): Promise<UserData> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data: row, error } = await supabase.from(USER_DATA_TABLE).select("data").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  if (row?.data) return row.data as UserData;
  const meta = (user.user_metadata ?? {}) as { first_name?: string; last_name?: string };
  const fresh = newUserData(meta.first_name ?? "", meta.last_name ?? "");
  const { error: insertError } = await supabase.from(USER_DATA_TABLE).insert({ user_id: user.id, data: fresh });
  if (insertError) throw insertError;
  return fresh;
}

/** Adds (or refreshes) a Supabase account in the state and logs it in */
function withCloudUser(s: AppState, user: User, data: UserData): AppState {
  const acc: Account = { id: user.id, email: user.email ?? "", passHash: "", createdAt: user.created_at, cloud: true };
  return {
    ...s,
    accounts: [...s.accounts.filter((a) => a.id !== user.id), acc],
    data: { ...s.data, [user.id]: data },
    session: user.id,
  };
}

/** Page to come back to from confirmation and password-reset emails */
const redirectUrl = () => (typeof window === "undefined" ? undefined : window.location.origin + window.location.pathname);

export type Tab = "basket" | "cart" | "qr" | "profile" | "feedback";
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

/** `info` = success that still needs a step from the user (e.g. confirming the email) */
type Result = { ok: true; info?: string } | { ok: false; error: string };

interface Ctx {
  ready: boolean;
  /** true when accounts are stored in Supabase (works across devices) */
  cloud: boolean;
  /** true after opening a password-reset link: the app asks for a new password */
  recovering: boolean;
  requestPasswordReset: (email: string) => Promise<Result>;
  setNewPassword: (password: string) => Promise<Result>;
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
  /** general feedback about the app (Feedback tab): saved in the account and, with Supabase, in the app_feedback table */
  sendAppFeedback: (f: { kind: AppFeedbackKind; rating: number; message: string; canContact: boolean; email?: string }) => Promise<Result>;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [tab, setTabState] = useState<Tab>("basket");
  const [profileView, setProfileView] = useState<ProfileView>("home");
  const [qrOrderId, setQrOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recovering, setRecovering] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** last data object loaded from or saved to Supabase, to skip saving unchanged data */
  const lastCloudData = useRef<UserData | null>(null);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  /** Loads a Supabase user's data and logs them in; returns an error message on failure */
  const attachCloudUser = useCallback(async (user: User): Promise<string | null> => {
    try {
      const d = await loadCloudData(user);
      lastCloudData.current = d;
      setState((s) => withCloudUser(s ?? emptyState(), user, d));
      setTabState("basket");
      return null;
    } catch (e) {
      console.error("FoodPulse: Supabase error", e);
      return cloudError(errorMessage(e));
    }
  }, []);

  // Start-up: local data first, then an existing Supabase session (also after an email link)
  useEffect(() => {
    const local = load();
    if (!supabase) {
      setState(local);
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
    });
    let cancelled = false;
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const user = s.session?.user;
      if (user) {
        try {
          const d = await loadCloudData(user);
          if (cancelled) return;
          lastCloudData.current = d;
          setState(withCloudUser(local, user, d));
          return;
        } catch {
          if (!cancelled) notify("Non riusciamo a caricare il tuo account. Riprova più tardi.");
        }
      }
      if (!cancelled) setState(local);
    })();
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [notify]);

  // Device storage: everything except Supabase accounts
  useEffect(() => {
    if (!state) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(localPart(state)));
    } catch {
      /* keep going in memory */
    }
  }, [state]);

  const account = state?.accounts.find((a) => a.id === state.session) ?? null;
  const data = account && state ? state.data[account.id] ?? null : null;
  const store = storeById(data?.storeId);

  // Supabase storage: save the logged-in user's data shortly after each change
  const pendingSave = useRef<{ userId: string; snapshot: UserData } | null>(null);
  const saveNow = useCallback(async () => {
    const job = pendingSave.current;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    pendingSave.current = null;
    if (!supabase || !job) return;
    const { error } = await supabase
      .from(USER_DATA_TABLE)
      .upsert({ user_id: job.userId, data: job.snapshot, updated_at: new Date().toISOString() });
    if (error) notify("Modifica non salvata online. Controlla la connessione.");
    else lastCloudData.current = job.snapshot;
  }, [notify]);

  useEffect(() => {
    if (!supabase || !account?.cloud || !data || data === lastCloudData.current) return;
    pendingSave.current = { userId: account.id, snapshot: data };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void saveNow(), CLOUD_SAVE_DELAY_MS);
  }, [account, data, saveNow]);

  // Save right away when the page is hidden or closed, so no change is lost
  useEffect(() => {
    if (!supabase) return;
    const flush = () => {
      if (document.visibilityState === "hidden") void saveNow();
    };
    document.addEventListener("visibilitychange", flush);
    return () => document.removeEventListener("visibilitychange", flush);
  }, [saveNow]);

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
    if (supabase) {
      const { data: r, error } = await supabase.auth.signUp({
        email: e,
        password,
        options: { data: { first_name: firstName.trim(), last_name: lastName.trim() }, emailRedirectTo: redirectUrl() },
      });
      if (error) return { ok: false, error: cloudError(error.message) };
      if (!r.session || !r.user) {
        return { ok: true, info: `Ti abbiamo inviato un'email a ${e}. Apri il link per confermare l'account, poi accedi.` };
      }
      const err = await attachCloudUser(r.user);
      return err ? { ok: false, error: err } : { ok: true };
    }
    if (state?.accounts.some((a) => a.email === e)) return { ok: false, error: "Esiste già un account con questa email. Accedi oppure usa un'altra email." };
    const acc: Account = { id: `u-${Date.now().toString(36)}`, email: e, passHash: await hashPassword(e, password), createdAt: new Date().toISOString() };
    setState((s) => {
      const base = s ?? emptyState();
      return { ...base, accounts: [...base.accounts, acc], data: { ...base.data, [acc.id]: newUserData(firstName.trim(), lastName.trim()) }, session: acc.id };
    });
    setTabState("basket");
    return { ok: true };
  }, [state, attachCloudUser]);

  const login: Ctx["login"] = useCallback(async (email, password) => {
    const e = email.trim().toLowerCase();
    if (supabase) {
      const { data: r, error } = await supabase.auth.signInWithPassword({ email: e, password });
      if (error || !r.user) return { ok: false, error: cloudError(error?.message ?? "") };
      const err = await attachCloudUser(r.user);
      return err ? { ok: false, error: err } : { ok: true };
    }
    const acc = state?.accounts.find((a) => a.email === e && !a.demo);
    if (!acc) return { ok: false, error: "Non troviamo un account con questa email su questo dispositivo. Registrati o prova la demo." };
    if (acc.passHash !== (await hashPassword(e, password))) return { ok: false, error: "Password non corretta. Riprova o recuperala." };
    setState((s) => (s ? { ...s, session: acc.id } : s));
    setTabState("basket");
    return { ok: true };
  }, [state, attachCloudUser]);

  const requestPasswordReset: Ctx["requestPasswordReset"] = useCallback(async (email) => {
    if (!supabase) return { ok: true };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: redirectUrl() });
    return error ? { ok: false, error: cloudError(error.message) } : { ok: true };
  }, []);

  const setNewPassword: Ctx["setNewPassword"] = useCallback(async (password) => {
    if (!supabase) return { ok: false, error: cloudError("") };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, error: cloudError(error.message) };
    setRecovering(false);
    return { ok: true };
  }, []);

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
    if (account?.cloud && supabase) {
      const client = supabase;
      // save any pending change first, then end the Supabase session
      void saveNow().finally(() => client.auth.signOut());
      lastCloudData.current = null;
    }
    setState((s) => (s ? { ...localPart(s), session: null } : s));
    setTabState("basket");
    setProfileView("home");
    setQrOrderId(null);
  }, [account, saveNow]);

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

  const sendAppFeedback: Ctx["sendAppFeedback"] = useCallback(
    async ({ kind, rating, message, canContact, email }) => {
      const text = message.trim();
      if (supabase) {
        const contactEmail = canContact ? (account?.cloud ? account.email : email?.trim() || null) : null;
        const { error } = await supabase.from("app_feedback").insert({
          user_id: account?.cloud ? account.id : null,
          email: contactEmail,
          kind,
          rating: rating || null,
          message: text,
          can_contact: canContact,
        });
        if (error) {
          console.error("FoodPulse: feedback not sent", error);
          return { ok: false, error: cloudError(errorMessage(error)) };
        }
      }
      const entry: AppFeedback = {
        id: `fb-${Date.now().toString(36)}`,
        date: new Date().toISOString(),
        kind,
        rating,
        message: text,
        canContact,
      };
      update((d) => ({ ...d, appFeedbacks: [entry, ...(d.appFeedbacks ?? [])] }));
      return { ok: true };
    },
    [account, update]
  );

  const value = useMemo<Ctx>(
    () => ({
      ready: state !== null,
      cloud: supabase !== null,
      recovering,
      requestPasswordReset,
      setNewPassword,
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
      sendAppFeedback,
    }),
    [state, recovering, requestPasswordReset, setNewPassword, account, data, store, tab, setTab, profileView, qrOrderId, toast, notify, register, login, startDemo, resetDemo, logout, updateProfile, setOnboarded, setStore, setAdvance, addToCart, setCartQty, addToList, toggleListItem, removeListItem, dismissSuggestion, setSuggestionQty, regenerate, placeOrder, completeOrder, cancelOrder, submitFeedback, dismissFeedback, sendAppFeedback]
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
