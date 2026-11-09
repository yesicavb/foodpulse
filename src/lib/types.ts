export type CategoryId = "panetteria" | "gastronomia" | "carne" | "pesce" | "ortofrutta" | "latticini";

export type Tag =
  | "proteico"
  | "vegetale"
  | "bio"
  | "famiglia"
  | "colazione"
  | "veloce"
  | "leggero"
  | "bambini"
  | "energia"
  | "sano";

export type Allergen = "glutine" | "lattosio" | "uova" | "pesce" | "crostacei" | "frutta_guscio" | "soia" | "sesamo";
export type Animal = "carne" | "pesce" | "latte" | "uova";

export type IconKey =
  | "wheat"
  | "croissant"
  | "sandwich"
  | "soup"
  | "drumstick"
  | "salad"
  | "beef"
  | "fish"
  | "apple"
  | "banana"
  | "cherry"
  | "carrot"
  | "leaf"
  | "grape"
  | "milk"
  | "egg"
  | "bean"
  | "coffee"
  | "cookie"
  | "droplet"
  | "package"
  | "pizza"
  | "cup"
  | "dumbbell"
  | "candy";

/** Fresh or ultra-fresh product, bookable through FOODPULSE */
export interface FreshProduct {
  id: string;
  name: string;
  desc: string;
  category: CategoryId;
  unit: string;
  basePrice: number;
  weightKg: number;
  tags: Tag[];
  allergens: Allergen[];
  animal?: Animal[];
  /** bookable units per day in an average store */
  stock: number;
  icon: IconKey;
}

/** Packaged product, bought normally from the shelves (not bookable) */
export interface ShelfProduct {
  id: string;
  name: string;
  desc: string;
  aisle: string;
  basePrice: number;
  tags: Tag[];
  allergens: Allergen[];
  animal?: Animal[];
  icon: IconKey;
}

export type LockerType = "ambiente" | "refrigerato" | "surgelato";

export interface LockerPoint {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  types: LockerType[];
}

export interface Store {
  id: string;
  chain: string;
  name: string;
  address: string;
  city: string;
  distanceKm: number;
  hours: string;
  /** price multiplier relative to the base price list */
  priceIndex: number;
  stockFactor: number;
  /** extra store discount, in percentage points, per department */
  categoryPromos: Partial<Record<CategoryId, number>>;
  /** fresh products not available in this store */
  unavailable: string[];
  services: {
    instore?: { desk: string; slots: string[] };
    locker?: { points: LockerPoint[]; slots: string[] };
    delivery?: { fee: number; freeOver: number; slots: string[]; provider: string };
  };
}

export type Interest =
  | "fitness"
  | "bodybuilding"
  | "sano"
  | "cucina"
  | "risparmio"
  | "vegetale"
  | "sport"
  | "famiglia"
  | "veloce"
  | "bio";

/** Retail media campaign of a CPG brand (demo data) */
export interface Campaign {
  id: string;
  brand: string;
  product: string;
  desc: string;
  packCategory: string;
  aisle: string;
  icon: IconKey;
  targets: Interest[];
  /** products in the history that make the campaign relevant (e.g. milk and yogurt for breakfast) */
  signals: string[];
  /** relevant for people shopping for 3 or more */
  household?: boolean;
  /** can be shown even without consent to personalized advertising */
  generic?: boolean;
  /** diets for which the product must not be suggested */
  notFor?: Diet[];
  stores: string[];
  /** the brand's bid, in euros per 1,000 impressions */
  bidEur: number;
  priority: 1 | 2 | 3 | 4 | 5;
  validFrom: string;
  validTo: string;
  promo?: string;
}

export type Diet = "onnivora" | "vegetariana" | "vegana" | "pescetariana" | "flessibile";

export interface Profile {
  firstName: string;
  lastName: string;
  ageRange: string;
  householdSize: number | null;
  shoppingFor: string;
  hasKids: "si" | "no" | "";
  kidsAges: string[];
  pets: string[];
  address: string;
  interests: Interest[];
  diet: Diet | "";
  favorites: string[];
  disliked: string;
  frequency: string;
  days: string[];
  weeklySpend: string;
  departments: CategoryId[];
  offersInterest: number;
  priority: string;
  budget: number | null;
  goals: string[];
  /** health-related data: used only to exclude products, never for advertising */
  health: { allergens: Allergen[]; notes: string; consent: boolean };
  notifications: {
    orders: boolean;
    reminders: boolean;
    suggestions: boolean;
    promos: boolean;
    adsPersonalized: boolean;
    marketing: boolean;
  };
}

export interface CartLine {
  productId: string;
  qty: number;
}

/** Reminder for products to pick up from the shelf: not part of the booking */
export interface ListItem {
  id: string;
  kind: "shelf" | "sponsored";
  name: string;
  detail: string;
  checked: boolean;
}

export type PickupMethod = "instore" | "locker" | "delivery";

export interface OrderLine {
  productId: string;
  name: string;
  category: CategoryId;
  qty: number;
  unitPrice: number;
  unitFinal: number;
  pct: number;
  weightKg: number;
}

export type OrderStatus = "attivo" | "completato" | "annullato";

export interface Order {
  id: string;
  code: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  createdAt: string;
  pickupDate: string;
  advance: number;
  method: PickupMethod;
  slot: string;
  pickupDetail: string;
  lockerType?: LockerType;
  lockerCell?: string;
  deliveryAddress?: string;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  voucherValue: number;
  voucherId?: string;
  fee: number;
  total: number;
  kgFood: number;
  points: number;
  status: OrderStatus;
  completedAt?: string;
  cancelledAt?: string;
  feedbackDone: boolean;
}

export interface PointsEvent {
  id: string;
  date: string;
  label: string;
  points: number;
}

export interface Voucher {
  id: string;
  code: string;
  value: number;
  createdAt: string;
  usedAt?: string;
  orderId?: string;
}

export interface Feedback {
  orderId: string;
  date: string;
  ratings: Record<string, number>;
  comment: string;
  points: number;
}

export interface UserData {
  profile: Profile;
  storeId: string | null;
  advance: number;
  cart: CartLine[];
  list: ListItem[];
  basket: { seed: number; dismissed: string[]; qty: Record<string, number> };
  /** how many times each product was bought in the last 8 weeks */
  history: Record<string, number>;
  orders: Order[];
  points: { balance: number; lifetime: number; events: PointsEvent[] };
  vouchers: Voucher[];
  feedbacks: Feedback[];
  pendingFeedback: string | null;
  onboarded: boolean;
}

export interface Account {
  id: string;
  email: string;
  passHash: string;
  createdAt: string;
  demo?: boolean;
}

export interface AppState {
  v: 2;
  accounts: Account[];
  data: Record<string, UserData>;
  session: string | null;
}
