import type { ScreeningType } from "./types.ts";

export const RUBRIC_VERSION = "visibility-v1" as const;

export const UNIVERSAL_WEIGHTS: Record<string, number> = {
  findability_identity: 10,
  local_presence_reputation: 10,
  organic_search_visibility: 10,
  message_clarity: 10,
  mobile_experience_performance: 10,
  conversion_readiness: 10,
  measurement_freshness: 10,
};

export const SECTOR_KEYS: Record<ScreeningType, string[]> = {
  business: [
    "service_product_clarity",
    "local_intent",
    "quote_booking_contact",
    "reputation",
    "portfolio_proof_media",
    "lead_tracking_followup",
  ],
  nonprofit: [
    "mission_impact_clarity",
    "donation_experience",
    "volunteer_supporter_pathway",
    "program_service_access",
    "transparency_trust",
    "email_event_advocacy_engagement",
  ],
  faith_ministry: [
    "visit_service_information",
    "giving",
    "events_groups",
    "sermons_media_live",
    "contact_prayer_help",
    "app_email_member_engagement",
  ],
  organization: [
    "mission_service_clarity",
    "primary_action_pathway",
    "trust_proof",
    "program_service_access",
    "contact_readiness",
    "engagement_followup",
  ],
};

export const SECTOR_WEIGHT = 5;

export function criterionWeight(
  screeningType: ScreeningType,
  scope: "universal" | "sector",
  key: string,
): number {
  if (scope === "universal") {
    const weight = UNIVERSAL_WEIGHTS[key];
    if (!weight) throw new Error(`Unknown universal criterion: ${key}`);
    return weight;
  }

  if (!SECTOR_KEYS[screeningType].includes(key)) {
    throw new Error(`Unknown ${screeningType} sector criterion: ${key}`);
  }
  return SECTOR_WEIGHT;
}

export function expectedKeys(screeningType: ScreeningType) {
  return {
    universal: Object.keys(UNIVERSAL_WEIGHTS),
    sector: [...SECTOR_KEYS[screeningType]],
  };
}

export function weightedPoints(rating: number, weight: number) {
  if (!Number.isFinite(rating) || rating < 0 || rating > 4) {
    throw new Error(`Rating must be between 0 and 4; received ${rating}`);
  }
  return Math.round(((rating / 4) * weight) * 100) / 100;
}
