"use client";

import { AuthScreen, NewPasswordScreen } from "@/components/auth/AuthScreen";
import { SmartBasketScreen } from "@/components/basket/SmartBasketScreen";
import { CartScreen } from "@/components/cart/CartScreen";
import { FeedbackSheet } from "@/components/feedback/FeedbackSheet";
import { ProfileScreen } from "@/components/profile/ProfileScreen";
import { QrScreen } from "@/components/qr/QrScreen";
import { AppShell } from "@/components/shell/AppShell";
import { LogoMark } from "@/components/ui/Logo";
import { AppProvider, useApp } from "@/store/AppStore";

function Gate() {
  const { ready, recovering, account, data, tab } = useApp();
  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-white">
        <LogoMark size={64} />
      </div>
    );
  }
  if (recovering) return <NewPasswordScreen />;
  if (!account || !data) return <AuthScreen />;
  return (
    <AppShell>
      {tab === "basket" && <SmartBasketScreen />}
      {tab === "cart" && <CartScreen />}
      {tab === "qr" && <QrScreen />}
      {tab === "profile" && <ProfileScreen />}
      {data.pendingFeedback && <FeedbackSheet orderId={data.pendingFeedback} />}
    </AppShell>
  );
}

/** App root: used by both the Next.js page and the standalone version */
export function FoodPulseApp() {
  return (
    <AppProvider>
      <Gate />
    </AppProvider>
  );
}
