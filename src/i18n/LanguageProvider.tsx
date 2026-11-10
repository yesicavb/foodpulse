"use client";

import { createContext, Fragment, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getLang, saveLang, type Lang } from "@/i18n/lang";
import { applyLanguage } from "@/i18n/translator";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "it", setLang: () => {} });

export const useLang = () => useContext(LangContext);

/**
 * Holds the IT/EN choice. Switching re-renders the screens (keyed on the language) so dates
 * and prices are formatted again, while the app state (account, cart, current tab) is kept.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("it");

  useEffect(() => {
    const saved = getLang();
    setLangState(saved);
    applyLanguage(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    saveLang(l);
    setLangState(l);
    applyLanguage(l);
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <Fragment key={lang}>{children}</Fragment>
    </LangContext.Provider>
  );
}

/** IT | EN switch, used in the header and on the welcome and login screens */
export function LanguageSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div data-no-translate role="group" aria-label="Lingua / Language" className="inline-flex shrink-0 gap-0.5 rounded-full border border-brand-100 bg-white p-0.5 text-[12px] font-bold">
      {(["it", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          aria-label={l === "it" ? "Italiano" : "English"}
          onClick={() => setLang(l)}
          className={`min-h-[30px] min-w-[34px] rounded-full px-2 uppercase transition ${lang === l ? "bg-brand-50 text-brand-700" : "text-ink-500 hover:text-ink-700"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
