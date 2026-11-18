"use client";

import { BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { enableNotifications, notifyState, type NotifyState } from "@/lib/systemNotify";

/** Small card asking to turn on browser notifications; hidden once answered or when not supported */
export function NotifyCard({ text, where }: { text: string; where: "customer" | "store" }) {
  const [state, setState] = useState<NotifyState>("unsupported");
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    setState(notifyState());
    try {
      setHidden(localStorage.getItem(`foodpulse-notify-later-${where}`) === "1");
    } catch {
      /* ignore */
    }
  }, [where]);
  if (state !== "default" || hidden) return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white p-3 shadow-card">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
        <BellRing size={19} aria-hidden="true" />
      </span>
      <p className="min-w-0 flex-1 text-[13px] leading-snug text-ink-700">{text}</p>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <button
          type="button"
          className="btn-primary h-9 rounded-full px-3 text-[13px]"
          onClick={async () => {
            const s = await enableNotifications();
            setState(s);
            track("notifications_answer", { where, result: s });
          }}
        >
          Attiva notifiche
        </button>
        <button
          type="button"
          className="text-[11.5px] font-semibold text-ink-500 underline underline-offset-2"
          onClick={() => {
            setHidden(true);
            try {
              localStorage.setItem(`foodpulse-notify-later-${where}`, "1");
            } catch {
              /* ignore */
            }
          }}
        >
          Non ora
        </button>
      </div>
    </div>
  );
}
