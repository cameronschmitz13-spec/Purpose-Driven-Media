export type ScreeningType =
  | "business"
  | "nonprofit"
  | "faith_ministry"
  | "organization";

export type IdentityStatus = "confirmed" | "rejected" | "ambiguous";

export type EvidenceBasis =
  | "source"
  | "submitted"
  | "manual_verified"
  | "not_connected";

export interface CanonicalIdentity {
  organization_name: string;
  canonical_domain?: string;
  website_url?: string;
  primary_address?: string;
  city?: string;
  state_region?: string;
  postal_code?: string;
  phone?: string;
  first_party_social?: Record<string, string>;
  first_party_links?: Record<string, string>;
}

export interface CandidateSource {
  id: string;
  source_url: string;
  source_type: string;
  fetched_at: string;
  observed_name?: string;
  observed_domain?: string;
  observed_address?: string;
  observed_city?: string;
  observed_state?: string;
  observed_postal_code?: string;
  observed_phone?: string;
  observations?: Record<string, unknown>;
}

export interface IdentityDecision {
  status: IdentityStatus;
  confidence: number;
  included_in_score: boolean;
  reason: string;
  match_basis: string[];
  conflicts: string[];
  field_differences: Record<string, { canonical: string; observed: string }>;
}

export interface EvaluatedSource extends CandidateSource {
  identity: IdentityDecision;
}

export interface CriterionAssessment {
  scope: "universal" | "sector";
  key: string;
  rating: number;
  confidence: number;
  explanation: string;
  evidence_basis: EvidenceBasis;
  source_ids?: string[];
  critical_issue?: {
    title: string;
    detail: string;
  };
  raw_value?: Record<string, unknown>;
}

export interface ScreeningInput {
  run_id: string;
  screening_type: ScreeningType;
  rubric_version: "visibility-v1";
  target: CanonicalIdentity;
  sources: CandidateSource[];
  assessments: CriterionAssessment[];
  planning_target?: number;
  observed_at: string;
}

export interface PriorityItem {
  rank: number;
  key: string;
  scope: "universal" | "sector";
  rating: number;
  confidence: number;
  critical: boolean;
  explanation: string;
  source_ids: string[];
}

export interface FinalizerEntry {
  rating: number;
  confidence: number;
  source_id?: string;
  explanation: string;
  raw_value: Record<string, unknown>;
}

export interface FinalizerPayload {
  screening_run_id: string;
  ratings: {
    universal: Record<string, FinalizerEntry>;
    sector: Record<string, FinalizerEntry>;
  };
  critical_issues: Array<{
    criterion_key: string;
    title: string;
    detail: string;
    source_ids: string[];
  }>;
  planning_target?: number;
}

export interface ScreeningOutput {
  rubric_version: "visibility-v1";
  target: CanonicalIdentity;
  sources: EvaluatedSource[];
  accepted_source_ids: string[];
  excluded_source_ids: string[];
  preview_total: number;
  priorities: PriorityItem[];
  finalizer_payload: FinalizerPayload;
  report_snapshot: Record<string, unknown>;
}
