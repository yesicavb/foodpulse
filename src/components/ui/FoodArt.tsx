/**
 * Food illustrations drawn for FOODPULSE (no photos, no brand artwork), in a soft
 * realistic style: gradients for volume, highlights for shine, small details for texture.
 * One drawing per product, department and empty state, on a 64 × 64 grid.
 * To give a new product a picture, add its id to ART_FOR below (or reuse a similar drawing).
 */
import { useId, type ReactElement, type ReactNode } from "react";

/** Each drawing gets `u(name)`, which makes gradient ids unique per picture on the page */
type U = (name: string) => string;
type Art = (u: U) => ReactElement;
type Stop = [number, string, number?];

const Lin = ({ id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1 }: { id: string; s: Stop[]; x1?: number; y1?: number; x2?: number; y2?: number }) => (
  <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
    {s.map(([o, c, a], i) => (
      <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />
    ))}
  </linearGradient>
);
const Rad = ({ id, s, cx = 0.38, cy = 0.32, r = 0.75 }: { id: string; s: Stop[]; cx?: number; cy?: number; r?: number }) => (
  <radialGradient id={id} cx={cx} cy={cy} r={r}>
    {s.map(([o, c, a], i) => (
      <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />
    ))}
  </radialGradient>
);
const f = (u: U, n: string) => `url(#${u(n)})`;

