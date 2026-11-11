"use client";

import { CheckCircle2, MessageSquareHeart, QrCode, ShoppingCart, Sparkles, User } from "lucide-react";
import { LanguageSwitch } from "@/i18n/LanguageProvider";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { initials } from "@/lib/format";
import { isAvailable } from "@/lib/pricing";
import { useApp, type Tab } from "@/store/AppStore";

const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
  { id: "basket", label: "Smart Basket", icon: Sparkles },
  { id: "cart", label: "Il mio carrello", icon: ShoppingCart },
  { id: "qr", label: "Il mio QR Code", icon: QrCode },
  { id: "feedback", label: "Feedback", icon: MessageSquareHeart },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { tab, setTab, data, store, toast, setProfileView } = useApp();
  /** orange dot on Feedback until the user opens it once (accounts that already sent feedback never see it) */
  const feedbackDot = !!data && !data.feedbackTabSeen && !(data.appFeedbacks?.length);
  const p = data?.profile;
  const hasName = !!(p?.firstName || p?.lastName);
  const onProfile = tab === "profile";
  const cartCount = data ? data.cart.filter((l) => isAvailable(l.productId, store)).reduce((a, l) => a + l.qty, 0) : 0;
  const activeOrders = data ? data.orders.filter((o) => o.status === "attivo").length : 0;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-cream sm:shadow-2xl">
      <header className="gutter sticky top-0 z-40 flex items-center justify-between gap-3 bg-cream/95 pb-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur">
        <button type="button" onClick={() => setTab("basket")} aria-label="Vai allo Smart Basket">
          <Logo size={32} wordSize={18} />
        </button>
        <div className="flex items-center gap-2">
          <LanguageSwitch />
          {data && (
            <button
              type="button"
              onClick={() => {
                setTab("profile");
                setProfileView("home");
              }}
              aria-label="Il mio profilo"
              aria-current={onProfile ? "page" : undefined}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-[12.5px] font-bold transition ${onProfile ? "border-brand-600 bg-brand-600 text-white" : "border-brand-100 bg-white text-brand-700 hover:bg-brand-50"}`}
            >
              {hasName ? initials(p!.firstName, p!.lastName) : <User size={18} />}
            </button>
          )}
        </div>
      </header>

      <main className="gutter flex-1 pb-36 pt-4">{children}</main>

      {toast && (
        <div className="gutter pointer-events-none fixed inset-x-0 bottom-[92px] z-[70] flex justify-center">
          <div role="status" className="flex w-full max-w-[448px] animate-rise items-center gap-2 rounded-2xl bg-ink-900 px-4 py-3 text-[14px] font-semibold text-white shadow-lg">
            <CheckCircle2 size={18} className="shrink-0 text-leaf" /> {toast}
          </div>
        </div>
      )}

      <nav aria-label="Navigazione principale" className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 rounded-t-3xl bg-white/95 pb-[max(8px,env(safe-area-inset-bottom))] shadow-float backdrop-blur">
        <ul className="grid grid-cols-4 gap-1 px-2 pt-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            const badge = id === "cart" ? cartCount : id === "qr" ? activeOrders : 0;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setTab(id)}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex w-full flex-col items-center gap-1 rounded-2xl py-2 text-[10.5px] font-semibold leading-tight transition ${active ? "bg-brand-50 text-brand-600" : "text-ink-500 hover:text-ink-700"}`}
                >
                  <Icon size={22} strokeWidth={active ? 2.3 : 1.9} aria-hidden="true" />
                  <span className="text-center">{label}</span>
                  {id === "feedback" && feedbackDot && !active && (
                    <span className="absolute right-[28%] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-white">
                      <span className="sr-only">Nuovo</span>
                    </span>
                  )}
                  {badge > 0 && (
                    <span className="absolute right-[20%] top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-extrabold tabular-nums text-white">
                      {badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
