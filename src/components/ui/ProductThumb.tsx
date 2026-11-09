import {
  Apple,
  Banana,
  Bean,
  Beef,
  Candy,
  Carrot,
  Cherry,
  Coffee,
  Cookie,
  Croissant,
  CupSoda,
  Droplet,
  Drumstick,
  Dumbbell,
  Egg,
  Fish,
  Grape,
  Leaf,
  Milk,
  Package,
  Pizza,
  Salad,
  Sandwich,
  Soup,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import type { IconKey } from "@/lib/types";

const ICONS: Record<IconKey, LucideIcon> = {
  wheat: Wheat,
  croissant: Croissant,
  sandwich: Sandwich,
  soup: Soup,
  drumstick: Drumstick,
  salad: Salad,
  beef: Beef,
  fish: Fish,
  apple: Apple,
  banana: Banana,
  cherry: Cherry,
  carrot: Carrot,
  leaf: Leaf,
  grape: Grape,
  milk: Milk,
  egg: Egg,
  bean: Bean,
  coffee: Coffee,
  cookie: Cookie,
  droplet: Droplet,
  package: Package,
  pizza: Pizza,
  cup: CupSoda,
  dumbbell: Dumbbell,
  candy: Candy,
};

export function ProductIcon({ icon, size, className = "" }: { icon: IconKey; size: number; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon size={size} strokeWidth={1.5} className={className} aria-hidden="true" />;
}

/**
 * Illustrated product image (consistent placeholder for the demo).
 * In production, replace it with photos supplied by the store or the brand.
 */
export function ProductThumb({
  icon,
  tile,
  text,
  size = 64,
  label,
}: {
  icon: IconKey;
  tile: string;
  text: string;
  size?: number;
  label: string;
}) {
  const Icon = ICONS[icon];
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl ${tile} ${text}`}
      style={{ width: size, height: size }}
    >
      <span className="absolute -bottom-3 -right-3 h-2/3 w-2/3 rounded-full bg-white/50" aria-hidden="true" />
      <Icon size={Math.round(size * 0.46)} strokeWidth={1.6} className="relative" aria-hidden="true" />
    </div>
  );
}