/** Soft contact shadow under each item */
const Shadow = ({ u, w = 44, y = 55, o = 0.22 }: { u: U; w?: number; y?: number; o?: number }) => (
  <ellipse cx="32" cy={y} rx={w / 2} ry="3.6" fill="#3B2A1A" opacity={o} filter={f(u, "blur")} />
);
/** Glossy highlight */
const Shine = ({ cx, cy, rx, ry, rot = -30, o = 0.55 }: { cx: number; cy: number; rx: number; ry: number; rot?: number; o?: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFFFFF" opacity={o} transform={`rotate(${rot} ${cx} ${cy})`} />
);

/* A ceramic bowl; the food goes on top (surface at y≈33) */
const Bowl = ({ u, children }: { u: U; children: ReactNode }) => (
  <>
    <defs>
      <Lin id={u("bowl")} s={[[0, "#FFFFFF"], [0.6, "#EEF2EA"], [1, "#C9D4C1"]]} />
      <Lin id={u("rim")} s={[[0, "#FFFFFF"], [1, "#DDE5D6"]]} />
    </defs>
    <Shadow u={u} w={46} y={54} />
    <path d="M8 33 Q10 53 32 53 Q54 53 56 33 Z" fill={f(u, "bowl")} />
    <path d="M14 42 Q22 50 32 50" stroke="#FFFFFF" strokeWidth="2.4" fill="none" opacity="0.8" strokeLinecap="round" />
    <ellipse cx="32" cy="33" rx="24" ry="7.5" fill={f(u, "rim")} />
    {children}
  </>
);

/* A plastic tub with a printed band and a foil lid */
const Tub = ({ u, band, top, fill }: { u: U; band: string; top: string; fill?: ReactElement }) => (
  <>
    <defs>
      <Lin id={u("tub")} x1={0} y1={0} x2={1} y2={0} s={[[0, "#E3E8EE"], [0.25, "#FFFFFF"], [0.6, "#F4F6F9"], [1, "#C7CFD9"]]} />
      <Lin id={u("band")} x1={0} y1={0} x2={1} y2={0} s={[[0, band, 0.75], [0.3, band], [1, band, 0.7]]} />
      <Rad id={u("foil")} cx={0.35} cy={0.3} s={[[0, "#FFFFFF"], [0.6, top], [1, "#B9C3CF"]]} />
    </defs>
    <Shadow u={u} w={36} y={55} />
    <path d="M14 23 L50 23 L46 53 Q32 56.5 18 53 Z" fill={f(u, "tub")} />
    <path d="M16.6 37 L47.4 37 L46.4 45 L17.6 45 Z" fill={f(u, "band")} />
    <ellipse cx="32" cy="23" rx="18" ry="5.2" fill="#C9D2DD" />
    <ellipse cx="32" cy="22.4" rx="16.6" ry="4.4" fill={f(u, "foil")} />
    {fill}
  </>
);

/* A glass jar with a lid; `inside` draws the contents */
const Jar = ({ u, lid, inside }: { u: U; lid: string; inside: ReactElement }) => (
  <>
    <defs>
      <Lin id={u("glass")} x1={0} y1={0} x2={1} y2={0} s={[[0, "#FFFFFF", 0.5], [0.2, "#FFFFFF", 0.1], [0.8, "#FFFFFF", 0.05], [1, "#FFFFFF", 0.45]]} />
      <Lin id={u("lid")} s={[[0, lid], [1, "#000000"]]} />
    </defs>
    <Shadow u={u} w={32} />
    <rect x="18" y="19" width="28" height="36" rx="8" fill="#E9F1EC" opacity="0.9" />
    {inside}
    <rect x="18" y="19" width="28" height="36" rx="8" fill={f(u, "glass")} />
    <path d="M22 25 L22 48" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
    <rect x="17" y="13" width="30" height="8" rx="3" fill={lid} />
    <rect x="17" y="17" width="30" height="4" rx="2" fill={f(u, "lid")} opacity="0.35" />
    <path d="M20 15 L44 15" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.5" strokeLinecap="round" />
  </>
);

/* A pouch / bag with a top seal */
const Pouch = ({ u, c1, c2, band, children }: { u: U; c1: string; c2: string; band: string; children?: ReactNode }) => (
  <>
    <defs>
      <Lin id={u("pouch")} x1={0} y1={0} x2={1} y2={0} s={[[0, c2], [0.3, c1], [0.7, c1], [1, c2]]} />
    </defs>
    <Shadow u={u} w={36} />
    <path d="M17 13 L47 13 L49 52 Q32 56 15 52 Z" fill={f(u, "pouch")} />
    <path d="M17 13 L47 13 L47.4 19 L16.6 19 Z" fill={band} />
    <path d="M18 16 L46 16" stroke="#FFFFFF" strokeOpacity="0.55" strokeDasharray="1.5 1.5" />
    {children}
    <path d="M21 22 Q20 37 21 50" stroke="#FFFFFF" strokeWidth="2.2" opacity="0.35" fill="none" strokeLinecap="round" />
  </>
);

/* A printed box in 3/4 view */
const Carton = ({ u, c, side, children }: { u: U; c: string; side: string; children?: ReactNode }) => (
  <>
    <defs>
      <Lin id={u("box")} x1={0} y1={0} x2={1} y2={1} s={[[0, c], [1, side]]} />
    </defs>
    <Shadow u={u} w={40} />
    <path d="M16 12 L42 12 L49 17 L49 54 L23 54 L16 49 Z" fill={side} />
    <rect x="16" y="12" width="27" height="42" rx="2" fill={f(u, "box")} />
    {children}
    <path d="M18 14 L18 50" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.4" strokeLinecap="round" />
  </>
);

export const ART: Record<string, Art> = {
  /* ---------- Bakery ---------- */
  bread: (u) => (
    <>
      <defs>
        <Rad id={u("b")} cx={0.42} cy={0.3} r={0.8} s={[[0, "#F2BE7A"], [0.55, "#D18B45"], [1, "#9A5623"]]} />
        <Lin id={u("cut")} s={[[0, "#FBE3B8"], [1, "#E9B877"]]} />
      </defs>
      <Shadow u={u} w={50} />
      <path d="M7 40 C7 24 20 17 32 17 C44 17 57 24 57 40 C57 48 52 51 45 51 L19 51 C12 51 7 48 7 40 Z" fill={f(u, "b")} />
      {[17, 27, 37].map((x) => (
        <g key={x}>
          <path d={`M${x} 26 Q${x + 5} 29 ${x + 9} 36`} stroke="#8A4A1C" strokeWidth="4.2" strokeLinecap="round" fill="none" opacity="0.55" />
          <path d={`M${x} 26 Q${x + 5} 29 ${x + 9} 36`} stroke={f(u, "cut")} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </g>
      ))}
      <Shine cx={22} cy={23} rx={8} ry={2.6} rot={-20} o={0.35} />
      {[[14, 33], [46, 30], [40, 22], [24, 41], [50, 40]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.8" fill="#FFF6E5" opacity="0.8" />
      ))}
    </>
  ),
  rye: (u) => (
    <>
      <defs>
        <Rad id={u("b")} cx={0.42} cy={0.3} r={0.8} s={[[0, "#A97950"], [0.6, "#7A4D2C"], [1, "#4A2C17"]]} />
        <Lin id={u("seed")} s={[[0, "#FFF4D6"], [1, "#D9C08A"]]} />
      </defs>
      <Shadow u={u} w={50} />
      <path d="M7 40 C7 24 20 17 32 17 C44 17 57 24 57 40 C57 48 52 51 45 51 L19 51 C12 51 7 48 7 40 Z" fill={f(u, "b")} />
      {[[16, 32], [22, 25], [29, 29], [35, 22], [42, 27], [48, 33], [19, 40], [27, 37], [35, 34], [42, 40], [26, 45], [36, 45], [50, 42], [12, 38]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="2" ry="1.15" fill={f(u, "seed")} transform={`rotate(${i * 47} ${x} ${y})`} />
      ))}
      <Shine cx={22} cy={22} rx={8} ry={2.4} rot={-20} o={0.22} />
    </>
  ),
  focaccia: (u) => (
    <>
      <defs>
        <Rad id={u("t")} cx={0.4} cy={0.3} r={0.85} s={[[0, "#FBE09A"], [0.6, "#EDB65A"], [1, "#C98530"]]} />
        <Rad id={u("d")} cx={0.5} cy={0.6} r={0.6} s={[[0, "#B8721F"], [1, "#E4A64A"]]} />
      </defs>
      <Shadow u={u} w={52} />
      <rect x="7" y="23" width="50" height="28" rx="8" fill="#B87A2C" />
      <rect x="7" y="21" width="50" height="26" rx="8" fill={f(u, "t")} />
      {[[15, 28], [25, 32], [35, 27], [46, 31], [19, 38], [31, 39], [42, 39], [51, 38]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="2.6" ry="2" fill={f(u, "d")} />
      ))}
      {[[21, 27, 20], [39, 33, -30], [29, 30, 60], [48, 27, 10], [14, 36, -40]].map(([x, y, r], i) => (
        <path key={i} d={`M${x} ${y} l4 0`} stroke="#3E6B2A" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${r} ${x} ${y})`} />
      ))}
      {[[18, 31], [33, 35], [44, 28], [27, 42], [50, 34]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="1.4" height="1.4" fill="#FFFFFF" opacity="0.9" transform={`rotate(45 ${x} ${y})`} />
      ))}
      <Shine cx={20} cy={25} rx={9} ry={2.2} rot={-8} o={0.4} />
    </>
  ),
  croissant: (u) => (
    <>
      <defs>
        <Rad id={u("c")} cx={0.45} cy={0.25} r={0.9} s={[[0, "#FAD08A"], [0.5, "#E39B45"], [1, "#A8581C"]]} />
      </defs>
      <Shadow u={u} w={50} />
      {[
        "M6 44 Q8 34 16 32 Q20 38 18 46 Q12 48 6 44 Z",
        "M14 31 Q20 24 27 25 Q30 34 26 42 Q19 43 16 38 Z",
        "M25 23 Q32 20 39 23 Q40 33 36 41 Q28 42 26 34 Z",
        "M37 25 Q44 24 50 31 Q48 38 45 42 Q38 43 37 34 Z",
        "M48 32 Q56 34 58 44 Q52 48 46 46 Q44 38 48 32 Z",
      ].map((d, i) => (
        <path key={i} d={d} fill={f(u, "c")} stroke="#9C5419" strokeWidth="0.8" strokeOpacity="0.5" />
      ))}
      <Shine cx={31} cy={26} rx={5} ry={1.8} rot={-5} o={0.6} />
      <Shine cx={20} cy={30} rx={3.5} ry={1.4} rot={-35} o={0.45} />
      <Shine cx={43} cy={28} rx={3.5} ry={1.4} rot={30} o={0.45} />
    </>
  ),
  piadina: (u) => (
    <>
      <defs>
        <Rad id={u("p")} cx={0.45} cy={0.4} r={0.7} s={[[0, "#FFF3D8"], [0.7, "#F3D9A2"], [1, "#DDB56E"]]} />
      </defs>
      <Shadow u={u} w={50} />
      {[44, 40, 36, 32].map((y, i) => (
        <g key={y}>
          <ellipse cx="32" cy={y + 1.5} rx="24" ry="8" fill="#D2A762" />
          <ellipse cx="32" cy={y} rx="24" ry="8" fill={f(u, "p")} />
          {i === 3 && [[20, 30], [27, 28], [35, 31], [42, 29], [47, 32], [24, 34], [33, 35], [40, 34], [16, 33]].map(([x, yy], k) => (
            <ellipse key={k} cx={x} cy={yy} rx={k % 2 ? 1.8 : 1.2} ry="0.9" fill="#A8692F" opacity="0.65" />
          ))}
        </g>
      ))}
    </>
  ),

  /* ---------- Deli ---------- */
  lasagne: (u) => (
    <>
      <defs>
        <Lin id={u("pan")} s={[[0, "#9C6B45"], [1, "#5E3A22"]]} />
        <Lin id={u("sauce")} s={[[0, "#E2533A"], [1, "#A8271A"]]} />
        <Rad id={u("top")} cx={0.4} cy={0.3} s={[[0, "#FBE39A"], [0.7, "#EDB851"], [1, "#C98A2F"]]} />
      </defs>
      <Shadow u={u} w={50} />
      <path d="M9 25 L55 25 L51 52 L13 52 Z" fill={f(u, "pan")} />
      <rect x="12" y="24" width="40" height="25" rx="3" fill="#F6E3B3" />
      <rect x="12" y="29" width="40" height="5" fill={f(u, "sauce")} />
      <rect x="12" y="37" width="40" height="2.5" fill="#FFF1CC" />
      <rect x="12" y="41.5" width="40" height="5" fill={f(u, "sauce")} />
      <path d="M12 26 Q18 19 25 24 Q31 18 38 24 Q45 19 52 25 L52 29 L12 29 Z" fill={f(u, "top")} />
      {[[19, 23], [31, 22.5], [43, 23.5], [36, 26], [24, 26.5]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="2" ry="1.2" fill="#A9612A" opacity="0.75" />
      ))}
      <path d="M44 20 Q46 15 50 16 Q48 20 44 20 Z M47 21 Q52 19 54 22 Q50 24 47 21 Z" fill="#3F8E3A" />
      <Shine cx={22} cy={24} rx={5} ry={1.3} rot={-12} o={0.5} />
    </>
  ),
  chicken: (u) => (
    <>
      <defs>
        <Rad id={u("skin")} cx={0.38} cy={0.3} r={0.8} s={[[0, "#F6C07D"], [0.5, "#D9853A"], [1, "#8E4715"]]} />
        <Rad id={u("plate")} cx={0.5} cy={0.4} r={0.7} s={[[0, "#FFFFFF"], [1, "#E3DDCD"]]} />
      </defs>
      <ellipse cx="32" cy="46" rx="28" ry="9" fill={f(u, "plate")} />
      <ellipse cx="32" cy="46" rx="28" ry="9" fill="none" stroke="#D6CDB8" strokeWidth="1" />
      <path d="M46 36 Q55 33 57 39 Q57 45 51 43 Q48 41 46 40 Z" fill={f(u, "skin")} />
      <path d="M18 36 Q9 33 7 39 Q7 45 13 43 Q16 41 18 40 Z" fill={f(u, "skin")} />
      <circle cx="57" cy="41" r="2.3" fill="#FFF8EE" />
      <circle cx="7" cy="41" r="2.3" fill="#FFF8EE" />
      <ellipse cx="32" cy="34" rx="19" ry="14" fill={f(u, "skin")} />
      <Shine cx={26} cy={27} rx={6} ry={2.6} rot={-25} o={0.55} />
      <Shine cx={38} cy={30} rx={3} ry={1.2} rot={20} o={0.4} />
      <path d="M40 20 Q42 15 46 16 Q44 20 40 20 Z" fill="#3F8E3A" />
      <path d="M12 49 l3 -2 M48 50 l4 -1" stroke="#3F8E3A" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  ricesalad: (u) => (
    <Bowl u={u}>
      <defs>
        <Rad id={u("rice")} cx={0.45} cy={0.4} r={0.7} s={[[0, "#FFFBEA"], [1, "#E9DDB6"]]} />
      </defs>
      <ellipse cx="32" cy="32" rx="21.5" ry="6.4" fill={f(u, "rice")} />
      {[[19, 31, "#6FA83B"], [25, 29, "#F6C431"], [31, 32, "#F08A3C"], [37, 29.5, "#6FA83B"], [43, 31.5, "#E86A5A"], [28, 34.5, "#F6C431"], [36, 34, "#6FA83B"], [23, 34, "#E86A5A"], [41, 34.5, "#F6C431"], [33, 28.5, "#C9927A"]].map(([x, y, c], i) => (
        <g key={i}>
          <circle cx={x as number} cy={y as number} r="1.8" fill={c as string} />
          <circle cx={(x as number) - 0.5} cy={(y as number) - 0.6} r="0.55" fill="#FFFFFF" opacity="0.7" />
        </g>
      ))}
      {[[22, 31.5], [30, 30], [39, 32], [26, 33], [34, 33.5], [45, 33]].map(([x, y], i) => (
        <ellipse key={`r${i}`} cx={x} cy={y} rx="1.1" ry="0.5" fill="#FFFFFF" transform={`rotate(${i * 40} ${x} ${y})`} />
      ))}
    </Bowl>
  ),
  hummus: (u) => (
    <Bowl u={u}>
      <defs>
        <Rad id={u("h")} cx={0.45} cy={0.4} r={0.7} s={[[0, "#F2DDB5"], [1, "#D2AE76"]]} />
        <Rad id={u("oil")} cx={0.5} cy={0.5} r={0.6} s={[[0, "#E3D36A"], [1, "#B8A43A", 0.6]]} />
      </defs>
      <ellipse cx="32" cy="32" rx="21.5" ry="6.4" fill={f(u, "h")} />
      <path d="M19 32 Q32 24 45 32 Q32 38 22 33.5" fill="none" stroke="#BE9660" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="32" cy="31.6" rx="6" ry="2.2" fill={f(u, "oil")} />
      {[[25, 29.5], [38, 30], [35, 34], [28, 34]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.9" fill="#B83A22" />
      ))}
      {[[30, 31.5], [33.5, 30.8]].map(([x, y], i) => (
        <circle key={`c${i}`} cx={x} cy={y} r="1.5" fill="#E8C98E" stroke="#C4A068" strokeWidth="0.5" />
      ))}
    </Bowl>
  ),
  lentilballs: (u) => (
    <Bowl u={u}>
      <defs>
        <Rad id={u("ball")} cx={0.35} cy={0.3} r={0.75} s={[[0, "#B98A5E"], [0.6, "#875A36"], [1, "#55351E"]]} />
      </defs>
      {[[21, 30], [32, 28], [43, 30], [26, 34], [38, 34]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6.2" fill={f(u, "ball")} />
          {[[-2, -1], [1, 2], [2, -2], [-1, 3]].map(([dx, dy], k) => (
            <circle key={k} cx={x + dx} cy={y + dy} r="0.7" fill="#3F2512" opacity="0.6" />
          ))}
          <Shine cx={x - 2.2} cy={y - 2.4} rx={1.8} ry={1} o={0.45} />
        </g>
      ))}
      <path d="M45 23 Q48 18 52 19 Q50 23 45 23 Z M48 25 Q53 23 55 26 Q51 28 48 25 Z" fill="#3F8E3A" />
    </Bowl>
  ),
  tofu: (u) => (
    <>
      <defs>
        <Lin id={u("top")} x1={0} y1={0} x2={1} y2={1} s={[[0, "#FFFFFF"], [1, "#F3ECD6"]]} />
        <Lin id={u("front")} s={[[0, "#F7F1DF"], [1, "#E2D7B9"]]} />
        <Lin id={u("side")} s={[[0, "#E8DFC5"], [1, "#CFC29F"]]} />
      </defs>
      <Shadow u={u} w={48} />
      <path d="M11 27 L39 20 L55 27 L27 34 Z" fill={f(u, "top")} />
      <path d="M11 27 L27 34 L27 53 L11 46 Z" fill={f(u, "front")} />
      <path d="M27 34 L55 27 L55 46 L27 53 Z" fill={f(u, "side")} />
      {[[33, 40], [42, 38], [37, 46], [48, 42], [16, 38], [21, 45]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.6" fill="#BFAE85" />
      ))}
      <path d="M15 28.5 L38 22.8" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.9" strokeLinecap="round" />
    </>
  ),

  /* ---------- Meat ---------- */
  chickenbreast: (u) => (
    <>
      <defs>
        <Rad id={u("m")} cx={0.4} cy={0.3} r={0.8} s={[[0, "#FFE1D3"], [0.6, "#F4B49C"], [1, "#D9846A"]]} />
      </defs>
      <Shadow u={u} w={50} />
      <path d="M8 39 Q9 24 27 26 Q40 28 39 40 Q35 51 20 49 Q8 47 8 39 Z" fill={f(u, "m")} />
      <path d="M27 34 Q31 21 47 23 Q58 27 56 38 Q54 49 41 48 Q27 45 27 34 Z" fill={f(u, "m")} />
      {["M13 36 Q22 31 33 34", "M14 42 Q23 38 33 41", "M32 30 Q42 26 51 30", "M33 37 Q43 33 52 37", "M34 43 Q42 40 50 43"].map((d) => (
        <path key={d} d={d} fill="none" stroke="#E79B82" strokeWidth="0.9" opacity="0.7" strokeLinecap="round" />
      ))}
      <Shine cx={18} cy={31} rx={6} ry={2} rot={-15} o={0.6} />
      <Shine cx={39} cy={27} rx={6} ry={1.8} rot={-12} o={0.6} />
    </>
  ),
  turkey: (u) => (
    <>
      <defs>
        <Rad id={u("s")} cx={0.45} cy={0.4} r={0.65} s={[[0, "#FFF0E8"], [0.7, "#F6CDBD"], [1, "#E4A28C"]]} />
      </defs>
      <Shadow u={u} w={50} />
      {[[19, 39, -12], [32, 35, 0], [45, 39, 12]].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <ellipse cx={x} cy={y + 1} rx="13.5" ry="10.5" fill="#D58D76" />
          <ellipse cx={x} cy={y} rx="13" ry="10" fill={f(u, "s")} />
          <path d={`M${x - 7} ${y - 2} Q${x} ${y - 5} ${x + 7} ${y - 2}`} fill="none" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.7" strokeLinecap="round" />
        </g>
      ))}
    </>
  ),
  minced: (u) => (
    <>
      <defs>
        <Lin id={u("tray")} s={[[0, "#3A4A5C"], [1, "#1F2A36"]]} />
        <Rad id={u("meat")} cx={0.45} cy={0.25} r={0.8} s={[[0, "#F08A93"], [0.6, "#D4505F"], [1, "#9E2E3C"]]} />
      </defs>
      <Shadow u={u} w={52} />
      <path d="M6 36 L58 36 L54 51 L10 51 Z" fill={f(u, "tray")} />
      <path d="M6 36 L58 36" stroke="#5B6C80" strokeWidth="2" />
      <path d="M11 38 Q14 21 32 21 Q50 21 53 38 Z" fill={f(u, "meat")} />
      {Array.from({ length: 22 }, (_, i) => {
        const x = 15 + ((i * 37) % 34);
        const y = 25 + ((i * 13) % 12);
        return <path key={i} d={`M${x} ${y} q1.6 -1.6 3.2 0`} stroke={i % 3 ? "#A93646" : "#F6B4B8"} strokeWidth="1.1" fill="none" strokeLinecap="round" />;
      })}
      <Shine cx={24} cy={25} rx={5} ry={1.6} rot={-20} o={0.35} />
    </>
  ),
  burger: (u) => (
    <>
      <defs>
        <Rad id={u("p")} cx={0.4} cy={0.3} r={0.8} s={[[0, "#9E6A45"], [0.6, "#6E4027"], [1, "#3E2213"]]} />
      </defs>
      <Shadow u={u} w={48} />
      {[42, 30].map((y) => (
        <g key={y}>
          <ellipse cx="32" cy={y + 3} rx="21" ry="7.5" fill="#3A1F10" />
          <ellipse cx="32" cy={y} rx="21" ry="7.5" fill={f(u, "p")} />
          {[22, 30, 38].map((x) => (
            <path key={x} d={`M${x} ${y - 5} l5 9`} stroke="#2A160A" strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
          ))}
          <Shine cx={24} cy={y - 3} rx={5} ry={1.4} rot={-10} o={0.3} />
        </g>
      ))}
    </>
  ),
  sausage: (u) => (
    <>
      <defs>
        <Lin id={u("s")} x1={0} y1={0} x2={1} y2={1} s={[[0, "#E48C6E"], [1, "#A9452D"]]} />
      </defs>
      <Shadow u={u} w={46} />
      <path d="M32 33 m-3 0 a3 3 0 1 1 6 0 a8 8 0 1 1 -16 0 a13 13 0 1 1 26 0 a17 15 0 0 1 -5 11" fill="none" stroke="#7E2F1E" strokeWidth="8" strokeLinecap="round" />
      <path d="M32 33 m-3 0 a3 3 0 1 1 6 0 a8 8 0 1 1 -16 0 a13 13 0 1 1 26 0 a17 15 0 0 1 -5 11" fill="none" stroke={f(u, "s")} strokeWidth="6.6" strokeLinecap="round" />
      <path d="M32 33 m-3 0 a3 3 0 1 1 6 0 a8 8 0 1 1 -16 0 a13 13 0 1 1 26 0" fill="none" stroke="#FFD2C0" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" transform="translate(-0.8 -1.2)" />
    </>
  ),
  steak: (u) => (
    <>
      <defs>
        <Rad id={u("m")} cx={0.4} cy={0.35} r={0.8} s={[[0, "#E8505A"], [0.6, "#C02A34"], [1, "#7E1219"]]} />
      </defs>
      <Shadow u={u} w={52} />
      <path d="M8 34 Q8 17 30 17 Q51 17 55 30 Q58 45 42 49 Q27 53 17 49 Q8 45 8 34 Z" fill="#F3D4C0" />
      <path d="M11 34 Q11 20 30 20 Q48 20 52 31 Q54 43 40 46 Q27 49 18 46 Q11 42 11 34 Z" fill={f(u, "m")} />
      {["M17 29 Q24 25 31 29 Q37 33 45 30", "M16 37 Q24 34 33 38 Q40 41 47 37", "M23 43 Q30 41 37 44", "M28 24 Q34 23 39 26"].map((d) => (
        <path key={d} d={d} fill="none" stroke="#FBE3DA" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
      ))}
      <path d="M40 34 a5 5 0 1 0 0.1 0 Z" fill="#FFF8EE" stroke="#E9D9C3" strokeWidth="1" />
      <Shine cx={22} cy={24} rx={6} ry={1.8} rot={-18} o={0.4} />
    </>
  ),

  /* ---------- Fish ---------- */
  salmon: (u) => (
    <>
      <defs>
        <Lin id={u("f")} s={[[0, "#FFB088"], [0.55, "#F2814F"], [1, "#D35F30"]]} />
        <Lin id={u("skin")} s={[[0, "#B9C2C9"], [1, "#7D8A94"]]} />
      </defs>
      <Shadow u={u} w={52} />
      <path d="M7 41 Q8 47 26 49 L52 47 Q59 44 58 36 Z" fill={f(u, "skin")} />
      <path d="M7 39 Q8 24 29 23 L56 27 Q60 39 52 46 L26 48 Q7 48 7 39 Z" fill={f(u, "f")} />
      {[16, 25, 34, 43, 51].map((x) => (
        <path key={x} d={`M${x} 26 Q${x + 5} 36 ${x - 1} 47`} fill="none" stroke="#FFE3D3" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      ))}
      <Shine cx={24} cy={28} rx={9} ry={2} rot={-6} o={0.45} />
    </>
  ),
  bream: (u) => (
    <>
      <defs>
        <Lin id={u("body")} s={[[0, "#7F95A4"], [0.45, "#C9D5DD"], [0.75, "#EEF3F6"], [1, "#FFFFFF"]]} />
        <Lin id={u("fin")} s={[[0, "#9FB0BC"], [1, "#6E8291"]]} />
      </defs>
      <Shadow u={u} w={54} />
      <path d="M44 33 L58 20 Q55 34 58 48 Z" fill={f(u, "fin")} />
      <path d="M28 21 Q34 13 42 18 L38 24 Z" fill={f(u, "fin")} />
      <path d="M6 34 Q19 17 42 24 Q48 28 48 34 Q48 40 42 44 Q19 51 6 34 Z" fill={f(u, "body")} />
      {Array.from({ length: 12 }, (_, i) => {
        const x = 18 + (i % 4) * 6;
        const y = 29 + Math.floor(i / 4) * 5;
        return <path key={i} d={`M${x} ${y} q2.5 2 0 4`} fill="none" stroke="#8EA1AE" strokeWidth="0.7" opacity="0.6" />;
      })}
      <path d="M12 33 Q27 29 46 33" fill="none" stroke="#E1B547" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 27 Q21 34 18 41" fill="none" stroke="#6E8291" strokeWidth="1.2" />
      <circle cx="12.5" cy="31" r="2.4" fill="#1E2A30" />
      <circle cx="11.8" cy="30.3" r="0.8" fill="#FFFFFF" />
      <Shine cx={26} cy={25} rx={9} ry={1.6} rot={-8} o={0.6} />
    </>
  ),
  cod: (u) => (
    <>
      <defs>
        <Lin id={u("f")} s={[[0, "#FFFFFF"], [0.6, "#F3EEE2"], [1, "#DCD2BD"]]} />
      </defs>
      <Shadow u={u} w={52} />
      <path d="M7 38 Q7 23 27 23 L55 26 Q60 38 53 46 L27 49 Q7 49 7 38 Z" fill={f(u, "f")} />
      {[17, 26, 35, 44].map((x) => (
        <path key={x} d={`M${x} 26 Q${x + 5} 37 ${x} 47`} fill="none" stroke="#D8CDB4" strokeWidth="1.4" strokeLinecap="round" />
      ))}
      <path d="M10 41 Q30 46 54 42" fill="none" stroke="#C9C1AE" strokeWidth="1" opacity="0.7" />
      <Shine cx={24} cy={28} rx={9} ry={2} rot={-6} o={0.7} />
    </>
  ),
  prawns: (u) => (
    <>
      <defs>
        <Lin id={u("p")} x1={0} y1={0} x2={1} y2={1} s={[[0, "#FFC1A8"], [0.5, "#F2845F"], [1, "#C9553A"]]} />
      </defs>
      <Shadow u={u} w={48} />
      {[[22, 34, -10], [41, 33, 15]].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <path d={`M${x - 10} ${y - 5} A11 11 0 1 0 ${x + 9} ${y - 8}`} fill="none" stroke="#B84A30" strokeWidth="8.4" strokeLinecap="round" />
          <path d={`M${x - 10} ${y - 5} A11 11 0 1 0 ${x + 9} ${y - 8}`} fill="none" stroke={f(u, "p")} strokeWidth="7" strokeLinecap="round" />
          <path d={`M${x - 10} ${y - 5} A11 11 0 1 0 ${x + 9} ${y - 8}`} fill="none" stroke="#FFE1D4" strokeWidth="1" strokeDasharray="0.8 3.4" strokeLinecap="round" />
          <path d={`M${x + 9} ${y - 8} l5 -4 l-1 6 z`} fill="#E36F4C" />
        </g>
      ))}
    </>
  ),

  /* ---------- Fruit and vegetables ---------- */
  lettuce: (u) => (
    <>
      <defs>
        <Rad id={u("d")} cx={0.4} cy={0.3} s={[[0, "#5DAE4C"], [1, "#2A6E26"]]} />
        <Rad id={u("l")} cx={0.4} cy={0.3} s={[[0, "#D6EFA2"], [0.6, "#8BC34A"], [1, "#4E8F2C"]]} />
      </defs>
      <Shadow u={u} w={50} />
      <path d="M8 40 Q6 24 20 22 Q22 14 32 15 Q42 14 44 22 Q58 24 56 40 Q54 52 32 52 Q10 52 8 40 Z" fill={f(u, "d")} />
      <path d="M13 41 Q11 28 23 27 Q26 20 33 21 Q41 21 43 28 Q53 30 51 42 Q48 50 32 50 Q15 50 13 41 Z" fill={f(u, "l")} />
      <path d="M18 43 Q18 34 27 33 Q30 28 35 29 Q42 30 43 36 Q47 40 44 46 Q38 50 30 49 Q19 48 18 43 Z" fill="#B8DE7B" opacity="0.9" />
      {["M32 50 L32 22", "M32 38 L22 30", "M32 42 L44 33", "M32 46 L19 40", "M32 34 L41 26"].map((d) => (
        <path key={d} d={d} stroke="#EEF8D8" strokeWidth="1.3" strokeLinecap="round" opacity="0.9" />
      ))}
      <Shine cx={24} cy={27} rx={5} ry={1.8} o={0.35} />
    </>
  ),
  tomatoes: (u) => (
    <>
      <defs>
        <Rad id={u("t")} cx={0.35} cy={0.3} r={0.75} s={[[0, "#FF8A75"], [0.45, "#E53935"], [1, "#8E1414"]]} />
      </defs>
      <Shadow u={u} w={48} />
      {[[21, 39, 10], [42, 39, -10], [31, 28, 0]].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx="11" ry="9.5" fill={f(u, "t")} />
          <Shine cx={x - 4} cy={y - 3.5} rx={3} ry={1.8} o={0.7} />
          <path d={`M${x} ${y - 9} l-4 -1.5 l2.5 2.8 l-4.5 1 l4.6 0.6 l-1.6 3 l3 -2.3 l3 2.3 l-1.6 -3 l4.6 -0.6 l-4.5 -1 l2.5 -2.8 z`} fill="#2F6B22" />
          <path d={`M${x} ${y - 9} l0.5 -3`} stroke="#2F6B22" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      ))}
    </>
  ),
  spinach: (u) => (
    <>
      <defs>
        <Lin id={u("a")} x1={0} y1={0} x2={1} y2={1} s={[[0, "#5DB04E"], [1, "#1F5A1E"]]} />
        <Lin id={u("b")} x1={0} y1={0} x2={1} y2={1} s={[[0, "#7CC25E"], [1, "#2B6E27"]]} />
      </defs>
      <Shadow u={u} w={46} />
      {[[-34, "a"], [34, "a"], [-10, "b"], [12, "b"]].map(([r, g], i) => (
        <g key={i} transform={`rotate(${r} 32 50)`}>
          <path d="M32 50 Q16 33 32 11 Q48 33 32 50 Z" fill={f(u, g as string)} />
          <path d="M32 48 L32 15" stroke="#B9E3A3" strokeWidth="1.3" strokeLinecap="round" />
          {[22, 29, 36].map((y) => (
            <path key={y} d={`M32 ${y + 4} l-6 -5 M32 ${y + 4} l6 -5`} stroke="#A8D990" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
          ))}
          <Shine cx={28} cy={24} rx={1.6} ry={5} rot={10} o={0.25} />
        </g>
      ))}
    </>
  ),
  courgette: (u) => (
    <>
      <defs>
        <Lin id={u("z")} s={[[0, "#3E7D2C"], [0.35, "#86B866"], [0.6, "#3F7E2D"], [1, "#1E4C18"]]} />
        <Rad id={u("fl")} cx={0.3} cy={0.4} s={[[0, "#FFE680"], [1, "#F2A71B"]]} />
      </defs>
      <Shadow u={u} w={54} />
      <g transform="rotate(-18 32 34)">
        <rect x="8" y="26" width="46" height="15" rx="7.5" fill={f(u, "z")} />
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={13 + ((i * 7) % 38)} cy={29 + ((i * 5) % 9)} r="0.6" fill="#D9F0C4" opacity="0.8" />
        ))}
        <rect x="3" y="30" width="7" height="7" rx="2" fill="#5B7F2F" />
        <path d="M53 33.5 L62 26 Q60 33 62 41 Z" fill={f(u, "fl")} />
        <path d="M53 33.5 L59 30" stroke="#E08E0B" strokeWidth="0.8" />
      </g>
    </>
  ),
  apples: (u) => (
    <>
      <defs>
        <Rad id={u("a")} cx={0.32} cy={0.3} r={0.8} s={[[0, "#FF8A80"], [0.35, "#E53935"], [0.8, "#B71C1C"], [1, "#7F0E0E"]]} />
        <Rad id={u("b")} cx={0.32} cy={0.3} r={0.8} s={[[0, "#FFD180"], [0.25, "#F06A3A"], [0.7, "#C62828"], [1, "#801010"]]} />
        <Lin id={u("lf")} x1={0} y1={0} x2={1} y2={1} s={[[0, "#7CC25E"], [1, "#2E7D32"]]} />
      </defs>
      <Shadow u={u} w={48} />
      {[[22, 37, "a"], [42, 37, "b"]].map(([x, y, g], i) => {
        const X = x as number;
        const Y = y as number;
        return (
          <g key={i}>
            <path d={`M${X} ${Y - 9} Q${X - 14} ${Y - 15} ${X - 12.5} ${Y + 2} Q${X - 9.5} ${Y + 15} ${X} ${Y + 11.5} Q${X + 9.5} ${Y + 15} ${X + 12.5} ${Y + 2} Q${X + 14} ${Y - 15} ${X} ${Y - 9} Z`} fill={f(u, g as string)} />
            <Shine cx={X - 5.5} cy={Y - 2} rx={2.4} ry={4.5} rot={15} o={0.45} />
            <path d={`M${X} ${Y - 8} L${X + 1.2} ${Y - 15}`} stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
            <path d={`M${X + 1} ${Y - 13} Q${X + 7} ${Y - 18} ${X + 10} ${Y - 12} Q${X + 4.5} ${Y - 9.5} ${X + 1} ${Y - 13} Z`} fill={f(u, "lf")} />
          </g>
        );
      })}
    </>
  ),
  bananas: (u) => (
    <>
      <defs>
        <Lin id={u("b")} s={[[0, "#FFF2A6"], [0.4, "#F9D648"], [1, "#D9A81E"]]} />
      </defs>
      <Shadow u={u} w={50} />
      {[18, 10, 2].map((dy, i) => (
        <g key={i}>
          <path d={`M10 ${20 + dy} Q30 ${42 + dy} 55 ${24 + dy} Q56 ${30 + dy} 51 ${33 + dy} Q30 ${49 + dy} 10 ${27 + dy} Z`} fill={f(u, "b")} stroke="#C99A16" strokeWidth="0.6" />
          <path d={`M14 ${24 + dy} Q31 ${41 + dy} 51 ${28 + dy}`} fill="none" stroke="#FFFBE0" strokeWidth="1.2" opacity="0.8" />
          <path d={`M52 ${25 + dy} l3.5 -1`} stroke="#4E3420" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      ))}
      <path d="M7 20 L12 19 L12 47 L7 46 Z" fill="#7A5A2E" />
      <path d="M6 18 l7 -2 l0 4 l-7 2 z" fill="#5C421F" />
    </>
  ),
  berries: (u) => (
    <>
      <defs>
        <Lin id={u("bk")} s={[[0, "#EBC992"], [1, "#B88A4E"]]} />
        <Rad id={u("blue")} cx={0.35} cy={0.3} r={0.75} s={[[0, "#8C9EE6"], [0.5, "#3F4FA8"], [1, "#1F2660"]]} />
        <Rad id={u("rasp")} cx={0.35} cy={0.3} r={0.75} s={[[0, "#FF8FB1"], [0.5, "#E0245E"], [1, "#8C0F34"]]} />
      </defs>
      <Shadow u={u} w={48} />
      <path d="M10 34 L54 34 L49 52 L15 52 Z" fill={f(u, "bk")} />
      {[39, 44, 49].map((y) => (
        <path key={y} d={`M${12 + (y - 34) * 0.3} ${y} L${52 - (y - 34) * 0.3} ${y}`} stroke="#9C7038" strokeWidth="0.9" />
      ))}
      {[[19, 31], [33, 30], [46, 31], [26, 34], [40, 34]].map(([x, y], i) => (
        <g key={`b${i}`}>
          <circle cx={x} cy={y} r="4.4" fill={f(u, "blue")} />
          <circle cx={x} cy={y - 3.4} r="1" fill="#1A1F4A" />
          <circle cx={x - 1.4} cy={y - 1.2} r="1" fill="#FFFFFF" opacity="0.4" />
        </g>
      ))}
      {[[26, 27], [39, 26]].map(([x, y], i) => (
        <g key={`r${i}`}>
          {[[-2, -2], [0, -2.6], [2, -2], [-2.6, 0], [0, 0], [2.6, 0], [-2, 2], [0, 2.6], [2, 2]].map(([dx, dy], k) => (
            <circle key={k} cx={x + dx} cy={y + dy} r="1.7" fill={f(u, "rasp")} />
          ))}
        </g>
      ))}
      <path d="M44 20 Q48 15 52 19 Q48 22 44 20 Z" fill="#3F8E3A" />
    </>
  ),
  vegmix: (u) => (
    <>
      <defs>
        <Rad id={u("ap")} cx={0.32} cy={0.3} r={0.8} s={[[0, "#FF8A80"], [0.4, "#E53935"], [1, "#801010"]]} />
        <Rad id={u("tm")} cx={0.35} cy={0.3} r={0.75} s={[[0, "#FF9A85"], [0.45, "#EF4B3F"], [1, "#961818"]]} />
      </defs>
      <Shadow u={u} w={50} />
      <path d="M42 22 Q30 19 30 33 Q31 47 42 46.5 Q53 47 54 33 Q54 19 42 22 Z" fill={f(u, "ap")} />
      <Shine cx={36} cy={29} rx={2.2} ry={4.5} rot={15} o={0.45} />
      <path d="M42 22 L43 15" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
      <path d="M43 17 Q49 13 51 18 Q47 20 43 17 Z" fill="#3F8E3A" />
      <ellipse cx="22" cy="38" rx="13" ry="11.5" fill={f(u, "tm")} />
      <Shine cx={17} cy={34} rx={3.2} ry={2} o={0.65} />
      <path d="M22 27.5 l-4.5 -1.6 l2.8 3 l-5 1.1 l5 0.6 l-1.8 3.3 l3.5 -2.5 l3.5 2.5 l-1.8 -3.3 l5 -0.6 l-5 -1.1 l2.8 -3 z" fill="#2F6B22" />
    </>
  ),

  /* ---------- Dairy and cheese ---------- */
  mozzarella: (u) => (
    <>
      <defs>
        <Rad id={u("m")} cx={0.38} cy={0.32} r={0.8} s={[[0, "#FFFFFF"], [0.6, "#F6F5EE"], [1, "#D9D6C8"]]} />
        <Rad id={u("dish")} cx={0.5} cy={0.4} s={[[0, "#E8F2F8"], [1, "#B8D0DE"]]} />
      </defs>
      <ellipse cx="32" cy="47" rx="25" ry="7.5" fill={f(u, "dish")} />
      <ellipse cx="32" cy="45.5" rx="21" ry="5" fill="#DCEBF2" opacity="0.8" />
      <circle cx="32" cy="33" r="16" fill={f(u, "m")} />
      <path d="M32 17 Q36 19 35 22" stroke="#E6E3D6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Shine cx={25} cy={26} rx={5} ry={3} rot={-30} o={0.9} />
      <path d="M45 17 Q49 12 53 16 Q49 20 45 17 Z" fill="#3F8E3A" />
      <path d="M47 21 Q52 19 54 23 Q50 25 47 21 Z" fill="#5BA84A" />
    </>
  ),
  yogurt: (u) => <Tub u={u} band="#4F86D1" top="#EEF3F9" />,
  ricotta: (u) => (
    <Tub
      u={u}
      band="#7CB342"
      top="#F7F9F3"
      fill={
        <>
          <path d="M18 22.5 Q32 11 46 22.5" fill="#FFFEF8" stroke="#E8E2D0" strokeWidth="1" />
          {[22, 27, 32, 37, 42].map((x) => (
            <path key={x} d={`M${x} 21 Q${x + 1.5} ${17 + Math.abs(32 - x) * 0.3} ${x + 3} 21`} fill="none" stroke="#E4DDCA" strokeWidth="0.8" />
          ))}
        </>
      }
    />
  ),
  cottage: (u) => (
    <Tub
      u={u}
      band="#6FC0CC"
      top="#F4FAFB"
      fill={
        <>
          {[[23, 21.5], [28, 20], [33, 20.5], [38, 20], [42, 22], [26, 23.5], [31, 23], [36, 23.5]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="2.4" fill="#FCFAF2" stroke="#E2DCC9" strokeWidth="0.7" />
              <circle cx={x - 0.7} cy={y - 0.7} r="0.7" fill="#FFFFFF" />
            </g>
          ))}
        </>
      }
    />
  ),
  milk: (u) => (
    <>
      <defs>
        <Lin id={u("g")} x1={0} y1={0} x2={1} y2={0} s={[[0, "#E6ECF1"], [0.25, "#FFFFFF"], [0.6, "#F7F9FA"], [1, "#C9D3DC"]]} />
        <Lin id={u("cap")} s={[[0, "#5B97E0"], [1, "#2A62AE"]]} />
      </defs>
      <Shadow u={u} w={30} />
      <path d="M24 13 L40 13 L40 19 Q47 23 47 31 L47 51 Q47 55 43 55 L21 55 Q17 55 17 51 L17 31 Q17 23 24 19 Z" fill={f(u, "g")} stroke="#D3DBE3" strokeWidth="0.8" />
      <rect x="23.5" y="7" width="17" height="7" rx="2" fill={f(u, "cap")} />
      <rect x="17" y="32" width="30" height="13" fill="#7CB342" />
      <rect x="17" y="32" width="30" height="13" fill="#FFFFFF" opacity="0.1" />
      <path d="M25 39 q7 -6 14 0" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M21 24 L21 51" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  parmesan: (u) => (
    <>
      <defs>
        <Lin id={u("p")} x1={0} y1={0} x2={1} y2={1} s={[[0, "#FFE7A3"], [0.6, "#F2CD6C"], [1, "#D9A83F"]]} />
        <Lin id={u("r")} s={[[0, "#D2A14A"], [1, "#9C7024"]]} />
      </defs>
      <Shadow u={u} w={50} />
      <path d="M8 44 L56 44 L56 51 L8 51 Z" fill={f(u, "r")} />
      <path d="M8 44 L45 17 L56 25 L56 44 Z" fill={f(u, "p")} />
      <path d="M45 17 L56 25 L56 30 L45 22 Z" fill={f(u, "r")} />
      {Array.from({ length: 20 }, (_, i) => (
        <circle key={i} cx={22 + ((i * 11) % 30)} cy={31 + ((i * 7) % 12)} r={i % 3 ? 0.6 : 0.9} fill={i % 2 ? "#FFF6D4" : "#D7A848"} opacity="0.9" />
      ))}
      <path d="M12 43 L44 20" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
    </>
  ),
  cheese: (u) => (
    <>
      <defs>
        <Lin id={u("top")} x1={0} y1={0} x2={1} y2={1} s={[[0, "#FFE98F"], [1, "#F7C83A"]]} />
        <Lin id={u("side")} s={[[0, "#F7C640"], [1, "#DDA218"]]} />
        <Rad id={u("hole")} cx={0.4} cy={0.35} s={[[0, "#C98A0F"], [1, "#EEB52E"]]} />
      </defs>
      <Shadow u={u} w={52} />
      <path d="M7 30 L40 15 L57 25 L24 37 Z" fill={f(u, "top")} />
      <path d="M7 30 L24 37 L24 53 L7 46 Z" fill={f(u, "side")} />
      <path d="M24 37 L57 25 L57 46 L24 53 Z" fill="#F4BD2C" />
      {[[35, 42, 3.6], [47, 37, 2.6], [15, 40, 2.4], [42, 48, 1.8], [30, 26, 2.2], [52, 44, 1.6], [19, 47, 1.4]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.85} fill={f(u, "hole")} />
      ))}
      <path d="M10 30 L39 17" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.7" strokeLinecap="round" />
    </>
  ),
  eggs: (u) => (
    <>
      <defs>
        <Rad id={u("e")} cx={0.35} cy={0.3} r={0.8} s={[[0, "#FFF8EC"], [0.6, "#EBCB9E"], [1, "#C79A62"]]} />
        <Lin id={u("box")} s={[[0, "#C9B898"], [1, "#9C8A69"]]} />
      </defs>
      <Shadow u={u} w={52} />
      {[[18, 33], [32, 30], [46, 33]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx="8.2" ry="10.4" fill={f(u, "e")} />
          <Shine cx={x - 2.8} cy={y - 4} rx={1.6} ry={3} rot={10} o={0.7} />
        </g>
      ))}
      <path d="M6 40 L58 40 L53 53 L11 53 Z" fill={f(u, "box")} />
      {[19, 32, 45].map((x) => (
        <path key={x} d={`M${x - 6} 40 Q${x} 46 ${x + 6} 40`} fill="#B4A281" />
      ))}
    </>
  ),

  /* ---------- Shelf products ---------- */
  pasta: (u) => (
    <Pouch u={u} c1="#FBF3E2" c2="#E5D5B4" band="#C0392B">
      <defs>
        <Lin id={u("pn")} s={[[0, "#F5CE7A"], [1, "#C98F34"]]} />
      </defs>
      <rect x="21" y="23" width="22" height="25" rx="5" fill="#FFFFFF" opacity="0.55" />
      {[[26, 28, 30], [34, 27, -20], [39, 32, 40], [27, 36, -40], [35, 37, 20], [26, 43, 10], [34, 44, -30], [40, 41, 60]].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <rect x={x - 4.5} y={y - 1.8} width="9" height="3.6" rx="0.8" fill={f(u, "pn")} />
          <path d={`M${x - 3} ${y - 1.8} l-1 3.6 M${x} ${y - 1.8} l-1 3.6 M${x + 3} ${y - 1.8} l-1 3.6`} stroke="#B07A27" strokeWidth="0.5" />
        </g>
      ))}
    </Pouch>
  ),
  oats: (u) => (
    <>
      <defs>
        <Rad id={u("o")} cx={0.4} cy={0.3} s={[[0, "#FFF4DA"], [1, "#D9BE86"]]} />
      </defs>
      <Shadow u={u} w={50} />
      <path d="M10 46 Q14 26 32 24 Q50 26 54 46 Q32 52 10 46 Z" fill="#E7D2A4" />
      {Array.from({ length: 26 }, (_, i) => {
        const x = 15 + ((i * 29) % 34);
        const y = 30 + ((i * 11) % 16);
        return <ellipse key={i} cx={x} cy={y} rx="3" ry="1.9" fill={f(u, "o")} stroke="#C7A86C" strokeWidth="0.4" transform={`rotate(${i * 41} ${x} ${y})`} />;
      })}
      <Shine cx={26} cy={29} rx={5} ry={1.4} rot={-15} o={0.4} />
    </>
  ),
  chickpeas: (u) => (
    <>
      <defs>
        <Rad id={u("c")} cx={0.35} cy={0.3} s={[[0, "#FFF0C9"], [0.7, "#E5C27E"], [1, "#B8914E"]]} />
      </defs>
      <Jar
        u={u}
        lid="#C0392B"
        inside={
          <>
            <rect x="20" y="25" width="24" height="28" rx="6" fill="#F3E2B8" />
            {[[25, 30], [32, 29], [39, 31], [27, 36], [35, 36], [24, 42], [31, 43], [39, 42], [27, 48], [35, 49], [41, 47]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3.2" fill={f(u, "c")} />
            ))}
          </>
        }
      />
    </>
  ),
  sauce: (u) => (
    <>
      <defs>
        <Lin id={u("s")} s={[[0, "#E5513C"], [1, "#9E1F14"]]} />
      </defs>
      <Jar
        u={u}
        lid="#2E7D32"
        inside={
          <>
            <rect x="20" y="24" width="24" height="29" rx="6" fill={f(u, "s")} />
            {[[25, 30], [36, 33], [29, 41], [39, 45], [24, 47]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.3" fill="#F48A6E" opacity="0.8" />
            ))}
            <path d="M33 27 Q38 22 43 26 Q38 29 33 27 Z" fill="#5BA84A" />
          </>
        }
      />
    </>
  ),
  coffee: (u) => (
    <>
      <defs>
        <Rad id={u("bean")} cx={0.35} cy={0.3} s={[[0, "#A06A45"], [1, "#3E2213"]]} />
      </defs>
      <Pouch u={u} c1="#5D4037" c2="#3B2620" band="#A1887F">
        <circle cx="32" cy="36" r="8" fill="#F3E6D8" opacity="0.15" />
        <ellipse cx="32" cy="36" rx="5.5" ry="7.5" fill={f(u, "bean")} />
        <path d="M32 29 Q29 36 32 43" stroke="#2A160B" strokeWidth="1.4" fill="none" />
      </Pouch>
      {[[48, 50, 30], [14, 51, -20]].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx="3.4" ry="4.6" fill={f(u, "bean")} />
          <path d={`M${x} ${y - 4} Q${x - 1.5} ${y} ${x} ${y + 4}`} stroke="#2A160B" strokeWidth="1" fill="none" />
        </g>
      ))}
    </>
  ),
  water: (u) => (
    <>
      <defs>
        <Lin id={u("w")} x1={0} y1={0} x2={1} y2={0} s={[[0, "#9FD0F0"], [0.3, "#E6F5FD"], [0.7, "#C4E5F8"], [1, "#7FB9E0"]]} />
      </defs>
      <Shadow u={u} w={44} />
      {[22, 42].map((x) => (
        <g key={x}>
          <path d={`M${x - 3} 10 L${x + 3} 10 L${x + 3} 15 Q${x + 9} 19 ${x + 9} 27 L${x + 9} 52 Q${x + 9} 55 ${x + 6} 55 L${x - 6} 55 Q${x - 9} 55 ${x - 9} 52 L${x - 9} 27 Q${x - 9} 19 ${x - 3} 15 Z`} fill={f(u, "w")} opacity="0.95" />
          <rect x={x - 4} y="6.5" width="8" height="5" rx="1.5" fill="#1E6FC2" />
          <rect x={x - 9} y="32" width="18" height="10" fill="#3D93D6" />
          <path d={`M${x - 9} 46 L${x + 9} 46 M${x - 9} 49 L${x + 9} 49`} stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" />
          <path d={`M${x - 5} 20 L${x - 5} 51`} stroke="#FFFFFF" strokeWidth="2" opacity="0.8" strokeLinecap="round" />
        </g>
      ))}
    </>
  ),
  biscuits: (u) => (
    <>
      <defs>
        <Rad id={u("b")} cx={0.4} cy={0.35} s={[[0, "#F0BE7C"], [1, "#B87A3E"]]} />
      </defs>
      <Shadow u={u} w={46} />
      {[45, 38, 31].map((y, i) => (
        <g key={i}>
          <ellipse cx="32" cy={y + 3} rx="19" ry="6.5" fill="#8C5426" />
          <ellipse cx="32" cy={y} rx="19" ry="6.5" fill={f(u, "b")} />
        </g>
      ))}
      {[[24, 30], [32, 28], [40, 30], [28, 33], [36, 33], [32, 31]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.9" fill="#7A4318" />
      ))}
      <Shine cx={25} cy={28.5} rx={4} ry={1} rot={-8} o={0.4} />
    </>
  ),
  bar: (u) => (
    <>
      <defs>
        <Lin id={u("w")} s={[[0, "#46407A"], [0.5, "#2E2A4F"], [1, "#1A1730"]]} />
      </defs>
      <Shadow u={u} w={50} />
      <g transform="rotate(-20 32 34)">
        <rect x="8" y="25" width="48" height="17" rx="3" fill={f(u, "w")} />
        <rect x="18" y="25" width="18" height="17" fill="#FF8A3D" />
        <path d="M8 25 l-3 3 l3 3 l-3 3 l3 3 l-3 3 l3 2 M56 25 l3 3 l-3 3 l3 3 l-3 3 l3 3 l-3 2" stroke="#1A1730" strokeWidth="1.6" fill="none" />
        <path d="M40 31 l10 0 M40 36 l7 0" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 27.5 L54 27.5" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.4" />
      </g>
    </>
  ),
  cereal: (u) => (
    <Carton u={u} c="#F06A43" side="#B03E25">
      <defs>
        <Rad id={u("bowl")} cx={0.5} cy={0.3} s={[[0, "#FFFFFF"], [1, "#DDE3E8"]]} />
      </defs>
      <path d="M20 37 Q29.5 50 39 37 Z" fill={f(u, "bowl")} />
      <ellipse cx="29.5" cy="37" rx="9.5" ry="3.5" fill="#FFF8EE" />
      {[[25, 36], [29, 35], [33, 36.5], [27, 38], [31, 38]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.7" fill={i === 1 || i === 3 ? "#C2185B" : "#E0A94C"} />
      ))}
      <rect x="19" y="16" width="21" height="7" rx="2" fill="#FFF8EE" />
    </Carton>
  ),
  vegburger: (u) => (
    <>
      <defs>
        <Rad id={u("p")} cx={0.4} cy={0.3} s={[[0, "#A9C06A"], [0.7, "#7E9B45"], [1, "#556B2C"]]} />
      </defs>
      <Shadow u={u} w={48} />
      <ellipse cx="32" cy="41" rx="21" ry="8" fill="#4E6328" />
      <ellipse cx="32" cy="37" rx="21" ry="8" fill={f(u, "p")} />
      {[[23, 36], [30, 34], [38, 37], [27, 39], [41, 33], [34, 39.5]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="1.9" fill="#BDE08F" />
          <circle cx={x - 0.6} cy={y - 0.6} r="0.6" fill="#FFFFFF" opacity="0.7" />
        </g>
      ))}
      <path d="M45 22 Q51 15 55 21 Q51 26 45 22 Z" fill="#3F8E3A" />
    </>
  ),
  oatdrink: (u) => (
    <>
      <defs>
        <Lin id={u("f")} x1={0} y1={0} x2={1} y2={0} s={[[0, "#F9EBCB"], [1, "#E8D3A6"]]} />
      </defs>
      <Shadow u={u} w={32} />
      <path d="M32 9 L45 17 L45 55 L38 55 L38 17 Z" fill="#D9C08E" />
      <path d="M19 17 L32 9 L38 13 L25 21 Z" fill="#FFF5DC" />
      <rect x="19" y="17" width="19" height="38" fill={f(u, "f")} />
      <rect x="21" y="30" width="15" height="12" rx="2" fill="#7CB342" />
      <path d="M25 36 l7 0" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 19 L21 52" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.6" strokeLinecap="round" />
    </>
  ),
  rusks: (u) => (
    <>
      <defs>
        <Lin id={u("r")} x1={0} y1={0} x2={1} y2={1} s={[[0, "#F6D08F"], [1, "#D49A4C"]]} />
      </defs>
      <Shadow u={u} w={50} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i * 5 - 5} ${i * -4})`}>
          <rect x="11" y="30" width="38" height="21" rx="4" fill="#B57636" />
          <rect x="13" y="32" width="34" height="17" rx="3" fill={f(u, "r")} />
        </g>
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={20 + ((i * 7) % 26)} cy={25 + ((i * 3) % 10)} r="0.8" fill="#A9692B" />
      ))}
    </>
  ),
  snackcakes: (u) => (
    <>
      <defs>
        <Lin id={u("c")} s={[[0, "#F0BE73"], [1, "#C98A3F"]]} />
        <Lin id={u("ch")} s={[[0, "#8D5A3B"], [1, "#4E2D19"]]} />
      </defs>
      <Shadow u={u} w={50} />
      {[[19, 37], [45, 37], [32, 28]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 11} y={y - 6} width="22" height="15" rx="4" fill={f(u, "c")} />
          <rect x={x - 11} y={y - 6} width="22" height="5.5" rx="2.6" fill={f(u, "ch")} />
          <Shine cx={x - 5} cy={y - 4.5} rx={3} ry={0.8} rot={0} o={0.4} />
        </g>
      ))}
    </>
  ),
  dishsoap: (u) => (
    <>
      <defs>
        <Lin id={u("b")} x1={0} y1={0} x2={1} y2={0} s={[[0, "#4CAF50"], [0.3, "#8BD48F"], [1, "#2E7D32"]]} />
      </defs>
      <Shadow u={u} w={32} />
      <rect x="20" y="18" width="24" height="37" rx="8" fill={f(u, "b")} />
      <rect x="26.5" y="9" width="11" height="10" rx="2" fill="#1F5E22" />
      <rect x="23" y="30" width="18" height="12" rx="3" fill="#FFFFFF" opacity="0.92" />
      {[[48, 21, 4], [52, 13, 2.6], [45, 12, 1.6]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#E3F2FD" stroke="#B3D7F2" strokeWidth="0.6" />
      ))}
      <path d="M24 22 L24 50" stroke="#FFFFFF" strokeWidth="2.2" opacity="0.5" strokeLinecap="round" />
    </>
  ),
  icelolly: (u) => (
    <>
      <defs>
        <Lin id={u("i")} s={[[0, "#E53935"], [0.4, "#FF8A3D"], [0.7, "#FBC02D"], [1, "#F9A825"]]} />
      </defs>
      <Shadow u={u} w={26} />
      <rect x="30" y="40" width="4" height="15" rx="2" fill="#D7B377" />
      <rect x="21" y="9" width="22" height="36" rx="10" fill={f(u, "i")} />
      <path d="M26 14 L26 38" stroke="#FFFFFF" strokeWidth="2.4" opacity="0.5" strokeLinecap="round" />
    </>
  ),
};

