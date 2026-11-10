/**
 * Flat food illustrations drawn for FOODPULSE (no photos, no brand artwork).
 * One drawing per product, department and empty state. Each drawing uses a 64 × 64 grid.
 * To give a new product a picture, add its id to ART_FOR below (or reuse a similar drawing).
 */
import type { ReactElement, ReactNode } from "react";

const C = {
  crust: "#C98A4B",
  crustDark: "#9C6430",
  crumb: "#F2C98F",
  red: "#E53935",
  redDark: "#B71C1C",
  leaf: "#43A047",
  leafLight: "#7CB342",
  leafDark: "#2E7D32",
  cream: "#FFF8EE",
  white: "#FFFFFF",
  shadow: "rgba(27,94,32,0.10)",
};

const Shadow = ({ w = 40, y = 54 }: { w?: number; y?: number }) => <ellipse cx="32" cy={y} rx={w / 2} ry="3.5" fill={C.shadow} />;

/* Small reusable shapes */
const Tub = ({ body, band, lid, top = "#FFFFFF", fill }: { body: string; band: string; lid: string; top?: string; fill?: ReactElement }) => (
  <>
    <Shadow w={34} y={55} />
    <path d="M15 24 L49 24 L45 53 Q32 56 19 53 Z" fill={body} stroke="#D5DEE8" strokeWidth="1.5" />
    <path d="M17.2 38 L46.8 38 L45.9 45 L18.1 45 Z" fill={band} />
    <ellipse cx="32" cy="24" rx="17" ry="5" fill={lid} stroke="#C9D5E3" strokeWidth="1.2" />
    <ellipse cx="32" cy="23.4" rx="14" ry="3.6" fill={top} />
    {fill}
    <path d="M19.5 28 L21.5 50" stroke="#E8EEF4" strokeWidth="2.5" strokeLinecap="round" />
  </>
);

const Bag = ({ color, band, children }: { color: string; band: string; children?: ReactNode }) => (
  <>
    <Shadow w={34} />
    <path d="M18 14 L46 14 L48 52 Q32 56 16 52 Z" fill={color} />
    <path d="M18 14 L46 14 L46.4 20 L17.6 20 Z" fill={band} />
    <path d="M18 17 L46 17" stroke="#FFFFFF" strokeOpacity="0.5" strokeDasharray="2 2" />
    {children}
  </>
);

const Jar = ({ lid, content, dots }: { lid: string; content: string; dots: string }) => (
  <>
    <Shadow w={30} />
    <rect x="19" y="20" width="26" height="34" rx="7" fill="#EAF6E5" />
    <rect x="21" y="26" width="22" height="26" rx="5" fill={content} />
    {[[26, 31], [33, 30], [38, 35], [28, 38], [35, 41], [25, 46], [32, 47], [39, 47]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="3" fill={dots} />
    ))}
    <rect x="18" y="14" width="28" height="8" rx="3" fill={lid} />
    <path d="M23 26 L23 48" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" />
  </>
);

const Box = ({ color, side, children }: { color: string; side: string; children?: ReactNode }) => (
  <>
    <Shadow w={38} />
    <path d="M17 13 L43 13 L49 17 L49 53 L23 53 L17 49 Z" fill={side} />
    <rect x="17" y="13" width="26" height="40" rx="2" fill={color} />
    {children}
  </>
);

