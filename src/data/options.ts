import type { Allergen, Diet, Interest } from "@/lib/types";

export const AGE_RANGES = ["18–24", "25–34", "35–44", "45–54", "55–64", "65+"];
export const SHOPPING_FOR = ["Per me", "Per me e il mio partner", "Per la mia famiglia", "Per coinquilini", "Per altre persone"];
export const KIDS_AGES = ["0–2 anni", "3–5 anni", "6–10 anni", "11–14 anni", "15–17 anni"];
export const PETS = ["Cane", "Gatto", "Altri animali"];

export const INTERESTS: Interest[] = [
  "fitness",
  "bodybuilding",
  "sano",
  "cucina",
  "risparmio",
  "vegetale",
  "sport",
  "famiglia",
  "veloce",
  "bio",
];

export const DIETS: { id: Diet; label: string }[] = [
  { id: "onnivora", label: "Onnivora" },
  { id: "vegetariana", label: "Vegetariana" },
  { id: "vegana", label: "Vegana" },
  { id: "pescetariana", label: "Pescetariana" },
  { id: "flessibile", label: "Flessibile" },
];

export const FAVORITES = [
  "Carne",
  "Pesce",
  "Frutta",
  "Verdura",
  "Latticini",
  "Formaggi",
  "Pane e prodotti da forno",
  "Cereali",
  "Legumi",
  "Prodotti proteici",
];

export const FREQUENCIES = ["Ogni giorno", "2–3 volte a settimana", "1 volta a settimana", "Ogni 2 settimane"];
export const DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
export const WEEKLY_SPEND = ["Meno di 50 €", "50–100 €", "100–150 €", "150–200 €", "Più di 200 €"];
export const PRIORITIES = ["Risparmio", "Qualità", "Comodità", "Sostenibilità"];

export const GOALS = [
  { id: "risparmiare", label: "Risparmiare sulla spesa" },
  { id: "equilibrato", label: "Mangiare in modo più equilibrato" },
  { id: "spreco", label: "Ridurre lo spreco alimentare" },
  { id: "organizzare", label: "Organizzare meglio la spesa" },
];

export const ALLERGENS: { id: Allergen; label: string }[] = [
  { id: "glutine", label: "Glutine" },
  { id: "lattosio", label: "Lattosio" },
  { id: "uova", label: "Uova" },
  { id: "pesce", label: "Pesce" },
  { id: "crostacei", label: "Crostacei" },
  { id: "frutta_guscio", label: "Frutta a guscio" },
  { id: "soia", label: "Soia" },
  { id: "sesamo", label: "Sesamo" },
];

export const FEEDBACK_QUESTIONS = [
  { id: "overall", label: "Come valuti la tua esperienza complessiva?" },
  { id: "easy", label: "La prenotazione è stata semplice?" },
  { id: "complete", label: "Hai trovato tutti i prodotti prenotati?" },
  { id: "quality", label: "Come valuti la qualità e freschezza dei prodotti?" },
  { id: "staff", label: "Il personale ti ha servito correttamente?" },
  { id: "timing", label: "Il ritiro o la consegna sono avvenuti nei tempi previsti?" },
  { id: "recommend", label: "Consiglieresti FOODPULSE?" },
];