/** Which drawing each product (or department, or empty state) uses */
const ART_FOR: Record<string, string> = {
  "pane-integrale": "bread",
  "pane-segale": "rye",
  focaccia: "focaccia",
  cornetti: "croissant",
  piadine: "piadina",
  lasagne: "lasagne",
  "pollo-arrosto": "chicken",
  "insalata-riso": "ricesalad",
  hummus: "hummus",
  "polpette-lenticchie": "lentilballs",
  tofu: "tofu",
  "petto-pollo": "chickenbreast",
  tacchino: "turkey",
  macinato: "minced",
  hamburger: "burger",
  salsiccia: "sausage",
  salmone: "salmon",
  orata: "bream",
  merluzzo: "cod",
  gamberi: "prawns",
  "insalata-mista": "lettuce",
  pomodori: "tomatoes",
  spinaci: "spinach",
  zucchine: "courgette",
  mele: "apples",
  banane: "bananas",
  "frutti-bosco": "berries",
  mozzarella: "mozzarella",
  "yogurt-greco": "yogurt",
  "latte-fresco": "milk",
  ricotta: "ricotta",
  "fiocchi-latte": "cottage",
  parmigiano: "parmesan",
  uova: "eggs",
  "pasta-integrale": "pasta",
  avena: "oats",
  ceci: "chickpeas",
  caffe: "coffee",
  acqua: "water",
  biscotti: "biscuits",
  // sponsored products (fictional brands)
  "cmp-profit-bar": "bar",
  "cmp-alpi-yogurt": "yogurt",
  "cmp-granaria-cereali": "cereal",
  "cmp-verdevivo-burger": "vegburger",
  "cmp-verdevivo-avena": "oatdrink",
  "cmp-legume-pasta": "pasta",
  "cmp-granaria-fette": "rusks",
  "cmp-dolcecasa-merende": "snackcakes",
  "cmp-puroeco": "dishsoap",
  "cmp-ortorosso-sugo": "sauce",
  "cmp-scaduta": "icelolly",
  // departments
  panetteria: "bread",
  gastronomia: "lasagne",
  carne: "steak",
  pesce: "salmon",
  ortofrutta: "vegmix",
  latticini: "cheese",
};