const ART: Record<string, ReactElement> = {
  /* ---------- Bakery ---------- */
  bread: (
    <>
      <Shadow w={46} />
      <path d="M9 40 C9 25 21 18 32 18 C43 18 55 25 55 40 C55 47 51 50 45 50 L19 50 C13 50 9 47 9 40 Z" fill={C.crust} />
      <path d="M12 38 C13 27 22 22 32 22 C42 22 51 27 52 38" fill="none" stroke={C.crumb} strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" />
      {[20, 29, 38].map((x) => (
        <path key={x} d={`M${x} 27 L${x + 7} 35`} stroke={C.crustDark} strokeWidth="2.6" strokeLinecap="round" />
      ))}
    </>
  ),
  rye: (
    <>
      <Shadow w={46} />
      <path d="M9 40 C9 25 21 18 32 18 C43 18 55 25 55 40 C55 47 51 50 45 50 L19 50 C13 50 9 47 9 40 Z" fill="#8A5A36" />
      {[[18, 32], [25, 26], [32, 30], [39, 25], [46, 32], [22, 40], [30, 38], [38, 40], [45, 42], [28, 45], [37, 46]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="1.8" ry="1.1" fill="#F0DFA8" transform={`rotate(${i * 37} ${x} ${y})`} />
      ))}
    </>
  ),
  focaccia: (
    <>
      <Shadow w={48} />
      <rect x="8" y="22" width="48" height="28" rx="7" fill="#E3A94A" />
      <rect x="8" y="22" width="48" height="23" rx="7" fill="#F2C462" />
      {[[16, 29], [26, 33], [36, 28], [46, 33], [20, 38], [32, 39], [43, 39]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.2" fill="#D08C2C" />
      ))}
      {[[22, 28], [40, 34], [30, 31]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} l3 -2`} stroke={C.leafDark} strokeWidth="1.6" strokeLinecap="round" />
      ))}
    </>
  ),
  croissant: (
    <>
      <Shadow w={46} />
      <path d="M7 42 Q12 22 32 21 Q52 22 57 42 Q51 40 47 42 Q43 30 32 30 Q21 30 17 42 Q13 40 7 42 Z" fill="#D9963F" />
      <path d="M17 42 Q21 30 32 30 Q43 30 47 42 Q40 47 32 47 Q24 47 17 42 Z" fill="#E8AE57" />
      {["M22 25 Q25 33 22 40", "M32 21 L32 47", "M42 25 Q39 33 42 40"].map((d) => (
        <path key={d} d={d} fill="none" stroke="#B8732B" strokeWidth="2" strokeLinecap="round" />
      ))}
    </>
  ),
  piadina: (
    <>
      <Shadow w={46} />
      <ellipse cx="32" cy="42" rx="23" ry="8" fill="#E9C98D" />
      <ellipse cx="32" cy="37" rx="23" ry="8" fill="#F3DCA8" />
      <ellipse cx="32" cy="32" rx="23" ry="8" fill="#F8E6BD" />
      {[[22, 31], [30, 29], [39, 32], [44, 30], [27, 34], [35, 34]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="2" ry="1.1" fill="#C98A4B" opacity="0.7" />
      ))}
    </>
  ),

  /* ---------- Deli ---------- */
  lasagne: (
    <>
      <Shadow w={46} />
      <path d="M10 24 L54 24 L50 50 L14 50 Z" fill="#7A4A2E" />
      <rect x="13" y="22" width="38" height="25" rx="3" fill="#F5D57A" />
      <rect x="13" y="28" width="38" height="4" fill="#C0392B" />
      <rect x="13" y="35" width="38" height="3" fill="#F8E7B0" />
      <rect x="13" y="40" width="38" height="4" fill="#C0392B" />
      <path d="M13 24 Q20 19 26 24 Q32 19 38 24 Q44 19 51 24 L51 27 L13 27 Z" fill="#E9B44C" />
      <circle cx="22" cy="23" r="1.5" fill="#B5651D" />
      <circle cx="40" cy="22.5" r="1.5" fill="#B5651D" />
      <path d="M44 19 l3 -3 M46 21 l4 -1" stroke={C.leaf} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  chicken: (
    <>
      <ellipse cx="32" cy="46" rx="26" ry="8" fill="#EDE6D6" />
      <ellipse cx="32" cy="34" rx="18" ry="13" fill="#C77A3A" />
      <ellipse cx="29" cy="30" rx="10" ry="6" fill="#E09A55" />
      <path d="M46 36 Q54 34 55 40 Q55 44 50 42" fill="#B86A2E" />
      <path d="M18 36 Q10 34 9 40 Q9 44 14 42" fill="#B86A2E" />
      <circle cx="55" cy="41" r="2" fill="#FFF8EE" />
      <circle cx="9" cy="41" r="2" fill="#FFF8EE" />
      <path d="M40 22 l2 -3 M43 24 l3 -2" stroke={C.leafDark} strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  ricesalad: (
    <>
      <Shadow w={44} />
      <path d="M10 32 L54 32 Q52 52 32 52 Q12 52 10 32 Z" fill="#F1F7EC" stroke="#CFE3C2" strokeWidth="1.5" />
      <path d="M10 32 L54 32 Q53.6 35 53 37 L11 37 Q10.4 35 10 32 Z" fill={C.leafLight} />
      <ellipse cx="32" cy="32" rx="22" ry="7" fill="#F5EBC8" />
      {[[20, 31, "#7CB342"], [26, 29, "#FBC02D"], [33, 32, "#FF8A3D"], [39, 29, "#7CB342"], [44, 32, "#E57373"], [29, 34, "#FBC02D"], [37, 34, "#7CB342"], [24, 34, "#E57373"]].map(([x, y, c], i) => (
        <circle key={i} cx={x as number} cy={y as number} r="1.9" fill={c as string} />
      ))}
    </>
  ),
  hummus: (
    <>
      <Shadow w={44} />
      <path d="M10 32 L54 32 Q52 52 32 52 Q12 52 10 32 Z" fill="#F1F7EC" stroke="#CFE3C2" strokeWidth="1.5" />
      <path d="M11 37 L53 37" stroke={C.leafLight} strokeWidth="3" />
      <ellipse cx="32" cy="32" rx="22" ry="7" fill="#E3C79A" />
      <path d="M22 32 Q32 26 42 32 Q32 37 24 33" fill="none" stroke="#C9A570" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="32" cy="32" rx="5" ry="2" fill="#C5B03A" opacity="0.8" />
      {[[26, 29], [38, 30], [35, 34]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.1" fill="#C0392B" />
      ))}
    </>
  ),
  lentilballs: (
    <>
      <Shadow w={44} />
      <path d="M10 34 L54 34 Q52 52 32 52 Q12 52 10 34 Z" fill="#F1F7EC" stroke="#CFE3C2" strokeWidth="1.5" />
      <path d="M11 39 L53 39" stroke={C.leafLight} strokeWidth="3" />
      {[[22, 31], [32, 29], [42, 31], [27, 35], [37, 35]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6" fill="#8B5E3C" />
          <circle cx={x - 2} cy={y - 2} r="2" fill="#A87850" />
        </g>
      ))}
      <path d="M46 26 l3 -3 M48 28 l4 -1" stroke={C.leaf} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  tofu: (
    <>
      <Shadow w={44} />
      <path d="M12 28 L40 22 L54 28 L54 46 L26 52 L12 46 Z" fill="#E6DDC4" />
      <path d="M12 28 L26 34 L26 52 L12 46 Z" fill="#F4EEDC" />
      <path d="M12 28 L40 22 L54 28 L26 34 Z" fill="#FFFBEF" />
      <path d="M30 39 l8 -2 M32 44 l10 -2" stroke="#D9CEB0" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),

  /* ---------- Meat ---------- */
  chickenbreast: (
    <>
      <Shadow w={46} />
      <path d="M10 38 Q12 24 28 26 Q40 28 38 40 Q34 50 20 48 Q10 46 10 38 Z" fill="#F2B8A2" />
      <path d="M28 34 Q32 22 46 24 Q56 28 54 38 Q52 48 40 47 Q28 44 28 34 Z" fill="#F6C7B4" />
      <path d="M34 30 Q42 27 49 31" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M15 34 Q21 30 29 32" fill="none" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  turkey: (
    <>
      <Shadow w={46} />
      {[[22, 38], [32, 34], [42, 38]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx="13" ry="10" fill="#E8A894" />
          <ellipse cx={x} cy={y} rx="11" ry="8" fill="#F7D3C4" />
        </g>
      ))}
      <path d="M26 33 Q32 30 38 33" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  minced: (
    <>
      <Shadow w={48} />
      <rect x="8" y="34" width="48" height="16" rx="5" fill="#2F4F6F" />
      <path d="M12 38 Q16 22 32 22 Q48 22 52 38 Z" fill="#D9576B" />
      {[[20, 33], [26, 28], [33, 31], [40, 27], [45, 34], [30, 36], [24, 36], [38, 35]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} q2 -2 4 0`} stroke="#B23A4E" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      ))}
      <rect x="8" y="38" width="48" height="4" fill="#3E6A8F" />
    </>
  ),
  burger: (
    <>
      <Shadow w={44} />
      <ellipse cx="32" cy="44" rx="20" ry="7" fill="#5E3520" />
      <ellipse cx="32" cy="41" rx="20" ry="7" fill="#7A4A2E" />
      <ellipse cx="32" cy="32" rx="20" ry="7" fill="#5E3520" />
      <ellipse cx="32" cy="29" rx="20" ry="7" fill="#8A5636" />
      {[24, 31, 38].map((x) => (
        <path key={x} d={`M${x} 25 l4 7`} stroke="#4A2816" strokeWidth="2" strokeLinecap="round" />
      ))}
    </>
  ),
  sausage: (
    <>
      <Shadow w={44} />
      <path d="M32 34 m-3 0 a3 3 0 1 1 6 0 a8 8 0 1 1 -16 0 a13 13 0 1 1 26 0 a17 15 0 0 1 -6 11" fill="none" stroke="#C2614A" strokeWidth="7" strokeLinecap="round" />
      <path d="M32 34 m-3 0 a3 3 0 1 1 6 0 a8 8 0 1 1 -16 0 a13 13 0 1 1 26 0" fill="none" stroke="#E08A70" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
    </>
  ),
  steak: (
    <>
      <Shadow w={48} />
      <path d="M10 34 Q10 18 30 18 Q50 18 54 30 Q57 44 42 48 Q28 52 18 48 Q10 44 10 34 Z" fill="#C62828" />
      <path d="M14 34 Q14 22 30 22 Q46 22 50 31 Q52 42 40 44 Q28 47 20 44 Q14 41 14 34 Z" fill="#E04848" />
      <path d="M20 30 Q28 26 36 30 Q42 34 46 32" fill="none" stroke="#FFE4E1" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M22 38 Q30 36 38 40" fill="none" stroke="#FFE4E1" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="44" cy="38" r="4" fill="#FFF8EE" />
    </>
  ),

  /* ---------- Fish ---------- */
  salmon: (
    <>
      <Shadow w={48} />
      <path d="M8 38 Q10 24 30 24 L56 28 Q58 40 50 46 L26 48 Q8 48 8 38 Z" fill="#F28C5B" />
      <path d="M8 38 Q10 24 30 24 L56 28 L54 32 L30 30 Q14 30 10 40 Z" fill="#F7A57B" />
      {[18, 27, 36, 45].map((x) => (
        <path key={x} d={`M${x} 28 Q${x + 4} 37 ${x} 46`} fill="none" stroke="#FFD9C4" strokeWidth="2" strokeLinecap="round" />
      ))}
    </>
  ),
  bream: (
    <>
      <Shadow w={50} />
      <path d="M8 34 Q22 18 42 26 L54 18 L52 34 L54 50 L42 42 Q22 50 8 34 Z" fill="#B7C4CC" />
      <path d="M8 34 Q22 22 42 28 L42 32 Q24 28 10 36 Z" fill="#D7E0E5" />
      <path d="M14 34 Q28 30 42 34" fill="none" stroke="#E2B13C" strokeWidth="2" />
      <circle cx="15" cy="31" r="2.2" fill="#263238" />
      <circle cx="14.4" cy="30.4" r="0.7" fill="#FFFFFF" />
      <path d="M22 26 Q24 34 22 42" fill="none" stroke="#8FA1AC" strokeWidth="1.6" />
    </>
  ),
  cod: (
    <>
      <Shadow w={48} />
      <path d="M8 36 Q8 24 26 24 L54 27 Q58 38 52 45 L26 48 Q8 48 8 36 Z" fill="#EFE8DA" />
      <path d="M8 36 Q8 24 26 24 L54 27 L53 31 L26 29 Q12 30 9 38 Z" fill="#FBF8F1" />
      {[20, 30, 40].map((x) => (
        <path key={x} d={`M${x} 28 Q${x + 4} 37 ${x} 46`} fill="none" stroke="#DDD3BF" strokeWidth="1.8" strokeLinecap="round" />
      ))}
    </>
  ),
  prawns: (
    <>
      <Shadow w={44} />
      {[[24, 34, 0], [40, 34, 20]].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <path d={`M${x - 10} ${y - 4} A11 11 0 1 0 ${x + 9} ${y - 8}`} fill="none" stroke="#F28A6B" strokeWidth="8" strokeLinecap="round" />
          <path d={`M${x - 10} ${y - 4} A11 11 0 1 0 ${x + 9} ${y - 8}`} fill="none" stroke="#FFC2AE" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
        </g>
      ))}
    </>
  ),

  /* ---------- Fruit and vegetables ---------- */
  lettuce: (
    <>
      <Shadow w={46} />
      <circle cx="22" cy="36" r="14" fill={C.leafDark} />
      <circle cx="42" cy="36" r="14" fill={C.leafDark} />
      <circle cx="32" cy="28" r="15" fill={C.leaf} />
      <circle cx="26" cy="38" r="12" fill={C.leafLight} />
      <circle cx="39" cy="39" r="11" fill="#9CCC65" />
      <path d="M32 50 L32 22 M32 36 L24 30 M32 40 L41 33" stroke="#DCEDC8" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  tomatoes: (
    <>
      <Shadow w={44} />
      {[[22, 38], [40, 38], [31, 28]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx="10" ry="9" fill={C.red} />
          <ellipse cx={x - 3} cy={y - 3} rx="3" ry="2" fill="#FFFFFF" opacity="0.45" />
          <path d={`M${x - 4} ${y - 8} l4 2 l4 -2 l-2 3 l3 1 l-5 0 l-2 3 l-1 -3 l-4 0 l3 -2 z`} fill={C.leafDark} />
        </g>
      ))}
    </>
  ),
  spinach: (
    <>
      <Shadow w={44} />
      {[[-30, 22], [0, 32], [30, 42]].map(([r, x], i) => (
        <g key={i} transform={`rotate(${r} 32 48)`}>
          <path d="M32 48 Q18 32 32 12 Q46 32 32 48 Z" fill={i === 1 ? C.leaf : C.leafDark} />
          <path d="M32 46 L32 16" stroke="#A5D6A7" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
    </>
  ),
  courgette: (
    <>
      <Shadow w={50} />
      <g transform="rotate(-18 32 34)">
        <rect x="8" y="26" width="46" height="15" rx="7.5" fill={C.leafDark} />
        {[16, 24, 32, 40].map((x) => (
          <path key={x} d={`M${x} 28 L${x + 6} 28`} stroke="#81C784" strokeWidth="1.6" strokeLinecap="round" />
        ))}
        <rect x="4" y="30" width="7" height="7" rx="2" fill="#558B2F" />
        <path d="M54 33 L61 27 L60 33 L61 39 Z" fill="#FBC02D" />
      </g>
    </>
  ),
  apples: (
    <>
      <Shadow w={44} />
      {[[23, 36], [41, 36]].map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x} ${y - 9} Q${x - 13} ${y - 14} ${x - 12} ${y + 2} Q${x - 9} ${y + 14} ${x} ${y + 11} Q${x + 9} ${y + 14} ${x + 12} ${y + 2} Q${x + 13} ${y - 14} ${x} ${y - 9} Z`} fill={i ? "#C62828" : "#E53935"} />
          <ellipse cx={x - 5} cy={y - 3} rx="2.5" ry="4" fill="#FFFFFF" opacity="0.35" />
          <path d={`M${x} ${y - 9} L${x + 1} ${y - 15}`} stroke="#6D4C41" strokeWidth="2" strokeLinecap="round" />
          <path d={`M${x + 1} ${y - 13} Q${x + 7} ${y - 17} ${x + 9} ${y - 12} Q${x + 4} ${y - 10} ${x + 1} ${y - 13} Z`} fill={C.leaf} />
        </g>
      ))}
    </>
  ),
  bananas: (
    <>
      <Shadow w={46} />
      {[0, 8, 16].map((dy, i) => (
        <g key={i}>
          <path d={`M10 ${22 + dy} Q30 ${44 + dy} 54 ${26 + dy} Q54 ${32 + dy} 50 ${34 + dy} Q30 ${50 + dy} 10 ${28 + dy} Z`} fill={i === 1 ? "#F9D648" : "#FBE07A"} />
        </g>
      ))}
      <path d="M8 22 L12 21 L12 46 L8 45 Z" fill="#7A5A2E" />
      <path d="M52 27 l3 -1 M52 35 l3 -1 M52 43 l3 -1" stroke="#5D4037" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  berries: (
    <>
      <Shadow w={44} />
      <path d="M12 34 L52 34 L48 50 L16 50 Z" fill="#E7C08A" />
      <path d="M14 40 L50 40 M15 45 L49 45" stroke="#C99A5B" strokeWidth="1.6" />
      {[[20, 31, "#3949AB"], [27, 28, "#E91E63"], [34, 31, "#3949AB"], [41, 28, "#E91E63"], [46, 32, "#3949AB"], [30, 34, "#C2185B"], [38, 34, "#3949AB"], [23, 35, "#E91E63"]].map(([x, y, c], i) => (
        <g key={i}>
          <circle cx={x as number} cy={y as number} r="4.2" fill={c as string} />
          <circle cx={(x as number) - 1.3} cy={(y as number) - 1.3} r="1.1" fill="#FFFFFF" opacity="0.5" />
        </g>
      ))}
      <path d="M40 22 Q44 18 48 22 Q44 24 40 22 Z" fill={C.leaf} />
    </>
  ),
  vegmix: (
    <>
      <Shadow w={46} />
      <path d="M41 23 Q30 21 30 33 Q31 46 42 46 Q53 46 54 33 Q54 21 41 23 Z" fill="#E53935" />
      <path d="M41 23 L42 16" stroke="#6D4C41" strokeWidth="2" strokeLinecap="round" />
      <path d="M42 18 Q48 14 50 19 Q46 21 42 18 Z" fill={C.leaf} />
      <ellipse cx="22" cy="38" rx="12" ry="11" fill="#EF5350" />
      <path d="M17 28 l5 3 l5 -3 l-2 4 l4 1 l-6 1 l-1 4 l-2 -4 l-5 0 l3 -2 z" fill={C.leafDark} />
      <ellipse cx="18" cy="35" rx="3" ry="2" fill="#FFFFFF" opacity="0.45" />
    </>
  ),

  /* ---------- Dairy and cheese ---------- */
  mozzarella: (
    <>
      <Shadow w={40} />
      <circle cx="32" cy="34" r="17" fill="#FAFAF5" />
      <path d="M17 38 Q32 52 47 38 Q45 50 32 51 Q19 50 17 38 Z" fill="#ECECE2" />
      <ellipse cx="26" cy="27" rx="5" ry="3" fill="#FFFFFF" />
      <path d="M44 18 Q48 14 51 18 Q48 21 44 18 Z" fill={C.leaf} />
    </>
  ),
  yogurt: <Tub body="#F7FAFD" band="#5C8DD6" lid="#DCE7F5" top="#F2F6FB" />,
  ricotta: (
    <Tub
      body="#F7FAFD"
      band={C.leafLight}
      lid="#EAF6E5"
      top="#FFFFFF"
      fill={<path d="M20 23 Q32 13 44 23" fill="#FFFDF7" stroke="#EDE7D6" strokeWidth="1.5" />}
    />
  ),
  cottage: (
    <Tub
      body="#F7FAFD"
      band="#7EC4CF"
      lid="#E0F2F4"
      top="#FFFFFF"
      fill={
        <>
          {[[24, 22], [30, 20], [36, 21], [41, 23], [27, 25], [34, 24]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.4" fill="#FAF7EE" stroke="#E6E0CF" strokeWidth="0.8" />
          ))}
        </>
      }
    />
  ),
  milk: (
    <>
      <Shadow w={28} />
      <path d="M24 12 L40 12 L40 18 Q46 22 46 30 L46 50 Q46 54 42 54 L22 54 Q18 54 18 50 L18 30 Q18 22 24 18 Z" fill="#FFFFFF" stroke="#E3E8EE" strokeWidth="1.5" />
      <rect x="24" y="8" width="16" height="6" rx="2" fill="#3F7FD0" />
      <rect x="18" y="32" width="28" height="12" fill={C.leafLight} />
      <path d="M26 38 q6 -5 12 0" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M22 24 L22 50" stroke="#E8EEF5" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  parmesan: (
    <>
      <Shadow w={46} />
      <path d="M10 44 L54 44 L54 50 L10 50 Z" fill="#C9A44B" />
      <path d="M10 44 L44 18 L54 26 L54 44 Z" fill="#F4D27A" />
      <path d="M44 18 L54 26 L54 30 L44 22 Z" fill="#C9A44B" />
      {[[30, 38], [40, 34], [46, 40], [36, 42]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} l2 -1`} stroke="#E0B95A" strokeWidth="1.6" strokeLinecap="round" />
      ))}
    </>
  ),
  cheese: (
    <>
      <Shadow w={48} />
      <path d="M8 30 L40 16 L56 26 L56 46 L24 52 L8 46 Z" fill="#F7C948" />
      <path d="M8 30 L24 36 L24 52 L8 46 Z" fill="#F1B92C" />
      <path d="M8 30 L40 16 L56 26 L24 36 Z" fill="#FBDB72" />
      {[[34, 42, 3.4], [46, 38, 2.6], [16, 40, 2.4], [42, 47, 1.8], [30, 25, 2.2]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#E5A51F" />
      ))}
    </>
  ),
  eggs: (
    <>
      <Shadow w={46} />
      <path d="M8 40 L56 40 L52 52 L12 52 Z" fill="#B7A483" />
      {[[18, 34], [32, 31], [46, 34]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx="8" ry="10" fill="#F3E3C7" />
          <ellipse cx={x - 2.5} cy={y - 3} rx="2" ry="3" fill="#FFFFFF" opacity="0.6" />
        </g>
      ))}
      <path d="M8 40 L56 40" stroke="#9C8A69" strokeWidth="2" />
    </>
  ),

  /* ---------- Shelf products ---------- */
  pasta: (
    <Bag color="#F7EDDA" band="#C0392B">
      {[[24, 28], [32, 26], [40, 29], [27, 36], [36, 36], [24, 44], [33, 45], [41, 42]].map(([x, y], i) => (
        <rect key={i} x={x - 4} y={y - 2} width="8" height="4" rx="1.2" fill="#E2B259" transform={`rotate(${i * 40} ${x} ${y})`} />
      ))}
    </Bag>
  ),
  oats: (
    <Bag color="#E9D7B0" band={C.leafLight}>
      <ellipse cx="32" cy="36" rx="9" ry="6" fill="#F6ECD3" />
      {[[29, 35], [33, 33], [36, 37], [31, 38]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="2.4" ry="1.5" fill="#D8BE86" />
      ))}
    </Bag>
  ),
  chickpeas: <Jar lid="#C0392B" content="#F6E7C1" dots="#E2C27D" />,
  sauce: (
    <>
      <Jar lid="#2E7D32" content="#D84332" dots="#E8604D" />
      <path d="M36 28 Q40 24 44 28 Q40 30 36 28 Z" fill="#66BB6A" />
    </>
  ),
  coffee: (
    <Bag color="#4E342E" band="#8D6E63">
      <ellipse cx="32" cy="36" rx="6" ry="8" fill="#A1887F" />
      <path d="M32 29 Q29 36 32 43" stroke="#4E342E" strokeWidth="1.6" fill="none" />
    </Bag>
  ),
  water: (
    <>
      <Shadow w={40} />
      {[22, 42].map((x) => (
        <g key={x}>
          <path d={`M${x - 3} 10 L${x + 3} 10 L${x + 3} 15 Q${x + 9} 19 ${x + 9} 27 L${x + 9} 52 Q${x + 9} 55 ${x + 6} 55 L${x - 6} 55 Q${x - 9} 55 ${x - 9} 52 L${x - 9} 27 Q${x - 9} 19 ${x - 3} 15 Z`} fill="#CFE8F7" />
          <rect x={x - 4} y="7" width="8" height="5" rx="1.5" fill="#1E88E5" />
          <rect x={x - 9} y="32" width="18" height="10" fill="#4FA3E0" />
        </g>
      ))}
    </>
  ),
  biscuits: (
    <>
      <Shadow w={42} />
      {[44, 38, 32].map((y, i) => (
        <g key={i}>
          <ellipse cx="32" cy={y + 3} rx="18" ry="6" fill="#B87A3E" />
          <ellipse cx="32" cy={y} rx="18" ry="6" fill="#D49A57" />
        </g>
      ))}
      {[[25, 31], [32, 29], [39, 31], [32, 33]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.2" fill="#9C6430" />
      ))}
    </>
  ),
  bar: (
    <>
      <Shadow w={46} />
      <g transform="rotate(-20 32 34)">
        <rect x="8" y="26" width="48" height="16" rx="3" fill="#2E2A4F" />
        <rect x="18" y="26" width="18" height="16" fill="#FF8A3D" />
        <path d="M8 26 l-3 3 l3 3 l-3 3 l3 3 l-3 3 l3 3 M56 26 l3 3 l-3 3 l3 3 l-3 3 l3 3 l-3 3" stroke="#2E2A4F" strokeWidth="1.6" fill="none" />
        <path d="M40 31 l10 0 M40 36 l7 0" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </g>
    </>
  ),
  cereal: (
    <Box color="#E85D3A" side="#B8432A">
      <ellipse cx="30" cy="38" rx="9" ry="4" fill="#FFFFFF" />
      <path d="M21 38 Q30 50 39 38 Z" fill="#FFFFFF" />
      {[[26, 36], [30, 35], [34, 37]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.8" fill={i === 1 ? "#C2185B" : "#E0A94C"} />
      ))}
      <rect x="20" y="17" width="20" height="6" rx="2" fill="#FFF8EE" />
    </Box>
  ),
  vegburger: (
    <>
      <Shadow w={44} />
      <ellipse cx="32" cy="40" rx="20" ry="8" fill="#6E8B3D" />
      <ellipse cx="32" cy="36" rx="20" ry="8" fill="#8BAA4E" />
      {[[24, 35], [31, 33], [38, 36], [28, 38], [40, 32]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="#C5E1A5" />
      ))}
      <path d="M44 22 Q50 16 54 22 Q50 26 44 22 Z" fill={C.leaf} />
    </>
  ),
  oatdrink: (
    <>
      <Shadow w={30} />
      <path d="M20 18 L32 10 L44 18 L44 54 L20 54 Z" fill="#F3E3C0" />
      <path d="M32 10 L44 18 L44 54 L38 54 L38 18 Z" fill="#E2CDA0" />
      <path d="M20 18 L32 10 L38 14 L26 22 Z" fill="#FFF3D6" />
      <rect x="22" y="30" width="16" height="12" rx="2" fill={C.leafLight} />
      <path d="M26 36 l8 0" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  rusks: (
    <>
      <Shadow w={46} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i * 5 - 5} ${i * -4})`}>
          <rect x="12" y="30" width="36" height="20" rx="4" fill="#C98A4B" />
          <rect x="14" y="32" width="32" height="16" rx="3" fill="#E9B872" />
        </g>
      ))}
      {[[20, 31], [28, 34], [36, 31], [24, 37], [33, 38]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.9" fill="#B37738" />
      ))}
    </>
  ),
  snackcakes: (
    <>
      <Shadow w={46} />
      {[[20, 36], [44, 36], [32, 28]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 10} y={y - 6} width="20" height="14" rx="4" fill="#D9A45B" />
          <rect x={x - 10} y={y - 6} width="20" height="5" rx="2.5" fill="#7A4A2E" />
        </g>
      ))}
    </>
  ),
  dishsoap: (
    <>
      <Shadow w={30} />
      <rect x="21" y="18" width="22" height="36" rx="7" fill="#66BB6A" />
      <rect x="27" y="9" width="10" height="10" rx="2" fill="#2E7D32" />
      <rect x="24" y="30" width="16" height="12" rx="3" fill="#FFFFFF" />
      <circle cx="47" cy="22" r="4" fill="#E3F2FD" />
      <circle cx="51" cy="14" r="2.5" fill="#E3F2FD" />
      <path d="M25 22 L25 48" stroke="#A5D6A7" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  icelolly: (
    <>
      <Shadow w={24} />
      <rect x="30" y="40" width="4" height="14" rx="2" fill="#D7B377" />
      <rect x="22" y="10" width="20" height="34" rx="9" fill="#FF8A3D" />
      <rect x="22" y="10" width="20" height="12" rx="9" fill="#E53935" />
      <rect x="22" y="22" width="20" height="10" fill="#FBC02D" />
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

/** Food illustration for a product id, department id or drawing name */
export function FoodArt({ id, size = 64, label, className = "" }: { id: string; size?: number; label?: string; className?: string }) {
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
      {art}
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
  return (
    <svg viewBox="0 0 160 130" width={size} height={size * 0.81} aria-hidden="true">
      <ellipse cx="80" cy="120" rx="58" ry="6" fill={C.shadow} />
      {[[30, 30, -30], [126, 36, 30], [40, 14, -12], [118, 16, 12]].map(([x, y, r], i) => (
        <path key={i} d={`M${x} ${y} l${i % 2 ? 6 : -6} -8`} stroke="#7CB342" strokeWidth="4" strokeLinecap="round" transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <g transform="translate(36 22) scale(0.9)">{ART.lettuce}</g>
      <g transform="translate(58 30) scale(0.75)">{ART.tomatoes}</g>
      <path d="M96 62 L124 22" stroke="#FF8A3D" strokeWidth="13" strokeLinecap="round" />
      <path d="M120 24 l6 -10 M124 26 l10 -6 M118 22 l0 -12" stroke={C.leafDark} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M104 50 l6 4 M110 41 l6 4" stroke="#E0702A" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 64 L136 64 L124 116 L36 116 Z" fill="#7CB342" />
      <path d="M20 58 L140 58 Q144 58 143 63 L142 68 L18 68 L17 63 Q16 58 20 58 Z" fill="#8BC34A" />
      {[52, 72, 92].map((x) => (
        <rect key={x} x={x} y="80" width="14" height="20" rx="5" fill="#EAF6E5" />
      ))}
    </svg>
  );
}

export function GroceryBag({ size = 110 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 110" width={size} height={size * 0.92} aria-hidden="true">
      <g transform="translate(18 0) scale(0.8)">{ART.lettuce}</g>
      <path d="M78 46 L100 12" stroke="#FF8A3D" strokeWidth="9" strokeLinecap="round" />
      <path d="M98 14 l5 -8 M101 16 l8 -5" stroke={C.leafDark} strokeWidth="3" strokeLinecap="round" />
      <g transform="translate(44 6) scale(0.7)">{ART.tomatoes}</g>
      <path d="M22 44 L98 44 L92 104 L28 104 Z" fill="#D9A86C" />
      <path d="M22 44 L98 44 L97 52 L23 52 Z" fill="#C4925A" />
      <path d="M40 64 Q60 74 80 64" stroke="#B57F45" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
