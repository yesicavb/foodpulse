"use client";

import { Sparkles, Store as StoreIcon } from "lucide-react";
import { EmptyState, Sheet } from "@/components/ui/Controls";
import { GroceryBag } from "@/components/ui/FoodArt";
import { LogoMark } from "@/components/ui/Logo";
import { useApp } from "@/store/AppStore";
import { FreshCatalog } from "./FreshCatalog";
import { SmartList } from "./SmartList";
import { Sponsored } from "./Sponsored";
import { StorePicker } from "./StorePicker";

/** Main screen: the Smart Basket (no separate Home screen) */
export function SmartBasketScreen() {
  const { data, store, setOnboarded, setTab, setProfileView } = useApp();
  if (!data) return null;
  const firstName = data.profile.firstName;

  return (
    <div className="space-y-6">
      <div className="flex animate-rise items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] text-ink-700">
            Ciao{firstName ? <> {firstName}</> : null},
          </p>
          <h1 className="text-[22px] font-bold leading-tight tracking-tight text-ink-900">
            ecco la tua spesa della settimana{" "}
            <span aria-hidden="true">👋</span>
          </h1>
        </div>
        <GroceryBag size={104} />
      </div>

      <StorePicker />

      {store ? (
        <>
          <SmartList />
          <FreshCatalog />
          <Sponsored />
        </>
      ) : (
        <EmptyState
          icon={<StoreIcon size={26} />}
          title="Scegli prima il supermercato"
          text="Prodotti, prezzi, sconti e modalità di ritiro cambiano da un punto vendita all'altro."
        />
      )}

      <Sheet open={!data.onboarded} onClose={setOnboarded} title="Benvenuto in FOODPULSE">
        <div className="space-y-4 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-50">
            <LogoMark size={52} />
          </div>
          <h3 className="text-[20px] font-extrabold text-ink-900">Vuoi completare il tuo profilo?</h3>
          <p className="text-[14.5px] leading-relaxed text-ink-600">
            Con poche informazioni (per quante persone fai la spesa, cosa ti piace, il tuo budget) lo Smart Basket ti propone una lista più adatta a te. Puoi farlo
            anche più tardi dal profilo.
          </p>
          <div className="grid gap-2">
            <button
              type="button"
              className="btn-primary h-12"
              onClick={() => {
                setOnboarded();
                setTab("profile");
                setProfileView("personal");
              }}
            >
              <Sparkles size={16} /> Completa ora
            </button>
            <button type="button" className="btn-secondary h-12" onClick={setOnboarded}>
              Più tardi
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