/** Unique id prefix per picture, so gradients of different pictures never clash */
function useU(): U {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (n: string) => `fa${id}-${n}`;
}

const Blur = ({ u }: { u: U }) => (
  <defs>
    <filter id={u("blur")} x="-20%" y="-200%" width="140%" height="500%">
      <feGaussianBlur stdDeviation="1.6" />
    </filter>
  </defs>
);

/** Food illustration for a product id, department id or drawing name */
export function FoodArt({ id, size = 64, label, className = "" }: { id: string; size?: number; label?: string; className?: string }) {
  const u = useU();
  const art = ART[ART_FOR[id] ?? id] ?? ART.bread;
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Blur u={u} />
      {art(u)}
    </svg>
  );
}

/** Product picture on a soft round backdrop, as on the product cards */
export function ProductArt({ id, size = 72, label }: { id: string; size?: number; label: string }) {
  return (
    <div className="relative grid shrink-0 place-items-center rounded-2xl bg-cream" style={{ width: size, height: size }}>
      <FoodArt id={id} size={Math.round(size * 0.9)} label={label} />
    </div>
  );
}

/** Large illustrations for empty states and the greeting */
export function BasketHero({ size = 150 }: { size?: number }) {
  const u = useU();
  const a = (n: string) => (k: string) => u(`${n}-${k}`);
  return (
    <svg viewBox="0 0 160 130" width={size} height={size * 0.81} aria-hidden="true">
      <defs>
        <Lin id={u("bk")} s={[[0, "#9CCC65"], [1, "#5E9A2E"]]} />
        <Lin id={u("rim")} s={[[0, "#AED581"], [1, "#7CB342"]]} />
        <Lin id={u("car")} x1={0} y1={0} x2={1} y2={0} s={[[0, "#FFA45C"], [1, "#E8722A"]]} />
        <filter id={u("blur")} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <ellipse cx="80" cy="120" rx="58" ry="6" fill="#3B2A1A" opacity="0.18" filter={`url(#${u("blur")})`} />
      {[[30, 30, -30], [126, 36, 30], [40, 14, -12], [118, 16, 12]].map(([x, y, r], i) => (
        <path key={i} d={`M${x} ${y} l${i % 2 ? 6 : -6} -8`} stroke="#7CB342" strokeWidth="4" strokeLinecap="round" transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <g transform="translate(36 22) scale(0.9)">
        <Blur u={a("l")} />
        {ART.lettuce(a("l"))}
      </g>
      <g transform="translate(58 30) scale(0.75)">
        <Blur u={a("t")} />
        {ART.tomatoes(a("t"))}
      </g>
      <path d="M96 62 L124 22" stroke={`url(#${u("car")})`} strokeWidth="13" strokeLinecap="round" />
      <path d="M120 24 l6 -10 M124 26 l10 -6 M118 22 l0 -12" stroke="#2E7D32" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M104 50 l6 4 M110 41 l6 4" stroke="#C85F1E" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 64 L136 64 L124 116 L36 116 Z" fill={`url(#${u("bk")})`} />
      <path d="M20 58 L140 58 Q144 58 143 63 L142 68 L18 68 L17 63 Q16 58 20 58 Z" fill={`url(#${u("rim")})`} />
      {[52, 72, 92].map((x) => (
        <rect key={x} x={x} y="80" width="14" height="20" rx="5" fill="#EAF6E5" />
      ))}
    </svg>
  );
}

export function GroceryBag({ size = 110 }: { size?: number }) {
  const u = useU();
  const a = (n: string) => (k: string) => u(`${n}-${k}`);
  return (
    <svg viewBox="0 0 120 110" width={size} height={size * 0.92} aria-hidden="true">
      <defs>
        <Lin id={u("bag")} x1={0} y1={0} x2={1} y2={0} s={[[0, "#C99556"], [0.4, "#E3B57A"], [1, "#B9844A"]]} />
        <Lin id={u("car")} x1={0} y1={0} x2={1} y2={0} s={[[0, "#FFA45C"], [1, "#E8722A"]]} />
      </defs>
      <g transform="translate(18 0) scale(0.8)">
        <Blur u={a("l")} />
        {ART.lettuce(a("l"))}
      </g>
      <path d="M78 46 L100 12" stroke={`url(#${u("car")})`} strokeWidth="9" strokeLinecap="round" />
      <path d="M98 14 l5 -8 M101 16 l8 -5" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
      <g transform="translate(44 6) scale(0.7)">
        <Blur u={a("t")} />
        {ART.tomatoes(a("t"))}
      </g>
      <path d="M22 44 L98 44 L92 104 L28 104 Z" fill={`url(#${u("bag")})`} />
      <path d="M22 44 L98 44 L97 52 L23 52 Z" fill="#B07C42" />
      <path d="M40 64 Q60 74 80 64" stroke="#9E6C35" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
