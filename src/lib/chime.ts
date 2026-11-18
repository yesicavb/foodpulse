/**
 * Short "ding-dong" for new orders on the supermarket dashboard, made with the Web Audio API (no sound file).
 * Browsers only allow sound after the page has been tapped once, so unlockChime() runs on the first tap.
 */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

export function unlockChime() {
  const a = audio();
  if (a && a.state === "suspended") void a.resume();
}

export function playChime() {
  const a = audio();
  if (!a) return;
  if (a.state === "suspended") void a.resume();
  const t0 = a.currentTime + 0.02;
  // two notes, played twice: easy to hear in a busy shop
  [0, 0.9].forEach((offset) =>
    [
      [880, 0],
      [660, 0.28],
    ].forEach(([freq, d]) => {
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      const t = t0 + offset + d;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.35, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      o.connect(g).connect(a.destination);
      o.start(t);
      o.stop(t + 0.6);
    })
  );
  try {
    navigator.vibrate?.([200, 100, 200]);
  } catch {
    /* not supported */
  }
}
