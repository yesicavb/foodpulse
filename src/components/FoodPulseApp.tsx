"use client";

import { AppFeedbackScreen } from "@/components/feedback/AppFeedbackScreen";
import { AuthScreen, NewPasswordScreen } from "@/components/auth/AuthScreen";
import { SmartBasketScreen } from "@/components/basket/SmartBasketScreen";
import { CartScreen } from "@/components/cart/CartScreen";
import { FeedbackSheet } from "@/components/feedback/FeedbackSheet";
import { ProfileScreen } from "@/components/profile/ProfileScreen";
import { QrScreen } from "@/components/qr/QrScreen";
import { StoreApp } from "@/components/store/StoreApp";
import { DEMO_STORE_ID } from "@/lib/desk";
import { AppShell } from "@/components/shell/AppShell";
import { CookieBanner } from "@/components/shell/CookieBanner";
import { LogoMark } from "@/components/ui/Logo";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { AppProvider, useApp } from "@/store/AppStore";

function Gate() {
  const { ready, recovering, account, data, tab, storeDemo, exitStoreDemo, staffStore, logout } = useApp();
  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-white">
        <LogoMark size={64} />
      </div>
    );
  }
  if (recovering) return <NewPasswordScreen />;
  if (storeDemo) return <StoreApp storeId={DEMO_STORE_ID} cloud={false} demo onExit={exitStoreDemo} />;
  if (!account || !data) return <AuthScreen />;
  // supermarket account: wait for the check, then open the dashboard instead of the shopper app
  if (account.cloud && staffStore === undefined) {
    return (
      <div className="grid min-h-screen place-items-center bg-white">
        <LogoMark size={64} />
      </div>
    );
  }
  if (staffStore) return <StoreApp storeId={staffStore} cloud demo={false} onExit={logout} />;
  return (
    <AppShell>
      {tab === "basket" && <SmartBasketScreen />}
      {tab === "cart" && <CartScreen />}
      {tab === "qr" && <QrScreen />}
      {tab === "profile" && <ProfileScreen />}
      {tab === "feedback" && <AppFeedbackScreen />}
      {data.pendingFeedback && <FeedbackSheet orderId={data.pendingFeedback} />}
    </AppShell>
  );
}

/** App root: used by both the Next.js page and the standalone version */
export function FoodPulseApp() {
  return (
    <AppProvider>
      <LanguageProvider>
        <Gate />
        <CookieBanner />
      </LanguageProvider>
    </AppProvider>
  );
}
