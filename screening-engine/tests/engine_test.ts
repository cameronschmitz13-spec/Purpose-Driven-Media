import { runScreening } from "../engine.ts";
import { evaluateSourceIdentity } from "../identity.ts";
import type {
  CanonicalIdentity,
  CriterionAssessment,
  ScreeningInput,
} from "../types.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const target: CanonicalIdentity = {
  organization_name: "Lifepoint Church of Chillicothe",
  canonical_domain: "lifepoint-church.com",
  website_url: "https://lifepoint-church.com/",
  primary_address: "434 Locust St, Chillicothe, MO 64601",
  city: "Chillicothe",
  state_region: "MO",
  postal_code: "64601",
  phone: "(660) 973-2639",
  first_party_social: {
    facebook: "https://www.facebook.com/lifepointchurchchillicothe",
    youtube: "https://www.youtube.com/@lifepointchurchchillicothe",
  },
};

Deno.test("LifePoint: same-entity stale city listing remains confirmed by exact phone", () => {
  const decision = evaluateSourceIdentity(target, {
    id: "chillicothe-city",
    source_url: "https://www.chillicothecity.org/1246/Churches",
    source_type: "directory",
    fetched_at: "2026-09-25T00:00:00Z",
    observed_name: "Lifepoint Church",
    observed_address: "455 Locust Street",
    observed_city: "Chillicothe",
    observed_state: "MO",
    observed_phone: "660-973-2639",
  });

  assert(decision.status === "confirmed", JSON.stringify(decision));
  assert(decision.included_in_score, "confirmed source should be score-eligible");
  assert(
    decision.field_differences.address?.observed === "455 Locust Street",
    "stale address should be preserved as a consistency difference",
  );
});

Deno.test("LifePoint: same-name Tennessee church is rejected", () => {
  const decision = evaluateSourceIdentity(target, {
    id: "tennessee-lifepoint",
    source_url: "https://lifepointchurch.org/",
    source_type: "third_party",
    fetched_at: "2026-09-25T00:00:00Z",
    observed_name: "LifePoint Church",
    observed_domain: "lifepointchurch.org",
    observed_address: "506 Legacy Dr",
    observed_city: "Smyrna",
    observed_state: "TN",
    observed_phone: "615-459-3311",
  });

  assert(decision.status === "rejected", JSON.stringify(decision));
  assert(!decision.included_in_score, "rejected source must not affect score");
});

Deno.test("name-only match is ambiguous and excluded", () => {
  const decision = evaluateSourceIdentity(target, {
    id: "name-only",
    source_url: "https://example.com/churches/lifepoint",
    source_type: "directory",
    fetched_at: "2026-09-25T00:00:00Z",
    observed_name: "Lifepoint Church of Chillicothe",
  });

  assert(decision.status === "ambiguous", JSON.stringify(decision));
  assert(!decision.included_in_score, "name-only source must not score");
});

function assessments(): CriterionAssessment[] {
  const universal = [
    "findability_identity",
    "local_presence_reputation",
    "organic_search_visibility",
    "message_clarity",
    "mobile_experience_performance",
    "conversion_readiness",
    "measurement_freshness",
  ];
  const sector = [
    "visit_service_information",
    "giving",
    "events_groups",
    "sermons_media_live",
    "contact_prayer_help",
    "app_email_member_engagement",
  ];

  return [
    ...universal.map((key) => ({
      scope: "universal" as const,
      key,
      rating: 3,
      confidence: 0.9,
      explanation: "Test assessment",
      evidence_basis: "manual_verified" as const,
    })),
    ...sector.map((key) => ({
      scope: "sector" as const,
      key,
      rating: 3,
      confidence: 0.9,
      explanation: "Test assessment",
      evidence_basis: "manual_verified" as const,
    })),
  ];
}

Deno.test("visibility-v1 preview is deterministic at 75 for all 3/4 ratings", () => {
  const input: ScreeningInput = {
    run_id: "00000000-0000-0000-0000-000000000001",
    screening_type: "faith_ministry",
    rubric_version: "visibility-v1",
    target,
    sources: [],
    assessments: assessments(),
    observed_at: "2026-09-25T00:00:00Z",
  };

  const result = runScreening(input);
  assert(result.preview_total === 75, `expected 75, got ${result.preview_total}`);
});

Deno.test("rejected source cannot be cited by a scored criterion", () => {
  const list = assessments();
  list[0] = {
    ...list[0],
    evidence_basis: "source",
    source_ids: ["wrong-lifepoint"],
  };

  const input: ScreeningInput = {
    run_id: "00000000-0000-0000-0000-000000000002",
    screening_type: "faith_ministry",
    rubric_version: "visibility-v1",
    target,
    sources: [{
      id: "wrong-lifepoint",
      source_url: "https://lifepointchurch.org/",
      source_type: "third_party",
      fetched_at: "2026-09-25T00:00:00Z",
      observed_name: "LifePoint Church",
      observed_domain: "lifepointchurch.org",
      observed_city: "Smyrna",
      observed_state: "TN",
      observed_phone: "615-459-3311",
    }],
    assessments: list,
    observed_at: "2026-09-25T00:00:00Z",
  };

  let threw = false;
  try {
    runScreening(input);
  } catch (error) {
    threw = String(error).includes("rejected source");
  }
  assert(threw, "engine must fail closed when scoring references rejected evidence");
});
