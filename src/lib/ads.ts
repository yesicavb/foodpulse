import { CAMPAIGNS } from "@/data/campaigns";
import { INTEREST_LABEL } from "@/data/config";
import { householdOf } from "./profile";
import type { Campaign, Profile } from "./types";

/**
 * RETAIL MEDIA – demo ranking of sponsored products.
 *
 * 1. Filters: campaign active today, product available in the selected store,
 *    compatible with the customer's diet.
 * 2. Relevance (0–1): declared interests, related purchases in the history, shopping for several people.
 *    Below the relevance threshold the campaign is NOT shown, whatever the budget.
 * 3. Commercial value (0–1): campaign priority and the brand's bid.
 * 4. Final score = 40% relevance + 60% commercial value, among relevant campaigns only.
 *
 * Health data (allergens, notes) is never used. Without consent to personalized
 * advertising, only the store's generic promotions are shown.
 * Brands receive no individual data.
 */

export const RELEVANCE_THRESHOLD = 0.3;

export interface RankedAd {
  campaign: Campaign;
  relevance: number;
  commercial: number;
  score: number;
  reasons: string[];
}

const isoToday = (d: Date) => d.toISOString().slice(0, 10);

export function rankAds(profile: Profile, history: Record<string, number>, storeId: string, today = new Date()) {
  const day = isoToday(today);
  const live = CAMPAIGNS.filter(
    (c) =>
      c.validFrom <= day &&
      c.validTo >= day &&
      c.stores.includes(storeId) &&
      !(profile.diet && c.notFor?.includes(profile.diet as never))
  );
  const commercialOf = (c: Campaign, maxBid: number) => 0.5 * (c.priority / 5) + 0.5 * (c.bidEur / maxBid);

  if (!profile.notifications.adsPersonalized) {
    const pool = live.filter((c) => c.generic);
    const maxBid = Math.max(1, ...pool.map((c) => c.bidEur));
    const items: RankedAd[] = pool
      .map((c) => {
        const commercial = commercialOf(c, maxBid);
        return { campaign: c, relevance: 0, commercial, score: commercial, reasons: ["Promozione del punto vendita, non personalizzata"] };
      })
      .sort((a, b) => b.score - a.score);
    return { personalized: false, items };
  }

  const hh = householdOf(profile);
  const withRelevance = live.map((c) => {
    const reasons: string[] = [];
    let relevance = 0;
    const matches = c.targets.filter((t) => profile.interests.includes(t));
    if (matches.length) {
      relevance += Math.min(0.75, 0.55 + 0.1 * (matches.length - 1));
      reasons.push(`Interesse: ${matches.map((m) => INTEREST_LABEL[m].toLowerCase()).join(", ")}`);
    }
    if (c.signals.some((s) => (history[s] ?? 0) >= 2)) {
      relevance += 0.3;
      reasons.push("Acquisti spesso prodotti collegati");
    }
    if (c.household && hh >= 3) {
      relevance += 0.2;
      reasons.push(`Spesa per ${hh} persone`);
    }
    return { c, relevance: Math.min(1, relevance), reasons };
  });

  const relevant = withRelevance.filter((x) => x.relevance >= RELEVANCE_THRESHOLD);
  const maxBid = Math.max(1, ...relevant.map((x) => x.c.bidEur));
  const items: RankedAd[] = relevant
    .map((x) => {
      const commercial = commercialOf(x.c, maxBid);
      return { campaign: x.c, relevance: x.relevance, commercial, score: 0.4 * x.relevance + 0.6 * commercial, reasons: x.reasons };
    })
    .sort((a, b) => b.score - a.score);

  return { personalized: true, items };
}
