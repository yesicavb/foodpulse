/** FOODPULSE "Bag" logo: a shopping bag with a leaf, in shades of green */
export function LogoMark({ size = 36, inverted = false }: { size?: number; inverted?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M18 17v-3a6 6 0 0 1 12 0v3"
        fill="none"
        stroke={inverted ? "#9CCC65" : "#0E3A22"}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M11 17h26l-2 25H13z" fill={inverted ? "#FFFFFF" : "#1B5E20"} stroke={inverted ? "#FFFFFF" : "#1B5E20"} strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 37c0-7.5 4.5-11.5 12-11.5 0 7.5-4.5 11.5-12 11.5z" fill={inverted ? "#1B5E20" : "#9CCC65"} />
      <path d="M18 37l6.5-6.5" stroke={inverted ? "#FFFFFF" : "#1B5E20"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ size = 20, inverted = false }: { size?: number; inverted?: boolean }) {
  return (
    <span className="font-display font-extrabold leading-none tracking-[0.01em]" style={{ fontSize: size }}>
      <span className={inverted ? "text-white" : "text-brand-900"}>FOOD</span>
      <span className={inverted ? "text-leaf" : "text-brand-500"}>PULSE</span>
    </span>
  );
}

export function Logo({ size = 34, inverted = false, wordSize = 19 }: { size?: number; inverted?: boolean; wordSize?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} inverted={inverted} />
      <Wordmark size={wordSize} inverted={inverted} />
    </span>
  );
}
