import { createRoot } from "react-dom/client";
import { FoodPulseApp } from "@/components/FoodPulseApp";

/** Entry point of the single-file version (same code as the Next.js app) */
const el = document.getElementById("root");
if (el) createRoot(el).render(<FoodPulseApp />);
