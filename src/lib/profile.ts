import type { Profile } from "./types";

export function emptyProfile(firstName = "", lastName = ""): Profile {
  return {
    firstName,
    lastName,
    ageRange: "",
    householdSize: null,
    shoppingFor: "",
    hasKids: "",
    kidsAges: [],
    pets: [],
    address: "",
    interests: [],
    diet: "",
    favorites: [],
    disliked: "",
    frequency: "",
    days: [],
    weeklySpend: "",
    departments: [],
    offersInterest: 0,
    priority: "",
    budget: null,
    goals: [],
    health: { allergens: [], notes: "", consent: false },
    // Marketing consents are off by default: the customer turns them on
    notifications: { orders: true, reminders: true, suggestions: true, promos: false, adsPersonalized: false, marketing: false },
  };
}

/** Number of people shopped for: explicit value, otherwise estimated from "who do you shop for" */
export function householdOf(p: Profile) {
  if (p.householdSize) return p.householdSize;
  switch (p.shoppingFor) {
    case "Per me e il mio partner":
      return 2;
    case "Per la mia famiglia":
      return 4;
    case "Per coinquilini":
      return 3;
    case "Per altre persone":
      return 2;
    default:
      return 1;
  }
}

const SPEND_TO_BUDGET: Record<string, number> = {
  "Meno di 50 €": 40,
  "50–100 €": 75,
  "100–150 €": 125,
  "150–200 €": 175,
  "Più di 200 €": 220,
};
export const weeklyBudgetOf = (p: Profile) => p.budget ?? SPEND_TO_BUDGET[p.weeklySpend] ?? 80;

export const PROFILE_SECTIONS = [
  { id: "personal", label: "Informazioni personali e famiglia" },
  { id: "interests", label: "Interessi e stile di vita" },
  { id: "diet", label: "Preferenze alimentari" },
  { id: "habits", label: "Abitudini di spesa" },
  { id: "goals", label: "Budget e obiettivi" },
  { id: "health", label: "Esigenze alimentari e allergeni" },
  { id: "notifications", label: "Notifiche e privacy" },
] as const;
export type SectionId = (typeof PROFILE_SECTIONS)[number]["id"];

/** Completion percentage: one point for each piece of information useful for suggestions */
export function completion(p: Profile) {
  const checks: [SectionId, boolean][] = [
    ["personal", !!(p.firstName && p.lastName)],
    ["personal", !!p.ageRange],
    ["personal", !!p.householdSize],
    ["personal", !!p.shoppingFor],
    ["personal", !!p.hasKids],
    ["interests", p.interests.length > 0],
    ["diet", !!p.diet],
    ["diet", p.favorites.length > 0],
    ["habits", !!p.frequency],
    ["habits", p.days.length > 0],
    ["habits", p.departments.length > 0],
    ["habits", !!p.priority],
    ["goals", !!p.budget],
    ["goals", p.goals.length > 0],
  ];
  const done = checks.filter(([, ok]) => ok).length;
  const missing = Array.from(new Set(checks.filter(([, ok]) => !ok).map(([s]) => s)));
  return { pct: Math.round((done / checks.length) * 100), missing };
}
