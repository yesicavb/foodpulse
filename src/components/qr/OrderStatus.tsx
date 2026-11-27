"use client";

import { ChefHat, ClipboardCheck, PackageCheck, QrCode, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import { sendToStore, statusesAtStore, type DeskStatus } from "@/lib/desk";
import { useApp } from "@/store/AppStore";
import { systemNotify } from "@/lib/systemNotify";

/** How each store status looks for the customer */
export const CUSTOMER_STATUS: Partial<Record<DeskStatus, { title: string; text: string; icon: typeof ChefHat; tone: string; ring: string }>> = {
  da_preparare: {
    title: "Ordine ricevuto",
    text: "Il negozio ha ricevuto la tua prenotazione. Ti avvisiamo quando inizia a prepararla.",
    icon: ClipboardCheck,
    tone: "bg-amber-50 text-amber-900",
    ring: "bg-amber-500",
  },
  in_preparazione: {
    title: "Stanno preparando il tuo ordine",
    text: "Il negozio sta mettendo insieme la tua spesa. Ti avvisiamo appena è pronta.",
    icon: ChefHat,
    tone: "bg-sky-50 text-sky-900",
    ring: "bg-sky-500",
  },
  pronto: {
    title: "Il tuo ordine è pronto!",
    text: "Puoi passare a ritirarlo. Mostra il QR code al banco.",
    icon: PackageCheck,
    tone: "bg-brand-50 text-brand-900",
    ring: "bg-brand-600",
  },
};

type News = { orderId: string; status: DeskStatus };
interface Ctx {
  atStore: Record<string, DeskStatus>;
  /** a status change the customer hasn't looked at yet (dot on the QR tab) */
  unseen: boolean;
}
const OrderStatusCtx = createContext<Ctx>({ atStore: {}, unseen: false });
export const useOrderStatus = () => useContext(OrderStatusCtx);

const KNOWN_KEY = "foodpulse-status-known";
const readKnown = (): Record<string, DeskStatus> => {
  try {
    return JSON.parse(localStorage.getItem(KNOWN_KEY) ?? "{}");
  } catch {
    return {};
  }
};
const writeKnown = (k: Record<string, DeskStatus>) => {
  try {
    localStorage.setItem(KNOWN_KEY, JSON.stringify(k));
  } catch {
    /* ignore */
  }
};

/**
 * Follows the customer's active bookings at the supermarket, on every tab of the app.
 * When the store starts preparing an order or marks it ready, a pop-up appears and the QR tab gets a dot.
 */
export function OrderStatusProvider({ children }: { children: ReactNode }) {
  const { data, account, tab, setTab, setQrOrderId, completeOrder, notify } = useApp();
  const cloud = !!account?.cloud;
  const [atStore, setAtStore] = useState<Record<string, DeskStatus>>({});
  const [news, setNews] = useState<News | null>(null);
  const [unseen, setUnseen] = useState(false);
  const orders = useRef(data?.orders ?? []);
  orders.current = data?.orders ?? [];
  const who = `${data?.profile.firstName ?? ""} ${data?.profile.lastName ?? ""}`.trim() || "Cliente";
  const whoRef = useRef(who);
  whoRef.current = who;
  const activeIds = (data?.orders ?? [])
    .filter((o) => o.status === "attivo")
    .map((o) => o.id)
    .join(",");

  useEffect(() => {
    if (!activeIds) return;
    let alive = true;
    const ids = activeIds.split(",");
    const check = async () => {
      const st = await statusesAtStore(ids, cloud);
      if (!alive) return;
      setAtStore(st);
      const known = readKnown();
      let fresh: News | null = null;
      for (const id of ids) {
        const o = orders.current.find((x) => x.id === id);
        if (!o) continue;
        const s = st[id];
        if (s === "completato") {
          completeOrder(id);
          notify("Ritiro confermato dal negozio");
        } else if (!s) {
          void sendToStore(o, whoRef.current, cloud); // older booking the store never received
        } else if (s !== known[id] && (s === "in_preparazione" || s === "pronto")) {
          // "pronto" wins over "in preparazione" when several orders change at once
          if (!fresh || s === "pronto") fresh = { orderId: id, status: s };
        }
        if (s) known[id] = s;
      }
      writeKnown(known);
      if (fresh) {
        setNews(fresh);
        setUnseen(true);
        try {
          navigator.vibrate?.(fresh.status === "pronto" ? [180, 80, 180] : 150);
        } catch {
          /* not supported */
        }
        track("order_status_seen", { status: fresh.status });
        const look = CUSTOMER_STATUS[fresh.status];
        if (look) void systemNotify(look.title, look.text, `foodpulse-${fresh.orderId}`);
      }
    };
    void check();
    const t = setInterval(check, 8000);
    const onVisible = () => document.visibilityState === "visible" && void check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIds, cloud]);

  // opening the QR tab counts as having seen the news
  useEffect(() => {
    if (tab === "qr") setUnseen(false);
  }, [tab]);

  const close = useCallback(() => setNews(null), []);
  useEffect(() => {
    if (!news) return;
    const t = setTimeout(close, 15000);
    return () => clearTimeout(t);
  }, [news, close]);

  const look = news ? CUSTOMER_STATUS[news.status] : null;
  return (
    <OrderStatusCtx.Provider value={{ atStore, unseen }}>
      {children}
      {news && look && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex justify-center px-3 pt-[max(10px,env(safe-area-inset-top))]">
          <div role="alert" className={`pointer-events-auto w-full max-w-[456px] animate-sheet overflow-hidden rounded-3xl shadow-float ring-1 ring-black/5 ${look.tone}`}>
            <div className="flex items-start gap-3 p-4">
              <span className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white ${look.ring}`}>
                <span className={`absolute inset-0 animate-ping rounded-2xl opacity-30 ${look.ring}`} aria-hidden="true" />
                <look.icon size={24} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-extrabold leading-tight">{look.title}</p>
                <p className="mt-1 text-[13px] leading-snug opacity-85">{look.text}</p>
              </div>
              <button type="button" onClick={close} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/70" aria-label="Chiudi">
                <X size={16} />
              </button>
            </div>
            {tab !== "qr" && (
              <button
                type="button"
                onClick={() => {
                  setQrOrderId(news.orderId);
                  setTab("qr");
                  close();
                }}
                className="flex w-full items-center justify-center gap-2 border-t border-black/5 bg-white/60 py-3 text-[14px] font-bold"
              >
                <QrCode size={17} aria-hidden="true" /> Vai al mio QR code
              </button>
            )}
          </div>
        </div>
      )}
    </OrderStatusCtx.Provider>
  );
}
