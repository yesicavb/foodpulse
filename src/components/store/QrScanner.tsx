"use client";

import jsQR from "jsqr";
import { CameraOff, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Camera QR reader: uses the back camera, reads a few frames per second and calls
 * onResult once with the text in the QR. Works in any modern phone browser over https.
 */
export function QrScanner({ onResult }: { onResult: (text: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"starting" | "on" | "error">("starting");
  const [error, setError] = useState("");
  const done = useRef(false);
  const cb = useRef(onResult);
  cb.current = onResult;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let alive = true;

    const tick = () => {
      if (!alive || done.current) return;
      const v = video.current;
      const c = canvas.current;
      if (v && c && v.readyState >= 2 && v.videoWidth) {
        // read a centred square, scaled down: faster and enough for a phone screen
        const side = Math.min(v.videoWidth, v.videoHeight);
        const size = Math.min(640, side);
        c.width = size;
        c.height = size;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(v, (v.videoWidth - side) / 2, (v.videoHeight - side) / 2, side, side, 0, 0, size, size);
          const img = ctx.getImageData(0, 0, size, size);
          const hit = jsQR(img.data, size, size, { inversionAttempts: "attemptBoth" });
          if (hit?.data) {
            done.current = true;
            if (navigator.vibrate) navigator.vibrate(80);
            cb.current(hit.data);
            return;
          }
        }
      }
      timer = setTimeout(tick, 180);
    };

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (!alive) return stream.getTracks().forEach((t) => t.stop());
        const v = video.current;
        if (!v) return;
        v.srcObject = stream;
        await v.play();
        setState("on");
        tick();
      } catch (e) {
        const name = (e as { name?: string })?.name ?? "";
        setError(
          name === "NotAllowedError"
            ? "Hai negato l'accesso alla fotocamera. Consentilo nelle impostazioni del browser, oppure inserisci il codice a mano."
            : name === "NotFoundError" || (e as Error)?.message === "unsupported"
              ? "Nessuna fotocamera disponibile su questo dispositivo. Inserisci il codice a mano."
              : "Non è stato possibile avviare la fotocamera. Inserisci il codice a mano."
        );
        setState("error");
      }
    })();

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-ink-900">
      <video ref={video} className="h-full w-full object-cover" muted playsInline autoPlay aria-label="Inquadratura della fotocamera" />
      <canvas ref={canvas} className="hidden" />
      {state === "on" && (
        <div className="pointer-events-none absolute inset-[14%] rounded-3xl border-4 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.35)]" aria-hidden="true" />
      )}
      {state === "starting" && (
        <div className="absolute inset-0 grid place-items-center text-white">
          <span className="flex items-center gap-2 text-[14px] font-semibold">
            <Loader2 size={18} className="animate-spin" /> Avvio della fotocamera…
          </span>
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-white">
          <div>
            <CameraOff size={30} className="mx-auto mb-3 text-white/80" aria-hidden="true" />
            <p className="text-[14px] leading-snug">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
